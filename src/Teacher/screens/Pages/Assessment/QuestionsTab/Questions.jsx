'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import BulkUploadAssessmentModal from '../Components/BulkUploadAssessmentModal';
import { Plus, Filter, ChevronDown, ChevronLeft, ChevronRight, X, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionsService } from '../Services/questions.service';
import { contentService as addContentService } from '../../Content/services/AddContent.service.js';
import { getTeacherAllocatedPrograms } from '../../../../../_services/api.js';
import { useUserProfile } from "../../../../../contexts/UserProfileContext.jsx";

const Questions = () => {
  const navigate = useNavigate();
  const { getTeacherId } = useUserProfile();
  const teacherId = getTeacherId();

  const [questionsData, setQuestionsData] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ==== Filter States ====
  const [filters, setFilters] = useState({
    filterOpen: false,
    selectedProgramId: '',
    program: '',
    selectedBatchId: '',
    batch: '',
    selectedAcademicYearId: '',
    selectedSemesterId: '',
    academicYearSemester: '',
    selectedDivisionId: '',
    division: '',
    selectedPaperId: '',
    paper: '',
    selectedModuleId: '',
    module: '',
    selectedUnitId: '',
    unit: '',
  });

  const [options, setOptions] = useState({
    programs: [],
    batches: [],
    academicSemesters: [],
    divisions: [],
    subjects: [],
    modules: [],
    units: [],
  });

  const [allocationData, setAllocationData] = useState(null);
  const [allBatches, setAllBatches] = useState([]);

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const customBlue = 'rgb(33 98 193 / var(--tw-bg-opacity, 1))';
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Load Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!teacherId) return;
      try {
        const res = await getTeacherAllocatedPrograms(teacherId);
        if (res.success && res.data) {
          setAllocationData(res.data);
          const allAllocations = [...(res.data.class_teacher_allocation || []), ...(res.data.normal_allocation || [])];
          const programMap = new Map();
          allAllocations.forEach(a => {
            if (a.program) programMap.set(a.program.program_id, { value: a.program.program_id, label: a.program.program_name });
          });
          setOptions(prev => ({ ...prev, programs: Array.from(programMap.values()) }));
        }
      } catch (err) { console.error(err); }
    };
    fetchPrograms();
  }, [teacherId]);

  // Load Dependent Data (Hierarchy: Program -> Batch -> Academic Year / Semester -> Division)
  useEffect(() => {
    if (!filters.selectedProgramId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a => (a.program?.program_id || a.program_id) === progId);

    // Extract Unique Batches for the selected Program
    const batchMap = new Map();
    allocations.forEach(a => {
      if (a.batch) batchMap.set(a.batch.batch_id, { value: a.batch.batch_id, label: a.batch.batch_name });
    });
    setOptions(prev => ({ ...prev, batches: Array.from(batchMap.values()) }));
  }, [filters.selectedProgramId, allocationData]);

  // Load Semesters Based on Program + Batch
  useEffect(() => {
    if (!filters.selectedProgramId || !filters.selectedBatchId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId);
    const batchId = parseInt(filters.selectedBatchId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a =>
      (a.program?.program_id || a.program_id) === progId &&
      (a.batch?.batch_id || a.batch_id) === batchId
    );

    const semesterMap = new Map();
    allocations.forEach(a => {
      if (a.academic_year && a.semester) {
        const key = `${a.academic_year_id}-${a.semester_id}`;
        if (!semesterMap.has(key)) {
          semesterMap.set(key, { value: key, label: `${a.academic_year.name} - ${a.semester.name}`, yearId: a.academic_year_id, semId: a.semester_id });
        }
      }
    });
    setOptions(prev => ({ ...prev, academicSemesters: Array.from(semesterMap.values()) }));
  }, [filters.selectedProgramId, filters.selectedBatchId, allocationData]);

  // Load Divisions Based on Program + Batch + Academic Year/Semester
  useEffect(() => {
    if (!filters.selectedProgramId || !filters.selectedBatchId || !filters.selectedSemesterId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId);
    const batchId = parseInt(filters.selectedBatchId);
    const semId = parseInt(filters.selectedSemesterId);
    const allAllocations = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const allocations = allAllocations.filter(a =>
      (a.program?.program_id || a.program_id) === progId &&
      (a.batch?.batch_id || a.batch_id) === batchId &&
      (a.semester?.semester_id || a.semester_id) === semId
    );

    const divisionMap = new Map();
    allocations.forEach(a => {
      if (a.division) {
        divisionMap.set(a.division.division_id, { value: a.division.division_id, label: a.division.division_name });
      }
    });
    setOptions(prev => ({ ...prev, divisions: Array.from(divisionMap.values()) }));
  }, [filters.selectedProgramId, filters.selectedBatchId, filters.selectedSemesterId, allocationData]);

  // Handle Selections
  const handleFilterChange = async (name, item) => {
    const newFilters = { ...filters };
    if (name === 'program') {
      newFilters.program = item.label;
      newFilters.selectedProgramId = item.value;
      newFilters.batch = ''; newFilters.selectedBatchId = '';
      newFilters.academicYearSemester = ''; newFilters.selectedAcademicYearId = ''; newFilters.selectedSemesterId = '';
      newFilters.division = ''; newFilters.selectedDivisionId = '';
      newFilters.paper = ''; newFilters.selectedPaperId = '';
      newFilters.module = ''; newFilters.selectedModuleId = '';
      newFilters.unit = ''; newFilters.selectedUnitId = '';
    } else if (name === 'batch') {
      newFilters.batch = item.label;
      newFilters.selectedBatchId = item.value;
      newFilters.academicYearSemester = ''; newFilters.selectedAcademicYearId = ''; newFilters.selectedSemesterId = '';
      newFilters.division = ''; newFilters.selectedDivisionId = '';
      newFilters.paper = ''; newFilters.selectedPaperId = '';
      newFilters.module = ''; newFilters.selectedModuleId = '';
      newFilters.unit = ''; newFilters.selectedUnitId = '';
    } else if (name === 'academicSemester') {
      newFilters.academicYearSemester = item.label;
      newFilters.selectedAcademicYearId = item.yearId;
      newFilters.selectedSemesterId = item.semId;
      newFilters.division = ''; newFilters.selectedDivisionId = '';
      newFilters.paper = ''; newFilters.selectedPaperId = '';
      newFilters.module = ''; newFilters.selectedModuleId = '';
      newFilters.unit = ''; newFilters.selectedUnitId = '';

      try {
        const res = await addContentService.getTeacherSubjectsAllocated(teacherId, item.yearId, item.semId);
        setOptions(prev => ({ ...prev, subjects: (res || []).map(s => ({ value: s.subject_id, label: s.subject_name || s.name })) }));
      } catch (err) { console.error(err); }
    } else if (name === 'division') {
      newFilters.division = item.label;
      newFilters.selectedDivisionId = item.value;
    } else if (name === 'paper') {
      newFilters.paper = item.label;
      newFilters.selectedPaperId = item.value;
      newFilters.module = ''; newFilters.selectedModuleId = '';
      newFilters.unit = ''; newFilters.selectedUnitId = '';
      try {
        const res = await addContentService.getModulesAndUnits(item.value);
        setOptions(prev => ({ ...prev, modules: (res?.modules || []).map(m => ({ value: m.id || m.module_id, label: m.name || m.module_name, units: m.units || [] })) }));
      } catch (err) { console.error(err); }
    } else if (name === 'module') {
      newFilters.module = item.label;
      newFilters.selectedModuleId = item.value;
      newFilters.unit = ''; newFilters.selectedUnitId = '';
      const mod = options.modules.find(m => m.value === item.value);
      setOptions(prev => ({ ...prev, units: (mod?.units || []).map(u => ({ value: u.id || u.unit_id, label: u.name || u.unit_name })) }));
    } else if (name === 'unit') {
      newFilters.unit = item.label;
      newFilters.selectedUnitId = item.value;
    }
    setFilters(newFilters);
  };

  const getQuestions = async () => {
    setLoadingQuestions(true);
    try {
      let res;
      // Use most specific filter available
      if (filters.selectedUnitId) {
        // No unit-specific API, so use module
        res = await QuestionsService.getQuestionsByModule(filters.selectedModuleId);
        // Filter by unit client-side if needed
        if (Array.isArray(res)) {
          res = res.filter(q => q.unit_id == filters.selectedUnitId);
        }
      } else if (filters.selectedModuleId) {
        res = await QuestionsService.getQuestionsByModule(filters.selectedModuleId);
      } else if (filters.selectedPaperId) {
        res = await QuestionsService.getQuestionsBySubject(filters.selectedPaperId);
      } else if (filters.selectedProgramId) {
        res = await QuestionsService.getQuestionsByProgram(filters.selectedProgramId);
      } else {
        alert("Please select at least a program to fetch questions.");
        setLoadingQuestions(false);
        return;
      }
      setQuestionsData(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Error fetching questions:', err);
      alert('Error fetching questions. Please try again.');
      setQuestionsData([]);
    }
    finally { setLoadingQuestions(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await QuestionsService.deleteQuestion(id);
      setQuestionsData(prev => prev.filter(q => (q.question_id || q.id) !== id));
    } catch (err) { console.error(err); }
  };

  // Custom Select Components...
  const CustomSelect = ({ label, value, options, placeholder, onSelect, disabled, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div className={`w-full px-3 py-2 border rounded-lg min-h-[44px] flex items-center justify-between cursor-pointer ${disabled ? 'bg-gray-100' : 'bg-white'}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>{loading ? 'Loading...' : value || placeholder}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((opt, i) => (
                <div key={i} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { onSelect(opt); setIsOpen(false); }}>{opt.label}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button onClick={() => setFilters(p => ({ ...p, filterOpen: !p.filterOpen }))} className="flex items-center gap-2 bg-white border px-4 py-3 rounded-xl shadow-sm">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter</span>
          <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex gap-3">
          <button onClick={() => navigate('/teacher/assessments/add-question')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg"><Plus className="w-5 h-5" /> Add New Question</button>
          <button onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg"><Upload className="w-5 h-5" /> Bulk Upload</button>
        </div>
      </div>

      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomSelect label="Program" value={filters.program} options={options.programs} onSelect={v => handleFilterChange('program', v)} placeholder="Select Program" />
            <CustomSelect label="Batch" value={filters.batch} options={options.batches} onSelect={v => handleFilterChange('batch', v)} placeholder="Select Batch" disabled={!filters.selectedProgramId} />
            <CustomSelect label="Academic Year - Semester" value={filters.academicYearSemester} options={options.academicSemesters} onSelect={v => handleFilterChange('academicSemester', v)} placeholder="Select Semester" disabled={!filters.selectedBatchId} />
            <CustomSelect label="Division" value={filters.division} options={options.divisions} onSelect={v => handleFilterChange('division', v)} placeholder="Select Division" disabled={!filters.selectedSemesterId || options.divisions.length === 0} />
            <CustomSelect label="Paper" value={filters.paper} options={options.subjects} onSelect={v => handleFilterChange('paper', v)} placeholder="Select Paper" disabled={!filters.selectedSemesterId} />
            <CustomSelect label="Module" value={filters.module} options={options.modules} onSelect={v => handleFilterChange('module', v)} placeholder="Select Module" disabled={!filters.selectedPaperId} />
            <CustomSelect label="Unit" value={filters.unit} options={options.units} onSelect={v => handleFilterChange('unit', v)} placeholder="Select Unit" disabled={!filters.selectedModuleId} />
          </div>
          <div className="mt-4 flex justify-end"><button onClick={getQuestions} className="bg-blue-600 text-white px-8 py-3 rounded-lg">Get Q's</button></div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Questions</h2></div>
        <div className="p-6">
          {loadingQuestions ? <div className="text-center py-10">Loading questions...</div> : (
            <div className="grid gap-4">
              {questionsData.length === 0 ? <p className="text-center text-gray-500 py-10">No questions found. Use filters to search.</p> : questionsData.map((q, i) => (
                <div key={q.id || q.question_id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">Q{i + 1}</div>
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium uppercase">{q.question_category}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium uppercase">{q.question_level_name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/teacher/assessments/view-question/${q.question_id || q.id}`, { state: { question: q } })} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye size={18} /></button>
                      <button onClick={() => navigate(`/teacher/assessments/edit-question/${q.question_id || q.id}`, { state: { question: q } })} className="p-2 text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(q.question_id || q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{q.question}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                    <div className="flex gap-4">
                      <span>Subject: {q.subject_name}</span>
                      <span>Marks: {q.default_marks}</span>
                    </div>
                    <span>{q.module_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBulkUpload && <BulkUploadAssessmentModal onClose={() => setShowBulkUpload(false)} />}
    </div>
  );
};

export default Questions;
