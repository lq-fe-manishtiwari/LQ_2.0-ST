import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import ContentService from '../Service/Content.service';
import StudentProjectService from '../Service/StudentProject.service';

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, required = false }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300'
                    }`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

const AddStudentProject = ({ onClose, programId, semesterId, studentId, academicYearId }) => {
    const [formData, setFormData] = useState({
        subjectId: '',
        moduleId: '',
        unitId: '',
        projectTitle: '',
        projectDescription: '',
        projectLink: '',
    });

    const [options, setOptions] = useState({
        subjects: [],
        modules: [],
        units: []
    });

    const [loading, setLoading] = useState({
        modules: false,
        units: false,
        submitting: false,
        subjects: false
    });

    const [error, setError] = useState(null);


    // Load subjects when component mounts
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!academicYearId || !semesterId) {
                console.error("Missing academicYearId or semesterId");
                return;
            }

            setLoading(prev => ({ ...prev, subjects: true }));
            try {
                const response = await ContentService.getSubjectAllocations(academicYearId, semesterId);
                console.log("response", response);
                if (response.success && response.data) {
                    const subjectsData = Array.isArray(response.data) ? response.data : [];
                    console.log("subjectsData", subjectsData);
                    const subjects = subjectsData.map(s => ({
                        label: s.subject?.name || s.name,
                        value: s.subject?.subject_id
                    }));
                    console.log("subjects", subjects);
                    setOptions(prev => ({ ...prev, subjects }));
                }
            } catch (err) {
                console.error("Error loading subjects:", err);
                setError("Failed to load subjects");
            } finally {
                setLoading(prev => ({ ...prev, subjects: false }));
            }
        };

        fetchSubjects();
    }, [academicYearId, semesterId]);

    // Load modules when subject changes
    useEffect(() => {
        const fetchModules = async () => {
            if (!formData.subjectId) {
                setOptions(prev => ({ ...prev, modules: [], units: [] }));
                return;
            }

            setLoading(prev => ({ ...prev, modules: true }));
            try {
                const response = await ContentService.getModulesAndUnits(formData.subjectId);
                if (response.success && response.data?.modules) {
                    const modules = response.data.modules.map(m => ({
                        label: m.module_name || m.name,
                        value: m.module_id || m.id,
                        units: m.units || [] // Store units in module object for easier access
                    }));
                    setOptions(prev => ({ ...prev, modules, units: [] }));
                }
            } catch (err) {
                console.error("Error loading modules:", err);
                setError("Failed to load modules");
            } finally {
                setLoading(prev => ({ ...prev, modules: false }));
            }
        };

        fetchModules();
    }, [formData.subjectId]);

    // Update units when module changes (from local data)
    useEffect(() => {
        if (!formData.moduleId) {
            setOptions(prev => ({ ...prev, units: [] }));
            return;
        }

        const selectedModule = options.modules.find(m => String(m.value) === String(formData.moduleId));
        if (selectedModule && selectedModule.units) {
            const units = selectedModule.units.map(u => ({
                label: u.unit_name || u.name,
                value: u.unit_id || u.id
            }));
            setOptions(prev => ({ ...prev, units }));
        } else {
            setOptions(prev => ({ ...prev, units: [] }));
        }
    }, [formData.moduleId, options.modules]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset dependent fields
            ...(name === 'subjectId' ? { moduleId: '', unitId: '' } : {}),
            ...(name === 'moduleId' ? { unitId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.projectTitle || !formData.unitId || !formData.projectLink) {
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(prev => ({ ...prev, submitting: true }));

        try {
            const payload = {
                project_title: formData.projectTitle,
                project_description: formData.projectDescription,
                project_link: formData.projectLink,
                unit_id: parseInt(formData.unitId),
                semester_id: parseInt(semesterId),
                student_id: parseInt(studentId),
                content_type_id: 1, // Fixed as per requirement
                content_level_id: 2 // Fixed as per requirement (Intermediate)
            };

            const response = await StudentProjectService.submitProject(payload);
            if (response.success) {
                alert("Project submitted successfully!");
                onClose(); // Close modal on success
            }
        } catch (err) {
            console.error("Submission error:", err);
            setError("Failed to submit project. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Submit Student Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomSelect
                            label="Subject"
                            value={formData.subjectId}
                            onChange={(e) => handleChange({ target: { name: 'subjectId', value: e.target.value } })}
                            options={options.subjects}
                            placeholder={loading.subjects ? "Loading Subjects..." : "Select Subject"}
                            required
                        />
                        <CustomSelect
                            label="Module"
                            value={formData.moduleId}
                            onChange={(e) => handleChange({ target: { name: 'moduleId', value: e.target.value } })}
                            options={options.modules}
                            placeholder={loading.modules ? "Loading..." : "Select Module"}
                            disabled={!formData.subjectId || loading.modules}
                            required
                        />
                        <CustomSelect
                            label="Unit"
                            value={formData.unitId}
                            onChange={(e) => handleChange({ target: { name: 'unitId', value: e.target.value } })}
                            options={options.units}
                            placeholder="Select Unit"
                            disabled={!formData.moduleId}
                            required
                        />
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Project Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="projectTitle"
                                value={formData.projectTitle}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Solar System Model"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Project Description
                            </label>
                            <textarea
                                name="projectDescription"
                                value={formData.projectDescription}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe your project..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Project Link <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="url"
                                    name="projectLink"
                                    value={formData.projectLink}
                                    onChange={handleChange}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://github.com/..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading.submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                        >
                            {loading.submitting ? 'Submitting...' : 'Submit Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentProject;
