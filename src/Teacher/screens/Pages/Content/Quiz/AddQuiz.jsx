import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
// import { fetchClassesByprogram } from "../../Student/Services/student.service.js";
// import { contentService } from "../Services/content.service.js";
// import { contentQuizService } from "../Services/contentQuiz.service.js";

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
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
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

export default function AddQuiz() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    program: "",
    className: "",
    semester: "",
    paper: "",
    module: "",
    unit: "",
    quizName: "",
    duration: "",
    instructions: "",
  });

  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [papers, setPapers] = useState([]);
  const [modules, setModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch programs
  useEffect(() => {
    const storedPrograms = localStorage.getItem("college_programs");
    if (storedPrograms) {
      const parsedPrograms = JSON.parse(storedPrograms);
      const formatted = parsedPrograms.map(p => ({
        label: p.program_name,
        value: String(p.program_id),
        full: p,
      }));
      setPrograms(formatted);
    }
  }, []);

  // Fetch classes
  useEffect(() => {
    if (!formData.program) {
      setClasses([]);
      setSemesters([]);
      setPapers([]);
      setModules([]);
      setUnits([]);
      return;
    }

    fetchClassesByprogram(formData.program)
      .then(classesRes => {
        const formatted = classesRes.map(c => ({
          label: c.class_year_name,
          value: String(c.class_year_id),
          full: c,
        }));
        setClasses(formatted);
      })
      .catch(err => console.error("Error fetching classes:", err));
  }, [formData.program]);

  // Fetch semesters
  useEffect(() => {
    if (!formData.className) {
      setSemesters([]);
      setPapers([]);
      setModules([]);
      setUnits([]);
      return;
    }

    const classData = classes.find(cls => cls.value === formData.className);
    const semestersData = classData?.full?.semester_divisions?.map(sem => ({
      label: sem.semester_name,
      value: sem.semester_id,
      full: sem,
    })) || [];
    setSemesters(semestersData);
  }, [formData.className, classes]);

  // Fetch papers
  useEffect(() => {
    if (!formData.program) {
      setPapers([]);
      setModules([]);
      setUnits([]);
      return;
    }

    contentService.getSubjectbyProgramId(formData.program)
      .then(res => {
        if (res && Array.isArray(res)) {
          const formatted = res.map(s => ({
            label: s.name || s.paper_name || s.subject_name,
            value: s.subject_id || s.id,
          }));
          setPapers(formatted);
        }
      })
      .catch(err => console.error("Error fetching papers:", err));
  }, [formData.program]);

  // Fetch modules
  useEffect(() => {
    if (!formData.paper) return;
    
    contentService.getModulesAndUnits(formData.paper)
      .then(res => {
        setModules(res.modules || []);
        setUnits([]);
      })
      .catch(err => console.error("Error loading modules:", err));
  }, [formData.paper]);

  // Fetch units
  useEffect(() => {
    if (!formData.module || modules.length === 0) return;
    
    const selectedModule = modules.find(m => String(m.module_id) === String(formData.module));
    setUnits(selectedModule?.units || []);
  }, [formData.module, modules]);

  // Fetch questions
  useEffect(() => {
    if (!formData.unit) {
      setQuestionsList([]);
      return;
    }

    contentService.getQuestionsByUnitId(formData.unit)
      .then(res => {
        let questionsArray = [];
        if (Array.isArray(res?.data)) {
          questionsArray = res.data;
        } else if (Array.isArray(res)) {
          questionsArray = res;
        } else if (typeof res === 'object' && res !== null) {
          questionsArray = Object.values(res);
        }
        setQuestionsList(questionsArray);
      })
      .catch(err => console.error("Error fetching questions:", err));
  }, [formData.unit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "program") {
      updated = { ...updated, className: "", semester: "", paper: "", module: "", unit: "" };
    }
    if (name === "className") {
      updated = { ...updated, semester: "", paper: "", module: "", unit: "" };
    }
    if (name === "semester") {
      updated = { ...updated, paper: "", module: "", unit: "" };
    }
    if (name === "paper") {
      updated = { ...updated, module: "", unit: "" };
    }
    if (name === "module") {
      updated = { ...updated, unit: "" };
    }

    setFormData(updated);
  };

  const validateForm = () => {
    const required = ["quizName", "duration", "unit"];
    for (let f of required) {
      if (!formData[f]) {
        setAlert(
          <SweetAlert
            danger
            title="Validation Error"
            onConfirm={() => setAlert(null)}
          >
            Please fill: {f}
          </SweetAlert>
        );
        return false;
      }
    }

    if (selectedQuestions.length === 0) {
      setAlert(
        <SweetAlert
          danger
          title="Validation Error"
          onConfirm={() => setAlert(null)}
        >
          Please select at least one question
        </SweetAlert>
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const quizPayload = {
      quiz_name: formData.quizName,
      duration: parseInt(formData.duration),
      question_ids: selectedQuestions.map(id => parseInt(id)),
      unit_id: parseInt(formData.unit)
    };

    try {
      await contentQuizService.createQuizQuestion(quizPayload);
      setAlert(
        <SweetAlert
          success
          title="Quiz Created!"
          onConfirm={() => {
            setAlert(null);
            navigate("/content/quiz-dashboard");
          }}
        >
          "{formData.quizName}" has been created successfully.
        </SweetAlert>
      );
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
        >
          Failed to create quiz. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stdLayout">
      <div className="content-wrapper flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.75rem] font-semibold text-[#2162c1]">Add Quiz</h3>
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  label="Program *"
                  value={formData.program}
                  onChange={(e) => handleChange({ target: { name: 'program', value: e.target.value } })}
                  options={programs}
                  placeholder="Select Program"
                />

                <CustomSelect
                  label="Class *"
                  value={formData.className}
                  onChange={(e) => handleChange({ target: { name: 'className', value: e.target.value } })}
                  options={classes}
                  placeholder="Select Class"
                  disabled={!formData.program}
                />

                <CustomSelect
                  label="Semester *"
                  value={formData.semester}
                  onChange={(e) => handleChange({ target: { name: 'semester', value: e.target.value } })}
                  options={semesters}
                  placeholder="Select Semester"
                  disabled={!formData.className}
                />

                <CustomSelect
                  label="Paper *"
                  value={formData.paper}
                  onChange={(e) => handleChange({ target: { name: 'paper', value: e.target.value } })}
                  options={papers}
                  placeholder="Select Paper"
                  disabled={!formData.program}
                />

                <CustomSelect
                  label="Module *"
                  value={formData.module}
                  onChange={(e) => handleChange({ target: { name: 'module', value: e.target.value } })}
                  options={modules.map(m => ({ label: m.module_name, value: m.module_id }))}
                  placeholder="Select Module"
                  disabled={!formData.paper}
                />

                <CustomSelect
                  label="Unit *"
                  value={formData.unit}
                  onChange={(e) => handleChange({ target: { name: 'unit', value: e.target.value } })}
                  options={units.map(u => ({ label: u.unit_name, value: u.unit_id }))}
                  placeholder="Select Unit"
                  disabled={!formData.module}
                />
              </div>

              <label className="block mt-6 font-medium">Quiz Name *</label>
              <input
                type="text"
                name="quizName"
                value={formData.quizName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg mb-4"
                placeholder="Enter Quiz Name"
              />

              <label className="block font-medium">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg mb-6"
              />

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block font-medium">Select Questions *</label>
                  {questionsList.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedQuestions.length === questionsList.length && questionsList.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestions(questionsList.map(q => String(q.question_id)));
                          } else {
                            setSelectedQuestions([]);
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="selectAll" className="text-sm font-medium text-blue-600 cursor-pointer">
                        Select All ({questionsList.length})
                      </label>
                    </div>
                  )}
                </div>
                {questionsList.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3">
                      {questionsList.map((q, index) => (
                        <div key={q.question_id} className="flex items-start gap-3 p-3 bg-white rounded border">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(String(q.question_id))}
                            onChange={(e) => {
                              const questionId = String(q.question_id);
                              if (e.target.checked) {
                                setSelectedQuestions([...selectedQuestions, questionId]);
                              } else {
                                setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-blue-600"
                          />
                          <label className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-600">Q{index + 1}.</span>
                            </div>
                            <p className="text-gray-800">{q.question || q.question_text}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                    {formData.unit ? "No questions available for this unit" : "Please select a unit to view questions"}
                  </div>
                )}
                {selectedQuestions.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-blue-600">
                      {selectedQuestions.length} of {questionsList.length} question(s) selected
                    </span>
                    {selectedQuestions.length > 0 && selectedQuestions.length < questionsList.length && (
                      <button
                        type="button"
                        onClick={() => setSelectedQuestions([])}
                        className="text-red-500 hover:text-red-700 underline"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {alert}
    </div>
  );
}