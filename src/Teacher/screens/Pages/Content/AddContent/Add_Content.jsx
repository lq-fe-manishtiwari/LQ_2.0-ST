import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { courseService } from "../services/courses.service";
import { fetchClassesByprogram } from "../services/student.service.js";
import { contentService } from "../services/AddContent.service.js";


// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, required = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const displayValue = options.find(opt => opt.value === value)?.label || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border ${
          disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
          : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
        } rounded min-h-[40px] flex items-center justify-between transition-all duration-150`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {loading ? 'Loading...' : (displayValue || placeholder)}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>

      {isOpen && !disabled && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50" onClick={() => handleSelect({ value: '', label: placeholder })}>
            {placeholder}
          </div>
          {options.map((option, index) => (
            <div key={option.value || index} className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50" onClick={() => handleSelect(option)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AddContent() {
    // State management
    const [formData, setFormData] = useState({
        selectedProgram: "", selectedClass: "", selectedSemester: "", selectedSubject: "",
        selectedModule: "", selectedUnit: "", contentType: "", contentLevel: "",
        contentTitle: "", averageReadingTime: "", description: "", selectedQuiz: "",
        file: null, externalLink: "", videoUrl: ""
    });

    const [options, setOptions] = useState({
        programs: [], classes: [], semesters: [], subjects: [], modules: [], units: [], 
        contentTypes: [], quizzes: []
    });

    const [loading, setLoading] = useState({});

    // Load initial data
    useEffect(() => {
        loadPrograms();
        loadContentTypes();
        loadQuizzes();
    }, []);

    // Load dependent data when selections change
    useEffect(() => { if (formData.selectedProgram) loadClasses(); }, [formData.selectedProgram]);
    useEffect(() => { if (formData.selectedClass) loadSemesters(); }, [formData.selectedClass]);
    useEffect(() => { if (formData.selectedProgram) loadSubjects(); }, [formData.selectedProgram]);
    useEffect(() => { if (formData.selectedSubject) loadModulesAndUnits(); }, [formData.selectedSubject]);

    // Data loading functions
    const loadPrograms = () => {
        try {
            const stored = localStorage.getItem("college_programs");
            if (stored) {
                const programs = JSON.parse(stored).map(p => ({ label: p.program_name, value: String(p.program_id), full: p }));
                setOptions(prev => ({ ...prev, programs }));
            }
        } catch (err) {
            console.error("Error loading programs:", err);
        }
    };

    const loadClasses = async () => {
        try {
            const res = await fetchClassesByprogram(formData.selectedProgram);
            const classes = res.map(c => ({ label: c.class_year_name, value: String(c.class_year_id), full: c }));
            setOptions(prev => ({ ...prev, classes }));
        } catch (err) {
            console.error("Error loading classes:", err);
        }
    };

    const loadSemesters = () => {
        const classData = options.classes.find(cls => cls.value === formData.selectedClass);
        const semesters = classData?.full?.semester_divisions?.map(sem => ({ 
            label: sem.semester_name, value: sem.semester_id 
        })) || [];
        setOptions(prev => ({ ...prev, semesters }));
    };

    const loadSubjects = async () => {
        try {
            setLoading(prev => ({ ...prev, subjects: true }));
            const res = await contentService.getSubjectbyProgramId(formData.selectedProgram);
            const subjects = Array.isArray(res) ? res.map(s => ({ 
                label: s.name || s.paper_name || s.subject_name, 
                value: String(s.subject_id || s.id) 
            })) : [];
            setOptions(prev => ({ ...prev, subjects }));
        } catch (err) {
            console.error("Error loading subjects:", err);
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    };

    const loadModulesAndUnits = async () => {
        try {
            setLoading(prev => ({ ...prev, modules: true, units: true }));
            const res = await contentService.getModulesAndUnitsBySubjectId(formData.selectedSubject);
            
            const modules = res?.modules ? res.modules.map(m => ({ 
                label: m.name || m.module_name, 
                value: String(m.module_id || m.id),
                units: m.units || []
            })) : [];
            
            setOptions(prev => ({ ...prev, modules, units: [] }));
        } catch (err) {
            console.error("Error loading modules:", err);
        } finally {
            setLoading(prev => ({ ...prev, modules: false, units: false }));
        }
    };

    const loadContentTypes = async () => {
        try {
            const res = await contentService.getContentTypes();
            const contentTypes = Array.isArray(res) ? res.map(ct => ({ 
                label: ct.name || ct.type_name, 
                value: ct.value || ct.type_value 
            })) : [
                { label: "File", value: "file" }, { label: "External Link", value: "external" },
                { label: "Recorded Lecture", value: "video" }, { label: "Image", value: "image" },
                { label: "PDF", value: "pdf" }, { label: "Quiz", value: "quiz" }
            ];
            setOptions(prev => ({ ...prev, contentTypes }));
        } catch (err) {
            console.error("Error loading content types:", err);
            // Fallback to default options
            setOptions(prev => ({ ...prev, contentTypes: [
                { label: "File", value: "file" }, { label: "External Link", value: "external" },
                { label: "Recorded Lecture", value: "video" }, { label: "Image", value: "image" },
                { label: "PDF", value: "pdf" }, { label: "Quiz", value: "quiz" }
            ]}));
        }
    };

    const loadQuizzes = async () => {
        try {
            const res = await courseService.getAllQuizzes();
            const quizzes = Array.isArray(res) ? res.map(q => ({ 
                label: q.name || q.quiz_name, 
                value: String(q.quiz_id || q.id) 
            })) : [];
            setOptions(prev => ({ ...prev, quizzes }));
        } catch (err) {
            console.error("Error loading quizzes:", err);
        }
    };

    // Handle form changes
    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Reset dependent fields
            if (field === 'selectedProgram') {
                newData.selectedClass = newData.selectedSemester = newData.selectedSubject = 
                newData.selectedModule = newData.selectedUnit = "";
            } else if (field === 'selectedClass') {
                newData.selectedSemester = newData.selectedSubject = newData.selectedModule = newData.selectedUnit = "";
            } else if (field === 'selectedSubject') {
                newData.selectedModule = newData.selectedUnit = "";
            } else if (field === 'selectedModule') {
                newData.selectedUnit = "";
                // Load units for selected module
                const moduleData = options.modules.find(m => m.value === value);
                if (moduleData?.units) {
                    const units = moduleData.units.map(u => ({ 
                        label: u.name || u.unit_name, 
                        value: String(u.unit_id || u.id) 
                    }));
                    setOptions(prev => ({ ...prev, units }));
                }
            }
            
            return newData;
        });
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.selectedProgram || !formData.selectedClass || !formData.selectedSemester || 
            !formData.selectedSubject || !formData.contentType || !formData.contentTitle) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const submitData = {
                program_id: formData.selectedProgram, class_id: formData.selectedClass,
                semester_id: formData.selectedSemester, subject_id: formData.selectedSubject,
                module_id: formData.selectedModule || null, unit_id: formData.selectedUnit || null,
                content_type: formData.contentType, content_level: formData.contentLevel,
                title: formData.contentTitle, description: formData.description,
                average_reading_time: formData.averageReadingTime,
                quiz_id: formData.contentType === "quiz" ? formData.selectedQuiz : null,
                external_link: formData.contentType === "external" ? formData.externalLink : null,
                video_url: formData.contentType === "video" ? formData.videoUrl : null,
            };

            if (formData.file && ["file", "pdf", "image"].includes(formData.contentType)) {
                const formDataToSend = new FormData();
                Object.keys(submitData).forEach(key => {
                    if (submitData[key] !== null) formDataToSend.append(key, submitData[key]);
                });
                formDataToSend.append('file', formData.file);
                await contentService.AddContent(formDataToSend);
            } else {
                await contentService.AddContent(submitData);
            }

            alert("Content added successfully!");
        } catch (error) {
            console.error("Error adding content:", error);
            alert("Error adding content. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Add Content</h2>
                <button type="button" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition" onClick={() => window.history.back()}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Academic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect label="Program" value={formData.selectedProgram} onChange={(value) => handleChange('selectedProgram', value)} options={options.programs} placeholder="Select Program" required />
                    <CustomSelect label="Class" value={formData.selectedClass} onChange={(value) => handleChange('selectedClass', value)} options={options.classes} placeholder="Select Class" disabled={!formData.selectedProgram} required />
                    <CustomSelect label="Semester" value={formData.selectedSemester} onChange={(value) => handleChange('selectedSemester', value)} options={options.semesters} placeholder="Select Semester" disabled={!formData.selectedClass} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect label="Paper" value={formData.selectedSubject} onChange={(value) => handleChange('selectedSubject', value)} options={options.subjects} placeholder="Select Paper" disabled={!formData.selectedProgram} loading={loading.subjects} required />
                    <CustomSelect label="Module" value={formData.selectedModule} onChange={(value) => handleChange('selectedModule', value)} options={options.modules} placeholder="Select Module" disabled={!formData.selectedSubject} loading={loading.modules} />
                    <CustomSelect label="Unit" value={formData.selectedUnit} onChange={(value) => handleChange('selectedUnit', value)} options={options.units} placeholder="Select Unit" disabled={!formData.selectedModule} loading={loading.units} />
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect label="Content Type" value={formData.contentType} onChange={(value) => handleChange('contentType', value)} options={options.contentTypes} placeholder="Select Content Type" required />
                    <CustomSelect label="Content Level" value={formData.contentLevel} onChange={(value) => handleChange('contentLevel', value)} options={[{ label: "Beginner", value: "beginner" }, { label: "Intermediate", value: "intermediate" }, { label: "Advanced", value: "advanced" }]} placeholder="Select Content Level" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Content Title <span className="text-red-500">*</span></label>
                        <input type="text" name="contentTitle" value={formData.contentTitle} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="Enter Title" required />
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Average Reading Time (minutes) <span className="text-red-500">*</span></label>
                        <input type="number" name="averageReadingTime" value={formData.averageReadingTime} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="30" min="1" required />
                    </div>
                </div>

                {/* Conditional Fields */}
                {formData.contentType === "quiz" && (
                    <CustomSelect label="Select Quiz" value={formData.selectedQuiz} onChange={(value) => handleChange('selectedQuiz', value)} options={options.quizzes} placeholder="Select Quiz" required />
                )}
                
                {["file", "pdf", "image"].includes(formData.contentType) && (
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Upload {formData.contentType.toUpperCase()} <span className="text-red-500">*</span></label>
                        <input type="file" name="file" onChange={handleInputChange} accept={formData.contentType === "pdf" ? "application/pdf" : formData.contentType === "image" ? "image/*" : "*"} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required />
                    </div>
                )}
                
                {formData.contentType === "external" && (
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">External Link <span className="text-red-500">*</span></label>
                        <input type="url" name="externalLink" value={formData.externalLink} onChange={handleInputChange} placeholder="https://example.com" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required />
                    </div>
                )}
                
                {formData.contentType === "video" && (
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Video URL <span className="text-red-500">*</span></label>
                        <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required />
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" rows="4" placeholder="Enter content description..."></textarea>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors" disabled={Object.values(loading).some(Boolean)}>
                        {Object.values(loading).some(Boolean) ? 'Loading...' : 'Submit'}
                    </button>
                    <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors" onClick={() => window.history.back()}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
