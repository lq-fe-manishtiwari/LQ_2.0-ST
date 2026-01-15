import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import FilterSection from "./Components/FilterSection";
import SubjectSelectionTable from "./Components/SubjectSelectionTable";
import AddSubjectSelectionModal from "./Components/AddSubjectSelectionModal";
import SubjectSelectionConfigView from "./Components/SubjectSelectionConfigView";
import SubjectSelectionFullScreenView from "./Components/SubjectSelectionFullScreenView";
import { subjectSelectionService } from "./Services/subjectSelection.service";
import { getTeacherAllocatedPrograms } from "@/_services/api";

/**
 * SubjectSelectionDashboard Component
 * Main dashboard for managing subject selections
 * Uses cascading filters: Program → Batch → Academic Year & Semester
 */
export default function SubjectSelectionDashboard() {
    // State for data
    const [subjectSelections, setSubjectSelections] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for teacher allocation data
    const [teacherAllocations, setTeacherAllocations] = useState([]);
    const [classTeacherAllocations, setClassTeacherAllocations] = useState([]);

    const [filters, setFilters] = useState({
        programId: "",
        batchId: "",
        academicYearId: "",
        semesterId: "",
    });

    // State for search
    const [searchTerm, setSearchTerm] = useState("");

    // State for dropdown data - now derived from teacher allocations
    const [programs, setPrograms] = useState([]);
    const [batches, setBatches] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjectTypes, setSubjectTypes] = useState([]);

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAddNewPage, setShowAddNewPage] = useState(false);

    // State for configuration view
    const [showConfigView, setShowConfigView] = useState(false);
    const [selectedTypeForConfig, setSelectedTypeForConfig] = useState(null);
    const [selectedVerticalForConfig, setSelectedVerticalForConfig] = useState(null);
    const [existingConfigs, setExistingConfigs] = useState([]); // Store fetched configurations

    // State for full-screen view
    const [showFullScreenView, setShowFullScreenView] = useState(false);
    const [fullScreenData, setFullScreenData] = useState({
        configData: null,
        subjectType: null,
        vertical: null
    });

    // Check URL hash on component mount to restore view state
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#fullscreen') {
                // Try to restore from localStorage
                const savedData = localStorage.getItem('subjectSelection_fullScreenData');
                if (savedData) {
                    try {
                        const parsedData = JSON.parse(savedData);
                        setFullScreenData(parsedData);
                        setShowFullScreenView(true);
                    } catch (error) {
                        console.error('Error parsing saved full screen data:', error);
                        // Clear invalid data
                        localStorage.removeItem('subjectSelection_fullScreenData');
                        window.location.hash = '';
                    }
                }
            } else {
                setShowFullScreenView(false);
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // State for alerts
    const [alert, setAlert] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Apply filters and search when data changes - REAL-TIME
    useEffect(() => {
        applyFiltersAndSearch();
    }, [subjectSelections, filters, searchTerm]);

    // Fetch batches when program changes
    useEffect(() => {
        if (filters.programId && classTeacherAllocations.length > 0) {
            fetchBatches(filters.programId);
        } else {
            setBatches([]);
            setAcademicYears([]);
            setSemesters([]);
            // Clear dependent filters
            setFilters(prev => ({
                ...prev,
                batchId: "",
                academicYearId: "",
                semesterId: "",
            }));
        }
    }, [filters.programId, classTeacherAllocations]);

    // Extract academic years and semesters when batches change
    useEffect(() => {
        if (filters.batchId && classTeacherAllocations.length > 0) {
            console.log("Extracting academic years and semesters from teacher allocations");
            
            // Filter allocations by selected batch
            const batchAllocations = classTeacherAllocations.filter(
                allocation => allocation.batch && allocation.batch.batch_id === parseInt(filters.batchId)
            );

            // Extract unique academic years
            const uniqueAcademicYears = [];
            const academicYearIds = new Set();
            
            batchAllocations.forEach(allocation => {
                if (allocation.academic_year && !academicYearIds.has(allocation.academic_year_id)) {
                    academicYearIds.add(allocation.academic_year_id);
                    uniqueAcademicYears.push({
                        id: allocation.academic_year_id,
                        name: allocation.academic_year.name,
                        year_number: allocation.academic_year.year_number,
                        batch_id: allocation.batch.batch_id,
                        start_date: allocation.academic_year.start_date,
                        end_date: allocation.academic_year.end_date
                    });
                }
            });

            // Extract unique semesters
            const uniqueSemesters = [];
            const semesterIds = new Set();
            
            batchAllocations.forEach(allocation => {
                if (allocation.semester && !semesterIds.has(allocation.semester_id)) {
                    semesterIds.add(allocation.semester_id);
                    uniqueSemesters.push({
                        id: allocation.semester_id,
                        name: allocation.semester.name,
                        semester_number: allocation.semester.semester_number,
                        academic_year_id: allocation.academic_year_id,
                        batch_id: allocation.batch.batch_id,
                        program_id: allocation.program_id
                    });
                }
            });

            console.log("Extracted academic years:", uniqueAcademicYears);
            console.log("Extracted semesters:", uniqueSemesters);
            
            setAcademicYears(uniqueAcademicYears);
            setSemesters(uniqueSemesters);

            // Auto-select first academic year and semester if available
            if (uniqueAcademicYears.length > 0 && uniqueSemesters.length > 0) {
                setFilters(prev => ({
                    ...prev,
                    academicYearId: uniqueAcademicYears[0].id,
                    semesterId: uniqueSemesters[0].id
                }));
            }
        } else {
            setAcademicYears([]);
            setSemesters([]);
        }
    }, [filters.batchId, classTeacherAllocations]);

    // Fetch subject types when both academic year and semester are selected
    useEffect(() => {
        const fetchSubjectTypes = async () => {
            if (filters.academicYearId && filters.semesterId) {
                try {
                    console.log("Fetching subject types for:", filters.academicYearId, filters.semesterId);
                    const types = await subjectSelectionService.getSubjectTypes(
                        filters.academicYearId,
                        filters.semesterId
                    );
                    console.log("Fetched subject types:", types);
                    setSubjectTypes(types);
                } catch (error) {
                    console.error("Error fetching subject types:", error);
                    setSubjectTypes([]);
                }
            } else {
                // Clear subject types if academic year or semester is not selected
                setSubjectTypes([]);
            }
        };

        fetchSubjectTypes();
    }, [filters.academicYearId, filters.semesterId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Get current teacher ID from localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherId = currentUser?.jti;

            if (!teacherId) {
                throw new Error('Teacher ID not found');
            }

            // Fetch teacher allocated programs
            const response = await getTeacherAllocatedPrograms(teacherId);
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch teacher allocations');
            }

            const allocationsData = response.data;
            setTeacherAllocations(allocationsData);

            // Extract class teacher allocations only
            const classAllocations = allocationsData.class_teacher_allocation || [];
            setClassTeacherAllocations(classAllocations);

            // Extract unique programs from class teacher allocations
            const uniquePrograms = [];
            const programIds = new Set();
            
            classAllocations.forEach(allocation => {
                if (allocation.program && !programIds.has(allocation.program.program_id)) {
                    programIds.add(allocation.program.program_id);
                    uniquePrograms.push({
                        program_id: allocation.program.program_id,
                        program_name: allocation.program.program_name,
                        program_code: allocation.program.program_code
                    });
                }
            });

            setPrograms(uniquePrograms);

            // Auto-select first program if available
            if (uniquePrograms.length > 0) {
                setFilters(prev => ({ ...prev, programId: uniquePrograms[0].program_id }));
            }

            // Fetch subject selections (keeping this for now)
            const selectionsData = await subjectSelectionService.getAllSubjectSelections();
            setSubjectSelections(selectionsData);

        } catch (error) {
            console.error("Error fetching data:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {error.message || "Failed to load data. Please try again."}
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = (programId) => {
        try {
            // Filter class teacher allocations by selected program
            const programAllocations = classTeacherAllocations.filter(
                allocation => allocation.program_id === parseInt(programId)
            );

            // Extract unique batches
            const uniqueBatches = [];
            const batchIds = new Set();
            
            programAllocations.forEach(allocation => {
                if (allocation.batch && !batchIds.has(allocation.batch.batch_id)) {
                    batchIds.add(allocation.batch.batch_id);
                    uniqueBatches.push({
                        batch_id: allocation.batch.batch_id,
                        batch_code: allocation.batch.batch_code,
                        batch_name: allocation.batch.batch_name
                    });
                }
            });

            setBatches(uniqueBatches);

            // Auto-select first batch if available
            if (uniqueBatches.length > 0) {
                setFilters(prev => ({ ...prev, batchId: uniqueBatches[0].batch_id }));
            }
        } catch (error) {
            console.error("Error processing batches:", error);
            setBatches([]);
        }
    };

    const applyFiltersAndSearch = () => {
        let filtered = [...subjectSelections];

        // Apply filters - REAL-TIME
        if (filters.programId) {
            filtered = filtered.filter(
                (item) => item.programId === filters.programId
            );
        }
        if (filters.batchId) {
            filtered = filtered.filter(
                (item) => item.batchId === filters.batchId
            );
        }
        if (filters.academicYearId) {
            filtered = filtered.filter(
                (item) => item.academicYearId === filters.academicYearId
            );
        }
        if (filters.semesterId) {
            filtered = filtered.filter(
                (item) => item.semesterId === filters.semesterId
            );
        }

        // Apply search
        if (searchTerm.trim()) {
            filtered = filtered.filter((item) =>
                [
                    item.program,
                    item.batch,
                    item.academicYear,
                    item.semester,
                    item.subjectType,
                ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredData(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));

        // Clear dependent filters when parent changes
        if (field === "programId") {
            setFilters(prev => ({
                ...prev,
                batchId: "",
                academicYearId: "",
                semesterId: "",
            }));
        } else if (field === "batchId") {
            setFilters(prev => ({
                ...prev,
                academicYearId: "",
                semesterId: "",
            }));
        }
    };

    const handleClearFilters = () => {
        setFilters({
            programId: "",
            batchId: "",
            academicYearId: "",
            semesterId: "",
        });
        setBatches([]);
        setAcademicYears([]);
        setSemesters([]);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const handleAddNew = async (data) => {
        try {
            // Transform data from modal to configuration format
            const configPayload = {
                academicYearId: data.academicYearId,
                semesterId: data.semesterId,
                subjectTypeId: data.subjectTypeId,
                verticalId: data.verticalId || null,
                maxSelections: 0, // Default values
                minSelections: 0,
                startTime: null,
                endTime: null,
                studentLimitPerSubject: null,
                subjectSetRequest: [],
            };

            await subjectSelectionService.createSubjectSelectionConfig(configPayload);

            // Refresh configurations
            if (filters.academicYearId && filters.semesterId) {
                const updatedConfigs = await subjectSelectionService.getSubjectSelectionConfigs(
                    filters.academicYearId,
                    filters.semesterId,
                    null,
                    null
                );
                setExistingConfigs(updatedConfigs);
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating configuration:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to create configuration. Please try again.
                </SweetAlert>
            );
        }
    };

    const handleEdit = (item) => {
        // TODO: Implement edit functionality
        console.log("Edit item:", item);
        setAlert(
            <SweetAlert
                info
                title="Coming Soon"
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass="btn-confirm"
            >
                Edit functionality will be implemented soon.
            </SweetAlert>
        );
    };

    const handleDeleteClick = (item) => {
        setDeleteConfirm(item);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await subjectSelectionService.deleteSubjectSelection(deleteConfirm.id);

            // Remove from local state
            setSubjectSelections((prev) =>
                prev.filter((item) => item.id !== deleteConfirm.id)
            );

            setDeleteConfirm(null);
            setAlert(
                <SweetAlert
                    success
                    title="Deleted!"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Subject selection has been deleted.
                </SweetAlert>
            );
        } catch (error) {
            console.error("Error deleting subject selection:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to delete subject selection. Please try again.
                </SweetAlert>
            );
        }
    };

    const handleSaveConfiguration = async (configData) => {
        try {
            console.log("\n=== SAVE CONFIGURATION TRIGGERED ===");
            console.log("Raw configData from ConfigView:", configData);

            // Build complete payload with all configuration fields
            const completePayload = {
                // IDs
                academicYearId: filters.academicYearId,
                semesterId: filters.semesterId,
                subjectTypeId: configData.subjectTypeId || selectedTypeForConfig?.id,
                verticalId: configData.verticalId || selectedVerticalForConfig?.id || null,

                // Selection constraints
                maxSelections: configData.maxSelections || null,
                minSelections: configData.minSelections || null,

                // Time constraints
                startTime: configData.startTime || null,
                endTime: configData.endTime || null,

                // Student limit
                studentLimitPerSubject: configData.studentLimitPerSubject || null,

                // Subject sets
                subjectSetRequest: configData.subjectSetRequest || [],
                // subjectSetId: configData.subject_set_id || null,

                // Other fields
                selectionType: configData.selectionType || null,
                configId: configData.configId || null,
            };

            console.log("\n=== COMPLETE PAYLOAD (camelCase) ===");
            console.log(JSON.stringify(completePayload, null, 2));

            // Convert to snake_case for API
            const apiPayload = {
                academic_year_id: parseInt(completePayload.academicYearId),
                semester_id: parseInt(completePayload.semesterId),
                subject_type_id: parseInt(completePayload.subjectTypeId),
                vertical_type_id: completePayload.verticalId ? parseInt(completePayload.verticalId) : null,
                maximum_selections: completePayload.maxSelections ? parseInt(completePayload.maxSelections) : null,
                minimum_selections: completePayload.minSelections ? parseInt(completePayload.minSelections) : null,
                start_time: completePayload.startTime,
                end_time: completePayload.endTime,
                limit_per_subject_selections: completePayload.studentLimitPerSubject ? parseInt(completePayload.studentLimitPerSubject) : null,
                subject_set_request: (completePayload.subjectSetRequest || []).map(set => ({
                    set_number: set.setNumber,
                    subject_set_name: set.setName,
                    subject_ids: set.subjectIds,
                    selection_type: completePayload.selectionType || null,
                    // subject_set_id: completePayload.subjectSetId || null,
                    subject_set_id: set.subjectSetId || null,
                }))
            };

            console.log("\n=== API PAYLOAD (snake_case - TO BE SENT) ===");
            console.log(JSON.stringify(apiPayload, null, 2));
            console.log("\n=========================================\n");

            // Check if this is an update or create
            if (completePayload.configId) {
                console.log("Action: UPDATE - Config ID:", completePayload.configId);
                await subjectSelectionService.updateSubjectSelectionConfig(completePayload.configId, apiPayload);
            } else {
                console.log("Action: CREATE NEW");
                await subjectSelectionService.createSubjectSelectionConfig(apiPayload);
            }

            // Refresh configurations
            console.log("Refreshing configurations...");
            const updatedConfigs = await subjectSelectionService.getSubjectSelectionConfigs(
                filters.academicYearId,
                filters.semesterId,
                null,
                null
            );
            setExistingConfigs(updatedConfigs);

            setAlert(
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Configuration saved successfully.
                </SweetAlert>
            );
        } catch (error) {
            console.error("Error saving configuration:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to save configuration. Please try again.
                </SweetAlert>
            );
        }
    };

    const handleCancelConfiguration = () => {
        setShowConfigView(false);
        setSelectedTypeForConfig(null);
        setSelectedVerticalForConfig(null);
    };

    const handleViewDetails = (configData, subjectType, vertical) => {
        const fullScreenData = {
            configData,
            subjectType,
            vertical
        };
        
        setFullScreenData(fullScreenData);
        setShowFullScreenView(true);
        
        // Save to localStorage and update URL hash
        localStorage.setItem('subjectSelection_fullScreenData', JSON.stringify(fullScreenData));
        window.location.hash = 'fullscreen';
    };

    const handleBackToDashboard = () => {
        setShowFullScreenView(false);
        setFullScreenData({
            configData: null,
            subjectType: null,
            vertical: null
        });
        
        // Clear localStorage and URL hash
        localStorage.removeItem('subjectSelection_fullScreenData');
        window.location.hash = '';
    };

    // Check if we should show config view based on filters
    useEffect(() => {
        if (filters.academicYearId && filters.semesterId && subjectTypes.length > 0) {
            // Auto-show config view when subject types are loaded
            if (subjectTypes.length === 1) {
                setSelectedTypeForConfig(subjectTypes[0]);
            }
            setShowConfigView(true);
        } else {
            setShowConfigView(false);
        }
    }, [filters.academicYearId, filters.semesterId, subjectTypes]);

    // Auto-load configurations when Academic Year + Semester selected
    useEffect(() => {
        const fetchAllConfigs = async () => {
            if (filters.academicYearId && filters.semesterId) {
                try {
                    console.log("Auto-loading configs for Academic Year + Semester");
                    const configs = await subjectSelectionService.getSubjectSelectionConfigs(
                        filters.academicYearId,
                        filters.semesterId,
                        null, // No type filtering - get all
                        null  // No vertical filtering
                    );
                    console.log("Loaded all configs:", configs);
                    setExistingConfigs(configs);

                    // Auto-show config view if configs exist
                    if (configs.length > 0) {
                        setShowConfigView(true);
                    }
                } catch (error) {
                    console.error("Error auto-loading configs:", error);
                    setExistingConfigs([]);
                }
            } else {
                setExistingConfigs([]);
                setShowConfigView(false);
            }
        };
        fetchAllConfigs();
    }, [filters.academicYearId, filters.semesterId]);



    // Filter academic years based on selected batch (already filtered in useEffect)
    const filteredAcademicYears = academicYears.filter(ay => {
        if (!filters.batchId) return true;
        return ay.batch_id === parseInt(filters.batchId);
    });

    // Filter semesters based on selected batch and academic year (already filtered in useEffect)
    const filteredSemesters = semesters.filter(sem => {
        if (!filters.batchId) return true;
        if (filters.academicYearId && sem.academic_year_id !== parseInt(filters.academicYearId)) {
            return false;
        }
        return sem.batch_id === parseInt(filters.batchId);
    });

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-600">
                Loading subject selections...
            </div>
        );
    }

    // Show Add New Page if enabled
    if (showAddNewPage) {
        return (
            <AddSubjectSelectionModal
                isOpen={true}
                onClose={() => setShowAddNewPage(false)}
                onSubmit={handleAddNew}
                programs={programs}
            />
        );
    }

    // Show full screen view if enabled
    if (showFullScreenView) {
        return (
            <SubjectSelectionFullScreenView
                onBack={handleBackToDashboard}
                configData={fullScreenData.configData}
                subjectType={fullScreenData.subjectType}
                vertical={fullScreenData.vertical}
                academicYearId={filters.academicYearId}
                semesterId={filters.semesterId}
            />
        );
    }

    return (
        <div className="p-0 md:p-0">
            {/* Header with Search and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search paper selections..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                    />
                </div>

                <button
                    onClick={() => setShowAddNewPage(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all"
                >
                    <Plus size={20} />
                    <span>Add New</span>
                </button>
            </div>

            {/* Filters */}
            <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                programs={programs}
                batches={batches}
                academicYears={filteredAcademicYears}
                semesters={filteredSemesters}
            />

            {/* Configuration View - Shows when configs are loaded */}
            {showConfigView && existingConfigs.length > 0 && (
                <div className="mb-6 space-y-4">
                    {/* Display all configurations */}
                    {existingConfigs.map((config, index) => (
                        <SubjectSelectionConfigView
                            key={config.subject_selection_config_id || config.id || index}
                            subjectType={{
                                id: config.subject_type_id,
                                name: config.subject_type_name || "Subject Type",
                                subject_count: config.available_subjects || 0
                            }}
                            vertical={config.vertical_type_id ? {
                                id: config.vertical_type_id,
                                name: config.vertical_type_name || "Vertical"
                            } : null}
                            existingConfig={config}
                            academicYearId={filters.academicYearId}
                            semesterId={filters.semesterId}
                            onSave={handleSaveConfiguration}
                            onCancel={handleCancelConfiguration}
                            onViewDetails={handleViewDetails}
                            isReadOnly={false}
                        />
                    ))}

                    {/* Add Another Config Button */}

                </div>
            )}

            {/* Empty state when no configs and filters selected */}
            {/* {filters.academicYearId && filters.semesterId && existingConfigs.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="text-center">
                        <p className="text-gray-500 text-lg mb-2">No configurations found</p>
                        <p className="text-gray-400 text-sm mb-4">
                            Create your first subject selection configuration for this academic year and semester
                        </p>
                        <button
                            onClick={() => setShowAddNewPage(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Add Configuration
                        </button>
                    </div>
                </div>
            )} */}

            {/* Table - Hidden when config view is shown */}
            {!showConfigView && (
                <SubjectSelectionTable
                    data={filteredData}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

{/* Delete Confirmation */}
            {deleteConfirm && (
                <SweetAlert
                    warning
                    showCancel
                    title="Are you sure?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmBtnText="OK"
                    cancelBtnText="Cancel"
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                >
                    Are you sure you want to delete this subject selection for{" "}
                    {deleteConfirm.program}?
                </SweetAlert>
            )}

            {/* Alerts */}
            {alert}
        </div>
    );
}
