'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import BulkUploadQuestions from '../AddQuestions/BulkUploadQuestions';
import { Plus, Filter, ChevronDown, X, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { QuestionsService } from '../Services/questions.service';
import { collegeService } from '../../Academics/Services/college.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { courseService } from '../../Courses/Services/courses.service';
import { contentService } from '../../Content/Services/content.service';



const Questions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id || activeCollege?.college_id;

  const [filters, setFilters] = useState({
    filterOpen: false,
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    subjectId: '',
  });

  const [options, setOptions] = useState({
    programs: [],
    batches: [],
    academicYears: [],
    semesters: [],
    subjects: [],
  });

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    if (collegeId) {
      fetchPrograms();
    }
  }, [collegeId]);

  const isAnyFilterActive = useCallback(() => {
    return !!(filters.program || filters.batch || filters.academicYear ||
      filters.semester || filters.subjectId);
  }, [filters.program, filters.batch, filters.academicYear, filters.semester, filters.subjectId]);

  const fetchQuestionsByCollege = useCallback(async () => {
    try {
      if (!collegeId) return;
      setLoading(true);
      const res = await QuestionsService.getQuestionsByCollege(collegeId);
      const data = Array.isArray(res) ? res : (res?.questions || res?.data || []);
      setQuestions(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  const handleGetQuestions = useCallback(async () => {
    try {
      if (!collegeId) return;
      setLoading(true);
      setCurrentPage(1);

      const filterPayload = {
        college_id: collegeId ? Number(collegeId) : null,
        program_id: filters.program ? Number(filters.program) : null,
        batch_id: filters.batch ? Number(filters.batch) : null,
        academic_year_id: filters.academicYear ? Number(filters.academicYear) : null,
        semester_id: filters.semester ? Number(filters.semester) : null,
        subject_id: filters.subjectId ? Number(filters.subjectId) : null,
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(filterPayload).filter(([_, v]) => v != null && v !== '')
      );

      const res = await QuestionsService.filterQuestions(cleanPayload);
      const data = Array.isArray(res) ? res : (res?.questions || res?.data || []);
      setQuestions(data);
    } catch (error) {
      console.error('Filter questions error:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [collegeId, filters.program, filters.batch, filters.academicYear, filters.semester, filters.subjectId]);

  useEffect(() => {
    if (collegeId) {
      if (isAnyFilterActive()) {
        handleGetQuestions();
      } else {
        fetchQuestionsByCollege();
      }
    }
  }, [collegeId, isAnyFilterActive, handleGetQuestions, fetchQuestionsByCollege]);


  // Fetch programs
  const fetchPrograms = async () => {
    try {
      if (!collegeId) return;
      const programsData = await collegeService.getProgramByCollegeId(collegeId);
      setOptions(prev => ({ ...prev, programs: Array.isArray(programsData) ? programsData : [] }));
    } catch (error) {
      console.error('Fetch programs error:', error);
    }
  };

  const fetchBatches = async (programId) => {
    try {
      const res = await batchService.getBatchByProgramId(programId);

      const batches = Array.isArray(res) ? res : [];
      const extractedAcademicYears = [];
      const extractedSemesters = [];

      batches.forEach(batch => {
        if (batch.academic_years && Array.isArray(batch.academic_years)) {
          batch.academic_years.forEach(ay => {
            extractedAcademicYears.push({
              academic_year_id: ay.academic_year_id,
              name: ay.name,
              start_year: ay.start_year,
              end_year: ay.end_year,
              batchId: batch.batch_id
            });

            if (ay.semester_divisions && Array.isArray(ay.semester_divisions)) {
              ay.semester_divisions.forEach(semDiv => {
                extractedSemesters.push({
                  semester_id: semDiv.semester_id,
                  semester_name: semDiv.name,
                  semester_number: semDiv.semester_number,
                  academicYearId: ay.academic_year_id,
                  batchId: batch.batch_id
                });
              });
            }
          });
        }
      });

      // Deduping
      const uniqueAcademicYears = extractedAcademicYears.filter((ay, index, self) =>
        index === self.findIndex(a => a.academic_year_id === ay.academic_year_id)
      );
      const uniqueSemesters = extractedSemesters.filter((sem, index, self) =>
        index === self.findIndex(s => s.semester_id === sem.semester_id)
      );

      setOptions(prev => ({
        ...prev,
        batches: batches.map(b => ({ batch_id: b.batch_id, batch_name: b.batch_name })),
        academicYears: uniqueAcademicYears,
        semesters: uniqueSemesters
      }));

    } catch (error) {
      console.error('Fetch batches error:', error);
      setOptions(prev => ({ ...prev, batches: [], academicYears: [], semesters: [], subjects: [] }));
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoading(true);
      await QuestionsService.deleteQuestion(id);
      await fetchQuestionsByCollege();
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete question.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter Logic ────────────────────────────────────────

  // Filter Academic Years by Batch
  const filteredAcademicYears = useMemo(() => {
    if (!filters.batch) return options.academicYears;
    return options.academicYears.filter(ay => ay.batchId == filters.batch);
  }, [options.academicYears, filters.batch]);

  // Filter Semesters by Academic Year
  const filteredSemesters = useMemo(() => {
    if (!filters.academicYear) return [];
    return options.semesters.filter(sem => sem.academicYearId == filters.academicYear);
  }, [options.semesters, filters.academicYear]);

  // Filter Subjects by Semester
  const filteredSubjects = options.subjects;


  // ─── Filter Handlers ────────────────────────────────────────

  const handleProgramChange = (e) => {
    const progId = e.target.value;
    setFilters(prev => ({
      ...prev,
      program: progId,
      batch: '',
      subjectId: '',
    }));
    if (progId) fetchBatches(progId);
    else setOptions(prev => ({ ...prev, batches: [], academicYears: [], semesters: [], subjects: [] }));
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFilters(prev => ({
      ...prev,
      batch: batchId,
      academicYear: '',
      semester: '',
      subjectId: '',
    }));
  };

  const handleAcademicYearChange = (e) => {
    const ayId = e.target.value;
    setFilters(prev => ({
      ...prev,
      academicYear: ayId,
      semester: '',
      subjectId: '',
    }));
  };

  const handleSemesterChange = (e) => {
    const semId = e.target.value;
    setFilters(prev => ({
      ...prev,
      semester: semId,
      subjectId: '',
    }));

    if (semId) {
      courseService.getFilteredPapers(
        filters.program,
        filters.batch,
        filters.academicYear,
        semId,
        null,
        null,
        collegeId
      ).then(res => {
        setOptions(prev => ({
          ...prev,
          subjects: (res || []).map(s => ({
            id: s.subject_id,
            subject_id: s.subject_id,
            name: s.subject_name || s.name
          }))
        }));
      });
    } else {
      setOptions(prev => ({ ...prev, subjects: [] }));
    }
  };

  const handlePaperChange = (e) => {
    const sId = e.target.value;
    setFilters(prev => ({
      ...prev,
      subjectId: sId
    }));
  };

  const clearFilters = () => {
    setFilters({
      filterOpen: true,
      program: '',
      batch: '',
      academicYear: '',
      semester: '',
      subjectId: '',
    });
    setOptions(prev => ({ ...prev, batches: [], academicYears: [], semesters: [], subjects: [] }));
  };



  // ─── Pagination Logic ───────────────────────────────────────
  const totalItems = questions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = useMemo(() => {
    let filtered = questions;
    if (filters.subjectId) {
      filtered = filtered.filter(q => String(q.subject_id) === String(filters.subjectId));
    }
    return filtered.slice(startIndex, endIndex);
  }, [questions, filters.subjectId, startIndex, endIndex]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const PaginationControls = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 text-sm rounded ${currentPage === i
            ? 'bg-blue-600 text-white'
            : 'border border-gray-300 hover:bg-gray-50'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-3">
        {/* Left: rows per page + info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500">
            Showing {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems} questions
          </span>
        </div>

        {/* Right: page navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {pages}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Custom Select Components ───
  const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (optionValue) => {
      onChange({ target: { value: optionValue } });
      setIsOpen(false);
    };

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLabel = (val) => {
      if (!val) return placeholder;
      const found = options.find(opt => (opt.value != null ? opt.value : opt) == val);
      return found ? (found.label || found) : val;
    };

    return (
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border ${disabled
              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-300 cursor-pointer hover:border-[rgb(33,98,193)]'
              } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={`truncate mr-2 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
              {getLabel(value)}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
              {options.map((option) => {
                const optValue = option.value || option;
                const optLabel = option.label || option;
                return (
                  <div
                    key={optValue}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(optValue)}
                  >
                    {optLabel}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-[rgb(33,98,193)]" />
          <span className="text-[rgb(33,98,193)] font-medium">Filter</span>
          <ChevronDown
            className={`w-4 h-4 text-[rgb(33,98,193)] transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/admin-assessment/add-question')}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>

          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CustomSelect
              label="Program"
              value={filters.program}
              onChange={handleProgramChange}
              options={options.programs.map(p => ({ value: p.program_id, label: p.program_name }))}
              placeholder="Select Program"
            />

            <CustomSelect
              label="Batch"
              value={filters.batch}
              onChange={handleBatchChange}
              options={options.batches.map(b => ({ value: b.batch_id, label: b.batch_name }))}
              placeholder="Select Batch"
              disabled={!filters.program}
            />

            <CustomSelect
              label="Academic Year"
              value={filters.academicYear}
              onChange={handleAcademicYearChange}
              options={filteredAcademicYears.map(ay => ({ value: ay.academic_year_id, label: ay.name }))}
              placeholder="Select Year"
              disabled={!filters.batch}
            />

            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={handleSemesterChange}
              options={filteredSemesters.map(s => ({ value: s.semester_id, label: s.semester_name }))}
              placeholder="Select Semester"
              disabled={!filters.academicYear}
            />

            <CustomSelect
              label="Paper"
              value={filters.subjectId}
              onChange={handlePaperChange}
              options={options.subjects.map(s => ({ value: s.subject_id, label: s.name }))}
              placeholder="Select Paper"
              disabled={!filters.semester}
            />

          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your assessment questions</p>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading questions...</p>
          ) : currentQuestions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              {questions.length === 0 ? 'No questions found' : 'No questions on this page'}
            </p>
          ) : (
            <div className="grid gap-4">
              {currentQuestions.map((q, index) => {
                const globalIndex = startIndex + index;
                const questionData = {
                  ...q,
                  college_id: q.college_id || collegeId,
                  program_id: q.program_id,
                  program_name: q.program_name || 'N/A',
                  subject_id: q.subject_id,
                  subject_name: q.subject_name || 'N/A',
                  module_id: q.module_id,
                  module_name: q.module_name || 'N/A',
                  unit_id: q.unit_id,
                  unit_name: q.unit_name || 'N/A',
                  question_level_name: q.question_level_name || 'N/A',
                  blooms_level: q.blooms_level || { level_name: 'N/A', blooms_level_id: null },
                  course_outcomes: q.course_outcomes || [],
                  options: q.options || [],
                };
                console.log(questionData);

                return (
                  <div
                    key={q.question_id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          Q{globalIndex + 1}
                        </div>

                        <div className="flex gap-2">
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {q.question_type}
                          </span>
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {q.question_category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin-assessment/view-question/${q.question_id}`, { state: { question: q } })}
                          disabled={loading}
                          className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin-assessment/edit-question/${q.question_id}`, { state: { question: questionData } })}
                          disabled={loading}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.question_id)}
                          disabled={loading}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2">{q.question}</h3>

                    {q.question_type === 'MCQ' && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        {q.options?.map((opt, i) => (
                          <div
                            key={opt.option_id}
                            className={opt.is_correct ? 'text-green-600 font-medium' : 'text-gray-600'}
                          >
                            {String.fromCharCode(65 + i)}) {opt.option_text}
                            {opt.is_correct && ' ✓'}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex gap-4">
                        <span>Program: {q.program_name || 'N/A'}</span>
                        <span>Level: {q.question_level_name || 'N/A'}</span>
                        <span>Marks: {q.default_marks || '-'}</span>
                      </div>
                      <span>Status: {q.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <PaginationControls />
        </div>
      </div>

      {showBulkUpload && (
        <BulkUploadQuestions
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            if (isAnyFilterActive()) {
              handleGetQuestions();
            } else {
              fetchQuestionsByCollege();
            }
            setShowBulkUpload(false);
          }}
        />
      )}
    </div>
  );
};

export default Questions;