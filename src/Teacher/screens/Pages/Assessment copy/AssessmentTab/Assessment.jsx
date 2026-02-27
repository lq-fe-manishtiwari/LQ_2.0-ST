'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clipboard,
  Video,
  ChevronDown,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { AssessmentService } from '../Services/assessment.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { useAssessmentFormLogic } from '../../Assessment/hooks/useAssessmentFormLogic';

const Assessment = () => {
  const navigate = useNavigate();
  const { getTeacherId } = useUserProfile();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id || activeCollege?.college_id;

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);


  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    filterOpen: false,
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    subjectId: '',
    status: ''
  });


  // Derived formData for hook
  const formData = useMemo(() => ({
    selectedProgram: filters.program,
    selectedAcademicSemester: filters.academicYear && filters.semester ? `${filters.academicYear}-${filters.semester}` : '',
    selectedBatch: filters.batch,
    selectedSubject: filters.subjectId
  }), [filters.program, filters.academicYear, filters.semester, filters.batch, filters.subjectId]);

  const { options } = useAssessmentFormLogic(formData);


  const isAnyFilterActive = useCallback(() => {
    return !!(filters.program || filters.batch || filters.academicYear ||
      filters.semester || filters.subjectId || filters.status);
  }, [filters]);

  const fetchAssessments = useCallback(async () => {
    if (!collegeId) return;
    try {
      setLoading(true);

      let res;
      if (isAnyFilterActive()) {
        const filterPayload = {
          college_id: Number(collegeId),
          program_id: filters.program ? Number(filters.program) : null,
          batch_id: filters.batch ? Number(filters.batch) : null,
          academic_year_id: filters.academicYear ? Number(filters.academicYear) : null,
          semester_id: filters.semester ? Number(filters.semester) : null,
          subject_id: filters.subjectId ? Number(filters.subjectId) : null,
          status: filters.status || null,
        };
        const cleanPayload = Object.fromEntries(
          Object.entries(filterPayload).filter(([, v]) => v != null && v !== '')
        );
        res = await AssessmentService.filterAssessments(cleanPayload);
      } else {
        res = await AssessmentService.getAssessmentsByCollege(collegeId);
      }

      const data = Array.isArray(res) ? res : (res?.data || []);

      const mapped = data.map(a => ({
        id: a.assessment_id || a.id,
        title: a.title,
        subject: { name: a.subject_name || 'Unknown', color: '#3B82F6' },
        assesmentType: { name: a.type === 'STANDARD' ? 'Standard' : a.type === 'RUBRIC' ? 'Rubric' : a.type, color: '#3B82F6' },
        startDate: a.test_start_datetime ? new Date(a.test_start_datetime).toLocaleString() : '-',
        endDate: a.test_end_datetime ? new Date(a.test_end_datetime).toLocaleString() : '-',
        status: a.status || 'Draft',
        attempted: 0,
        total: a.questions ? a.questions.length : 0,
        percentage: 0,
        proctoring: a.mode === 'ONLINE',
        offline: a.mode === 'OFFLINE',
        type: a.mode || 'Online',
        rawData: a
      }));
      setAssessments(mapped);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [collegeId, filters, isAnyFilterActive]);



  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleProgramChange = (e) => {
    const progId = e.target.value;
    setFilters(prev => ({
      ...prev,
      program: progId,
      batch: '',
      academicYear: '',
      semester: '',
      subjectId: ''
    }));
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFilters(prev => ({
      ...prev,
      batch: batchId,
      subjectId: ''
    }));
  };



  const handleAcademicSemesterChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setFilters(prev => ({ ...prev, academicYear: '', semester: '', batch: '', subjectId: '' }));
      return;
    }
    const [ayId, semId] = val.split('-');
    setFilters(prev => ({
      ...prev,
      academicYear: ayId,
      semester: semId,
      batch: '',
      subjectId: ''
    }));
  };



  const handleSubjectChange = (e) => {
    setFilters(prev => ({ ...prev, subjectId: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };





  const filteredAssessments = useMemo(() => {
    return assessments
      .filter(a => {
        const raw = a.rawData || {};
        const statusMatch = !filters.status || a.status === filters.status;
        const programMatch = !filters.program || raw.program_id == filters.program;
        const batchMatch = !filters.batch || raw.batch_id == filters.batch;
        const ayMatch = !filters.academicYear || raw.academic_year_id == filters.academicYear;
        const semMatch = !filters.semester || raw.semester_id == filters.semester;

        const subjectMatch = !filters.subjectId || raw.subject_id == filters.subjectId;
        const activeSearch = !searchTerm ||
          a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && programMatch && batchMatch && ayMatch && semMatch && subjectMatch && activeSearch;
      })
      .sort((a, b) => {
        // Sort by created_at if available, otherwise fall back to id (higher id = newer)
        const aTime = a.rawData?.created_at ? new Date(a.rawData.created_at).getTime() : (a.id || 0);
        const bTime = b.rawData?.created_at ? new Date(b.rawData.created_at).getTime() : (b.id || 0);
        return bTime - aTime;
      });
  }, [assessments, filters, searchTerm]);

  const isAssessmentStarted = (assessment) => {
    if (!assessment.test_start_datetime) return false;
    if (assessment.status === 'Completed') return true;
    const startTime = new Date(assessment.test_start_datetime).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= startTime;
  };

  // Handle pagination
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAssessments.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAssessments.length / entriesPerPage);

  // Delete functionality
  const handleDeleteConfirm = (id) => {
    const assessment = assessments.find(a => a.id === id);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(id)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover "{assessment?.title || 'this assessment'}"!
      </SweetAlert>
    );
  };

  const confirmDelete = async (assessmentId) => {
    try {
      await AssessmentService.deleteAssessment(assessmentId);
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Assessment deleted successfully.
        </SweetAlert>
      );
      fetchAssessments();
    } catch (error) {
      console.error('Delete error:', error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to delete assessment. Please try again.
        </SweetAlert>
      );
    }
  };

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

    const getSelectedLabel = () => {
      if (!value) return placeholder;
      const found = options.find(opt => (opt.id || opt.value || opt) == value);
      return found ? (found.name || found.label || found) : value;
    };

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
            <span className={`truncate mr-2 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
              {getSelectedLabel()}
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
                const optVal = option.id || option.value || option;
                const optLabel = option.name || option.label || option;
                return (
                  <div
                    key={optVal}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(optVal)}
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
    <div className="p-0 md:p-0">
      {alert}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for assessments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          <button
            onClick={() => navigate('/admin-assessment/admin-add-new-assessment')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create Assessment</span>
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
              options={options.programs}
              placeholder="Select Program"
            />

            <CustomSelect
              label="Academic Year / Semester"
              value={filters.academicYear && filters.semester ? `${filters.academicYear}-${filters.semester}` : ''}
              onChange={handleAcademicSemesterChange}
              options={options.academicSemesters || []}
              placeholder="Select AY / Semester"
              disabled={!filters.program}
            />
            <CustomSelect
              label="Batch"
              value={filters.batch}
              onChange={handleBatchChange}
              options={options.batches}
              placeholder="Select Batch"
              disabled={!filters.academicYear || !filters.semester}
            />

            <CustomSelect
              label="Academic Year / Semester"
              value={filters.academicYear && filters.semester ? `${filters.academicYear}-${filters.semester}` : ''}
              onChange={handleAcademicSemesterChange}
              options={options.academicSemesters || []}
              placeholder="Select AY / Semester"
              disabled={!filters.academicYear || !filters.semester}
            />

            <CustomSelect
              label="Subject"
              value={filters.subjectId}
              onChange={handleSubjectChange}
              options={options.subjects}
              placeholder="Select Subject"
              disabled={!filters.academicYear || !filters.semester}
            />

            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={handleStatusChange}
              options={['Draft', 'Published', 'Completed']}
              placeholder="All Status"
            />
          </div>

        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading assessments...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Assessment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Status</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Progress</th> */}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.length > 0 ? (
                  currentEntries.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: a.subject.color }}>
                            {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{a.title}</div>
                            <div className="text-xs text-gray-500">{a.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.subject.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.assesmentType.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.startDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.endDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Published' ? 'bg-green-100 text-green-700' :
                          a.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {a.status}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${a.percentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{a.attempted || 0}/{a.total || 0}</span>
                        </div>
                      </td> */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate('/admin-assessment/assessment/view', { state: { assessmentData: a } })}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const route = a.assesmentType.name === 'Rubric'
                                ? '/admin-assessment/assessment/rubric-check-papers'
                                : '/admin-assessment/assessment/check-papers';
                              navigate(route, { state: { assessmentData: a } });
                            }}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title={a.assesmentType.name === 'Rubric' ? "Check Result (Rubric)" : "Evaluate Submissions"}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (isAssessmentStarted(a.rawData)) {
                                setAlert(
                                  <SweetAlert
                                    warning
                                    confirmBtnText="OK"
                                    confirmBtnCssClass="btn-confirm"
                                    title="Cannot Edit"
                                    onConfirm={() => setAlert(null)}
                                  >
                                    This assessment has already started or is completed and cannot be edited.
                                  </SweetAlert>
                                );
                              } else {
                                navigate('/admin-assessment/admin-add-new-assessment', { state: { assessmentData: a.rawData } });
                              }
                            }}
                            className={`p-1 rounded ${isAssessmentStarted(a.rawData) ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
                            title={isAssessmentStarted(a.rawData) ? "Cannot edit started assessment" : "Edit"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(a.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No assessments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages || 1} ({filteredAssessments.length} total)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-gray-500">No assessments found</p>
          </div>
        ) : (
          currentEntries.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: a.subject.color }}>
                    {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.subject.name}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Published' ? 'bg-green-100 text-green-700' :
                  a.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {a.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-700 mb-4">
                <p><span className="font-medium">Start:</span> {a.startDate}</p>
                <p><span className="font-medium">End:</span> {a.endDate}</p>
                <p><span className="font-medium">Type:</span> {a.assesmentType.name} ({a.type})</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span>Progress</span>
                    <span>{a.attempted || 0}/{a.total || 0}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${a.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t">
                <button
                  onClick={() => navigate('/admin-assessment/assessment/view', { state: { assessmentData: a } })}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="View Assessment"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const route = a.assesmentType.name === 'Rubric'
                      ? '/admin-assessment/assessment/rubric-check-papers'
                      : '/admin-assessment/assessment/check-papers';
                    navigate(route, { state: { assessmentData: a } });
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                  title={a.assesmentType.name === 'Rubric' ? "Evaluate with Rubric" : "Check Papers"}
                >
                  <ClipboardCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (isAssessmentStarted(a.rawData)) {
                      setAlert(
                        <SweetAlert
                          warning
                          confirmBtnText="OK"
                          confirmBtnCssClass="btn-confirm"
                          title="Cannot Edit"
                          onConfirm={() => setAlert(null)}
                        >
                          This assessment has already started or is completed and cannot be edited.
                        </SweetAlert>
                      );
                    } else {
                      navigate('/admin-assessment/admin-add-new-assessment', { state: { assessmentData: a.rawData } });
                    }
                  }}
                  className={`p-2 rounded ${isAssessmentStarted(a.rawData) ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
                  title={isAssessmentStarted(a.rawData) ? "Cannot edit started assessment" : "Edit Assessment"}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteConfirm(a.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assessment;
