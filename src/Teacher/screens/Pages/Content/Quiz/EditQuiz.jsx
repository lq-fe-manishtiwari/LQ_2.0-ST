import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";

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

  const selectedOption = options.find(opt => String(opt.value) === String(value));

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

export default function EditQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quiz } = location.state || {};

  // Dummy data
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
    { module_name: "Arrays & Linked Lists", module_id: 1 },
    { module_name: "Trees & Graphs", module_id: 2 }
  ];
  
  const dummyUnits = [
    { unit_name: "Arrays", unit_id: 1 },
    { unit_name: "Linked Lists", unit_id: 2 },
    { unit_name: "Binary Trees", unit_id: 3 }
  ];
  
  const dummyQuestions = [
    { question_id: 1, question: "What is an array?", question_text: "What is an array?" },
    { question_id: 2, question: "How do linked lists work?", question_text: "How do linked lists work?" },
    { question_id: 3, question: "What is a binary tree?", question_text: "What is a binary tree?" }
  ];

  const [formData, setFormData] = useState({
    program: "1",
    className: "1",
    semester: "1",
    paper: "1",
    module: "1",
    unit: "1",
    quizName: quiz?.quiz_name || "Sample Quiz",
    duration: quiz?.duration || "30",
  });

  const [programs] = useState(dummyPrograms);
  const [classes] = useState(dummyClasses);
  const [semesters] = useState(dummySemesters);
  const [papers] = useState(dummyPapers);
  const [modules] = useState(dummyModules);
  const [units] = useState(dummyUnits);
  const [questionsList] = useState(dummyQuestions);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz?.questions) {
      setSelectedQuestions(quiz.questions.map(q => String(q.question_id || q.id)));
    }
  }, [quiz]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.quizName || !formData.duration || selectedQuestions.length === 0) {
      alert("Please fill all required fields and select at least one question");
      return;
    }

    setLoading(true);
    // Simple success message
    setTimeout(() => {
      alert("Quiz updated successfully!");
      navigate("/teacher/content/quiz-dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="stdLayout">
      <div className="content-wrapper flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.75rem] font-semibold text-[#2162c1]">Edit Quiz</h3>
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
                  options={modules.map(m => ({ label: m.module_name, value: String(m.module_id) }))}
                  placeholder="Select Module"
                  disabled={!formData.paper}
                />

                <CustomSelect
                  label="Unit *"
                  value={formData.unit}
                  onChange={(e) => handleChange({ target: { name: 'unit', value: e.target.value } })}
                  options={units.map(u => ({ label: u.unit_name, value: String(u.unit_id) }))}
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
                    No questions available
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
                  {loading ? 'Updating...' : 'Update Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/teacher/content/quiz-dashboard")}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}