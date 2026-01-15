import React, { useState } from "react";
import PropTypes from "prop-types";
import { ChevronUp, ChevronDown, Edit2, Save, X, Eye } from "lucide-react";
import ConfigureSubjectSetsModal from "./ConfigureSubjectSetsModal";

/**
 * SubjectSelectionConfigView Component
 * Displays detailed configuration view for subject selections
 * Shows when filters are applied
 */
const SubjectSelectionConfigView = ({
    subjectType,
    vertical = null,
    existingConfig = null,
    isReadOnly = false,
    academicYearId,
    semesterId,
    onSave,
    onCancel,
    onViewDetails
}) => {
    // Initialize with existing config data if provided
    const initialConfig = existingConfig ? {
        configId: existingConfig.subject_selection_config_id || existingConfig.id,
        subjectTypeId: existingConfig.subject_type_id || subjectType?.id,
        verticalId: existingConfig.vertical_type_id || vertical?.id || null,
        maxSelections: existingConfig.maximum_selections || "",
        minSelections: existingConfig.minimum_selections || "",
        startTime: existingConfig.start_time ? existingConfig.start_time.substring(0, 16) : "",
        endTime: existingConfig.end_time ? existingConfig.end_time.substring(0, 16) : "",
        studentLimitPerSubject: existingConfig.limit_per_subject_selections || "",
        isMandatory: existingConfig.is_mandatory || false,
        selectionType: "Same Set Only", // Defaulting as per original state
        numberOfSets: existingConfig.subject_sets?.length || "",
        subjectSetRequest: existingConfig.subject_sets?.map((set, index) => ({
            setNumber: index + 1,
            setName: set.subject_set_name || `Set ${index + 1}`,
            subjectIds: (set.subjects || []).map(s => s.id || s.subject_id),
            subjectSetId: set.subject_set_id || null
        })) || [],
    } : {
        subjectTypeId: subjectType?.id,
        verticalId: vertical?.id || null,
        maxSelections: "",
        minSelections: "",
        startTime: "",
        endTime: "",
        studentLimitPerSubject: "",
        isMandatory: false,
        selectionType: "Same Set Only",
        numberOfSets: "",
        subjectSetRequest: [],
    };

    const [config, setConfig] = useState(initialConfig);
    const [isEditing, setIsEditing] = useState(!existingConfig);

    const [showManagement, setShowManagement] = useState(true);
    const [showConfigureSetsModal, setShowConfigureSetsModal] = useState(false);

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...config,
            subjectSetRequest: config.subjectSetRequest || []
        };
        onSave(payload);
        setIsEditing(false);
    };

    const handleSaveSubjectSets = (setsConfiguration) => {
        console.log("Saving subject sets:", setsConfiguration);
        // Update config with sets data
        setConfig(prev => ({
            ...prev,
            subjectSetRequest: setsConfiguration.sets,
            numberOfSets: setsConfiguration.sets.length,
        }));
        setShowConfigureSetsModal(false);
    };

    // Display name for the configuration
    const displayName = vertical ? `${vertical.name}` : subjectType?.name || "Configuration";
    const availableSubjects = existingConfig?.allocated_subject_count || subjectType?.subject_count || 0;
    console.log("existingConfig", existingConfig)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-600">
                    {displayName}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Details Button */}
                    <button
                        onClick={() => onViewDetails && onViewDetails(existingConfig, subjectType, vertical)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        title="View Details"
                    >
                        <Eye size={16} />
                        Details
                    </button>

                    <button
                        onClick={() => setShowManagement(!showManagement)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Management
                        {showManagement ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {showManagement && (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Selection Configuration */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Max/Min Selections Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Selections
                                    </label>
                                    <input disabled={!isEditing}
                                        type="number"
                                        value={config.maxSelections}
                                        onChange={(e) => handleChange("maxSelections", e.target.value)}
                                        placeholder="add max selection"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time
                                    </label>
                                    <input disabled={!isEditing}
                                        type="datetime-local"
                                        value={config.startTime}
                                        onChange={(e) => handleChange("startTime", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Min Selections and End Time Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Selections
                                    </label>
                                    <input disabled={!isEditing}
                                        type="number"
                                        value={config.minSelections}
                                        onChange={(e) => handleChange("minSelections", e.target.value)}
                                        placeholder="add min selection"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time
                                    </label>
                                    <input disabled={!isEditing}
                                        type="datetime-local"
                                        value={config.endTime}
                                        onChange={(e) => handleChange("endTime", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Student Limit and Mandatory Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Limit Per Paper
                                    </label>
                                    <input disabled={!isEditing}
                                        type="number"
                                        value={config.studentLimitPerSubject}
                                        onChange={(e) => handleChange("studentLimitPerSubject", e.target.value)}
                                        placeholder="add max selection"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                            </div>

                            {/* Available Subjects Display */}
                            <div className="pt-2">
                                <p className="text-sm text-gray-600">
                                    Available Paper: <span className="font-semibold text-gray-900">{availableSubjects}</span>
                                    {config.numberOfSets && ` ( ${config.numberOfSets} Sets )`}
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Subject Sets Configuration */}
                        <div className="lg:col-span-1">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-orange-800 mb-3">
                                    Paper Sets Configuration
                                </h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Selection Type
                                        </label>
                                        <select
                                            value={config.selectionType}
                                            onChange={(e) => handleChange("selectionType", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option>Same Set Only</option>
                                            <option>Mixed Sets Allowed</option>
                                            <option>Any Combination</option>
                                        </select>
                                    </div>

                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Sets
                                        </label>
                                        <input disabled={!isEditing}
                                            type="number"
                                            value={config.numberOfSets}
                                            onChange={(e) => handleChange("numberOfSets", e.target.value)}
                                            placeholder="add min selection"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div> */}

                                    <button
                                        type="button"
                                        onClick={() => setShowConfigureSetsModal(true)}
                                        disabled={!isEditing} className="w-full px-4 py-2 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Configure Sets
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                title="Edit Configuration"
                            >
                                <Edit2 size={18} />
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setConfig(initialConfig);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                                    title="Cancel"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    title="Save Configuration"
                                >
                                    <Save size={18} />
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </form>
            )}

            {/* Configure Subject Sets Modal */}
            <ConfigureSubjectSetsModal
                isOpen={showConfigureSetsModal}
                onClose={() => setShowConfigureSetsModal(false)}
                onSave={handleSaveSubjectSets}
                subjectTypeId={subjectType?.id}
                subjectTypeName={subjectType?.name}
                verticalName={vertical?.name}
                academicYearId={academicYearId}
                semesterId={semesterId}
                existingSets={existingConfig?.subject_sets || []}
            />
        </div>
    );
};

SubjectSelectionConfigView.propTypes = {
    subjectType: PropTypes.object,
    vertical: PropTypes.object,
    existingConfig: PropTypes.object,
    isReadOnly: PropTypes.bool,
    academicYearId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    semesterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func,
};

export default SubjectSelectionConfigView;
