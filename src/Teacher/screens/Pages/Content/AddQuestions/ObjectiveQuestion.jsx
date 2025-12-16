
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Editor } from "react-editor";
import SweetAlert from 'react-bootstrap-sweetalert';
import { collegeService } from '../services/college.service';
import { contentService } from '../services/content.service.js';
import { fetchClassesByprogram } from '../services/student.service.js';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';

const ObjectiveQuestion = ({
  formData,
  handleChange,
  errors,
  touched,
  isEdit = false,
  question_id,
  questionData,
  onSaveSuccess
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const dropdownRefs = useRef({});

  // Get user profile data
  const { getUserId, getCollegeId,getTeacherId , isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();

  // Data
  const [programOptions, setProgramOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);     // { id, name }
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);     // modules
  const [topicOptions, setTopicOptions] = useState([]);         // units
  const [questionLevelOptions, setQuestionLevelOptions] = useState([]);

  // Selection
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // Loading
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState(false);


  // Effect to initialize state in edit mode
  useEffect(() => {
    if (isEdit && questionData) {
      // Set unit ID from question data to enable save button
      if (questionData.unit_id) {
        setSelectedUnitId(questionData.unit_id);
      }
    }
  }, [isEdit, questionData]);

  // Effects to set selected IDs when options and formData are ready
  useEffect(() => {
    if (isEdit && formData.program && programOptions.length > 0 && !selectedProgramId) {
      const program = programOptions.find(p => p.name === formData.program);
      if (program) setSelectedProgramId(program.id);
    }
  }, [isEdit, formData.program, programOptions, selectedProgramId]);

  useEffect(() => {
    if (isEdit && formData.program && programOptions.length > 0 && selectedProgramId) {
      const program = programOptions.find(p => p.id === selectedProgramId);
      if (program?.allocations) {
        const semesters = [...new Set(program.allocations.map(a => a.semester?.name).filter(Boolean))];
        setSemesterOptions(semesters);
        
        // Auto-select semester if available in edit mode
        if (formData.semester && !selectedSemesterId) {
          const semesterAllocation = program.allocations.find(a => a.semester?.name === formData.semester);
          if (semesterAllocation) {
            setSelectedSemesterId(semesterAllocation.semester_id);
            setSelectedAcademicYearId(semesterAllocation.academic_year_id);
          }
        }
      }
    }
  }, [isEdit, formData.program, formData.semester, programOptions, selectedProgramId, selectedSemesterId]);
  
  useEffect(() => {
    if (isEdit && formData.subject && subjectOptions.length > 0 && !selectedSubjectId) {
      const subject = subjectOptions.find(s => s.name === formData.subject);
      if (subject) setSelectedSubjectId(subject.id);
    }
  }, [isEdit, formData.subject, subjectOptions, selectedSubjectId]);

  // Effect to set topic options in edit mode
  useEffect(() => {
    if (isEdit && formData.chapter && chapterOptions.length > 0) {
      const chapter = chapterOptions.find(m => m.module_name === formData.chapter);
      if (chapter) {
        setTopicOptions(chapter.units || []);
      }
    }
  }, [isEdit, formData.chapter, chapterOptions]);

  // Handle dropdown selection
  const handleSelect = (fieldName, value) => {
    if (fieldName === 'program') {
      const program = programOptions.find(p => p.name === value);
      setSelectedProgramId(program?.id || null);
      
      // Get semesters from all allocations for this program
      if (program?.allocations) {
        const semesters = [...new Set(program.allocations.map(a => a.semester?.name).filter(Boolean))];
        setSemesterOptions(semesters);
      }
      
      resetFields(['semester', 'subject', 'chapter', 'topic']);
      setSelectedSubjectId(null);
      setSelectedUnitId(null);
      setSelectedSemesterId(null);
      setSelectedAcademicYearId(null);
    }
    else if (fieldName === 'semester') {
      // Find the program and then the semester allocation
      const program = programOptions.find(p => p.id === selectedProgramId);
      if (program) {
        const semesterAllocation = program.allocations.find(a => a.semester?.name === value);
        if (semesterAllocation) {
          setSelectedSemesterId(semesterAllocation.semester_id);
          setSelectedAcademicYearId(semesterAllocation.academic_year_id);
        }
      }
      
      resetFields(['subject', 'chapter', 'topic']);
      setSelectedSubjectId(null);
      setSelectedUnitId(null);
    }
    else if (fieldName === 'subject') {
      const subject = subjectOptions.find(s => s.name === value);
      setSelectedSubjectId(subject?.id || null);
      resetFields(['chapter', 'topic']);
      setSelectedUnitId(null);
    }
    else if (fieldName === 'chapter') {
      const module = chapterOptions.find(m => m.module_name === value);
      const units = module?.units || [];
      setTopicOptions(units);
      setSelectedUnitId(null);
      handleChange({ target: { name: 'topic', value: '' } });
    }
    else if (fieldName === 'topic') {
      const unit = topicOptions.find(u => u.unit_name === value);
      setSelectedUnitId(unit?.unit_id || null);
    }

    handleChange({ target: { name: fieldName, value } });
    setOpenDropdown(null);
  };

  const resetFields = (fields) => {
    fields.forEach(field => {
      handleChange({ target: { name: field, value: '' } });
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains(e.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!isProfileLoaded || profileLoading) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }

      const teacherId = getTeacherId();

      if (!teacherId) {
        console.warn('No teacher ID found. Please ensure you are logged in.');
        return;
      }
      
      try {
        console.log('Fetching programs for teacher ID:', teacherId);
        const response = await api.getTeacherAllocatedPrograms(teacherId);
        console.log('Programs response:', response);
        
        if (response.success && response.data) {
          // Flatten class_teacher_allocation and normal_allocation into single array
          const classTeacherPrograms = response.data.class_teacher_allocation || [];
          const normalPrograms = response.data.normal_allocation || [];
          const allPrograms = [...classTeacherPrograms, ...normalPrograms];
          
          // Group allocations by program_id and merge them
          const programMap = new Map();
          
          allPrograms.forEach(allocation => {
            const programId = allocation.program_id;
            const programName = allocation.program?.program_name || allocation.program_name || `Program ${programId}`;
            
            if (!programMap.has(programId)) {
              programMap.set(programId, {
                id: programId,
                name: programName,
                allocations: []
              });
            }
            
            programMap.get(programId).allocations.push(allocation);
          });
          
          const uniquePrograms = Array.from(programMap.values());
          
          setProgramOptions(uniquePrograms);
          console.log('Formatted programs:', uniquePrograms);
        } else {
          console.error('Failed to fetch programs:', response.message);
          setProgramOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, [isProfileLoaded, profileLoading, getTeacherId]);

    // Fetch Question Levels
    useEffect(() => {
        const fetchQuestionLevels = async () => {
            try {
                console.log('Fetching question levels...');
                const levels = await contentService.getAllQuestionLevel();
                console.log('Question levels response:', levels);
                
                if (Array.isArray(levels)) {
                    setQuestionLevelOptions(levels);
                    console.log('Question levels set:', levels);
                } else {
                    console.error('Question levels response is not an array:', levels);
                    setQuestionLevelOptions([]);
                }
            } catch (error) {
                console.error("Failed to fetch question levels:", error);
                setQuestionLevelOptions([]);
            }
        };
        fetchQuestionLevels();
    }, []);


 useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedAcademicYearId || !selectedSemesterId) {
        setSubjectOptions([]);
        setSelectedSubjectId(null);
        return;
      }

      if (!isProfileLoaded || profileLoading) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }

      const teacherId = getTeacherId();
      if (!teacherId) {
        console.warn('No teacher ID found. Please ensure you are logged in.');
        return;
      }

      setLoadingSubjects(true);
      try {
        console.log('Fetching subjects for teacher:', teacherId, 'academicYearId:', selectedAcademicYearId, 'semesterId:', selectedSemesterId);
        const response = await contentService.getTeacherSubjectsAllocated(teacherId, selectedAcademicYearId, selectedSemesterId);
        console.log('Teacher allocated subjects response:', response);

        if (Array.isArray(response)) {
          const subjects = response.map(subjectInfo => ({
            id: subjectInfo.subject_id || subjectInfo.id,
            name: subjectInfo.subject_name || subjectInfo.name
          })).filter(s => s.name && s.id);

          const unique = Array.from(new Map(subjects.map(s => [s.name, s])).values());
          setSubjectOptions(unique);
          console.log('Formatted allocated subjects:', unique);
        } else {
          console.error('Subjects response is not valid:', response);
          setSubjectOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch teacher allocated subjects:', err);
        setSubjectOptions([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedAcademicYearId, selectedSemesterId, isProfileLoaded, profileLoading, getTeacherId]); // Depends on academicYearId and semesterId



  // Fetch Modules & Units by Subject ID
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) {
        setChapterOptions([]);
        setTopicOptions([]);
        return;
      }

      setLoadingModules(true);
      try {
        console.log('Fetching modules for subject ID:', selectedSubjectId);
        const response = await contentService.getModulesbySubject(selectedSubjectId);
        console.log('Modules response:', response);
        
        const modules = response?.modules || response || [];

        if (Array.isArray(modules)) {
          const formattedModules = modules.map(m => ({
            module_id: m.module_id,
            module_name: m.module_name,
            units: Array.isArray(m.units) ? m.units : []
          }));
          setChapterOptions(formattedModules);
          console.log('Formatted modules:', formattedModules);
        } else {
          console.error('Modules response is not an array:', modules);
          setChapterOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setChapterOptions([]);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [selectedSubjectId]);

  // Show SweetAlert
  const showSweetAlert = (title, text, type = 'success', confirmText = 'OK') => {
    setAlertConfig({
      title,
      text,
      type,
      confirmBtnText: confirmText,
      onConfirm: () => setShowAlert(false)
    });
    setShowAlert(true);
  };

  // Save / Update Question
  const handleSave = async () => {
    if (!selectedUnitId) {
      showSweetAlert('Warning', 'Please select a Topic (Unit)', 'warning');
      return;
    }
    const userId = getUserId();
    console.log("getUserId", userId);

    setSaving(true);
    try {
        const level = questionLevelOptions.find(l => l.question_level_type === formData.questionLevel);
        const payload = {
            question: formData.question?.trim(),
            answer: formData.answer?.replace('Option ', ''), // "Option 1" → "1"
            option1: formData.option1 || null,
            option2: formData.option2 || null,
            option3: formData.option3 || null,
            option4: formData.option4 || null,
            option5: formData.option5 || null,
            option6: null,
            option_count: parseInt(formData.noOfOptions) || 4,
            unit_id: selectedUnitId,
            question_level_id: level ? level.question_level_id : null,
            questionImages: [], // Add later
            default_weightage: parseFloat(formData.defaultMarks) || 1.0,
            admin: false,
            user_id: userId,
      };

      console.log('Saving Question Payload:', payload);

      if (isEdit && question_id) {
        await contentService.updateQuestion(question_id, payload);
        showSweetAlert('Success', 'Question updated successfully!');
      } else {
        await contentService.createQuestion(payload);
        showSweetAlert('Success', 'Question created successfully!');
      }

      onSaveSuccess?.();
    } catch (err) {
      console.error('Save failed:', err);
      showSweetAlert('Error', err.response?.data?.message || "Failed to save question", 'error');
    } finally {
      setSaving(false);
    }
  };

  // Custom Dropdown
  const CustomDropdown = ({ fieldName, label, value, options, placeholder, required = false, loading = false, disabled = false }) => {
    
    return (
      <div ref={el => dropdownRefs.current[fieldName] = el} className="relative">
        <label className="block font-medium mb-1 text-gray-700 text-sm">
          {label}{required && <span className="text-red-500">*</span>}
        </label>
        <div
          className={`w-full px-4 py-3 border rounded-lg min-h-[48px] flex items-center justify-between cursor-pointer transition-all
            ${disabled || loading ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'bg-white hover:border-blue-500'}
            ${errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-gray-300'}
          `}
          onClick={() => !disabled && !loading && setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
        >
          <span className={`${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {loading ? 'Loading...' : (value || placeholder)}
          </span>
          {!loading && !disabled && <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === fieldName ? 'rotate-180' : ''}`} />}
        </div>

        {openDropdown === fieldName && !loading && !disabled && (
          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelect(fieldName, '')}>
              {placeholder}
            </div>
            {Array.isArray(options) && options.length > 0 ? (
              options.map((opt, index) => {
                const display = opt?.module_name || opt?.unit_name || opt?.semester_name || opt?.name || opt?.question_level_type || opt;
                const key = opt?.module_id || opt?.unit_id || opt?.semester_id || opt?.id || opt?.question_level_id || `${fieldName}-${index}`;
                return (
                  <div
                    key={key}
                    className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelect(fieldName, display)}
                  >
                    {display}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                No options available
              </div>
            )}
          </div>
        )}
        {errors[fieldName] && touched[fieldName] && <p className="mt-1 text-xs text-red-600">{errors[fieldName]}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        {isEdit ? 'Edit Question' : 'Create New Question'}
      </h2>

      {/* Program → Semester → Subject */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <CustomDropdown fieldName="program" label="Program" value={formData.program} options={programOptions.map(p => p.name)} placeholder="Select Program" required disabled={isEdit} />
        <CustomDropdown
          fieldName="semester"
          label="Semester"
          value={formData.semester}
          options={semesterOptions.map ? semesterOptions.map(s => s) : semesterOptions}
          placeholder="Select Semester"
          required
          disabled={isEdit || !formData.program}
        />
        <CustomDropdown
          fieldName="subject"
          label="Paper"
          value={formData.subject}
          options={subjectOptions.map(s => s.name)}
          placeholder="Select Paper"
          required
          loading={loadingSubjects}
          disabled={isEdit || !formData.semester}  // Now needs Semester
        />
      </div>

      {/* Chapter → Topic → Question Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <CustomDropdown fieldName="chapter" label="Module" value={formData.chapter} options={chapterOptions.map(m => m.module_name)} placeholder="Select Module" required loading={loadingModules} disabled={!formData.subject} />
        <CustomDropdown fieldName="topic" label="Unit" value={formData.topic} options={topicOptions.map(u => u.unit_name)} placeholder="Select Unit" required disabled={!formData.chapter} />
        <CustomDropdown fieldName="questionLevel" label="Level" value={formData.questionLevel} options={questionLevelOptions.map(l => l.question_level_type || l.name)} placeholder="Select Level" required />
      </div>

      {/* Level, Options, Marks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CustomDropdown fieldName="noOfOptions" label="No. of Options" value={formData.noOfOptions} options={['3', '4', '5']} placeholder="4" required />
        <div>
          <label className="block font-medium mb-1 text-gray-700 text-sm">Default Marks *</label>
          <input type="number" name="defaultMarks" value={formData.defaultMarks} onChange={handleChange} min="1" max="100"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2" />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <label className="block font-medium mb-2 text-gray-700">Question *</label>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
          <Editor
            value={formData.question || ""}
            onChange={(val) => handleChange({ target: { name: 'question', value: val } })}
            style={{ minHeight: 120, padding: 16, fontSize: 16 }}
            className="focus:outline-none"
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-6 mb-8">
        {['1', '2', '3', '4', '5'].slice(0, formData.noOfOptions || 4).map((num) => (
          <div key={num}>
            <label className="block font-medium mb-2 text-gray-700">Option {num} *</label>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <Editor
                value={formData[`option${num}`] || ""}
                onChange={(val) => handleChange({ target: { name: `option${num}`, value: val } })}
                style={{ minHeight: 100, padding: 16, fontSize: 16 }}
                className="focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div className="mb-10">
        <label className="block font-medium mb-3 text-gray-700">Correct Answer *</label>
        <div className="flex flex-wrap gap-6">
          {['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']
            .slice(0, formData.noOfOptions || 4)
            .map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="answer" value={opt} checked={formData.answer === opt} onChange={handleChange}
                  className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{opt}</span>
              </label>
            ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving || !selectedUnitId}
          className={`px-10 py-4 rounded-lg font-semibold text-white transition-all text-lg
            ${saving || !selectedUnitId 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
        >
          {saving ? 'Saving...' : isEdit ? 'Update Question' : 'Save Question'}
        </button>
      </div>

      {/* SweetAlert */}
      {showAlert && (
        <SweetAlert
          title={alertConfig.title}
          onConfirm={alertConfig.onConfirm}
          type={alertConfig.type}
          confirmBtnText={alertConfig.confirmBtnText}
          showCancel={false}
        >
          {alertConfig.text}
        </SweetAlert>
      )}
    </div>
  );
};

export default ObjectiveQuestion;