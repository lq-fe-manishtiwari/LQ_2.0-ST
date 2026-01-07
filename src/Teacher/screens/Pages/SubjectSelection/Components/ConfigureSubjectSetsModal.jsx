import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Plus, Trash2, Edit2, Check } from "lucide-react";
import { subjectSelectionService } from "../Services/subjectSelection.service";

/**
 * ConfigureSubjectSetsModal Component
 * Clean, minimal design for subject set configuration
 */
const ConfigureSubjectSetsModal = ({
    isOpen,
    onClose,
    onSave,
    subjectTypeId,
    subjectTypeName,
    verticalName,
    academicYearId,
    semesterId,
    existingSets = [],
}) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize sets from existing or default
    const getInitialSets = () => {
        if (existingSets && existingSets.length > 0) {
            return existingSets.map((set, index) => ({
                id: Date.now() + index,
                name: set.subject_set_name || `Set ${index + 1}`,
                subjects: set.subjects || [],
                isEditingName: false,
                subjectSetId: set.subject_set_id || null
            }));
        }
        return [{ id: 1, name: "Set 1", subjects: [], isEditingName: false, subjectSetId: null  }];
    };

    const [sets, setSets] = useState(getInitialSets());

    // Fetch subjects when modal opens
    useEffect(() => {
        if (isOpen && subjectTypeId && academicYearId && semesterId) {
            fetchSubjects();
        }
    }, [isOpen, subjectTypeId, academicYearId, semesterId]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await subjectSelectionService.getSubjectsByTab(
                subjectTypeId,
                academicYearId,
                semesterId,
                subjectTypeName
            );
            setSubjects(data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    const isSubjectUsed = (subjectId) => {
        return sets.some(set => set.subjects.some(s => (s.id || s.subject_id) === subjectId));
    };

    const addSubjectToSet = (setId, subject) => {
        if (isSubjectUsed(subject.id || subject.subject_id)) return;
        setSets(prevSets =>
            prevSets.map(set =>
                set.id === setId ? { ...set, subjects: [...set.subjects, subject] } : set
            )
        );
    };

    const removeSubjectFromSet = (setId, subjectId) => {
        setSets(prevSets =>
            prevSets.map(set =>
                set.id === setId
                    ? { ...set, subjects: set.subjects.filter(s => (s.id || s.subject_id) !== subjectId) }
                    : set
            )
        );
    };

    const addNewSet = () => {
        const newSetNumber = sets.length + 1;
        setSets([...sets, { id: Date.now(), name: `Set ${newSetNumber}`, subjects: [], isEditingName: false, subjectSetId: null  }]);
    };

    const removeSet = (setId) => {
        if (sets.length === 1) return;
        setSets(sets.filter(set => set.id !== setId));
    };

    const resetAllSets = () => {
        setSets([{ id: 1, name: "Set 1", subjects: [], isEditingName: false, subjectSetId: null  }]);
    };

    const toggleSetNameEdit = (setId) => {
        setSets(prevSets =>
            prevSets.map(set =>
                set.id === setId ? { ...set, isEditingName: !set.isEditingName } : set
            )
        );
    };

    const updateSetName = (setId, newName) => {
        setSets(prevSets =>
            prevSets.map(set =>
                set.id === setId ? { ...set, name: newName } : set
            )
        );
    };

    const handleSave = () => {
        const configuration = {
            sets: sets.map((set, index) => ({
                setNumber: index + 1,
                setName: set.name,
                subjectIds: set.subjects.map(s => s.id || s.subject_id),
                subjectSetId: set.subjectSetId || null,
            })),
        };
        onSave(configuration);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40">
            <div className="flex min-h-full items-start justify-center p-4 pt-10">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Configure Subject Sets</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {subjectTypeName} {verticalName && `• ${verticalName}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading subjects...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Available Subjects */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-700">Available Subjects</h3>
                                        <span className="text-xs text-gray-500">
                                            {subjects.length} total
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                        {subjects.length === 0 ? (
                                            <p className="text-gray-500 text-sm col-span-full text-center py-4">
                                                No subjects available
                                            </p>
                                        ) : (
                                            subjects.map((subject) => {
                                                const used = isSubjectUsed(subject.id || subject.subject_id);
                                                return (
                                                    <div
                                                        key={subject.id || subject.subject_id}
                                                        className={`p-3 rounded-md border ${used
                                                            ? "bg-gray-100 border-gray-300 opacity-60"
                                                            : "bg-white border-gray-300"
                                                            }`}
                                                    >
                                                        <p className="font-medium text-sm text-gray-900">
                                                            {subject.subject_name || subject.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {subject.subject_code || subject.code} • {subject.credits || 3} Credits
                                                        </p>
                                                        {used && (
                                                            <span className="inline-block mt-1 text-xs text-gray-600">
                                                                Added to set
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Sets */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Subject Sets</h3>
                                    <div className="space-y-4">
                                        {sets.map((set, index) => (
                                            <div key={set.id} className="border border-gray-300 rounded-lg bg-white">
                                                {/* Set Header */}
                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            {set.isEditingName ? (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        value={set.name}
                                                                        onChange={(e) => updateSetName(set.id, e.target.value)}
                                                                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Enter set name"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={() => toggleSetNameEdit(set.id)}
                                                                        className="p-1.5 text-gray-600 hover:text-gray-900"
                                                                        title="Save"
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <h4 className="font-semibold text-gray-900">{set.name}</h4>
                                                                    <button
                                                                        onClick={() => toggleSetNameEdit(set.id)}
                                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                                        title="Edit name"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                ({set.subjects.length} subjects)
                                                            </span>
                                                        </div>
                                                        {sets.length > 1 && (
                                                            <button
                                                                onClick={() => removeSet(set.id)}
                                                                className="ml-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                                            >
                                                                Remove Set
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Set Body */}
                                                <div className="p-4">
                                                    {set.subjects.length === 0 ? (
                                                        <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
                                                            No subjects added
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                                            {set.subjects.map((subject) => (
                                                                <div
                                                                    key={subject.id || subject.subject_id}
                                                                    className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-md"
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                                            {subject.subject_name || subject.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            {subject.subject_code || subject.code} • {subject.credits || 3} Credits
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeSubjectFromSet(set.id, subject.id || subject.subject_id)}
                                                                        className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add Subject Dropdown */}
                                                    <select
                                                        onChange={(e) => {
                                                            const subjectId = e.target.value;
                                                            if (subjectId) {
                                                                const subject = subjects.find(s =>
                                                                    (s.id || s.subject_id).toString() === subjectId
                                                                );
                                                                if (subject) {
                                                                    addSubjectToSet(set.id, subject);
                                                                    e.target.value = "";
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">+ Add Subject</option>
                                                        {subjects
                                                            .filter(s => !isSubjectUsed(s.id || s.subject_id))
                                                            .map(subject => (
                                                                <option key={subject.id || subject.subject_id} value={subject.id || subject.subject_id}>
                                                                    {subject.subject_name || subject.name} ({subject.subject_code || subject.code})
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex gap-2">
                            <button
                                onClick={addNewSet}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                            >
                                <Plus size={16} />
                                Add New Set
                            </button>
                            <button
                                onClick={resetAllSets}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Reset All
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ConfigureSubjectSetsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    subjectTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subjectTypeName: PropTypes.string,
    verticalName: PropTypes.string,
    academicYearId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    semesterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    existingSets: PropTypes.array,
};

export default ConfigureSubjectSetsModal;
