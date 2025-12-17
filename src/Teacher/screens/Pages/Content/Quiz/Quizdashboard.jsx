import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Upload, Edit, Trash2, ChevronDown, Clock, FileText } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';

import { courseService } from "../services/courses.service"

import { fetchClassesByprogram } from '../services/student.service';

import { contentService } from '../services/content.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';


import { contentQuizService } from '../services/contentQuiz.service';
import BulkUploadAssessmentModal from '../Components/BulkUploadAssessmentModal';

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
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

  const selectedOption = options.find(opt => opt.value === value);

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
          <span className={`flex-1 truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect({ value: '', label: placeholder })}
            >
              {placeholder}
            </div>
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function QuizDashboard() {
  const navigate = useNavigate();
  
  // Get user profile data
  const { getUserId, getCollegeId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [papers, setPapers] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [filters, setFilters] = useState({
    program: "",
    semester: "",
    paper: "",
    module: "",
    unit: "",
  });

  // Additional state for tracking selections
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  // Load quizzes when unit is selected
  useEffect(() => {
    if (filters.unit) {
      loadQuizzesByUnit(filters.unit);
    } else {
      setQuizzes([]); // Clear quizzes when no unit is selected
    }
  }, [filters.unit]);

  // ---------- FETCH PROGRAMS ----------
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
          
          // Store all allocation data
          setAllAllocations(allPrograms);
          
          allPrograms.forEach(allocation => {
            const programId = allocation.program_id;
            const programName = allocation.program?.program_name || allocation.program_name || `Program ${programId}`;
            
            if (!programMap.has(programId)) {
              programMap.set(programId, {
                id: programId,
                label: programName,
                value: String(programId),
                allocations: []
              });
            }
            
            programMap.get(programId).allocations.push(allocation);
          });
          
          const uniquePrograms = Array.from(programMap.values());
          setPrograms(uniquePrograms);
          console.log('Formatted programs:', uniquePrograms);
          
          // Auto-select first program
          if (uniquePrograms.length > 0 && !filters.program) {
            setFilters(prev => ({ ...prev, program: uniquePrograms[0].value }));
          }
        } else {
          console.error('Failed to fetch programs:', response.message);
          setPrograms([]);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, [isProfileLoaded, profileLoading, getTeacherId]);

  // ---------- FETCH SEMESTERS WHEN PROGRAM CHANGES ----------
  useEffect(() => {
    if (!filters.program) {
      setSemesters([]);
      setPapers([]);
      setFilters(prev => ({ ...prev, semester: "", paper: "" }));
      setSelectedProgramId(null);
      return;
    }

    const program = programs.find(p => p.value === filters.program);
    if (program) {
      setSelectedProgramId(program.id);
      // Get semesters from allocations for this program
      const semesters = [...new Set(program.allocations.map(a => a.semester?.name).filter(Boolean))];
      const formattedSemesters = semesters.map(sem => ({ label: sem, value: sem }));
      setSemesters(formattedSemesters);
      
      // Auto-select first semester
      if (formattedSemesters.length > 0 && !filters.semester) {
        setFilters(prev => ({ ...prev, semester: formattedSemesters[0].value }));
      }
    }
  }, [filters.program, programs]);

  // ---------- FETCH PAPERS WHEN SEMESTER CHANGES ----------
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedProgramId || !filters.semester) {
        setPapers([]);
        setFilters(prev => ({ ...prev, paper: "" }));
        return;
      }

      // Find the program and then the semester allocation
      const program = programs.find(p => p.id === selectedProgramId);
      if (program) {
        const semesterAllocation = program.allocations.find(a => a.semester?.name === filters.semester);
        if (semesterAllocation) {
          setSelectedSemesterId(semesterAllocation.semester_id);
          setSelectedAcademicYearId(semesterAllocation.academic_year_id);

          if (!isProfileLoaded || profileLoading) return;

          const teacherId = getTeacherId();
          if (!teacherId) return;

          try {
            const response = await contentService.getTeacherSubjectsAllocated(teacherId, semesterAllocation.academic_year_id, semesterAllocation.semester_id);
            
            if (Array.isArray(response)) {
              const subjects = response.map(subjectInfo => ({
                label: subjectInfo.subject_name || subjectInfo.name,
                value: subjectInfo.subject_id || subjectInfo.id
              })).filter(s => s.label && s.value);

              const unique = Array.from(new Map(subjects.map(s => [s.label, s])).values());
              setPapers(unique);
              
              // Auto-select first paper
              if (unique.length > 0 && !filters.paper) {
                setFilters(prev => ({ ...prev, paper: unique[0].value }));
              }
            }
          } catch (err) {
            console.error('Failed to fetch teacher allocated subjects:', err);
            setPapers([]);
          }
        }
      }
    };

    fetchSubjects();
  }, [filters.semester, selectedProgramId, programs, isProfileLoaded, profileLoading, getTeacherId]);

  useEffect(() => {
    if (!filters.paper) {
      setModules([]);
      setUnits([]);
      setFilters(prev => ({ ...prev, module: "", unit: "" }));
      return;
    }

    setSelectedSubjectId(filters.paper);

    const loadModules = async () => {
      try {
        const response = await contentService.getModulesbySubject(filters.paper);
        const modulesArray = response?.modules || response || [];

        if (Array.isArray(modulesArray) && modulesArray.length > 0) {
          const formatted = modulesArray.map(mod => ({
            label: mod.module_name,
            value: String(mod.module_id),
            full: { units: mod.units || [] }
          }));
          setModules(formatted);
          
          // Auto-select first module
          if (formatted.length > 0 && !filters.module) {
            setFilters(prev => ({ ...prev, module: formatted[0].value }));
          }
        } else {
          setModules([]);
        }
        setUnits([]);
        setFilters(prev => ({ ...prev, module: "", unit: "" }));
      } catch (err) {
        console.error("Error fetching modules:", err);
        setModules([]);
      }
    };

    loadModules();
  }, [filters.paper]);

  useEffect(() => {
    if (!filters.module) {
      setUnits([]);
      setFilters(prev => ({ ...prev, unit: "" }));
      return;
    }

    const selectedModule = modules.find(m => m.value === filters.module);

    const formattedUnits = selectedModule?.full?.units?.map(u => ({
      label: u.unit_name,
      value: String(u.unit_id),
    })) || [];

    setUnits(formattedUnits);
    
    // Auto-select first unit
    if (formattedUnits.length > 0) {
      setFilters(prev => ({ ...prev, unit: formattedUnits[0].value }));
    } else {
      setFilters(prev => ({ ...prev, unit: "" }));
    }
  }, [filters.module]);


  const loadQuizzesByUnit = async (unitId) => {
    try {
      console.log('Loading quizzes for unit ID:', unitId);
      const res = await contentQuizService.getQuizzesByUnitIdForTeacher(unitId);
      console.log('Quizzes response:', res);
      setQuizzes(res || []);
    } catch (err) {
      console.error("Error loading quizzes for unit:", err);
      setQuizzes([]);
    }
  };

  const getFilteredQuizzes = () => {
    // Since we're now loading quizzes based on unit selection,
    // we don't need to filter them again
    return quizzes;
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizToDelete(quizId);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    setShowAlert(false);
    try {
      await contentQuizService.softDeleteQuiz(quizToDelete);
      
      // If no error thrown, deletion was successful
      setAlertMessage('Quiz deleted successfully!');
      setShowDeleteSuccessAlert(true);
      // Reload quizzes for current unit if one is selected
      if (filters.unit) {
        loadQuizzesByUnit(filters.unit);
      }
      setQuizToDelete(null);
    } catch (err) {
      console.error('Delete quiz error:', err);
      setErrorMessage('Failed to delete quiz. Please try again.');
      setShowDeleteErrorAlert(true);
      setQuizToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setQuizToDelete(null);
  };



  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8">
      {/* Header: Filter + Create Quiz Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/teacher/content/add-content/quiz/add')}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-3 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Create New Quiz</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <CustomSelect
              label="Program"
              value={filters.program}
              onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              options={programs}
              placeholder="Select Program"
            />



            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              options={semesters}
              placeholder="Select Semester"
              disabled={!filters.program}
            />

            <CustomSelect
              label="Paper"
              value={filters.paper}
              onChange={(e) => setFilters(prev => ({ ...prev, paper: e.target.value }))}
              options={papers}
              placeholder="Select Paper"
              disabled={!filters.semester}
            />

            <CustomSelect
              label="Module"
              value={filters.module}
              onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
              options={modules}
              placeholder="Select Module"
              disabled={!filters.paper}
            />

            <CustomSelect
              label="Unit"
              value={filters.unit}
              onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
              options={units}
              placeholder="Select Unit"
              disabled={!filters.module}
            />
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-indigo-100">

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-6 sm:mb-8">
            {filters.unit ? 'Filtered Quizzes' : 'All Quizzes'}
          </h3>

          {(() => {
            const filteredQuizzes = getFilteredQuizzes();
            return filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.quiz_id}
                    className="group p-4 sm:p-6 bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-indigo-200"
                  >
                    {/* Title */}
                    <h4 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {quiz.quiz_name}
                    </h4>

                    {/* Duration + Questions */}
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-sm mb-4">
                      <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {quiz.duration} min
                      </span>
                      <span className="flex items-center gap-2 text-purple-600 bg-purple-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>


                     <p className={`text-xs mb-4 px-3 py-1 rounded-full inline-block font-medium ${
                       quiz.approval_status 
                         ? 'text-green-700 bg-green-50' 
                         : 'text-red-700 bg-red-50'
                     }`}>
                     Status: {quiz.approval_status ? 'Approved' : 'Pending'}
                    </p>

                    {/* Active Badge */}
                    {/* <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      quiz.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {quiz.active ? "Active" : "Inactive"}
                  </span> */}
                    {/* --- EDIT + DELETE BUTTONS --- */}
                    <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                      <button
                        onClick={() =>
                          navigate("/teacher/content/add-content/quiz/edit", {
                            state: { quiz: quiz, filters: filters }
                          })
                        }
                        className="p-2 sm:p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition touch-manipulation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                        className="p-2 sm:p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">
                  {filters.unit ? 'No quizzes found for selected filters.' : 'No quizzes available.'}
                </p>
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

      {/* Delete Confirmation Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete!"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          You won't be able to recover this quiz!
        </SweetAlert>
      )}

      {/* Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Deleted!"
           confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Error Alert */}
      {showDeleteErrorAlert && (
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setShowDeleteErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      )}
    </div>
  );
}

