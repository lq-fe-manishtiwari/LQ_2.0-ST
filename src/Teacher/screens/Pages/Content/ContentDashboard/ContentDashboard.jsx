'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Filter, ChevronDown, X, Edit, Trash2, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/content.service.js';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';
import StudentRequest from './StudentRequest';

const ContentDashboard = () => {
  const navigate = useNavigate();

  // Get user profile data
  const { getUserId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();

  const [filters, setFilters] = useState({
    filterOpen: false,
    program: [],
    semester: '',
    gradeDivisionId: [],
    chapter: '',
    topic: '',
    activeInactiveStatus: 'all',
  });

  const [loading, setLoading] = useState({
    chapters: false,
    topics: false,
    content: false,
    delete: false
  });
  const [content, setContent] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // SweetAlert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const [programOptions, setProgramOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  // Load content when unit is selected
  useEffect(() => {
    if (filters.topic) {
      const selectedTopic = topicOptions.find(t => t.unit_name === filters.topic);
      if (selectedTopic?.unit_id) {
        loadContentByUnit(selectedTopic.unit_id);
      }
    } else {
      setContent([]); // Clear content when no unit is selected
    }
  }, [filters.topic, topicOptions]);

  // SweetAlert function
  const showSweetAlert = (title, text, type = 'success', confirmText = 'OK', onConfirm = null) => {
    setAlertConfig({
      title,
      text,
      type,
      confirmBtnText: confirmText,
      confirmBtnCssClass: 'btn-confirm',
      onConfirm: () => {
        setShowAlert(false);
        if (onConfirm && typeof onConfirm === 'function') {
          onConfirm();
        }
      }
    });
    setShowAlert(true);
  };

  const loadContentByUnit = async (unitId) => {
    setLoading(prev => ({ ...prev, content: true }));
    try {
      console.log('Loading content for unit ID:', unitId);
      const res = await contentService.getAllContentsByUnitIdForTeacher(unitId);
      console.log('Content response:', res);
      setContent(res.data || []);
    } catch (err) {
      console.error("Error loading content for unit:", err);
      setContent([]);
    } finally {
      setLoading(prev => ({ ...prev, content: false }));
    }
  };

  // Custom Select Component
  const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
      onChange({ target: { value: option } });
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

    const displayValue = typeof value === 'object' && value !== null ? value.name : value;

    return (
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border ${disabled || loading
              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
              } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          >
            <span className={`flex-1 truncate ${displayValue && !loading ? 'text-gray-900' : 'text-gray-400'}`}>
              {loading ? 'Loading...' : (displayValue || placeholder)}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>

          {isOpen && !disabled && !loading && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
              {options.map((option) => {
                const optionName = typeof option === 'object' && option !== null ? option.name : option;
                const optionId = typeof option === 'object' && option !== null
                  ? option.module_id || option.unit_id || option.id || optionName
                  : option;
                return (
                  <div
                    key={optionId}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(option)}
                  >
                    {optionName}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Multi Select Program
  const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const availableOptions = programOptions.filter(p => !selectedPrograms.includes(p));

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedPrograms.length > 0 ? (
              selectedPrograms.map((prog) => (
                <span
                  key={prog}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {prog}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProgramRemove();
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm ml-1">Select Program</span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {availableOptions.length > 0 ? (
                availableOptions.map((prog) => (
                  <div
                    key={prog}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => onProgramChange({ target: { value: prog } })}
                  >
                    {prog}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">All programs selected</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fetch Programs and store all allocation data
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

          // Store all allocation data
          setAllAllocations(allPrograms);
          console.log("allPrograms", allPrograms)

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

          // Auto-select first available program and cascade selections
          if (uniquePrograms.length > 0 && filters.program.length === 0) {
            const firstProgram = uniquePrograms[0];
            setSelectedProgramId(firstProgram.id);
            const semesters = [...new Set(firstProgram.allocations.map(a => a.semester?.name).filter(Boolean))];
            setSemesterOptions(semesters);

            // Auto-select first semester
            const firstSemester = semesters[0];
            if (firstSemester) {
              const semesterAllocation = firstProgram.allocations.find(a => a.semester?.name === firstSemester);
              if (semesterAllocation) {
                setSelectedSemesterId(semesterAllocation.semester_id);
                setSelectedAcademicYearId(semesterAllocation.academic_year_id);
              }
            }

            setFilters(prev => ({
              ...prev,
              program: [firstProgram.name],
              semester: firstSemester || ''
            }));
          }
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

  // Fetch Subjects using teacher allocation API
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedAcademicYearId || !selectedSemesterId) {
        console.log('Academic year ID or semester ID not available → skipping subjects');
        setSubjectOptions([]);
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

          // Auto-select first subject
          if (unique.length > 0 && !filters.gradeDivisionId.length) {
            const firstSubject = unique[0];
            setSelectedSubjectId(firstSubject.id);
            setFilters(prev => ({
              ...prev,
              gradeDivisionId: [firstSubject.name]
            }));
          }


        } else {
          console.error('Subjects response is not valid:', response);
          setSubjectOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch teacher allocated subjects:', err);
        setSubjectOptions([]);
      }
    };

    fetchSubjects();
  }, [selectedAcademicYearId, selectedSemesterId, isProfileLoaded, profileLoading, getTeacherId, selectedSubjectId]);

  // Fetch Modules (Chapters) & Units (Topics) by Subject ID
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) {
        setChapterOptions([]);
        setTopicOptions([]);
        return;
      }

      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const response = await contentService.getModulesbySubject(selectedSubjectId);
        console.log('getModulesbySubject Response:', response);

        const modulesArray = response?.modules || response || [];

        if (Array.isArray(modulesArray) && modulesArray.length > 0) {
          const formatted = modulesArray.map(mod => ({
            module_id: mod.module_id,
            module_name: mod.module_name,
            units: mod.units || []
          }));
          setChapterOptions(formatted);

          // Auto-select first module and first unit
          if (formatted.length > 0 && !filters.chapter) {
            const firstModule = formatted[0];
            const units = firstModule.units || [];
            const formattedUnits = units.map(u => ({ unit_id: u.unit_id, unit_name: u.unit_name }));
            setTopicOptions(formattedUnits);

            const firstUnit = formattedUnits[0];
            setFilters(prev => ({
              ...prev,
              chapter: firstModule.module_name,
              topic: firstUnit ? firstUnit.unit_name : ''
            }));
            setSelectedChapter(firstModule);
          }
        } else {
          setChapterOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch modules/units:', err);
        setChapterOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };

    fetchModules();
  }, [selectedSubjectId]);

  // Handle Program Selection
  const handleProgramChange = (e) => {
    const value = e.target.value;
    const program = programOptions.find(p => p.name === value);
    if (program) {
      setSelectedProgramId(program.id);

      // Get semesters from all allocations for this program
      const semesters = [...new Set(program.allocations.map(a => a.semester?.name).filter(Boolean))];
      setSemesterOptions(semesters);

      setFilters(prev => ({
        ...prev,
        program: [value],
        semester: '',
        gradeDivisionId: []
      }));
      setSubjectOptions([]);
    }
  };

  const removeProgram = () => {
    setFilters(prev => ({
      ...prev,
      program: [],
      semester: '',
      gradeDivisionId: []
    }));
    setSelectedProgramId(null);
    setSelectedAcademicYearId(null);
    setSelectedSemesterId(null);
    setSemesterOptions([]);
    setSubjectOptions([]);
  };

  // DELETE CONTENT FUNCTION
  const handleDeleteContent = async (contentId) => {
    console.log('Attempting to delete content with ID:', contentId);

    if (!contentId) {
      console.error('Content ID is undefined');
      showSweetAlert('Error', 'Cannot delete: Content ID is missing', 'error');
      return;
    }

    // Custom confirmation SweetAlert
    setAlertConfig({
      title: 'Confirm Delete',
      text: 'Are you sure you want to delete this content? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      confirmBtnText: 'Yes, delete it!',
      cancelBtnText: 'Cancel',
      confirmBtnBsStyle: 'danger',
      cancelBtnBsStyle: 'default',
      confirmBtnCssClass: 'btn-confirm',
      cancelBtnCssClass: 'btn-cancel',
      onConfirm: async () => {
        // Delete logic
        setDeletingId(contentId);
        setLoading(prev => ({ ...prev, delete: true }));

        try {
          const contentToDelete = content.find(c => c.id === contentId || c.content_id === contentId);
          const actualContentId = contentToDelete?.id || contentToDelete?.content_id || contentId;

          await contentService.hardDeleteContent(actualContentId);

          setContent(prevContent => prevContent.filter(c =>
            c.id !== actualContentId && c.content_id !== actualContentId
          ));

          console.log(`Content ${actualContentId} deleted successfully`);

          // Success SweetAlert
          showSweetAlert('Deleted!', 'Content has been deleted successfully.', 'success');
        } catch (error) {
          console.error('Failed to delete content:', error);
          showSweetAlert('Error', 'Failed to delete content. Please try again.', 'error');
        } finally {
          setDeletingId(null);
          setLoading(prev => ({ ...prev, delete: false }));
        }
      },
      onCancel: () => {
        setShowAlert(false);
      }
    });
    setShowAlert(true);
  };

  // Helper function to get content ID
  const getContentId = (contentItem) => {
    return contentItem.content_id || contentItem.id || contentItem._id || contentItem.contentId;
  };
  // Filter content based on selected filters
  const getFilteredContent = () => {
    return content;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header: Filter + Create Content Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
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
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/teacher/content/add-content/content/add')}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-3 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Create New Content</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Program */}
            <MultiSelectProgram
              label="Program"
              selectedPrograms={filters.program}
              programOptions={programOptions.map(p => p.name)}
              onProgramChange={handleProgramChange}
              onProgramRemove={removeProgram}
            />

            {/* Semester */}
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => {
                const semesterName = e.target.value;
                setFilters(prev => ({ ...prev, semester: semesterName, gradeDivisionId: [] }));

                if (semesterName && selectedProgramId) {
                  // Find the program and then the semester allocation
                  const program = programOptions.find(p => p.id === selectedProgramId);
                  if (program) {
                    const semesterAllocation = program.allocations.find(a => a.semester?.name === semesterName);
                    if (semesterAllocation) {
                      setSelectedSemesterId(semesterAllocation.semester_id);
                      setSelectedAcademicYearId(semesterAllocation.academic_year_id);
                    }
                  }
                } else {
                  setSelectedSemesterId(null);
                  setSelectedAcademicYearId(null);
                }
                setSubjectOptions([]);
              }}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={filters.program.length === 0 || semesterOptions.length === 0}
            />

            {/* Subject */}
            <CustomSelect
              label="Paper"
              value={filters.gradeDivisionId[0] || ''}
              onChange={(e) => {
                const subjectObj = subjectOptions.find(s => s.name === e.target.value);
                setSelectedSubjectId(subjectObj ? subjectObj.id : null);
                setFilters(prev => ({
                  ...prev,
                  gradeDivisionId: e.target.value ? [e.target.value] : [],
                  chapter: '',
                  topic: ''
                }));
                setChapterOptions([]);
                setTopicOptions([]);
              }}
              options={subjectOptions.map(s => s.name)}
              placeholder="Select Paper"
            />
            {/* Chapter */}
            <CustomSelect
              label="Module"
              value={filters.chapter}
              onChange={(e) => {
                const chapterName = e.target.value;
                const chapterObj = chapterOptions.find(c => c.module_name === chapterName);
                setSelectedChapter(chapterObj || null);
                setFilters(prev => ({ ...prev, chapter: chapterName, topic: '' }));

                const units = chapterObj?.units || [];
                const formattedUnits = units.map(u => ({ unit_id: u.unit_id, unit_name: u.unit_name }));
                setTopicOptions(formattedUnits);
              }}
              options={chapterOptions.map(c => c.module_name)}
              placeholder="Select Module"
              disabled={chapterOptions.length === 0}
              loading={loading.chapters}
            />
            {/* Topic */}
            <CustomSelect
              label="Unit"
              value={filters.topic}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, topic: e.target.value }));
              }}
              options={topicOptions.map(t => t.unit_name)}
              placeholder="Select Unit"
              disabled={topicOptions.length === 0}
            />
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-indigo-100">

        {/* Student Requests Section - Only show when a unit (topic) is selected */}
        {filters.topic && topicOptions.find(t => t.unit_name === filters.topic)?.unit_id && (
          <StudentRequest
            unitId={topicOptions.find(t => t.unit_name === filters.topic)?.unit_id}
            onUpdate={() => {
              // Refresh content list when a project is approved
              const unitId = topicOptions.find(t => t.unit_name === filters.topic)?.unit_id;
              if (unitId) loadContentByUnit(unitId);
            }}
          />
        )}

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-6 sm:mb-8">
            {filters.topic ? 'Filtered Content' : 'All Content'}
          </h3>

          {(() => {
            const filteredContent = getFilteredContent();
            return loading.content ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredContent.map((c, index) => {
                  const contentId = getContentId(c);

                  return (
                    <div
                      key={contentId || index}
                      className="group p-4 sm:p-6 bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-indigo-200"
                    >
                      {/* Title */}
                      <h4 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {c.content_name || 'Untitled Content'}
                      </h4>

                      {/* Description */}
                      {c.content_description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {c.content_description}
                        </p>
                      )}

                      {/* Reading Time + Type */}
                      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-sm mb-4">
                        <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {c.average_reading_time_seconds ? Math.floor(c.average_reading_time_seconds / 60) : 0} min
                        </span>
                        <span className="flex items-center gap-2 text-purple-600 bg-purple-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          Content
                        </span>
                      </div>

                      {/* Approval Status */}
                      <p className={`text-xs mb-4 px-3 py-1 rounded-full inline-block font-medium ${c.approval_status
                        ? 'text-green-700 bg-green-50'
                        : 'text-red-700 bg-red-50'
                        }`}>
                        Status: {c.approval_status ? 'Approved' : 'Pending'}
                      </p>

                      {/* Meta Information */}
                      <div className="text-xs text-gray-500 mb-4 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Unit:</span>
                          <span>{c.unit_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Paper:</span>
                          <span>{c.subject_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Module:</span>
                          <span>{c.module_name || 'N/A'}</span>
                        </div>
                        {c.created_by_full_name && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Created by:</span>
                            <span>{c.created_by_full_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end mt-4 sm:mt-6">
                        <button
                          onClick={() => handleDeleteContent(contentId)}
                          disabled={loading.delete || !contentId}
                          className="p-2 sm:p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition touch-manipulation"
                          title={!contentId ? "Cannot delete: Missing ID" : "Delete content"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">
                  {filters.topic ? 'No content found for selected filters.' : 'No content available.'}
                </p>
              </div>
            );
          })()
          }
        </div>
      </div>

      {/* SweetAlert */}
      {showAlert && (
        <SweetAlert
          {...alertConfig}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
        />
      )}
    </div>
  );
};

export default ContentDashboard;