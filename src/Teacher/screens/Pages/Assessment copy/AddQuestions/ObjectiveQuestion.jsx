import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Upload, Plus, Trash2 } from 'lucide-react';
import { batchService } from '../../Academics/Services/batch.Service';
import { contentService } from '../../Content/services/content.service.js';
import { contentService as academicsContentService } from '../../Academics/Services/content.service';
// import { fetchClassesByprogram } from '../../Student/Services/student.service.js';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { COService } from "../Settings/Service/co.service.js"
import { QuestionsService } from '../Services/questions.service.js';
import { useAssessmentFormLogic } from '../../Assessment/hooks/useAssessmentFormLogic';

const ObjectiveQuestion = ({
  formData,
  setFieldValue,
  errors,
  touched,
}) => {
  const { userID, userRole } = useUserProfile();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id;

  // Must be declared before hookFormData useMemo
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  // Use the same hook as AddInternalAssessment for teacher-allocated programs
  const hookFormData = useMemo(() => ({
    selectedProgram: String(selectedProgramId || ''),
    selectedAcademicSemester: '',
    selectedBatch: '',
    selectedSubject: '',
  }), [selectedProgramId]);
  const { options: hookOptions } = useAssessmentFormLogic(hookFormData);

  const [questionLevels, setQuestionLevels] = useState([]);
  const [loadingQuestionLevels, setLoadingQuestionLevels] = useState(false);
  // ==== Dropdown States ====
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // ==== UI States ====
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const dropdownRefs = useRef({});

  const common = formData.common || {};
  const questions = formData.questions || [{}];
  const [coOptions, setCoOptions] = useState([]);
  const [loadingCOs, setLoadingCOs] = useState(false);
  const [bloomsLevels, setBloomsLevels] = useState([]);
  const [loadingBloomsLevels, setLoadingBloomsLevels] = useState(false);

  useEffect(() => {
    const fetchBloomsLevels = async () => {
      setLoadingBloomsLevels(true);
      try {
        const response = await QuestionsService.getAllBloomsLevels();
        setBloomsLevels(response || []);
      } catch (err) {
        console.error('Failed to fetch blooms levels:', err);
        setBloomsLevels([]);
      } finally {
        setLoadingBloomsLevels(false);
      }
    };

    fetchBloomsLevels();
  }, []);

  useEffect(() => {
    const fetchQuestionLevels = async () => {
      setLoadingQuestionLevels(true);
      try {
        const response = await QuestionsService.getAllQuestionLevels();
        setQuestionLevels(response || []);
      } catch (err) {
        console.error('Failed to fetch question levels:', err);
        setQuestionLevels([]);
      } finally {
        setLoadingQuestionLevels(false);
      }
    };

    fetchQuestionLevels();
  }, []);

  useEffect(() => {
    const fetchCOs = async () => {
      if (!collegeId) {
        setCoOptions([]);
        return;
      }

      setLoadingCOs(true);
      try {
        const response = await COService.getAllCOByCollegeId(collegeId);
        const formattedCOs = (response || []).map(co => ({
          id: co.course_outcome_id,
          name: co.outcome_code || co.outcome_title,
          title: co.outcome_title,
          description: co.outcome_description
        }));
        setCoOptions(formattedCOs);
      } catch (err) {
        console.error('Failed to fetch Course Outcomes:', err);
        setCoOptions([]);
      } finally {
        setLoadingCOs(false);
      }
    };

    fetchCOs();
  }, [collegeId]);


  // Fetch Batches + Subjects when program changes
  useEffect(() => {
    if (!selectedProgramId) {
      setBatches([]);
      setAcademicYears([]);
      setSemesters([]);
      setSubjectOptions([]);
      setFieldValue('common.batch', '');
      setFieldValue('common.academicYear', '');
      setFieldValue('common.semester', '');
      setFieldValue('common.paper', '');
      setFieldValue('common.paperId', '');
      return;
    }

    setLoadingBatches(true);
    const fetchBatchesAndSubjects = async () => {
      try {
        const [batchRes, subjectRes] = await Promise.all([
          batchService.getBatchByProgramId(selectedProgramId),
          contentService.getSubjectbyProgramId(selectedProgramId),
        ]);
        setBatches(batchRes || []);
        const subjects = (subjectRes || []).filter(s => !s.is_deleted)
          .map(s => ({ id: s.subject_id, name: s.subject_name || s.name }));
        setSubjectOptions(subjects);
      } catch (err) {
        console.error('Failed to fetch batches/subjects:', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatchesAndSubjects();
  }, [selectedProgramId]);

  // Extract Academic Years when batch changes
  useEffect(() => {
    const batchId = common.batchId;
    if (!batchId) {
      setAcademicYears([]);
      setSemesters([]);
      return;
    }
    const batch = batches.find(b => b.batch_id == batchId);
    if (batch?.academic_years) {
      setAcademicYears(batch.academic_years);
    } else {
      setAcademicYears([]);
    }
    setFieldValue('common.academicYear', '');
    setFieldValue('common.semester', '');
  }, [common.batchId, batches]);

  // Extract Semesters when Academic Year changes
  useEffect(() => {
    const ayId = common.academicYearId;
    if (!ayId) {
      setSemesters([]);
      return;
    }
    const ay = academicYears.find(a => a.academic_year_id == ayId);
    if (ay?.semester_divisions) {
      setSemesters(ay.semester_divisions.map(s => ({
        id: s.semester_id,
        name: s.name || s.semester_name
      })));
    } else {
      setSemesters([]);
    }
    setFieldValue('common.semester', '');
  }, [common.academicYearId, academicYears]);




  // Fetch Modules
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) return;
      setLoadingModules(true);
      try {
        const res = await academicsContentService.getModulesbySubject(selectedSubjectId);
        const modules = Array.isArray(res) ? res : (res?.modules || []);
        setChapterOptions(modules.map(m => ({
          module_id: m.module_id,
          module_name: m.module_name || m.label,
          units: m.units || []
        })));
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setChapterOptions([]);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, [selectedSubjectId, common.batchId, common.academicYearId, common.semesterId]);

  // Update topics when module changes
  useEffect(() => {
    if (!selectedModuleId) {
      setTopicOptions([]);
      setSelectedUnitId(null);
      setFieldValue('common.topic', '');
      setFieldValue('common.unitId', null);
      return;
    }

    const module = chapterOptions.find(m => m.module_id == selectedModuleId);
    if (module && module.units) {
      setTopicOptions(module.units);
    } else {
      setTopicOptions([]);
    }

    setSelectedUnitId(null);
    setFieldValue('common.topic', '');
    setFieldValue('common.unitId', null);
  }, [selectedModuleId, chapterOptions]);

  const handleCommonSelect = (fieldName, value) => {
    if (fieldName === 'program') {
      const selected = hookOptions.programs.find(p => p.label === value);
      const programId = selected?.value ? parseInt(selected.value) : null;
      setSelectedProgramId(programId);
      setFieldValue('common.program', value);
      setFieldValue('common.programId', programId);

      // Reset dependent fields
      setFieldValue('common.batch', '');
      setFieldValue('common.batchId', '');
      setFieldValue('common.academicYear', '');
      setFieldValue('common.academicYearId', '');
      setFieldValue('common.semester', '');
      setFieldValue('common.semesterId', '');
      setFieldValue('common.paper', '');
      setFieldValue('common.paperId', '');
    } else if (fieldName === 'batch') {
      const selected = batches.find(b => (b.batch_name || b.batch_year) === value);
      setFieldValue('common.batch', value);
      setFieldValue('common.batchId', selected?.batch_id || '');
    } else if (fieldName === 'academicYear') {
      const selected = academicYears.find(ay => ay.name === value);
      setFieldValue('common.academicYear', value);
      setFieldValue('common.academicYearId', selected?.academic_year_id || '');
    } else if (fieldName === 'semester') {
      const selected = semesters.find(s => s.name === value);
      setFieldValue('common.semester', value);
      setFieldValue('common.semesterId', selected?.id || '');
    } else if (fieldName === 'subject') {
      const selected = subjectOptions.find(s => s.name === value);
      setSelectedSubjectId(selected?.id || null);
      setFieldValue('common.paper', value);
      setFieldValue('common.paperId', selected?.id || null);
    } else if (fieldName === 'chapter') {
      const selected = chapterOptions.find(m => m.module_name === value);
      setSelectedModuleId(selected?.module_id || null);
      setFieldValue('common.module', value);
      setFieldValue('common.moduleId', selected?.module_id || null);
    } else if (fieldName === 'topic') {
      const selected = topicOptions.find(u => u.unit_name === value);
      setSelectedUnitId(selected?.unit_id || null);
      setFieldValue('common.unit', value);
      setFieldValue('common.unitId', selected?.unit_id || null);
    } else if (fieldName === 'bloomsLevel') {
      const selected = bloomsLevels.find(b => b.level_name === value);
      setFieldValue('common.bloomsLevel', value);
      setFieldValue('common.bloomsLevelId', selected?.blooms_level_id || '');
    } else if (fieldName === 'courseOutcome') {
      const selected = coOptions.find(co => co.name === value);
      setFieldValue('common.courseOutcome', value);
      setFieldValue('common.courseOutcomeId', selected?.id || '');
    }
    setOpenDropdown(null);
  };

  const handleQuestionSelect = (qIndex, fieldName, value) => {

    // 🌸 BLOOMS LEVEL
    if (fieldName === 'bloomsLevel') {
      const selected = bloomsLevels.find(
        b => b.level_name === value
      );

      setFieldValue(`questions[${qIndex}].bloomsLevel`, value);
      setFieldValue(
        `questions[${qIndex}].blooms_level_id`,
        selected?.blooms_level_id || null
      );
    }

    // 📘 QUESTION LEVEL
    else if (fieldName === 'questionLevel') {
      const selected = questionLevels.find(
        q => q.question_level_type === value
      );

      setFieldValue(`questions[${qIndex}].questionLevel`, value);
      setFieldValue(
        `questions[${qIndex}].question_level_id`,
        selected?.question_level_id || null
      );
    }

    // 🧩 OTHER FIELDS
    else {
      setFieldValue(`questions[${qIndex}].${fieldName}`, value);
    }

    setOpenDropdown(null);
  };


  const handleQuestionChange = (qIndex, fieldName, value) => {
    setFieldValue(`questions[${qIndex}].${fieldName}`, value);
  };

  const handleQuestionFileChange = (qIndex, e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    setFieldValue(`questions[${qIndex}].questionImagesNames`, fileNames);
  };

  const addQuestion = () => {
    const newQuestions = [...questions, {
      courseOutcome: "",
      bloomsLevel: "",
      questionLevel: "",
      defaultMarks: "",
      question: "",
      modelAnswer: "",
      noOfOptions: "4",
      answer: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
      questionImagesNames: ""
    }];
    setFieldValue('questions', newQuestions);
  };

  const removeQuestion = (index) => {
    const newQs = questions.filter((_, i) => i !== index);
    setFieldValue('questions', newQs.length ? newQs : [{}]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CustomDropdown = ({
    id,
    label,
    value,
    options,
    placeholder,
    required = false,
    onSelect,
    disabled = false,
    loading = false,
  }) => (
    <div ref={el => (dropdownRefs.current[id] = el)} className="relative">
      <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md min-h-[42px] flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        onClick={() => !disabled && setOpenDropdown(openDropdown === id ? null : id)}
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'} text-sm md:text-base`}>
          {loading ? 'Loading...' : value || placeholder}
        </span>
        {!disabled && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === id ? 'rotate-180' : 'rotate-0'
              }`}
          />
        )}
      </div>
      {openDropdown === id && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => onSelect('')}
          >
            {placeholder}
          </div>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => onSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Get question level options
  const getQuestionLevelOptions = () => {
    return questionLevels.map(level => level.question_level_type || level.name);
  };

  // Get blooms level options
  const getBloomsLevelOptions = () => {
    return bloomsLevels.map(level => level.level_name);
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* COMMON SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 pb-6 border-b">
        <CustomDropdown
          id="program-dropdown"
          label="Program"
          value={common.program || ''}
          options={hookOptions.programs.map(p => p.label)}
          placeholder="Select Program"
          required
          onSelect={val => handleCommonSelect('program', val)}
        />

        <CustomDropdown
          id="batch-dropdown"
          label="Batch"
          value={common.batch || ''}
          options={batches.map(b => b.batch_name || b.batch_year)}
          placeholder="Select Batch"
          required
          disabled={!common.programId}
          loading={loadingBatches}
          onSelect={val => handleCommonSelect('batch', val)}
        />

        <CustomDropdown
          id="ay-dropdown"
          label="Academic Year"
          value={common.academicYear || ''}
          options={academicYears.map(ay => ay.name)}
          placeholder="Select Year"
          required
          disabled={!common.batchId}
          onSelect={val => handleCommonSelect('academicYear', val)}
        />

        <CustomDropdown
          id="sem-dropdown"
          label="Semester"
          value={common.semester || ''}
          options={semesters.map(s => s.name)}
          placeholder="Select Semester"
          required
          disabled={!common.academicYearId}
          onSelect={val => handleCommonSelect('semester', val)}
        />

        <CustomDropdown
          id="subject-dropdown"
          label="Paper"
          value={common.paper || ''}
          options={subjectOptions.map(s => s.name)}
          placeholder="Select Paper"
          required
          disabled={!common.programId}
          loading={loadingSubjects}
          onSelect={val => handleCommonSelect('subject', val)}
        />

        <CustomDropdown
          id="chapter-dropdown"
          label="Module"
          value={common.module || ''}
          options={chapterOptions.map(m => m.module_name)}
          placeholder="Select Module"
          required
          disabled={!common.paperId}
          loading={loadingModules}
          onSelect={val => handleCommonSelect('chapter', val)}
        />

        <CustomDropdown
          id="topic-dropdown"
          label="Unit"
          value={common.unit || ''}
          options={topicOptions.map(u => u.unit_name)}
          placeholder="Select Unit"
          required
          disabled={!common.moduleId}
          onSelect={val => handleCommonSelect('topic', val)}
        />

        <CustomDropdown
          id="co-common-dropdown"
          label="Course Outcome"
          value={common.courseOutcome || ''}
          options={coOptions.map(co => co.name)}
          placeholder="Select CO"
          disabled={!common.paperId}
          loading={loadingCOs}
          onSelect={val => handleCommonSelect('courseOutcome', val)}
        />

        <CustomDropdown
          id="blooms-common"
          label="Bloom's Level"
          value={common.bloomsLevel || ''}
          options={bloomsLevels.map(level => level.level_name)}
          placeholder="Select BL"
          loading={loadingBloomsLevels}
          onSelect={val => handleCommonSelect('bloomsLevel', val)}
        />
      </div>

      {/* MULTIPLE QUESTIONS */}
      {questions.map((q, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-5 md:p-6 bg-gray-50 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1.5 text-sm font-medium"
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <CustomDropdown
              id={`qlevel-${index}`}
              label="Question Level"
              value={q.questionLevel || ''}
              options={questionLevels.map(q => q.question_level_type)}
              placeholder="Select Level"
              onSelect={val =>
                handleQuestionSelect(index, 'questionLevel', val)
              }
            />

            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
                Default Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={q.defaultMarks || ''}
                onChange={e => handleQuestionChange(index, 'defaultMarks', e.target.value)}
                placeholder="Enter marks"
                min="1"
                className={`w-full border rounded-md px-3 py-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors?.questions?.[index]?.defaultMarks ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
                No. of Options <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={q.noOfOptions || '4'}
                onChange={e => handleQuestionChange(index, 'noOfOptions', e.target.value)}
                placeholder="Enter options count"
                min="2"
                className="w-full border rounded-md px-3 py-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={q.question || ''}
                onChange={e => handleQuestionChange(index, 'question', e.target.value)}
                rows="4"
                placeholder="Enter your question here..."
                className={`w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 text-sm md:text-base ${errors?.questions?.[index]?.question ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
                Question Images
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={q.questionImagesNames || 'No file chosen'}
                  readOnly
                  className="w-full border rounded-md px-3 py-2.5 bg-gray-50 border-gray-300 text-sm cursor-default"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  multiple
                  onChange={e => handleQuestionFileChange(index, e)}
                  className="hidden"
                  id={`questionImages-${index}`}
                />
                <label
                  htmlFor={`questionImages-${index}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden xs:inline">Choose files</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Supported: jpeg, png, jpg, pdf
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block font-medium text-gray-700 text-sm md:text-base">
              Options
            </label>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D', 'E'].slice(0, Number(q.noOfOptions || 4)).map(opt => (
                <div key={opt} className="flex items-start gap-3">
                  <div className="mt-1 font-medium w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 shrink-0">
                    {opt}
                  </div>
                  <textarea
                    value={q[`option${opt}`] || ''}
                    onChange={e => handleQuestionChange(index, `option${opt}`, e.target.value)}
                    placeholder={`Option ${opt}...`}
                    rows={2}
                    className={`flex-1 border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y text-sm ${errors?.questions?.[index]?.[`option${opt}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700 text-sm md:text-base">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 md:gap-6">
              {['A', 'B', 'C', 'D', 'E'].slice(0, Number(q.noOfOptions || 4)).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`answer-${index}`}
                    checked={q.answer === opt}
                    onChange={() => handleQuestionChange(index, 'answer', opt)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Option {opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
      >
        <Plus size={18} /> Add New Question
      </button>
    </div>
  );
};

export default ObjectiveQuestion;