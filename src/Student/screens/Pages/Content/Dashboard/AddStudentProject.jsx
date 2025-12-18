import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ContentService from '../Service/Content.service';
import StudentProjectService from '../Service/StudentProject.service';

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
    // ... (unchanged)
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

    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find(opt => String(opt.value) === String(value));

    return (
        <div ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <div
                    className={`w-full px-3 py-2 border ${disabled
                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
                        } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                    />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => handleSelect({ value: '', label: placeholder })}
                        >
                            {placeholder}
                        </div>
                        {safeOptions.map((option) => (
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
        </div>
    );
};

const AddStudentProject = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Destructure values from state, with fallback to empty object
    const { programId, semesterId, studentId, academicYearId } = location.state || {};

    const [formData, setFormData] = useState({
        subjectId: '',
        moduleId: '',
        unitId: '',
        projectTitle: '',
        projectDescription: '',
        projectLink: '',
        content_type_id: '',
        content_level_id: '',
    });

    const [options, setOptions] = useState({
        subjects: [],
        modules: [],
        units: [],
        contentTypes: [
          
        ],
        contentLevels: [
            
        ],
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
                if (response.success && response.data) {
                    const subjectsData = Array.isArray(response.data) ? response.data : [];
                    const subjects = subjectsData.map(s => ({
                        label: s.subject?.name || s.name,
                        value: s.subject?.subject_id
                    }));
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
                        units: m.units || []
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

    // Update units when module changes
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
            ...(name === 'subjectId' ? { moduleId: '', unitId: '' } : {}),
            ...(name === 'moduleId' ? { unitId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.projectTitle || !formData.unitId || !formData.projectLink || !formData.contentTypeId || !formData.contentLevelId) {
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
                content_type_id: parseInt(formData.content_type_id),
                content_level_id: parseInt(formData.content_level_id)
            };

            const response = await StudentProjectService.submitProject(payload);
            if (response.success) {
                alert("Project submitted successfully!");
                navigate(-1);
            }
        } catch (err) {
            console.error("Submission error:", err);
            setError("Failed to submit project. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="w-full">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[1.75rem] font-semibold text-[#2162c1]">Submit Student Project</h3>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CustomSelect
                                label="Subject *"
                                value={formData.subjectId}
                                onChange={(e) => handleChange({ target: { name: 'subjectId', value: e.target.value } })}
                                options={options.subjects}
                                placeholder={loading.subjects ? "Loading Subjects..." : "Select Subject"}
                            />
                            <CustomSelect
                                label="Module *"
                                value={formData.moduleId}
                                onChange={(e) => handleChange({ target: { name: 'moduleId', value: e.target.value } })}
                                options={options.modules}
                                placeholder={loading.modules ? "Loading..." : "Select Module"}
                                disabled={!formData.subjectId || loading.modules}
                            />
                            <CustomSelect
                                label="Unit *"
                                value={formData.unitId}
                                onChange={(e) => handleChange({ target: { name: 'unitId', value: e.target.value } })}
                                options={options.units}
                                placeholder="Select Unit"
                                disabled={!formData.moduleId}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <CustomSelect
                                label="Content Type *"
                                value={formData.content_type_id}
                                onChange={(e) => handleChange({ target: { name: 'content_type_id', value: e.target.value } })}
                                options={options.contentTypes}
                                placeholder="Select Content Type"
                            />
                            <CustomSelect
                                label="Content Level *"
                                value={formData.content_level_id}
                                onChange={(e) => handleChange({ target: { name: 'content_level_id', value: e.target.value } })}
                                options={options.contentLevels}
                                placeholder="Select Content Level"
                            />
                        </div>

                        <label className="block mt-6 font-medium">Project Title *</label>
                        <input
                            type="text"
                            name="projectTitle"
                            value={formData.projectTitle}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-lg mb-4"
                            placeholder="Enter Project Title"
                        />

                        <label className="block font-medium">Project Description</label>
                        <textarea
                            name="projectDescription"
                            value={formData.projectDescription}
                            onChange={handleChange}
                            rows="4"
                            className="w-full border px-3 py-2 rounded-lg mb-4"
                            placeholder="Describe your project..."
                        />

                        <label className="block font-medium">Project Link *</label>
                        <div className="relative mb-6">
                            <LinkIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                name="projectLink"
                                value={formData.projectLink}
                                onChange={handleChange}
                                className="w-full pl-10 border px-3 py-2 rounded-lg"
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                type="submit"
                                disabled={loading.submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading.submitting ? 'Submitting...' : 'Submit Project'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudentProject;