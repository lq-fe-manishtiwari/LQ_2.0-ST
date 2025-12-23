import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Users, Clock, Settings, BookOpen, Target, Search, Filter, X, Plus, Check, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { subjectSelectionService } from "../Services/subjectSelection.service";

/**
 * SubjectSelectionFullScreenView Component
 * Fully mobile responsive UI with real API integration for student selection status
 */
const SubjectSelectionFullScreenView = ({
    onBack,
    configData,
    subjectType,
    vertical = null,
    academicYearId,
    semesterId,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Local state for tracking unsaved changes
    const [localSelectedSubjects, setLocalSelectedSubjects] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSuccessMessage] = useState(null);

    // Multi-select state for bulk operations
    const [selectedStudents, setSelectedStudents] = useState([]); // Array of student IDs
    const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(10); // Students per page


    // Fetch students data when component mounts
    useEffect(() => {
        fetchStudentsData();
    }, [configData]);

    const fetchStudentsData = async () => {
        if (!configData?.subject_selection_config_id) {
            setError("Configuration ID not found");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await subjectSelectionService.getAllStudentsSelectionStatus(
                configData.subject_selection_config_id
            );

            // Transform API response to match our component structure
            const transformedData = data.map(student => {
                // Construct full name from firstname, middlename, lastname
                const fullName = [
                    student.firstname || '',
                    student.middlename || '',
                    student.lastname || ''
                ].filter(name => name.trim()).join(' ').trim() || 'Unknown Student';

                // Parse selected subjects if it's a string, otherwise use as array
                let selectedSubjects = [];
                if (student.selected_subjects) {
                    try {
                        selectedSubjects = typeof student.selected_subjects === 'string'
                            ? JSON.parse(student.selected_subjects)
                            : student.selected_subjects;
                    } catch (e) {
                        selectedSubjects = [];
                    }
                }

                return {
                    id: student.student_id,
                    name: fullName,
                    rollNumber: student.roll_number || 'N/A',
                    email: student.email || 'N/A',
                    phone: student.phone || 'N/A',
                    status: student.status || (student.has_selection ? 'SUBMITTED' : 'PENDING'),
                    selectedSubjects: Array.isArray(selectedSubjects) ? selectedSubjects : [],
                    maxSelections: configData?.maximum_selections || 5,
                    totalSelections: Array.isArray(selectedSubjects) ? selectedSubjects.length : 0,
                    profilePic: null,
                    // Additional fields from API
                    firstName: student.firstname,
                    middleName: student.middlename,
                    lastName: student.lastname,
                    hasSelection: student.has_selection,
                    selectionId: student.selection_id,
                    selectionTime: student.selection_time
                };
            });

            setStudentsData(transformedData);
        } catch (err) {
            console.error("Error fetching students data:", err);
            setError("Failed to load students data");
            setStudentsData([]);
        } finally {
            setLoading(false);
        }
    };

    const displayName = vertical ? `${vertical.name}` : subjectType?.name || "Configuration";
    const availableSubjects = configData?.allocated_subject_count || subjectType?.subject_count || 0;

    // Get all available subjects from config data
    const getAllAvailableSubjects = () => {
        if (!configData?.subject_sets) return [];

        const allSubjects = [];
        configData.subject_sets.forEach(set => {
            if (set.subjects && Array.isArray(set.subjects)) {
                set.subjects.forEach(subject => {
                    allSubjects.push({
                        id: subject.subject_id,
                        name: subject.subject_name,
                        code: subject.subject_code || 'N/A',
                        paper_code: subject.paper_code || 'N/A',
                        type: subject.subject_type_name || 'N/A',
                        set_name: set.subject_set_name
                    });
                });
            }
        });
        return allSubjects;
    };

    const allAvailableSubjects = getAllAvailableSubjects();

    // Filter students based on search and status
    const filteredStudents = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && (student.status === "SUBMITTED" || student.hasSelection)) ||
            (statusFilter === "inactive" && (student.status === "PENDING" || !student.hasSelection));

        return matchesSearch && matchesStatus;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to first page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const getSelectionStatusColor = (selected, max) => {
        const percentage = (selected / max) * 100;
        if (percentage === 100) return "bg-green-100 text-green-800";
        if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
        if (percentage > 0) return "bg-blue-100 text-blue-800";
        return "bg-gray-100 text-gray-800";
    };

    const handleStudentClick = (student) => {
        // If bulk selection mode is active, toggle selection instead of opening modal
        if (bulkSelectionMode) {
            handleToggleStudentSelection(student.id);
            return;
        }

        setSelectedStudent(student);
        setLocalSelectedSubjects([...student.selectedSubjects]); // Copy current selections
        setHasUnsavedChanges(false);
        setSaveError(null);
        setSuccessMessage(null);
        setShowStudentModal(true);
    };

    // Multi-select handlers
    const handleToggleStudentSelection = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === currentStudents.length) {
            // Deselect all
            setSelectedStudents([]);
        } else {
            // Select all current page students
            setSelectedStudents(currentStudents.map(s => s.id));
        }
    };

    const handleToggleBulkMode = () => {
        setBulkSelectionMode(!bulkSelectionMode);
        if (bulkSelectionMode) {
            // Exiting bulk mode, clear selections
            setSelectedStudents([]);
        }
    };

    const handleBulkSubjectSelection = () => {
        if (selectedStudents.length === 0) {
            alert("Please select at least one student");
            return;
        }

        // Initialize bulk subject selections for each selected student
        const initialBulkData = {};
        selectedStudents.forEach(studentId => {
            const student = studentsData.find(s => s.id === studentId);
            if (student) {
                initialBulkData[studentId] = [...student.selectedSubjects];
            }
        });

        setBulkSubjectSelections(initialBulkData);
        setShowBulkModal(true);
    };

    // Bulk modal state
    const [bulkSubjectSelections, setBulkSubjectSelections] = useState({});
    const [bulkHasChanges, setBulkHasChanges] = useState(false);
    const [bulkSaving, setBulkSaving] = useState(false);
    const [currentBulkStudent, setCurrentBulkStudent] = useState(null); // For individual editing

    // Get common subjects across all selected students
    const getCommonSubjects = () => {
        if (selectedStudents.length === 0) return [];

        const selectedStudentObjects = studentsData.filter(s => selectedStudents.includes(s.id));
        if (selectedStudentObjects.length === 0) return [];

        // Start with first student's subjects
        const firstStudent = selectedStudentObjects[0];
        const commonSubjects = [...firstStudent.selectedSubjects];

        // Filter to only subjects that ALL students have
        return commonSubjects.filter(subject => {
            const subjectId = typeof subject === 'object' ? subject.subject_id : subject;
            return selectedStudentObjects.every(student => {
                return student.selectedSubjects.some(s => {
                    const sId = typeof s === 'object' ? s.subject_id : s;
                    return sId === subjectId;
                });
            });
        });
    };

    // Add subject to all selected students in bulk
    const handleBulkAddSubject = (subject) => {
        const newSelections = { ...bulkSubjectSelections };
        let updated = false;

        selectedStudents.forEach(studentId => {
            const student = studentsData.find(s => s.id === studentId);
            if (!student) return;

            const currentSelections = newSelections[studentId] || [];
            if (currentSelections.length < student.maxSelections) {
                const alreadySelected = currentSelections.some(s =>
                    (typeof s === 'object' ? s.subject_id : s) === subject.id
                );

                if (!alreadySelected) {
                    newSelections[studentId] = [...currentSelections, {
                        subject_id: subject.id,
                        subject_name: subject.name
                    }];
                    updated = true;
                }
            }
        });

        if (updated) {
            setBulkSubjectSelections(newSelections);
            setBulkHasChanges(true);
        }
    };

    // Remove subject from all selected students in bulk
    const handleBulkRemoveSubject = (subjectId) => {
        const newSelections = { ...bulkSubjectSelections };

        selectedStudents.forEach(studentId => {
            const currentSelections = newSelections[studentId] || [];
            newSelections[studentId] = currentSelections.filter(subject =>
                (typeof subject === 'object' ? subject.subject_id : subject) !== subjectId
            );
        });

        setBulkSubjectSelections(newSelections);
        setBulkHasChanges(true);
    };

    // Add subject to individual student
    const handleIndividualAddSubject = (studentId, subject) => {
        const student = studentsData.find(s => s.id === studentId);
        if (!student) return;

        const currentSelections = bulkSubjectSelections[studentId] || [];
        if (currentSelections.length >= student.maxSelections) return;

        const alreadySelected = currentSelections.some(s =>
            (typeof s === 'object' ? s.subject_id : s) === subject.id
        );

        if (!alreadySelected) {
            setBulkSubjectSelections({
                ...bulkSubjectSelections,
                [studentId]: [...currentSelections, {
                    subject_id: subject.id,
                    subject_name: subject.name
                }]
            });
            setBulkHasChanges(true);
        }
    };

    // Remove subject from individual student
    const handleIndividualRemoveSubject = (studentId, subjectId) => {
        const currentSelections = bulkSubjectSelections[studentId] || [];
        setBulkSubjectSelections({
            ...bulkSubjectSelections,
            [studentId]: currentSelections.filter(subject =>
                (typeof subject === 'object' ? subject.subject_id : subject) !== subjectId
            )
        });
        setBulkHasChanges(true);
    };

    // Save bulk changes
    const handleBulkSave = async () => {
        if (!bulkHasChanges) return;

        setBulkSaving(true);
        setSaveError(null);
        setSuccessMessage(null);

        try {
            // Prepare bulk request entries
            const entries = selectedStudents.map(studentId => {
                const subjectIds = (bulkSubjectSelections[studentId] || []).map(subject =>
                    typeof subject === 'object' ? subject.subject_id : subject
                );

                return {
                    studentId: studentId,
                    subjectSelectionConfigId: configData.subject_selection_config_id,
                    subjectIds: subjectIds
                };
            });

            const bulkRequest = { entries };

            console.log("Sending bulk save request:", bulkRequest);

            const response = await subjectSelectionService.bulkSaveOrUpdateSubjectSelections(bulkRequest);

            if (response) {
                console.log("Bulk save successful:", response);

                // Update local state
                const updatedStudents = studentsData.map(student => {
                    if (selectedStudents.includes(student.id)) {
                        const newSelections = bulkSubjectSelections[student.id] || [];
                        return {
                            ...student,
                            selectedSubjects: newSelections,
                            totalSelections: newSelections.length,
                            hasSelection: newSelections.length > 0,
                            status: newSelections.length > 0 ? 'SUBMITTED' : 'PENDING'
                        };
                    }
                    return student;
                });

                setStudentsData(updatedStudents);
                setBulkHasChanges(false);
                setSuccessMessage(`Successfully updated ${selectedStudents.length} students!`);

                // Refresh data
                setTimeout(async () => {
                    try {
                        await fetchStudentsData();
                    } catch (error) {
                        console.error("Error refreshing data:", error);
                    }
                }, 1000);

                // Auto close modal after success
                setTimeout(() => {
                    setShowBulkModal(false);
                    setSelectedStudents([]);
                    setBulkSelectionMode(false);
                    setSuccessMessage(null);
                }, 2000);
            }

        } catch (error) {
            console.error("Error in bulk save:", error);
            setSaveError(error.message || "Failed to save bulk changes");
        } finally {
            setBulkSaving(false);
        }
    };

    const handleAddSubject = (subject) => {
        if (selectedStudent && localSelectedSubjects.length < selectedStudent.maxSelections) {
            const newSubject = {
                subject_id: subject.id,
                subject_name: subject.name
            };

            const updatedSelections = [...localSelectedSubjects, newSubject];
            setLocalSelectedSubjects(updatedSelections);
            setHasUnsavedChanges(true);
        }
    };

    const handleRemoveSubject = (subjectId) => {
        if (selectedStudent) {
            const updatedSelections = localSelectedSubjects.filter(subject =>
                (typeof subject === 'object' ? subject.subject_id : subject) !== subjectId
            );
            setLocalSelectedSubjects(updatedSelections);
            setHasUnsavedChanges(true);
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedStudent || !hasUnsavedChanges) return;

        setSaving(true);
        setSaveError(null);
        setSuccessMessage(null);

        try {
            // Prepare subject IDs for API
            const subjectIds = localSelectedSubjects.map(subject =>
                typeof subject === 'object' ? subject.subject_id : subject
            );

            // Use bulk API endpoint even for single student
            // This provides consistency and allows future batch operations
            const bulkRequest = {
                entries: [
                    {
                        studentId: selectedStudent.id,
                        subjectSelectionConfigId: configData.subject_selection_config_id,
                        subjectIds: subjectIds
                    }
                ]
            };

            console.log("Sending bulk update request for single student:", bulkRequest);

            // Call bulk API
            const response = await subjectSelectionService.bulkSaveOrUpdateSubjectSelections(bulkRequest);

            // Only update UI if API call was successful
            if (response) {
                console.log("Bulk API response:", response);

                // Update the main students data with saved changes
                const updatedStudents = studentsData.map(student => {
                    if (student.id === selectedStudent.id) {
                        const updatedStudent = {
                            ...student,
                            selectedSubjects: [...localSelectedSubjects],
                            totalSelections: localSelectedSubjects.length,
                            hasSelection: true,
                            status: 'SUBMITTED'
                        };
                        setSelectedStudent(updatedStudent);
                        return updatedStudent;
                    }
                    return student;
                });

                setStudentsData(updatedStudents);
                setHasUnsavedChanges(false);
                setSuccessMessage("Subject selection saved successfully!");

                // Refresh data from API to get latest state
                setTimeout(async () => {
                    try {
                        await fetchStudentsData();
                    } catch (error) {
                        console.error("Error refreshing data after save:", error);
                    }
                }, 1000);

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            }

        } catch (error) {
            console.error("Error saving student subject selection:", error);

            // Set error message for UI display
            let errorMessage = "Failed to save changes. Please try again.";

            if (error.message) {
                errorMessage = error.message;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            setSaveError(errorMessage);

            // Auto-hide error message after 5 seconds
            setTimeout(() => {
                setSaveError(null);
            }, 5000);

        } finally {
            setSaving(false);
        }
    };

    const handleCancelChanges = () => {
        if (selectedStudent) {
            setLocalSelectedSubjects([...selectedStudent.selectedSubjects]);
            setHasUnsavedChanges(false);
            setSaveError(null);
            setSuccessMessage(null);
        }
    };

    const getSelectedSubjects = () => {
        // Return local selected subjects when in modal, otherwise return student's actual selections
        return showStudentModal ? localSelectedSubjects : (selectedStudent?.selectedSubjects || []);
    };

    const getAvailableSubjects = () => {
        // Use local selections when in modal for real-time filtering
        const currentSelections = showStudentModal ? localSelectedSubjects : (selectedStudent?.selectedSubjects || []);
        const selectedSubjectIds = currentSelections.map(subject =>
            typeof subject === 'object' ? subject.subject_id : subject
        );
        return allAvailableSubjects.filter(subject => !selectedSubjectIds.includes(subject.id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile-Responsive Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onBack) {
                                        onBack();
                                    }
                                }}
                                className="p-2 hover:bg-blue-800 rounded-full transition-colors flex-shrink-0"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                            </button>
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <Settings size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
                                <div className="min-w-0">
                                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{displayName}</h1>
                                    <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">Subject Selection Configuration & Student Management</p>
                                    <p className="text-blue-100 text-xs sm:hidden">Configuration & Students</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right sm:text-right w-full sm:w-auto">
                            <p className="text-blue-100 text-xs sm:text-sm">Total Students</p>
                            <p className="text-xl sm:text-2xl font-bold">{studentsData.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-Responsive Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Enhanced Configuration Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                    {/* Main Configuration Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                <BookOpen size={18} className="sm:w-5 sm:h-5" />
                                Configuration Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-blue-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Subject Type:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-blue-700 truncate">{displayName}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-green-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Max Selections:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-green-700">
                                            {configData?.maximum_selections || "5"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-yellow-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Min Selections:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-yellow-700">
                                            {configData?.minimum_selections || "2"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Available Subjects:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-purple-700">{availableSubjects}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-indigo-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Student Limit/Subject:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-indigo-700">
                                            {configData?.limit_per_subject_selections || "30"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-red-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Start Date:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-red-700">
                                            {configData?.start_time
                                                ? new Date(configData.start_time).toLocaleDateString()
                                                : "01 Jan 2024"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-orange-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">End Date:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-orange-700">
                                            {configData?.end_time
                                                ? new Date(configData.end_time).toLocaleDateString()
                                                : "31 Jan 2024"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-teal-50 rounded-lg gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Subject Sets:</span>
                                        <span className="text-xs sm:text-sm font-semibold text-teal-700">
                                            {configData?.subject_sets?.length || "2"} sets
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile-Responsive Statistics */}
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 lg:space-y-4 lg:block">
                        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                                <div className="p-2 bg-green-100 rounded-lg mb-2 lg:mb-0">
                                    <Users size={16} className="sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-green-600" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                        {studentsData.filter(s => s.status === 'SUBMITTED' || s.hasSelection).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg mb-2 lg:mb-0">
                                    <Target size={16} className="sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-blue-600" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                        {studentsData.filter(s => s.selectedSubjects.length === s.maxSelections).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex flex-col lg:flex-row items-center lg:gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg mb-2 lg:mb-0">
                                    <Clock size={16} className="sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-yellow-600" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                        {studentsData.filter(s => s.selectedSubjects.length > 0 && s.selectedSubjects.length < s.maxSelections).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile-Responsive Students Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Students Header with Search and Filter */}
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Users size={18} className="sm:w-5 sm:h-5" />
                                    Students ({filteredStudents.length})
                                    {bulkSelectionMode && selectedStudents.length > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                            {selectedStudents.length} selected
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    {bulkSelectionMode
                                        ? "Select students to assign subjects in bulk"
                                        : "Click on any student to manage their subject selections"
                                    }
                                    {filteredStudents.length > studentsPerPage && !bulkSelectionMode && (
                                        <span className="ml-2 text-blue-600">
                                            • Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Bulk Mode Toggle */}
                                <button
                                    onClick={handleToggleBulkMode}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${bulkSelectionMode
                                        ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                                        }`}
                                >
                                    {bulkSelectionMode ? '✕ Cancel Bulk Mode' : '☑ Bulk Selection Mode'}
                                </button>

                                {/* Bulk Actions - Show only in bulk mode with selections */}
                                {bulkSelectionMode && selectedStudents.length > 0 && (
                                    <button
                                        onClick={handleBulkSubjectSelection}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Assign Subjects ({selectedStudents.length})
                                    </button>
                                )}

                                {/* Search */}
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600">Loading students...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center m-4">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={fetchStudentsData}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Mobile-First Students List */}
                    {!loading && !error && (
                        <div className="block sm:hidden">
                            <div className="divide-y divide-gray-200">
                                {currentStudents.map((student) => (
                                    <div key={student.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleStudentClick(student)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {/* Checkbox for bulk selection */}
                                                {bulkSelectionMode && (
                                                    <div className="flex-shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student.id)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleStudentSelection(student.id);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {student.rollNumber}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'SUBMITTED' || student.hasSelection
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {student.status === 'SUBMITTED' || student.hasSelection ? 'Submitted' : 'Pending'}
                                                </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSelectionStatusColor(student.selectedSubjects.length, student.maxSelections)
                                                    }`}>
                                                    {student.selectedSubjects.length}/{student.maxSelections}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${student.selectedSubjects.length === student.maxSelections
                                                        ? 'bg-green-600'
                                                        : student.selectedSubjects.length > 0
                                                            ? 'bg-blue-600'
                                                            : 'bg-gray-400'
                                                        }`}
                                                    style={{
                                                        width: `${(student.selectedSubjects.length / student.maxSelections) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 text-center">
                                                {Math.round((student.selectedSubjects.length / student.maxSelections) * 100)}% complete
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Desktop Table */}
                    {!loading && !error && (
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* Checkbox column header */}
                                        {bulkSelectionMode && (
                                            <th className="px-4 lg:px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                    title="Select All"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Roll Number
                                        </th>
                                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>

                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Selections
                                        </th>
                                        <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleStudentClick(student)}>
                                            {/* Checkbox column */}
                                            {bulkSelectionMode && (
                                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStudentSelection(student.id);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                                            <span className="text-white font-medium text-sm">
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate max-w-32 lg:max-w-none">
                                                            {student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.rollNumber}</div>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.phone}</div>
                                            </td>

                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSelectionStatusColor(student.selectedSubjects.length, student.maxSelections)
                                                    }`}>
                                                    {student.selectedSubjects.length}/{student.maxSelections} selected
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${student.selectedSubjects.length === student.maxSelections
                                                            ? 'bg-green-600'
                                                            : student.selectedSubjects.length > 0
                                                                ? 'bg-blue-600'
                                                                : 'bg-gray-400'
                                                            }`}
                                                        style={{
                                                            width: `${(student.selectedSubjects.length / student.maxSelections) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {Math.round((student.selectedSubjects.length / student.maxSelections) * 100)}% complete
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStudentClick(student);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                                                >
                                                    <Edit3 size={14} />
                                                    <span className="hidden sm:inline">Manage</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && filteredStudents.length === 0 && (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No students found</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && filteredStudents.length > studentsPerPage && (
                        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Mobile Pagination Info */}
                                <div className="text-sm text-gray-700 order-2 sm:order-1">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                                    <span className="font-medium">{filteredStudents.length}</span> students
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2 order-1 sm:order-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md border ${currentPage === 1
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        title="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            <React.Fragment key={index}>
                                                {page === '...' ? (
                                                    <span className="px-3 py-2 text-gray-500">...</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-3 py-2 rounded-md border text-sm font-medium ${currentPage === page
                                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Mobile Page Info */}
                                    <div className="sm:hidden px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md border">
                                        {currentPage} / {totalPages}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md border ${currentPage === totalPages
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        title="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile-Responsive Student Subject Management Modal */}
            {showStudentModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Mobile-Responsive Modal Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg gap-3 sm:gap-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-medium text-sm sm:text-lg">
                                        {selectedStudent.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl font-bold truncate">{selectedStudent.name}</h2>
                                    <p className="text-blue-100 text-xs sm:text-sm truncate">{selectedStudent.rollNumber} • Subject Selection Management</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (hasUnsavedChanges) {
                                        const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                                        if (!confirmClose) return;
                                    }
                                    setShowStudentModal(false);
                                    setHasUnsavedChanges(false);
                                    setSaveError(null);
                                    setSuccessMessage(null);
                                }}
                                className="p-2 hover:bg-blue-800 rounded-full transition-colors flex-shrink-0 self-end sm:self-center"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Mobile-Responsive Modal Content */}
                        <div className="p-4 sm:p-6">
                            {/* Success/Error Messages */}
                            {saveSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <Check size={16} className="text-green-600 mr-2" />
                                        <p className="text-sm text-green-800">{saveSuccess}</p>
                                    </div>
                                </div>
                            )}

                            {saveError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <X size={16} className="text-red-600 mr-2" />
                                        <p className="text-sm text-red-800">{saveError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                {/* Selected Subjects */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <Check size={18} className="sm:w-5 sm:h-5 text-green-600" />
                                        Selected Subjects ({localSelectedSubjects.length}/{selectedStudent.maxSelections})
                                        {hasUnsavedChanges && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                Unsaved
                                            </span>
                                        )}
                                    </h3>

                                    {getSelectedSubjects().length > 0 ? (
                                        <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                                            {getSelectedSubjects().map((subject, index) => (
                                                <div key={subject.subject_id || index} className="flex items-center justify-between p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{subject.subject_name}</h4>
                                                        <p className="text-xs sm:text-sm text-gray-600">ID: {subject.subject_id}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSubject(subject.subject_id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors flex-shrink-0 ml-2"
                                                        title="Remove Subject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                                            <BookOpen size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 text-sm sm:text-base">No subjects selected yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Available Subjects */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <Plus size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                                        Available Subjects
                                    </h3>

                                    {localSelectedSubjects.length < selectedStudent.maxSelections ? (
                                        <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                                            {getAvailableSubjects().map((subject) => (
                                                <div key={subject.id} className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{subject.name}</h4>
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {subject.code} • {subject.paper_code} • {subject.set_name}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddSubject(subject)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors flex-shrink-0 ml-2"
                                                        title="Add Subject"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                                            <Target size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 text-sm sm:text-base">Maximum selections reached</p>
                                            <p className="text-gray-500 text-xs sm:text-sm mt-2">
                                                Remove some subjects to add new ones
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile-Responsive Modal Footer */}
                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                        Progress: {localSelectedSubjects.length}/{selectedStudent.maxSelections} subjects selected
                                        {hasUnsavedChanges && (
                                            <span className="block text-yellow-600 font-medium">
                                                You have unsaved changes
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasUnsavedChanges) {
                                                    const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
                                                    if (!confirmClose) return;
                                                }
                                                setShowStudentModal(false);
                                                setHasUnsavedChanges(false);
                                                setSaveError(null);
                                                setSuccessMessage(null);
                                            }}
                                            className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            {hasUnsavedChanges ? 'Cancel' : 'Close'}
                                        </button>
                                        {hasUnsavedChanges && (
                                            <button
                                                onClick={handleCancelChanges}
                                                className="flex-1 sm:flex-initial px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors text-sm"
                                            >
                                                Reset
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSaveChanges();
                                            }}
                                            disabled={!hasUnsavedChanges || saving}
                                            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md transition-colors text-sm ${hasUnsavedChanges && !saving
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Subject Selection Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 border-b border-gray-200 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold">Bulk Subject Assignment</h2>
                                    <p className="text-green-100 text-xs sm:text-sm mt-1">
                                        Managing {selectedStudents.length} students
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (bulkHasChanges) {
                                            const confirm = window.confirm("You have unsaved changes. Close anyway?");
                                            if (!confirm) return;
                                        }
                                        setShowBulkModal(false);
                                        setBulkHasChanges(false);
                                        setCurrentBulkStudent(null);
                                    }}
                                    className="p-2 hover:bg-green-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Success/Error Messages */}
                        {saveSuccess && (
                            <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-600 mr-2" />
                                    <p className="text-sm text-green-800">{saveSuccess}</p>
                                </div>
                            </div>
                        )}

                        {saveError && (
                            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <X size={16} className="text-red-600 mr-2" />
                                    <p className="text-sm text-red-800">{saveError}</p>
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <div className="flex overflow-x-auto">
                                <button
                                    onClick={() => setCurrentBulkStudent(null)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${currentBulkStudent === null
                                        ? 'border-b-2 border-green-600 text-green-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    📊 Bulk Operations
                                </button>
                                {studentsData.filter(s => selectedStudents.includes(s.id)).map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => setCurrentBulkStudent(student.id)}
                                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${currentBulkStudent === student.id
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        👤 {student.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6">
                            {/* Bulk Operations View */}
                            {currentBulkStudent === null && (
                                <div className="space-y-6">
                                    {/* Common Subjects Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Target size={18} className="text-green-600" />
                                            Common Subjects (Selected by all students)
                                        </h3>
                                        {getCommonSubjects().length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {getCommonSubjects().map((subject, index) => (
                                                    <div key={subject.subject_id || index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 text-sm">{subject.subject_name}</h4>
                                                            <p className="text-xs text-gray-600">ID: {subject.subject_id}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleBulkRemoveSubject(subject.subject_id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                            title="Remove from all students"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                <p className="text-gray-600 text-sm">No common subjects selected across all students</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Subjects for Bulk Assignment */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Plus size={18} className="text-blue-600" />
                                            Assign to All Students
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                            {allAvailableSubjects.map((subject) => (
                                                <div key={subject.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-sm truncate">{subject.name}</h4>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {subject.code} • {subject.paper_code} • {subject.set_name}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBulkAddSubject(subject)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors ml-2 flex-shrink-0"
                                                        title="Add to all students"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Student-wise Summary */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Users size={18} className="text-purple-600" />
                                            Individual Summary
                                        </h3>
                                        <div className="space-y-3">
                                            {studentsData.filter(s => selectedStudents.includes(s.id)).map(student => (
                                                <div key={student.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                                                                <span className="text-white font-medium text-xs">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                                                                <p className="text-xs text-gray-600">{student.rollNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSelectionStatusColor(
                                                                (bulkSubjectSelections[student.id] || []).length,
                                                                student.maxSelections
                                                            )
                                                                }`}>
                                                                {(bulkSubjectSelections[student.id] || []).length}/{student.maxSelections}
                                                            </span>
                                                            <button
                                                                onClick={() => setCurrentBulkStudent(student.id)}
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Edit →
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {(bulkSubjectSelections[student.id] || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {(bulkSubjectSelections[student.id] || []).map((subject, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700">
                                                                    {subject.subject_name || subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Individual Student Edit View */}
                            {currentBulkStudent !== null && (() => {
                                const student = studentsData.find(s => s.id === currentBulkStudent);
                                if (!student) return null;

                                const studentSelections = bulkSubjectSelections[currentBulkStudent] || [];
                                const selectedSubjectIds = studentSelections.map(s =>
                                    typeof s === 'object' ? s.subject_id : s
                                );
                                const availableForStudent = allAvailableSubjects.filter(
                                    subject => !selectedSubjectIds.includes(subject.id)
                                );

                                return (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Selected Subjects */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Check size={18} className="text-green-600" />
                                                Selected Subjects ({studentSelections.length}/{student.maxSelections})
                                            </h3>
                                            {studentSelections.length > 0 ? (
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {studentSelections.map((subject, index) => (
                                                        <div key={subject.subject_id || index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900 text-sm">{subject.subject_name}</h4>
                                                                <p className="text-xs text-gray-600">ID: {subject.subject_id}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleIndividualRemoveSubject(currentBulkStudent, subject.subject_id)}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                    <BookOpen size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600 text-sm">No subjects selected</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Available Subjects */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Plus size={18} className="text-blue-600" />
                                                Available Subjects
                                            </h3>
                                            {studentSelections.length < student.maxSelections ? (
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {availableForStudent.map((subject) => (
                                                        <div key={subject.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-gray-900 text-sm truncate">{subject.name}</h4>
                                                                <p className="text-xs text-gray-600 truncate">
                                                                    {subject.code} • {subject.paper_code} • {subject.set_name}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleIndividualAddSubject(currentBulkStudent, subject)}
                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors ml-2"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                    <Target size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600 text-sm">Maximum selections reached</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-sm text-gray-600">
                                    {bulkHasChanges ? (
                                        <span className="text-yellow-600 font-medium">⚠ You have unsaved changes</span>
                                    ) : (
                                        <span>No changes made</span>
                                    )}
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            if (bulkHasChanges) {
                                                const confirm = window.confirm("Discard changes?");
                                                if (!confirm) return;
                                            }
                                            setShowBulkModal(false);
                                            setBulkHasChanges(false);
                                            setCurrentBulkStudent(null);
                                        }}
                                        className="flex-1 sm:flex-initial px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkSave}
                                        disabled={!bulkHasChanges || bulkSaving}
                                        className={`flex-1 sm:flex-initial px-6 py-2 rounded-md transition-colors ${bulkHasChanges && !bulkSaving
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {bulkSaving ? 'Saving...' : `Save All Changes (${selectedStudents.length})`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

SubjectSelectionFullScreenView.propTypes = {
    onBack: PropTypes.func.isRequired,
    configData: PropTypes.object,
    subjectType: PropTypes.object,
    vertical: PropTypes.object,
    academicYearId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    semesterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SubjectSelectionFullScreenView;
