import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Link as LinkIcon, FileText, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import ContentService from '../Service/Content.service';
import StudentProjectService from '../Service/StudentProject.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';

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
    const { getUserId } = useUserProfile();

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
        subjects: false,
        uploading: false
    });

    const [fileData, setFileData] = useState({
        file: null,
        fileName: '',
        fileUrl: ''
    });

    // Load content types and levels
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, levelsRes] = await Promise.all([
                    ContentService.getContentTypes(),
                    ContentService.getContentLevel()
                ]);

                if (typesRes.success) {
                    const contentTypes = Array.isArray(typesRes.data) ? typesRes.data.map(ct => ({
                        label: ct.content_type_name,
                        value: ct.content_type_id,
                        full: ct
                    })) : [];
                    setOptions(prev => ({ ...prev, contentTypes }));
                }

                if (levelsRes.success) {
                    const contentLevels = Array.isArray(levelsRes.data) ? levelsRes.data.map(l => ({
                        label: l.content_level_name || l.name || l.label,
                        value: l.content_level_id || l.id
                    })) : [];
                    setOptions(prev => ({ ...prev, contentLevels }));
                }
            } catch (err) {
                console.error("Error loading types/levels:", err);
            }
        };
        fetchData();
    }, []);

    const [error, setError] = useState(null);
    const [showSubmitAlert, setShowSubmitAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
                setError(null);
                return;
            }

            setLoading(prev => ({ ...prev, modules: true }));
            setError(null);
            try {
                const response = await ContentService.getModulesAndUnits(formData.subjectId);
                if (response.success && response.data?.modules) {
                    const modules = response.data.modules.map(m => ({
                        label: m.module_name || m.name,
                        value: m.module_id || m.id,
                        units: m.units || []
                    }));
                    setOptions(prev => ({ ...prev, modules, units: [] }));
                } else {
                    setOptions(prev => ({ ...prev, modules: [], units: [] }));
                }
            } catch (err) {
                console.error("Error loading modules:", err);
                setOptions(prev => ({ ...prev, modules: [], units: [] }));
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

    const handleChange = async (e) => {
        const { name, value, files } = e.target;

        if (name === 'file' && files && files[0]) {
            const file = files[0];
            setFileData(prev => ({ ...prev, file, fileName: file.name }));
            setLoading(prev => ({ ...prev, uploading: true }));

            try {
                const url = await ContentService.uploadFileToS3(file);
                // S3 upload returns plain text URL or JSON depending on impl. Service wrapper handles text.
                if (url) {
                    setFileData(prev => ({ ...prev, fileUrl: url }));
                    setFormData(prev => ({ ...prev, projectLink: url }));
                }
            } catch (err) {
                console.error("File upload failed:", err);
                setError("Failed to upload file");
            } finally {
                setLoading(prev => ({ ...prev, uploading: false }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...(name === 'subjectId' ? { moduleId: '', unitId: '' } : {}),
                ...(name === 'moduleId' ? { unitId: '' } : {})
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.projectTitle || !formData.projectLink || !formData.content_type_id || !formData.content_level_id) {
            setError("Please fill in all required fields.");
            return;
        }

        setShowSubmitAlert(true);
    };

    const handleConfirmSubmit = async () => {
        setShowSubmitAlert(false);
        const userId = getUserId();

        setLoading(prev => ({ ...prev, submitting: true }));

        try {
            const payload = {
                project_title: formData.projectTitle,
                project_description: formData.projectDescription,
                project_link: formData.projectLink,
                unit_id: parseInt(formData.unitId),
                module_id: parseInt(formData.moduleId),
                semester_id: parseInt(semesterId),
                student_id: parseInt(studentId),
                content_type_id: parseInt(formData.content_type_id),
                content_level_id: parseInt(formData.content_level_id),
                created_by_user_id: userId,
            };

            const response = await StudentProjectService.submitProject(payload);
            if (response.success) {
                setSuccessMessage('Project submitted successfully!');
                setShowSuccessAlert(true);
                setTimeout(() => navigate(-1), 1500);
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
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#2162c1]">Submit Project</h3>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <CustomSelect
                                label="Subject *"
                                value={formData.subjectId}
                                onChange={(e) => handleChange({ target: { name: 'subjectId', value: e.target.value } })}
                                options={options.subjects}
                                placeholder={loading.subjects ? "Loading..." : "Select Subject"}
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

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Project Title *</label>
                                <input
                                    type="text"
                                    name="projectTitle"
                                    value={formData.projectTitle}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter Project Title"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Project Description</label>
                                <textarea
                                    name="projectDescription"
                                    value={formData.projectDescription}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Describe your project..."
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {(() => {
                                        const selectedType = options.contentTypes.find(ct => String(ct.value) === String(formData.content_type_id));
                                        const isFile = selectedType?.label?.toLowerCase().includes('file');
                                        return isFile ? 'Upload Project File *' : 'Project Link *';
                                    })()}
                                </label>

                                {(() => {
                                    const selectedType = options.contentTypes.find(ct => String(ct.value) === String(formData.content_type_id));
                                    // Default to Link input if no type selected or type is not File
                                    const isFile = selectedType?.label?.toLowerCase().includes('file');

                                    if (isFile) {
                                        return (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="flex gap-4 items-end">
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            name="file"
                                                            onChange={handleChange}
                                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                                        />
                                                    </div>
                                                </div>

                                                {loading.uploading && (
                                                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                        Uploading file...
                                                    </p>
                                                )}

                                                {fileData.fileUrl && !loading.uploading && (
                                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                                                        <Check className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <p className="text-sm text-green-700 font-medium">Uploaded Successfully</p>
                                                            <a href={fileData.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                                                                {fileData.fileName}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="url"
                                                    name="projectLink"
                                                    value={formData.projectLink}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading.submitting}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm"
                            >
                                {loading.submitting ? 'Submitting...' : 'Submit Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Submit Confirmation Alert */}
            {showSubmitAlert && (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                    title="Confirm Submission"
                    onConfirm={handleConfirmSubmit}
                    onCancel={() => setShowSubmitAlert(false)}
                >
                    Are you sure you want to submit this project?
                </SweetAlert>
            )}

            {/* Success Alert */}
            {showSuccessAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setShowSuccessAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {successMessage}
                </SweetAlert>
            )}
        </div>
    );
};

export default AddStudentProject;