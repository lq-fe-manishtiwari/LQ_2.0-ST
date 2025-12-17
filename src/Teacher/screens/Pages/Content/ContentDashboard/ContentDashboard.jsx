'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Filter, ChevronDown, X, Edit, Trash2, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/content.service.js';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';

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
              : 'bg-white border-gray-300 cursor-pointer hover:border-[rgb(33,98,193)]'
              } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          >
            <span className={displayValue && !loading ? 'text-gray-900' : 'text-gray-400'}>
              {loading ? 'Loading...' : (displayValue || placeholder)}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && !disabled && !loading && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
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
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
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
            className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-[rgb(33,98,193)]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedPrograms.length > 0 ? (
              selectedPrograms.map((prog) => (
                <span
                  key={prog}
                  className="inline-flex items-center gap-1 bg-[rgba(33,98,193,0.1)] text-[rgb(33,98,193)] px-2 py-1 rounded-full text-xs font-medium"
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
            <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {availableOptions.length > 0 ? (
                availableOptions.map((prog) => (
                  <div
                    key={prog}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
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

          await contentService.softDeleteContent(actualContentId);

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-[rgb(33,98,193)]" />
          <span className="text-[rgb(33,98,193)] font-medium">Filter</span>
          <ChevronDown className={`w-4 h-4 text-[rgb(33,98,193)] transition-transform ${filters.filterOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/teacher/content/add-content/content/add')}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Content
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

      {/* Content List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your educational content</p>
        </div>
        <div className="p-6">
          {loading.content ? (
            <div className="text-center text-gray-500 py-10">Loading content...</div>
          ) : (() => {
            const filteredContent = getFilteredContent();
            return filteredContent.length > 0 ? (
              <div className="space-y-4">
                {filteredContent.map((c, index) => {
                  const contentId = getContentId(c);
                  console.log(`Content ${index} ID:`, contentId, 'Full object:', c);

                  return (
                    <div key={contentId || index} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-800">#{index + 1}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.approval_status
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                            {c.approval_status ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600 font-medium">{c.content_name || 'Content name not found.'}</p>
                        {c.content_description && (
                          <p className="text-sm text-gray-500 mt-1">{c.content_description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{c.average_reading_time_seconds ? Math.floor(c.average_reading_time_seconds / 60) : 0} min</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Unit: {c.unit_name || 'N/A'} | Subject: {c.subject_name || 'N/A'} | Module: {c.module_name || 'N/A'}
                        </p>
                        {c.created_by_full_name && (
                          <p className="text-xs text-gray-400 mt-1">
                            Created by: {c.created_by_full_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => {
                            navigate("/teacher/content/add-content/content/add", {
                              state: { content: c, filters: filters }
                            });
                          }}
                          className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          disabled={loading.delete || !contentId}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteContent(contentId)}
                          disabled={loading.delete || !contentId}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!contentId ? "Cannot delete: Missing ID" : "Delete content"}
                        >
                          {loading.delete && deletingId === contentId ? (
                            <span className="text-sm">Deleting...</span>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No content found. Create your first content item!</p>
              </div>
            );
          })()}
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