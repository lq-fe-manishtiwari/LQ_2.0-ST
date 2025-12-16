'use client';
import React, { useState, useRef, useEffect } from 'react';
import BulkUploadAssessmentModal from '../Components/BulkUploadAssessmentModal';
import { Plus, Filter, ChevronDown, X, Upload, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collegeService } from '../services/college.service';
import { courseService } from '../services/courses.service';
import { fetchClassesByprogram } from '../services/student.service.js';
import { contentService } from '../services/content.service.js';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';

const Questions = () => {
  const navigate = useNavigate();
  
  // Get user profile data
  const { getUserId, getCollegeId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();

  const [filters, setFilters] = useState({
    filterOpen: false,
    program: [],
    semester: '',
    gradeDivisionId: [],
    chapter: '',
    topic: '',
    activeInactiveStatus: 'all',
  });

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [loading, setLoading] = useState({ 
    chapters: false, 
    topics: false, 
    questions: false,
    delete: false 
  });
  const [questions, setQuestions] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  
  // SweetAlert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  // SweetAlert function
  const showSweetAlert = (title, text, type = 'success', confirmText = 'OK', onConfirm = null) => {
    setAlertConfig({
      title,
      text,
      type,
      confirmBtnText: confirmText,
      onConfirm: () => {
        setShowAlert(false);
        if (onConfirm && typeof onConfirm === 'function') {
          onConfirm();
        }
      }
    });
    setShowAlert(true);
  };

  // Auto-select first available options and load questions
  useEffect(() => {
    const autoSelectAndLoadQuestions = async () => {
      if (allAllocations.length > 0 && programOptions.length > 0) {
        // Auto-select first program
        const firstProgram = programOptions[0];
        if (firstProgram && !selectedProgramId) {
          setSelectedProgramId(firstProgram.id);
          setFilters(prev => ({ ...prev, program: [firstProgram.name] }));
          
          // Get semesters for this program and auto-select first one
          const semesters = [...new Set(firstProgram.allocations.map(a => a.semester?.name).filter(Boolean))];
          setSemesterOptions(semesters);
          
          if (semesters.length > 0) {
            const firstSemester = semesters[0];
            const semesterAllocation = firstProgram.allocations.find(a => a.semester?.name === firstSemester);
            if (semesterAllocation) {
              setSelectedSemesterId(semesterAllocation.semester_id);
              setSelectedAcademicYearId(semesterAllocation.academic_year_id);
              setFilters(prev => ({ ...prev, semester: firstSemester }));
            }
          }
        }
      }
    };
    autoSelectAndLoadQuestions();
  }, [allAllocations, programOptions, selectedProgramId]);

  // Filter questions based on selected filters
  const getFilteredQuestions = () => {
    let filtered = questions;
    
    // Filter by program if selected
    if (filters.program.length > 0 && selectedProgramId) {
      // Note: Questions don't have direct program_id, so we filter by other criteria when program is selected
      // For now, we'll show all questions when only program is selected
    }
    
    // Filter by unit if selected
    if (filters.topic) {
      const selectedTopic = topicOptions.find(t => t.unit_name === filters.topic);
      if (selectedTopic?.unit_id) {
        filtered = filtered.filter(q => String(q.unit_id) === String(selectedTopic.unit_id));
      }
    }
    
    return filtered;
  };

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
                return (
                  <div
                    key={optionName}
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
          console.log("allPrograms",allPrograms)
          
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

  // Handle Semester Selection
  const handleSemesterChange = (e) => {
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
  };

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
          
          // Auto-select first subject if available
          if (unique.length > 0 && !selectedSubjectId) {
            const firstSubject = unique[0];
            setSelectedSubjectId(firstSubject.id);
            setFilters(prev => ({ ...prev, gradeDivisionId: [firstSubject.name] }));
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


  // DELETE QUESTION FUNCTION WITH SWEETALERT CONFIRMATION
  const handleDeleteQuestion = async (questionId) => {
    console.log('Attempting to delete question with ID:', questionId);
    
    if (!questionId) {
      console.error('Question ID is undefined');
      showSweetAlert('Error', 'Cannot delete: Question ID is missing', 'error');
      return;
    }

    // Custom confirmation SweetAlert
    setAlertConfig({
      title: 'Confirm Delete',
      text: 'Are you sure you want to delete this question? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      confirmBtnText: 'Yes, delete it!',
      cancelBtnText: 'Cancel',
      confirmBtnBsStyle: 'danger',
      cancelBtnBsStyle: 'default',
      onConfirm: async () => {
        // Delete logic
        setDeletingId(questionId);
        setLoading(prev => ({ ...prev, delete: true }));

        try {
          const questionToDelete = questions.find(q => q.id === questionId || q.question_id === questionId);
          const actualQuestionId = questionToDelete?.id || questionToDelete?.question_id || questionId;
          
          await contentService.deleteQuestion(actualQuestionId);
          
          setQuestions(prevQuestions => prevQuestions.filter(q => 
            q.id !== actualQuestionId && q.question_id !== actualQuestionId
          ));
          
          console.log(`Question ${actualQuestionId} deleted successfully`);
          
          // Success SweetAlert
          showSweetAlert('Deleted!', 'Question has been deleted successfully.', 'success');
        } catch (error) {
          console.error('Failed to delete question:', error);
          showSweetAlert('Error', 'Failed to delete question. Please try again.', 'error');
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

  // Helper function to get question ID from question object
  const getQuestionId = (question) => {
    return question.id || question.question_id || question._id || question.questionId;
  };

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

  // Auto-fetch questions when unit is selected
  useEffect(() => {
    const autoFetchQuestions = async () => {
      if (!filters.topic) {
        setQuestions([]);
        return;
      }

      const selectedTopic = topicOptions.find(t => t.unit_name === filters.topic);
      if (!selectedTopic || !selectedTopic.unit_id) {
        setQuestions([]);
        return;
      }

      setLoading(prev => ({ ...prev, questions: true }));
      try {
        console.log('Auto-fetching questions for unit ID:', selectedTopic.unit_id);
        const response = await contentService.getQuestionsByUnitId(selectedTopic.unit_id);
        console.log('Auto-fetched Questions Response:', response);
        
        if (Array.isArray(response)) {
          setQuestions(response || []);
          if (response.length === 0) {
            console.log('No questions found for the selected unit.');
          }
        } else {
          console.log('Response is not an array:', response);
          setQuestions([]);
        }
      } catch (error) {
        console.error('Failed to auto-fetch questions:', error);
        setQuestions([]);
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    autoFetchQuestions();
  }, [filters.topic, topicOptions]);

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
            onClick={() => navigate('/teacher/content/add-question')}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Question
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all"
          >
            <Upload className="w-5 h-5" /> Bulk Upload
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
              onChange={handleSemesterChange}
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
              disabled={!selectedSubjectId || chapterOptions.length === 0}
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
              disabled={!filters.chapter || topicOptions.length === 0}
            />
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
          {loading.questions ? (
            <div className="text-center text-gray-500 py-10">Loading questions...</div>
          ) : (() => {
            const filteredQuestions = getFilteredQuestions();
            return filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((q, index) => {
                const questionId = getQuestionId(q);
                console.log(`Question ${index} ID:`, questionId, 'Full object:', q);
                
                return (
                  <div key={questionId || index} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">Q{index + 1}.</p>
                      <p className="mt-1 text-gray-600">{q.question || q.question_text || 'Question text not found.'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Unit: {q.unit_name || 'N/A'} | Subject: {q.subject_name || 'N/A'}  | Status: {q.subject_name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => {
                          console.log("Navigating with question:", q, "and filters:", filters);
                          navigate("/content/add-question", { state: { question: q, filters: filters } });
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                        disabled={loading.delete || !questionId}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(questionId)}
                        disabled={loading.delete || !questionId}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!questionId ? "Cannot delete: Missing ID" : "Delete question"}
                      >
                        {loading.delete && deletingId === questionId ? (
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
                {filters.topic ? 'No questions found for selected unit.' :
                 filters.program.length > 0 ? 'Select Semester → Paper → Module → Unit to filter further' :
                 'Select Program to start filtering questions'}
              </div>
            );
          })()
        }
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadAssessmentModal onClose={() => setShowBulkUpload(false)} />
      )}

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

export default Questions;