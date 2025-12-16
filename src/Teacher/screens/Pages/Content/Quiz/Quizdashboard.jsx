import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Upload, Edit, Trash2, ChevronDown } from "lucide-react";
// import { courseService } from "../../Courses/Services/courses.service";
// import { fetchClassesByprogram } from "../../Student/Services/student.service.js";
// import { contentService } from '../Services/content.service.js';
// import { contentQuizService } from '../Services/contentQuiz.service.js';
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
          className={`w-full px-3 py-2 border ${
            disabled
              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
          } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`flex-1 truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : 'rotate-0'
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
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [papers, setPapers] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [filters, setFilters] = useState({
    program: "",
    class: "",
    semester: "",
    paper: "",
    module:"",
    unit: "",
  });

  // Dummy data for testing
  const dummyPrograms = [
    { label: "Computer Science", value: "1" },
    { label: "Information Technology", value: "2" }
  ];

  const dummyClasses = [
    { label: "First Year", value: "1" },
    { label: "Second Year", value: "2" }
  ];

  const dummySemesters = [
    { label: "Semester 1", value: "1" },
    { label: "Semester 2", value: "2" }
  ];

  const dummyPapers = [
    { label: "Data Structures", value: "1" },
    { label: "Algorithms", value: "2" }
  ];

  const dummyModules = [
    { label: "Arrays & Linked Lists", value: "1", full: { units: [{ unit_name: "Arrays", unit_id: 1 }, { unit_name: "Linked Lists", unit_id: 2 }] } },
    { label: "Trees & Graphs", value: "2", full: { units: [{ unit_name: "Binary Trees", unit_id: 3 }, { unit_name: "Graph Traversal", unit_id: 4 }] } }
  ];

  const dummyQuizzes = [
    {
      quiz_id: 1,
      quiz_name: "Array Fundamentals Quiz",
      duration: 30,
      unit_id: 1,
      questions: [{ id: 1 }, { id: 2 }, { id: 3 }],
      createddate: "2024-01-15T10:00:00Z",
      active: true
    },
    {
      quiz_id: 2,
      quiz_name: "Linked List Operations",
      duration: 45,
      unit_id: 2,
      questions: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      createddate: "2024-01-20T14:30:00Z",
      active: true
    },
    {
      quiz_id: 3,
      quiz_name: "Binary Tree Traversal",
      duration: 60,
      unit_id: 3,
      questions: [{ id: 1 }, { id: 2 }],
      createddate: "2024-01-25T09:15:00Z",
      active: false
    }
  ];

  // Initialize with dummy data
  useEffect(() => {
    setPrograms(dummyPrograms);
    setClasses(dummyClasses);
    setSemesters(dummySemesters);
    setPapers(dummyPapers);
    setQuizzes(dummyQuizzes);
  }, []);

  // ---------- FETCH PROGRAMS ----------
  useEffect(() => {
    const fetchPrograms = () => {
      try {
        const storedPrograms = localStorage.getItem("college_programs");
        if (storedPrograms) {
          const parsedPrograms = JSON.parse(storedPrograms);
          const formatted = parsedPrograms.map(p => ({
            label: p.program_name,
            value: String(p.program_id),
            full: p,
          }));
          setPrograms(formatted);
        } else {
          setPrograms([]);
        }
      } catch (err) {
        console.error("Error reading college_programs:", err);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, []);

  // ---------- FETCH CLASSES WHEN PROGRAM CHANGES ----------
  useEffect(() => {
    const loadClasses = async () => {
      if (!filters.program) {
        setClasses([]);
        setSemesters([]);
        setPapers([]);
        setFilters(prev => ({ ...prev, class: "", semester: "", paper: "" }));
        return;
      }

      try {
        const classesRes = await fetchClassesByprogram(filters.program);
        const formattedClasses = classesRes.map(c => ({
          label: c.class_year_name,
          value: String(c.class_year_id),
          full: c,
        }));
        setClasses(formattedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      }
    };

    loadClasses();
  }, [filters.program]);

  // ---------- FETCH SEMESTERS WHEN CLASS CHANGES ----------
  useEffect(() => {
    if (!filters.class) {
      setSemesters([]);
      setPapers([]);
      setFilters(prev => ({ ...prev, semester: "", paper: "" }));
      return;
    }

    const classData = classes.find(cls => cls.value === filters.class);
    const semestersData = classData?.full?.semester_divisions?.map(sem => ({
      label: sem.semester_name,
      value: sem.semester_id,
      full: sem,
    })) || [];

    setSemesters(semestersData);
    setFilters(prev => ({ ...prev, semester: "", paper: "" }));
  }, [filters.class, classes]);

  // ---------- FETCH PAPERS WHEN SEMESTER CHANGES ----------
  useEffect(() => {
    const fetchPapers = async () => {
      if (!filters.semester) {
        setPapers([]);
        setFilters(prev => ({ ...prev, paper: "" }));
        return;
      }

      try {
        const res = await courseService.getAllCourses();
        if (res && Array.isArray(res)) {
          const formatted = res.map(s => ({
            label: s.name || s.paper_name || s.subject_name,
            value: s.subject_id || s.id,
          }));
          setPapers(formatted);
        }
      } catch (err) {
        console.error("Error fetching papers:", err);
      }
    };

    fetchPapers();
  }, [filters.semester]);

  useEffect(() => {
    if (!filters.paper) {
      setModules([]);
      setUnits([]);
      setFilters(prev => ({ ...prev, module: "", unit: "" }));
      return;
    }

    // Use dummy modules data
    setModules(dummyModules);
    setUnits([]);
    setFilters(prev => ({ ...prev, module: "", unit: "" }));
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
  setFilters(prev => ({ ...prev, unit: "" }));
}, [filters.module]);


  const loadAllQuizzes = () => {
    // Use dummy quiz data
    setQuizzes(dummyQuizzes);
  };

const getFilteredQuizzes = () => {
  return quizzes.filter(quiz => {
    if (filters.unit && String(quiz.unit_id) !== String(filters.unit)) return false;
    return true;
  });
};

const handleDeleteQuiz = async (quizId) => {
  try {
    const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmDelete) return;

    const response = await contentQuizService.softDeleteQuiz(quizId);

    if (response?.success) {
      alert("Quiz deleted successfully!");
      loadAllQuizzes(); // refresh list
    } else {
      alert("Failed to delete quiz.");
    }
  } catch (err) {
    console.error("Delete quiz error:", err);
    alert("Error deleting quiz.");
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
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
            onClick={() => navigate('/teacher/content/quiz/add')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Create New Quiz</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <CustomSelect
              label="Program"
              value={filters.program}
              onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              options={programs}
              placeholder="Select Program"
            />
            
            <CustomSelect
              label="Class"
              value={filters.class}
              onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              options={classes}
              placeholder="Select Class"
              disabled={!filters.program}
            />
            
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              options={semesters}
              placeholder="Select Semester"
              disabled={!filters.class}
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

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {filters.unit ? 'Filtered Quizzes' : 'All Quizzes'}
        </h3>

        {(() => {
          const filteredQuizzes = getFilteredQuizzes();
          return filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.quiz_id}  
                  className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  {/* Title */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {quiz.quiz_name}
                  </h4>

                  {/* Duration + Questions */}
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>⏳ {quiz.duration} min</span>
                    <span>📝 {quiz.questions?.length || 0} Questions</span>
                  </div>

                  {/* Created date */}
                  <p className="text-xs text-gray-500 mb-3">
                    Created on {new Date(quiz.createddate).toLocaleDateString()}
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
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() =>
                          navigate("/teacher/content/quiz/edit", {
                            state: { quiz: quiz, filters: filters }
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">
              {filters.unit ? 'No quizzes found for selected filters.' : 'No quizzes available.'}
            </p>
          );
        })()
        }
      </div>
    </div>

    {/* Bulk Upload Modal */}
          {showBulkUpload && (
            <BulkUploadAssessmentModal onClose={() => setShowBulkUpload(false)} />
          )}

    </div>
    
  );
}

