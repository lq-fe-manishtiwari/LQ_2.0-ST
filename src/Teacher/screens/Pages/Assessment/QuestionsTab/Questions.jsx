'use client';
import React, { useState, useEffect, useCallback } from 'react';
import BulkUploadAssessmentModal from '../Components/BulkUploadAssessmentModal';
import {
  Plus, Filter, ChevronDown, Upload, Edit, Trash2, Eye,
  BookOpen, Target, Brain, CheckCircle, ChevronUp, Search,
  X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionsService } from '../Services/questions.service';
import { contentService as addContentService } from '../../Content/services/AddContent.service.js';
import { getTeacherAllocatedPrograms } from '../../../../../_services/api.js';
import { useUserProfile } from "../../../../../contexts/UserProfileContext.jsx";

const ITEMS_PER_PAGE = 10;

const Questions = () => {
  const navigate = useNavigate();
  const { getTeacherId } = useUserProfile();
  const teacherId = getTeacherId();

  const [questionsData, setQuestionsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // ==== Filter States ====
  const [filters, setFilters] = useState({
    filterOpen: false,
    selectedProgramId: '', program: '',
    selectedBatchId: '', batch: '',
    selectedAcademicYearId: '', selectedSemesterId: '', academicYearSemester: '',
    selectedDivisionId: '', division: '',
    selectedPaperId: '', paper: '',
    selectedModuleId: '', module: '',
    selectedUnitId: '', unit: '',
  });

  const [options, setOptions] = useState({
    programs: [], batches: [], academicSemesters: [],
    divisions: [], subjects: [], modules: [], units: [],
  });
  const [allocationData, setAllocationData] = useState(null);

  // ── Load Programs ──────────────────────────────────────────────
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!teacherId) return;
      try {
        const res = await getTeacherAllocatedPrograms(teacherId);
        if (res.success && res.data) {
          setAllocationData(res.data);
          const all = [...(res.data.class_teacher_allocation || []), ...(res.data.normal_allocation || [])];
          const map = new Map();
          all.forEach(a => { if (a.program) map.set(a.program.program_id, { value: a.program.program_id, label: a.program.program_name }); });
          const progs = Array.from(map.values());
          setOptions(p => ({ ...p, programs: progs }));
          if (progs.length > 0 && !filters.selectedProgramId) {
            setFilters(p => ({ ...p, program: progs[0].label, selectedProgramId: progs[0].value }));
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchPrograms();
  }, [teacherId]);

  // ── Auto-fetch when key filters change ────────────────────────
  useEffect(() => {
    if (filters.selectedProgramId) getQuestions();
  }, [filters.selectedProgramId, filters.selectedPaperId, filters.selectedModuleId, filters.selectedUnitId]);

  // ── Batches ───────────────────────────────────────────────────
  useEffect(() => {
    if (!filters.selectedProgramId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId);
    const all = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const map = new Map();
    all.filter(a => (a.program?.program_id || a.program_id) === progId)
      .forEach(a => { if (a.batch) map.set(a.batch.batch_id, { value: a.batch.batch_id, label: a.batch.batch_name }); });
    setOptions(p => ({ ...p, batches: Array.from(map.values()) }));
  }, [filters.selectedProgramId, allocationData]);

  // ── Semesters ─────────────────────────────────────────────────
  useEffect(() => {
    if (!filters.selectedProgramId || !filters.selectedBatchId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId), batchId = parseInt(filters.selectedBatchId);
    const all = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const map = new Map();
    all.filter(a => (a.program?.program_id || a.program_id) === progId && (a.batch?.batch_id || a.batch_id) === batchId)
      .forEach(a => {
        if (a.academic_year && a.semester) {
          const key = `${a.academic_year_id}-${a.semester_id}`;
          if (!map.has(key)) map.set(key, { value: key, label: `${a.academic_year.name} - ${a.semester.name}`, yearId: a.academic_year_id, semId: a.semester_id });
        }
      });
    setOptions(p => ({ ...p, academicSemesters: Array.from(map.values()) }));
  }, [filters.selectedProgramId, filters.selectedBatchId, allocationData]);

  // ── Divisions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!filters.selectedProgramId || !filters.selectedBatchId || !filters.selectedSemesterId || !allocationData) return;
    const progId = parseInt(filters.selectedProgramId), batchId = parseInt(filters.selectedBatchId), semId = parseInt(filters.selectedSemesterId);
    const all = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const map = new Map();
    all.filter(a => (a.program?.program_id || a.program_id) === progId && (a.batch?.batch_id || a.batch_id) === batchId && (a.semester?.semester_id || a.semester_id) === semId)
      .forEach(a => { if (a.division) map.set(a.division.division_id, { value: a.division.division_id, label: a.division.division_name }); });
    setOptions(p => ({ ...p, divisions: Array.from(map.values()) }));
  }, [filters.selectedProgramId, filters.selectedBatchId, filters.selectedSemesterId, allocationData]);

  // ── Filter change handler ──────────────────────────────────────
  const handleFilterChange = async (name, item) => {
    const f = { ...filters };
    const resetBelow = (fields) => fields.forEach(k => { f[k] = ''; });

    if (name === 'program') {
      f.program = item.label; f.selectedProgramId = item.value;
      resetBelow(['batch', 'selectedBatchId', 'academicYearSemester', 'selectedAcademicYearId', 'selectedSemesterId', 'division', 'selectedDivisionId', 'paper', 'selectedPaperId', 'module', 'selectedModuleId', 'unit', 'selectedUnitId']);
    } else if (name === 'batch') {
      f.batch = item.label; f.selectedBatchId = item.value;
      resetBelow(['academicYearSemester', 'selectedAcademicYearId', 'selectedSemesterId', 'division', 'selectedDivisionId', 'paper', 'selectedPaperId', 'module', 'selectedModuleId', 'unit', 'selectedUnitId']);
    } else if (name === 'academicSemester') {
      f.academicYearSemester = item.label; f.selectedAcademicYearId = item.yearId; f.selectedSemesterId = item.semId;
      resetBelow(['division', 'selectedDivisionId', 'paper', 'selectedPaperId', 'module', 'selectedModuleId', 'unit', 'selectedUnitId']);
      try {
        const res = await addContentService.getTeacherSubjectsAllocated(teacherId, item.yearId, item.semId);
        setOptions(p => ({ ...p, subjects: (res || []).map(s => ({ value: s.subject_id, label: s.subject_name || s.name })) }));
      } catch (err) { console.error(err); }
    } else if (name === 'division') {
      f.division = item.label; f.selectedDivisionId = item.value;
    } else if (name === 'paper') {
      f.paper = item.label; f.selectedPaperId = item.value;
      resetBelow(['module', 'selectedModuleId', 'unit', 'selectedUnitId']);
      try {
        const res = await addContentService.getModulesAndUnits(item.value);
        setOptions(p => ({ ...p, modules: (res?.modules || []).map(m => ({ value: m.id || m.module_id, label: m.name || m.module_name, units: m.units || [] })) }));
      } catch (err) { console.error(err); }
    } else if (name === 'module') {
      f.module = item.label; f.selectedModuleId = item.value;
      resetBelow(['unit', 'selectedUnitId']);
      const mod = options.modules.find(m => m.value === item.value);
      setOptions(p => ({ ...p, units: (mod?.units || []).map(u => ({ value: u.id || u.unit_id, label: u.name || u.unit_name })) }));
    } else if (name === 'unit') {
      f.unit = item.label; f.selectedUnitId = item.value;
    }
    setFilters(f);
  };

  // ── Extract questions from API response ───────────────────────
  const extractQuestions = (res) => {
    if (!res) return { questions: [], total: 0 };
    if (res.questions && Array.isArray(res.questions)) return { questions: res.questions, total: res.total_count || res.questions.length };
    if (Array.isArray(res)) return { questions: res, total: res.length };
    if (res.data && Array.isArray(res.data)) return { questions: res.data, total: res.total_count || res.data.length };
    return { questions: [], total: 0 };
  };

  // ── Fetch questions ────────────────────────────────────────────
  const getQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    setExpandedQuestion(null);
    setCurrentPage(1);
    setSearchTerm('');
    try {
      let res;
      if (filters.selectedUnitId) {
        res = await QuestionsService.getQuestionsByModule(filters.selectedModuleId);
        const { questions } = extractQuestions(res);
        const filtered = questions.filter(q => q.unit_id == filters.selectedUnitId);
        setQuestionsData(filtered); setTotalCount(filtered.length);
        return;
      } else if (filters.selectedModuleId) {
        res = await QuestionsService.getQuestionsByModule(filters.selectedModuleId);
      } else if (filters.selectedPaperId) {
        res = await QuestionsService.getQuestionsBySubject(filters.selectedPaperId);
      } else if (filters.selectedProgramId) {
        res = await QuestionsService.getQuestionsByProgram(filters.selectedProgramId);
      } else { setLoadingQuestions(false); return; }

      const { questions, total } = extractQuestions(res);
      setQuestionsData(questions);
      setTotalCount(total);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestionsData([]); setTotalCount(0);
    } finally { setLoadingQuestions(false); }
  }, [filters]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await QuestionsService.deleteQuestion(id);
      setQuestionsData(prev => prev.filter(q => (q.question_id || q.id) !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) { console.error(err); }
  };

  // ── Pagination + Search ───────────────────────────────────────
  const filtered = questionsData.filter(q =>
    !searchTerm || q.question?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (p) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    setExpandedQuestion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // ── Stats ──────────────────────────────────────────────────────
  const objCount = questionsData.filter(q => q.question_category === 'OBJECTIVE').length;
  const subjCount = questionsData.filter(q => q.question_category === 'SUBJECTIVE').length;
  const totalMarks = questionsData.reduce((s, q) => s + (q.default_marks || 0), 0);

  // ── Helpers ────────────────────────────────────────────────────
  const getLevelBadge = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'EASY') return 'bg-green-100 text-green-700 border-green-200';
    if (l === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (l === 'HARD') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // ── Custom Select ──────────────────────────────────────────────
  const CustomSelect = ({ label, value, options: opts, placeholder, onSelect, disabled }) => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
        <div className="relative">
          <div
            onClick={() => !disabled && setOpen(o => !o)}
            className={`w-full px-3 py-2.5 border rounded-lg min-h-[42px] flex items-center justify-between cursor-pointer transition-all
              ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'bg-white hover:border-blue-400'}
              ${open ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}
          >
            <span className={`text-sm truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
              {opts.length === 0
                ? <div className="px-4 py-3 text-sm text-gray-400 text-center">No options</div>
                : opts.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => { onSelect(opt); setOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700
                      ${value === opt.label ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    {opt.label}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Pagination Bar ─────────────────────────────────────────────
  const PaginationBar = () => {
    const pageNumbers = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pageNumbers.push(i);
      }
    }

    // Insert gaps
    const withGaps = [];
    let prev = null;
    for (const p of pageNumbers) {
      if (prev && p - prev > 1) withGaps.push('...');
      withGaps.push(p);
      prev = p;
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        {/* Info */}
        <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-semibold text-gray-700">
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
          </span>{' '}
          –{' '}
          <span className="font-semibold text-gray-700">
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{filtered.length}</span> questions
        </p>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Page numbers */}
          {withGaps.map((p, i) =>
            p === '...'
              ? <span key={`gap-${i}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
              : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg transition-all border
                    ${p === currentPage
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    }`}
                >
                  {p}
                </button>
              )
          )}

          {/* Next */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Question Bank</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount > 0 ? `${totalCount} total questions` : 'Manage your assessment questions'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(p => ({ ...p, filterOpen: !p.filterOpen }))}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all shadow-sm
              ${filters.filterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
          >
            <Filter className="w-4 h-4" /> Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${filters.filterOpen ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/teacher/assessments/add-question')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CustomSelect label="Program" value={filters.program} options={options.programs} onSelect={v => handleFilterChange('program', v)} placeholder="Select Program" />
            <CustomSelect label="Batch" value={filters.batch} options={options.batches} onSelect={v => handleFilterChange('batch', v)} placeholder="Select Batch" disabled={!filters.selectedProgramId} />
            <CustomSelect label="Academic Year – Semester" value={filters.academicYearSemester} options={options.academicSemesters} onSelect={v => handleFilterChange('academicSemester', v)} placeholder="Select Semester" disabled={!filters.selectedBatchId} />
            <CustomSelect label="Division" value={filters.division} options={options.divisions} onSelect={v => handleFilterChange('division', v)} placeholder="Select Division" disabled={!filters.selectedSemesterId} />
            <CustomSelect label="Subject / Paper" value={filters.paper} options={options.subjects} onSelect={v => handleFilterChange('paper', v)} placeholder="Select Subject" disabled={!filters.selectedSemesterId} />
            <CustomSelect label="Module" value={filters.module} options={options.modules} onSelect={v => handleFilterChange('module', v)} placeholder="Select Module" disabled={!filters.selectedPaperId} />
            <CustomSelect label="Unit" value={filters.unit} options={options.units} onSelect={v => handleFilterChange('unit', v)} placeholder="Select Unit" disabled={!filters.selectedModuleId} />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setFilters(p => ({ ...p, batch: '', selectedBatchId: '', academicYearSemester: '', selectedAcademicYearId: '', selectedSemesterId: '', division: '', selectedDivisionId: '', paper: '', selectedPaperId: '', module: '', selectedModuleId: '', unit: '', selectedUnitId: '' }))}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={getQuestions}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Cards ── */}
      {questionsData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Questions', value: totalCount, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Objective (MCQ)', value: objCount, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Subjective', value: subjCount, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            { label: 'Total Marks', value: totalMarks, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      {questionsData.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search questions by text..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Questions List ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* List header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            Questions
            {searchTerm && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({filtered.length} result{filtered.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>
          {totalPages > 1 && (
            <span className="text-xs text-gray-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* ── Content ── */}
        {loadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-500">Loading questions...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BookOpen className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 font-medium">No questions found</p>
            <p className="text-sm text-gray-400">
              {questionsData.length > 0 ? 'Try a different search term' : 'Use filters above to load questions'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map((q, i) => {
              const qId = q.question_id || q.id;
              const globalN = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
              const expanded = expandedQuestion === qId;

              return (
                <div key={qId} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">

                      {/* Left */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Serial */}
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mt-0.5">
                          {globalN}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
                              ${q.question_category === 'OBJECTIVE'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-purple-100 text-purple-700 border-purple-200'}`}
                            >
                              {q.question_category === 'OBJECTIVE' ? '📋 ' : '✍️ '}{q.question_category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                              ${q.question_type === 'MCQ'
                                ? 'bg-cyan-100 text-cyan-700'
                                : q.question_type === 'SHORT_ANSWER'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-pink-100 text-pink-700'}`}
                            >
                              {(q.question_type || '').replace('_', ' ')}
                            </span>
                            {q.question_level_name && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(q.question_level_name)}`}>
                                {q.question_level_name}
                              </span>
                            )}
                            {q.blooms_level && (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                                <Brain className="w-3 h-3" />{q.blooms_level.level_name}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                              {q.default_marks} {q.default_marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>

                          {/* Question text */}
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.question}</p>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {q.subject_name && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{q.subject_name}</span>}
                            {q.module_name && <span>📁 {q.module_name}</span>}
                            {q.unit_name && <span>📌 {q.unit_name}</span>}
                            {q.course_outcomes?.length > 0 && (
                              <span className="flex items-center gap-1 text-teal-600">
                                <Target className="w-3 h-3" />{q.course_outcomes.map(co => co.outcome_code).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(q.options?.length > 0 || q.question_category === 'SUBJECTIVE') && (
                          <button
                            onClick={() => setExpandedQuestion(expanded ? null : qId)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={expanded ? 'Collapse' : 'Expand'}
                          >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/teacher/assessments/view-question/${qId}`, { state: { question: q } })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/assessments/edit-question/${qId}`, { state: { question: q } })}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(qId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded Detail ── */}
                    {expanded && (
                      <div className="mt-4 ml-11 space-y-4">

                        {/* MCQ Options */}
                        {q.question_category === 'OBJECTIVE' && q.options?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Options</p>
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={opt.option_id || oi}
                                  className={`flex items-center gap-3 p-3 rounded-lg border
                                    ${opt.is_correct
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-gray-50 border-gray-200'}`}
                                >
                                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                                    ${opt.is_correct ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <span className="flex-1 text-sm text-gray-800">{opt.option_text}</span>
                                  {opt.is_correct && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded border border-green-200">
                                      <CheckCircle className="w-3 h-3" /> Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subjective — Model Answer */}
                        {q.question_category === 'SUBJECTIVE' && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Model Answer</p>
                            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-700 min-h-[60px]">
                              {q.model_answer
                                ? q.model_answer
                                : <span className="text-gray-400 italic">No model answer provided</span>}
                            </div>
                          </div>
                        )}

                        {/* Course Outcomes */}
                        {q.course_outcomes?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Course Outcomes</p>
                            <div className="flex flex-wrap gap-2">
                              {q.course_outcomes.map(co => (
                                <div key={co.course_outcome_id} className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-xs">
                                  <span className="font-bold text-teal-700 flex-shrink-0">{co.outcome_code}</span>
                                  <span className="text-teal-600">{co.outcome_title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extra Info */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg
                          ${q.question_category === 'OBJECTIVE' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                          <div>
                            <span className={`text-xs font-semibold ${q.question_category === 'OBJECTIVE' ? 'text-blue-700' : 'text-purple-700'}`}>Question Level</span>
                            <p className={`text-sm mt-0.5 font-medium ${q.question_category === 'OBJECTIVE' ? 'text-blue-900' : 'text-purple-900'}`}>
                              {q.question_level_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className={`text-xs font-semibold ${q.question_category === 'OBJECTIVE' ? 'text-blue-700' : 'text-purple-700'}`}>Bloom's Level</span>
                            <p className={`text-sm mt-0.5 font-medium ${q.question_category === 'OBJECTIVE' ? 'text-blue-900' : 'text-purple-900'}`}>
                              {q.blooms_level?.level_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className={`text-xs font-semibold ${q.question_category === 'OBJECTIVE' ? 'text-blue-700' : 'text-purple-700'}`}>Status</span>
                            <p className={`text-sm mt-0.5 font-medium ${q.question_category === 'OBJECTIVE' ? 'text-blue-900' : 'text-purple-900'}`}>
                              {q.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loadingQuestions && filtered.length > ITEMS_PER_PAGE && <PaginationBar />}
      </div>

      {showBulkUpload && <BulkUploadAssessmentModal onClose={() => setShowBulkUpload(false)} />}
    </div>
  );
};

export default Questions;
