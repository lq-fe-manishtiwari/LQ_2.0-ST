import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X, ChevronDown } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { subjectSelectionService } from "../Services/subjectSelection.service";

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, error, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    return (
        <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div
                    className={`w-full px-3 py-2 border rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150 ${disabled
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                        : 'bg-white cursor-pointer hover:border-blue-400'
                        } ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                        {displayValue || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => handleSelect({ value: '', label: placeholder })}
                        >
                            {placeholder}
                        </div>
                        {options.map(option => (
                            <div
                                key={option.value}
                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

/**
 * AddSubjectSelectionModal Component
 * Modal form for creating new subject selections
 * Uses cascading filters: Program → Batch → Academic Year & Semester
 */
const AddSubjectSelectionModal = ({
    isOpen,
    onClose,
    onSubmit,
    programs = [],
    alert: parentAlert
}) => {
    const [formData, setFormData] = useState({
        programId: "",
        batchId: "",
        academicYearId: "",
        semesterId: "",
        subjectTypeId: "",
        subTypeId: "", // For verticals or specializations
    });

    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    // Modal-specific data state (independent from dashboard)
    const [modalBatches, setModalBatches] = useState([]);
    const [modalAcademicYears, setModalAcademicYears] = useState([]);
    const [modalSemesters, setModalSemesters] = useState([]);
    const [modalSubjectTypes, setModalSubjectTypes] = useState([]);

    // Get current subject type with sub_tabs
    const selectedSubjectType = modalSubjectTypes.find(
        type => type.id === parseInt(formData.subjectTypeId)
    );

    // Only consider verticals, ignore specializations
    const verticalOptions = selectedSubjectType?.sub_tabs?.verticals || [];
    const hasVerticals = verticalOptions.length > 0;

    // Filter semesters based on selected academic year
    const filteredModalSemesters = formData.academicYearId
        ? modalSemesters.filter(sem => sem.academic_year_id === parseInt(formData.academicYearId))
        : modalSemesters;

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                programId: "",
                batchId: "",
                academicYearId: "",
                semesterId: "",
                subjectTypeId: "",
                subTypeId: "",
            });
            setErrors({});
            // Clear modal-specific data
            setModalBatches([]);
            setModalAcademicYears([]);
            setModalSemesters([]);
            setModalSubjectTypes([]);
        }
    }, [isOpen]);

    // Fetch batches when modal program changes (independent)
    useEffect(() => {
        const fetchModalBatches = async () => {
            if (formData.programId && isOpen) {
                try {
                    const batchesData = await subjectSelectionService.getBatchesByProgramId(formData.programId);
                    setModalBatches(batchesData);
                } catch (error) {
                    console.error("Error fetching modal batches:", error);
                    setModalBatches([]);
                }
            } else {
                setModalBatches([]);
            }
        };
        fetchModalBatches();
    }, [formData.programId, isOpen]);

    // Extract academic years and semesters when modal batches change
    useEffect(() => {
        if (modalBatches.length > 0) {
            const { academicYears: ayList, semesters: semList } =
                subjectSelectionService.extractAcademicYearsAndSemesters(modalBatches);

            // Filter academic years and semesters based on selected batch
            if (formData.batchId) {
                const selectedBatchId = parseInt(formData.batchId);
                const filteredAY = ayList.filter(ay => ay.batch_id === selectedBatchId);
                const filteredSem = semList.filter(sem => sem.batch_id === selectedBatchId);
                setModalAcademicYears(filteredAY);
                setModalSemesters(filteredSem);
            } else {
                // If no batch selected, show all
                setModalAcademicYears(ayList);
                setModalSemesters(semList);
            }
        } else {
            setModalAcademicYears([]);
            setModalSemesters([]);
        }
    }, [modalBatches, formData.batchId]);

    // Fetch subject types when both academic year and semester are selected in modal
    useEffect(() => {
        const fetchModalSubjectTypes = async () => {
            if (formData.academicYearId && formData.semesterId && isOpen) {
                try {
                    const types = await subjectSelectionService.getSubjectTypes(
                        formData.academicYearId,
                        formData.semesterId
                    );
                    setModalSubjectTypes(types);
                } catch (error) {
                    console.error("Error fetching modal subject types:", error);
                    setModalSubjectTypes([]);
                }
            } else {
                setModalSubjectTypes([]);
            }
        };
        fetchModalSubjectTypes();
    }, [formData.academicYearId, formData.semesterId, isOpen]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear dependent fields when parent changes
        if (field === "programId") {
            setFormData(prev => ({
                ...prev,
                batchId: "",
                academicYearId: "",
                semesterId: "",
                subjectTypeId: "",
                subTypeId: "",
            }));
        } else if (field === "batchId") {
            setFormData(prev => ({
                ...prev,
                academicYearId: "",
                semesterId: "",
                subjectTypeId: "",
                subTypeId: "",
            }));
        } else if (field === "academicYearId" || field === "semesterId") {
            // Clear subject type when academic year or semester changes
            setFormData(prev => ({
                ...prev,
                subjectTypeId: "",
                subTypeId: "",
            }));
        } else if (field === "subjectTypeId") {
            // Clear sub-type when subject type changes
            setFormData(prev => ({
                ...prev,
                subTypeId: "",
            }));
        }

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.programId) newErrors.programId = "Program is required";
        if (!formData.batchId) newErrors.batchId = "Batch is required";
        if (!formData.academicYearId) newErrors.academicYearId = "Academic Year is required";
        if (!formData.semesterId) newErrors.semesterId = "Semester is required";
        if (!formData.subjectTypeId) newErrors.subjectTypeId = "Subject Type is required";

        // Validate vertical if available
        if (hasVerticals && !formData.subTypeId) {
            newErrors.subTypeId = "Vertical is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                // Get the names for display purposes from modal data
                const payload = {
                    programId: formData.programId,
                    program: programs.find(p => p.program_id === formData.programId)?.program_name || "",
                    batchId: formData.batchId,
                    batch: modalBatches.find(b => b.batch_id === formData.batchId)?.batch_name ||
                        modalBatches.find(b => b.batch_id === formData.batchId)?.batch_year || "",
                    academicYearId: formData.academicYearId,
                    academicYear: modalAcademicYears.find(y => y.id === formData.academicYearId)?.name || "",
                    semesterId: formData.semesterId,
                    semester: modalSemesters.find(s => s.id === formData.semesterId)?.name || "",
                    subjectTypeId: formData.subjectTypeId,
                    subjectType: modalSubjectTypes.find(t => t.id === formData.subjectTypeId)?.name || "",
                };

                // Add vertical if selected
                if (formData.subTypeId && hasVerticals) {
                    const vertical = verticalOptions.find(v => v.id === parseInt(formData.subTypeId));
                    payload.verticalId = formData.subTypeId;
                    payload.vertical = vertical?.name || "";
                }

                // Transform data to configuration format
                const configPayload = {
                    academicYearId: payload.academicYearId,
                    semesterId: payload.semesterId,
                    subjectTypeId: payload.subjectTypeId,
                    verticalId: payload.verticalId || null,
                    maxSelections: 0,
                    minSelections: 0,
                    startTime: null,
                    endTime: null,
                    studentLimitPerSubject: null,
                    subjectSetRequest: [],
                };

                await subjectSelectionService.createSubjectSelectionConfig(configPayload);

                // Show success and close
                setAlert(
                    <SweetAlert
                        success
                        title="Success!"
                        onConfirm={() => {
                            setAlert(null);
                            onClose();
                            onSubmit(payload); // Notify parent for refresh
                        }}
                        confirmBtnCssClass="btn-confirm"
                    >
                        Configuration created successfully.
                    </SweetAlert>
                );
            } catch (error) {
                console.error("Error creating configuration:", error);
                
                // Check if it's a duplicate error
                const errorMessage = error.response?.data?.message || error.message || error || "Failed to create configuration";
                const isDuplicate = errorMessage.toLowerCase().includes("duplicate paper selection already exists");
                
                console.log("Error details:", {
                    errorMessage,
                    isDuplicate,
                    fullError: error
                });
                
                setAlert(
                    <SweetAlert
                        warning={isDuplicate}
                        danger={!isDuplicate}
                        title={isDuplicate ? "Paper Selection Already Exists" : "Error"}
                        onConfirm={() => setAlert(null)}
                        confirmBtnCssClass="btn-confirm"
                    >
                        {isDuplicate ? "This paper selection configuration already exists for the selected academic year, semester, subject type, and vertical combination." : errorMessage}
                    </SweetAlert>
                );
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Single Card with Header and Form */}
                <div className="bg-white rounded-xl shadow-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                            Add Paper Selection
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex-shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {/* Program */}
                            <CustomSelect
                                label="Program"
                                value={formData.programId}
                                onChange={(e) => handleChange("programId", e.target.value)}
                                options={programs.map(program => ({
                                    value: program.program_id,
                                    label: program.program_name
                                }))}
                                placeholder="Select Program"
                                error={errors.programId}
                                required
                            />

                            {/* Batch */}
                            <CustomSelect
                                label="Batch"
                                value={formData.batchId}
                                onChange={(e) => handleChange("batchId", e.target.value)}
                                options={modalBatches.map(batch => ({
                                    value: batch.batch_id,
                                    label: batch.batch_name || batch.batch_year || `${batch.start_year}-${batch.end_year}`
                                }))}
                                placeholder="Select Batch"
                                disabled={!formData.programId}
                                error={errors.batchId}
                                required
                            />

                            {/* Academic Year */}
                            <CustomSelect
                                label="Academic Year"
                                value={formData.academicYearId}
                                onChange={(e) => handleChange("academicYearId", e.target.value)}
                                options={modalAcademicYears.map(year => ({
                                    value: year.id,
                                    label: year.name
                                }))}
                                placeholder="Select Academic Year"
                                disabled={!formData.batchId}
                                error={errors.academicYearId}
                                required
                            />

                            {/* Semester */}
                            <CustomSelect
                                label="Semester"
                                value={formData.semesterId}
                                onChange={(e) => handleChange("semesterId", e.target.value)}
                                options={filteredModalSemesters.map(semester => ({
                                    value: semester.id,
                                    label: semester.name
                                }))}
                                placeholder="Select Semester"
                                disabled={!formData.academicYearId}
                                error={errors.semesterId}
                                required
                            />

                            {/* Subject Type */}
                            <CustomSelect
                                label="Subject Type"
                                value={formData.subjectTypeId}
                                onChange={(e) => handleChange("subjectTypeId", e.target.value)}
                                options={modalSubjectTypes.map(type => ({
                                    value: type.id,
                                    label: type.name
                                }))}
                                placeholder="Select Subject Type"
                                disabled={!formData.academicYearId || !formData.semesterId}
                                error={errors.subjectTypeId}
                                required
                            />

                            {/* Vertical - Show in same row if verticals exist */}
                            {hasVerticals ? (
                                <CustomSelect
                                    label="Vertical"
                                    value={formData.subTypeId}
                                    onChange={(e) => handleChange("subTypeId", e.target.value)}
                                    options={verticalOptions.map(vertical => ({
                                        value: vertical.id,
                                        label: vertical.name
                                    }))}
                                    placeholder="Select Vertical"
                                    error={errors.subTypeId}
                                    required
                                />
                            ) : (
                                // Empty div to maintain grid layout when no verticals
                                <div></div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Alerts */}
            {parentAlert || alert}
        </div>
    );
};

AddSubjectSelectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    programs: PropTypes.array,
    alert: PropTypes.node,
};

export default AddSubjectSelectionModal;
