import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Upload, Plus, Trash2 } from 'lucide-react';
import { contentService as addContentService } from '../../Content/services/AddContent.service.js';
import { getTeacherAllocatedPrograms } from '../../../../../_services/api.js';
import { useUserProfile } from "../../../../../contexts/UserProfileContext.jsx";
import { COService } from "../Settings/Service/co.service.js"
import { QuestionsService } from '../Services/questions.service.js';

const ObjectiveQuestion = ({
  formData,
  setFieldValue,
  errors,
  touched,
}) => {
  const { getTeacherId } = useUserProfile();
  const teacherId = getTeacherId();

  const [questionLevels, setQuestionLevels] = useState([]);
  const [loadingQuestionLevels, setLoadingQuestionLevels] = useState(false);

  // ==== Dropdown States ====
  const [programOptions, setProgramOptions] = useState([]);
  const [allocationData, setAllocationData] = useState(null);

  const [batchOptions, setBatchOptions] = useState([]);
  const [academicSemesterOptions, setAcademicSemesterOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [coOptions, setCoOptions] = useState([]);
  const [bloomsLevels, setBloomsLevels] = useState([]);

  // ==== Loading States ====
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingCOs, setLoadingCOs] = useState(false);
  const [loadingBloomsLevels, setLoadingBloomsLevels] = useState(false);

  // ==== UI States ====
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const common = formData.common || {};
  const questions = formData.questions || [{}];

  // Initialize data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingPrograms(true);
      setLoadingQuestionLevels(true);
      setLoadingBloomsLevels(true);
      try {
        const [programsRes, levelsRes, bloomsRes] = await Promise.all([
          getTeacherAllocatedPrograms(teacherId),
          QuestionsService.getAllQuestionLevels(),
          QuestionsService.getAllBloomsLevels()
        ]);

        if (programsRes.success && programsRes.data) {
          setAllocationData(programsRes.data);
          const allAllocations = [
            ...(programsRes.data.class_teacher_allocation || []),
            ...(programsRes.data.normal_allocation || [])
          ];
          const programMap = new Map();
          allAllocations.forEach(allocation => {
            if (allocation.program) {
              const program = allocation.program;
              if (!programMap.has(program.program_id)) {
                programMap.set(program.program_id, {
                  id: program.program_id,
                  name: program.program_name
                });
              }
            }
          });
          setProgramOptions(Array.from(programMap.values()));
        }
        setQuestionLevels(levelsRes || []);
        setBloomsLevels(bloomsRes || []);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoadingPrograms(false);
        setLoadingQuestionLevels(false);
        setLoadingBloomsLevels(false);
      }
    };

    if (teacherId) fetchInitialData();
  }, [teacherId]);

  // Load Batches when Program changes
  useEffect(() => {
    if (!common.programId || !allocationData) {
      setBatchOptions([]);
      return;
    }

    const selectedProgramId = parseInt(common.programId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a => (a.program?.program_id || a.program_id) === selectedProgramId);

    const batchMap = new Map();
    allocations.forEach(a => {
      if (a.batch) batchMap.set(a.batch.batch_id, { id: a.batch.batch_id, name: a.batch.batch_name });
    });
    setBatchOptions(Array.from(batchMap.values()));
  }, [common.programId, allocationData]);

  // Load Semesters when Program + Batch changes
  useEffect(() => {
    if (!common.programId || !common.batchId || !allocationData) {
      setAcademicSemesterOptions([]);
      return;
    }

    const selectedProgramId = parseInt(common.programId);
    const selectedBatchId = parseInt(common.batchId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a =>
      (a.program?.program_id || a.program_id) === selectedProgramId &&
      (a.batch?.batch_id || a.batch_id) === selectedBatchId
    );

    const semesterMap = new Map();
    allocations.forEach(a => {
      if (a.academic_year && a.semester) {
        const key = `${a.academic_year_id}-${a.semester_id}`;
        if (!semesterMap.has(key)) {
          semesterMap.set(key, {
            id: key,
            name: `${a.academic_year.name} - ${a.semester.name}`,
            academicYearId: a.academic_year_id,
            semesterId: a.semester_id
          });
        }
      }
    });
    setAcademicSemesterOptions(Array.from(semesterMap.values()));
  }, [common.programId, common.batchId, allocationData]);

  // Load Divisions when Program + Batch + Semester changes
  useEffect(() => {
    if (!common.programId || !common.batchId || !common.semesterId || !allocationData) {
      setDivisionOptions([]);
      return;
    }

    const selectedProgramId = parseInt(common.programId);
    const selectedBatchId = parseInt(common.batchId);
    const selectedSemesterId = parseInt(common.semesterId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a =>
      (a.program?.program_id || a.program_id) === selectedProgramId &&
      (a.batch?.batch_id || a.batch_id) === selectedBatchId &&
      (a.semester?.semester_id || a.semester_id) === selectedSemesterId
    );

    const divisionMap = new Map();
    allocations.forEach(a => {
      if (a.division) {
        divisionMap.set(a.division.division_id, { id: a.division.division_id, name: a.division.division_name });
      }
    });
    setDivisionOptions(Array.from(divisionMap.values()));
  }, [common.programId, common.batchId, common.semesterId, allocationData]);

  // Load Subjects when Academic Year/Semester changes
  useEffect(() => {
    if (!common.academicYearId || !common.semesterId || !common.programId || !common.batchId || !common.divisionId) {
      setSubjectOptions([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await addContentService.getTeacherSubjectsAllocated(teacherId, common.academicYearId, common.semesterId);
        if (Array.isArray(res)) {
          setSubjectOptions(res.map(s => ({ id: s.subject_id, name: s.subject_name || s.name })));
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [common.academicYearId, common.semesterId, common.programId, common.batchId, common.divisionId, teacherId]);

  // Load Modules when Subject changes
  useEffect(() => {
    if (!common.paperId) {
      setModuleOptions([]);
      return;
    }

    const fetchModules = async () => {
      setLoadingModules(true);
      try {
        const res = await addContentService.getModulesAndUnits(common.paperId);
        const modules = res?.modules || [];
        setModuleOptions(modules.map(m => ({
          id: m.module_id || m.id,
          name: m.module_name || m.name,
          units: m.units || []
        })));
      } catch (err) {
        console.error('Failed to fetch modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    const fetchCOs = async () => {
      setLoadingCOs(true);
      try {
        const response = await COService.getAllCOByCourseId(common.paperId);
        setCoOptions(response.map(co => ({
          id: co.course_outcome_id,
          name: co.outcome_code || co.outcome_title,
        })));
      } catch (err) {
        console.error('Failed to fetch COs:', err);
      } finally {
        setLoadingCOs(false);
      }
    };

    fetchModules();
    fetchCOs();
  }, [common.paperId]);

  // Update Units when Module changes
  useEffect(() => {
    if (!common.moduleId) {
      setUnitOptions([]);
      return;
    }
    const module = moduleOptions.find(m => m.id == common.moduleId);
    if (module?.units) {
      setUnitOptions(module.units.map(u => ({ id: u.unit_id || u.id, name: u.unit_name || u.name })));
    } else {
      setUnitOptions([]);
    }
  }, [common.moduleId, moduleOptions]);

  const handleCommonSelect = (fieldName, value) => {
    if (fieldName === 'program') {
      const selected = programOptions.find(p => p.name === value);
      setFieldValue('common.program', value);
      setFieldValue('common.programId', selected?.id || "");
      // Reset dependents
      setFieldValue('common.batch', "");
      setFieldValue('common.batchId', "");
      setFieldValue('common.academicYearSemester', "");
      setFieldValue('common.academicYear', "");
      setFieldValue('common.academicYearId', "");
      setFieldValue('common.semester', "");
      setFieldValue('common.semesterId', "");
      setFieldValue('common.division', "");
      setFieldValue('common.divisionId', "");
      setFieldValue('common.paper', "");
      setFieldValue('common.paperId', "");
    } else if (fieldName === 'batch') {
      const selected = batchOptions.find(b => b.name === value);
      setFieldValue('common.batch', value);
      setFieldValue('common.batchId', selected?.id || "");
      // Reset dependents
      setFieldValue('common.academicYearSemester', "");
      setFieldValue('common.academicYear', "");
      setFieldValue('common.academicYearId', "");
      setFieldValue('common.semester', "");
      setFieldValue('common.semesterId', "");
      setFieldValue('common.division', "");
      setFieldValue('common.divisionId', "");
      setFieldValue('common.paper', "");
      setFieldValue('common.paperId', "");
    } else if (fieldName === 'academicYearSemester') {
      const selected = academicSemesterOptions.find(s => s.name === value);
      setFieldValue('common.academicYearSemester', value);
      setFieldValue('common.academicYear', selected ? "Set" : ""); // Visual only
      setFieldValue('common.academicYearId', selected?.academicYearId || "");
      setFieldValue('common.semester', selected?.name.split(' - ')[1] || "");
      setFieldValue('common.semesterId', selected?.semesterId || "");
      // Reset dependents
      setFieldValue('common.division', "");
      setFieldValue('common.divisionId', "");
      setFieldValue('common.paper', "");
      setFieldValue('common.paperId', "");
    } else if (fieldName === 'division') {
      const selected = divisionOptions.find(d => d.name === value);
      setFieldValue('common.division', value);
      setFieldValue('common.divisionId', selected?.id || "");
    } else if (fieldName === 'subject') {
      const selected = subjectOptions.find(s => s.name === value);
      setFieldValue('common.paper', value);
      setFieldValue('common.paperId', selected?.id || "");
      // Reset dependents
      setFieldValue('common.module', "");
      setFieldValue('common.moduleId', "");
      setFieldValue('common.unit', "");
      setFieldValue('common.unitId', "");
    } else if (fieldName === 'module') {
      const selected = moduleOptions.find(m => m.name === value);
      setFieldValue('common.module', value);
      setFieldValue('common.moduleId', selected?.id || "");
      // Reset dependent
      setFieldValue('common.unit', "");
      setFieldValue('common.unitId', "");
    } else if (fieldName === 'unit') {
      const selected = unitOptions.find(u => u.name === value);
      setFieldValue('common.unit', value);
      setFieldValue('common.unitId', selected?.id || "");
    } else if (fieldName === 'courseOutcome') {
      const selected = coOptions.find(co => co.name === value);
      setFieldValue('common.courseOutcome', value);
      setFieldValue('common.courseOutcomeId', selected?.id || "");
    } else if (fieldName === 'bloomsLevel') {
      const selected = bloomsLevels.find(b => b.level_name === value);
      setFieldValue('common.bloomsLevel', value);
      setFieldValue('common.bloomsLevelId', selected?.blooms_level_id || "");
    }
    setOpenDropdown(null);
  };

  const handleQuestionSelect = (index, fieldName, value) => {
    if (fieldName === 'questionLevel') {
      const selected = questionLevels.find(l => l.question_level_type === value);
      setFieldValue(`questions[${index}].questionLevel`, value);
      setFieldValue(`questions[${index}].question_level_id`, selected?.question_level_id || null);
    }
    setOpenDropdown(null);
  };

  const handleQuestionChange = (index, field, value) => {
    setFieldValue(`questions[${index}].${field}`, value);
  };

  const handleQuestionFileChange = (index, e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const names = Array.from(files).map(f => f.name).join(', ');
    setFieldValue(`questions[${index}].questionImagesNames`, names);
    // Note: Actual upload logic would go here if needed
  };

  const addQuestion = () => {
    setFieldValue('questions', [...questions, {
      bloomsLevel: "",
      questionLevel: "",
      defaultMarks: "",
      question: "",
      noOfOptions: 4,
      answer: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
    }]);
  };

  const removeQuestion = (index) => {
    const newQs = questions.filter((_, i) => i !== index);
    setFieldValue('questions', newQs.length ? newQs : [{}]);
  };

  const CustomDropdown = ({ id, label, value, options, placeholder, required, onSelect, disabled, loading }) => (
    <div ref={el => (dropdownRefs.current[id] = el)} className="relative">
      <label className="block font-medium mb-1 text-gray-700 text-sm">{label}{required && <span className="text-red-500">*</span>}</label>
      <div
        className={`w-full px-3 py-2 border bg-white cursor-pointer rounded-md min-h-[40px] flex items-center justify-between ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-400 focus:ring-2 focus:ring-blue-400'}`}
        onClick={() => !disabled && setOpenDropdown(openDropdown === id ? null : id)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{loading ? 'Loading...' : value || placeholder}</span>
        {!disabled && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />}
      </div>
      {openDropdown === id && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt, idx) => (
            <div key={idx} className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer" onClick={() => onSelect(opt)}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* FILTER SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b">
        <CustomDropdown id="program" label="Program" value={common.program} options={programOptions.map(p => p.name)} placeholder="Select Program" required onSelect={v => handleCommonSelect('program', v)} loading={loadingPrograms} />
        <CustomDropdown id="batch" label="Batch" value={common.batch} options={batchOptions.map(b => b.name)} placeholder="Select Batch" required disabled={!common.programId} onSelect={v => handleCommonSelect('batch', v)} />
        <CustomDropdown id="academicSemester" label="Academic Year - Semester" value={common.academicYearSemester} options={academicSemesterOptions.map(s => s.name)} placeholder="Select Semester" required disabled={!common.batchId} onSelect={v => handleCommonSelect('academicYearSemester', v)} />
        <CustomDropdown id="division" label="Division" value={common.division} options={divisionOptions.map(d => d.name)} placeholder="Select Division" disabled={!common.semesterId || divisionOptions.length === 0} onSelect={v => handleCommonSelect('division', v)} />
        <CustomDropdown id="subject" label="Paper" value={common.paper} options={subjectOptions.map(s => s.name)} placeholder="Select Paper" required disabled={!common.semesterId} onSelect={v => handleCommonSelect('subject', v)} loading={loadingSubjects} />
        <CustomDropdown id="module" label="Module" value={common.module} options={moduleOptions.map(m => m.name)} placeholder="Select Module" required disabled={!common.paperId} onSelect={v => handleCommonSelect('module', v)} loading={loadingModules} />
        <CustomDropdown id="unit" label="Unit" value={common.unit} options={unitOptions.map(u => u.name)} placeholder="Select Unit" required disabled={!common.moduleId} onSelect={v => handleCommonSelect('unit', v)} />
        <CustomDropdown id="co" label="Course Outcome" value={common.courseOutcome} options={coOptions.map(co => co.name)} placeholder="Select CO" required disabled={!common.paperId} onSelect={v => handleCommonSelect('courseOutcome', v)} loading={loadingCOs} />
        <CustomDropdown id="blooms" label="Bloom's Level" value={common.bloomsLevel} options={bloomsLevels.map(b => b.level_name)} placeholder="Select BL" required onSelect={v => handleCommonSelect('bloomsLevel', v)} loading={loadingBloomsLevels} />
      </div>

      {/* QUESTIONS */}
      {questions.map((q, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Question {index + 1}</h3>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"><Trash2 size={16} /> Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomDropdown id={`qlevel-${index}`} label="Question Level" value={q.questionLevel} options={questionLevels.map(l => l.question_level_type)} placeholder="Select Level" onSelect={v => handleQuestionSelect(index, 'questionLevel', v)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Marks <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={q.defaultMarks} onChange={e => handleQuestionChange(index, 'defaultMarks', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Marks" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Options</label>
              <select value={q.noOfOptions} onChange={e => handleQuestionChange(index, 'noOfOptions', e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
                {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
            <textarea rows="3" value={q.question} onChange={e => handleQuestionChange(index, 'question', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter question..." />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Options & Correct Answer</label>
            {['A', 'B', 'C', 'D', 'E'].slice(0, Number(q.noOfOptions || 4)).map(opt => (
              <div key={opt} className="flex items-center gap-3">
                <input type="radio" name={`answer-${index}`} checked={q.answer === opt} onChange={() => handleQuestionChange(index, 'answer', opt)} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-500 w-4">{opt}</span>
                <input type="text" value={q[`option${opt}`]} onChange={e => handleQuestionChange(index, `option${opt}`, e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder={`Option ${opt}`} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="button" onClick={addQuestion} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"><Plus size={18} /> Add Question</button>
    </div>
  );
};

export default ObjectiveQuestion;