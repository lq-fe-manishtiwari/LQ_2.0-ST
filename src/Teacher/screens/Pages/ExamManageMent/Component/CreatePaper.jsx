import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

const CustomSelect = ({ label, value, placeholder, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"
          }`}
        >
          {value || placeholder}
        </button>
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

// Hard-coded questions (aap baad mein API se laa sakte ho)
const HARD_CODED_QUESTIONS = [
  {
    id: 1,
    question: "What is React?",
    options: ["A JavaScript library", "A database", "A programming language", "A CSS framework"],
  },
  {
    id: 2,
    question: "Which hook is used for state?",
    options: ["useEffect", "useRef", "useState", "useMemo"],
  },
  {
    id: 3,
    question: "JSX stands for?",
    options: ["Java Syntax Extension", "JavaScript XML", "JSON XML", "Java Source X"],
  },
];

const CreatePaper = ({ dutyId, onClose }) => {
  const [sections, setSections] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    paper_name: "",
    paper_description: "",
    exam_schedule_id: "",
    subject_id: "",
    exam_tool_id: "",
    start_date_time: "",
    end_date_time: "",
    exam_duration: "",
    remark: "",
    min_marks: "",
    max_marks: "",
  });

  const [filters, setFilters] = useState({
    program: "",
    batch: "",
    academicYear: "",
    semester: "",
    division: "",
  });

  // Mock data (real mein API se aayega)
  const [programs] = useState([
    { program_id: 1, program_name: "B.Tech" },
    { program_id: 2, program_name: "M.Tech" },
  ]);
  const [batches] = useState([
    { batch_id: 101, batch_name: "2022-2026" },
    { batch_id: 102, batch_name: "2023-2027" },
  ]);
  const [academicYears] = useState([
    { academic_year_id: 2024, name: "2024-2025" },
    { academic_year_id: 2025, name: "2025-2026" },
  ]);
  const [semesters] = useState([
    { semester_id: 5, name: "Semester 5" },
    { semester_id: 6, name: "Semester 6" },
  ]);
  const [divisions] = useState([
    { division_id: "A", division_name: "Division A" },
    { division_id: "B", division_name: "Division B" },
  ]);

  const [examSchedules] = useState([
    {
      examScheduleId: 1,
      examScheduleName: "Mid Term Exam - Oct 2025",
      tool: { toolId: 1, toolName: "Online Proctored" },
      courses: [
        { subjectId: 101, subjectName: "Data Structures", startExamDateTime: "2025-10-15T10:00:00", endExamDateTime: "2025-10-15T13:00:00" },
        { subjectId: 102, subjectName: "Database Systems", startExamDateTime: "2025-10-16T14:00:00", endExamDateTime: "2025-10-16T17:00:00" },
      ],
    },
  ]);

  const [subjects, setSubjects] = useState([]);
  const [selectedToolName, setSelectedToolName] = useState("");

  // Add Section
  const addSection = () => {
    const newId = sections.length + 1;
    const newLetter = String.fromCharCode(65 + sections.length);
    setSections([
      ...sections,
      {
        id: newId,
        section_name: `Section ${newLetter}`,
        total_marks: 0,
        questions: 0,
        selectedQuestions: [],
      },
    ]);
  };

  const removeSection = (id) => {
    setSections(sections.filter((sec) => sec.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const toggleQuestion = (sectionId, question) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const exists = section.selectedQuestions.find((q) => q.id === question.id);
        return {
          ...section,
          selectedQuestions: exists
            ? section.selectedQuestions.filter((q) => q.id !== question.id)
            : [...section.selectedQuestions, question],
          questions: exists ? section.questions - 1 : section.questions + 1,
        };
      })
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fill subjects, tool, dates when schedule & subject selected
  useEffect(() => {
    if (!formData.exam_schedule_id) {
      setSubjects([]);
      setSelectedToolName("");
      return;
    }

    const selectedSchedule = examSchedules.find(
      (s) => Number(s.examScheduleId) === Number(formData.exam_schedule_id)
    );

    if (selectedSchedule?.courses) {
      setSubjects(
        selectedSchedule.courses.map((c) => ({
          subject_id: c.subjectId,
          subject_name: c.subjectName,
        }))
      );
      setFormData((prev) => ({
        ...prev,
        exam_tool_id: selectedSchedule.tool?.toolId || "",
      }));
      setSelectedToolName(selectedSchedule.tool?.toolName || "");
    }
  }, [formData.exam_schedule_id]);

  useEffect(() => {
    if (!formData.exam_schedule_id || !formData.subject_id) {
      setFormData((prev) => ({
        ...prev,
        start_date_time: "",
        end_date_time: "",
        exam_duration: "",
      }));
      return;
    }

    const selectedSchedule = examSchedules.find(
      (s) => Number(s.examScheduleId) === Number(formData.exam_schedule_id)
    );
    const selectedCourse = selectedSchedule?.courses.find(
      (c) => Number(c.subjectId) === Number(formData.subject_id)
    );

    if (!selectedCourse) return;

    const toDateTimeLocal = (iso) => iso ? iso.slice(0, 16) : "";

    const start = toDateTimeLocal(selectedCourse.startExamDateTime);
    const end = toDateTimeLocal(selectedCourse.endExamDateTime);

    let duration = "";
    if (start && end) {
      const diffMs = new Date(end) - new Date(start);
      duration = (diffMs / (1000 * 60 * 60)).toFixed(1);
    }

    setFormData((prev) => ({
      ...prev,
      start_date_time: start,
      end_date_time: end,
      exam_duration: duration,
    }));
  }, [formData.exam_schedule_id, formData.subject_id]);

  const isFormValid = () => {
    return (
      formData.paper_name &&
      formData.paper_description &&
      formData.exam_schedule_id &&
      formData.subject_id &&
      formData.start_date_time &&
      formData.end_date_time &&
      formData.exam_duration &&
      formData.min_marks !== "" &&
      formData.max_marks !== ""
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Paper Created:", { dutyId, formData, sections });
      alert("Exam Paper Created Successfully!");
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-gray-50 w-full max-w-6xl my-8 mx-4 rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800">Create Question Paper</h2>
            <p className="text-lg"><strong>Duty ID:</strong> {dutyId}</p>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <CustomSelect
                label="Program *"
                value={programs.find((p) => p.program_id === filters.program)?.program_name || ""}
                placeholder="Select Program"
                options={programs.map((p) => ({ label: p.program_name, value: p.program_id }))}
                onChange={(opt) => setFilters({ program: opt.value, batch: "", academicYear: "", semester: "", division: "" })}
              />
              <CustomSelect
                label="Batch *"
                value={batches.find((b) => b.batch_id === filters.batch)?.batch_name || ""}
                placeholder="Select Batch"
                disabled={!filters.program}
                options={batches.map((b) => ({ label: b.batch_name, value: b.batch_id }))}
                onChange={(opt) => setFilters((prev) => ({ ...prev, batch: opt.value }))}
              />
              <CustomSelect
                label="Academic Year *"
                value={academicYears.find((a) => a.academic_year_id === filters.academicYear)?.name || ""}
                placeholder="Select Year"
                disabled={!filters.batch}
                options={academicYears.map((a) => ({ label: a.name, value: a.academic_year_id }))}
                onChange={(opt) => setFilters((prev) => ({ ...prev, academicYear: opt.value }))}
              />
              <CustomSelect
                label="Semester *"
                value={semesters.find((s) => s.semester_id === filters.semester)?.name || ""}
                placeholder="Select Semester"
                disabled={!filters.academicYear}
                options={semesters.map((s) => ({ label: s.name, value: s.semester_id }))}
                onChange={(opt) => setFilters((prev) => ({ ...prev, semester: opt.value }))}
              />
              <CustomSelect
                label="Division *"
                value={divisions.find((d) => d.division_id === filters.division)?.division_name || ""}
                placeholder="Select Division"
                disabled={!filters.semester}
                options={divisions.map((d) => ({ label: d.division_name, value: d.division_id }))}
                onChange={(opt) => setFilters((prev) => ({ ...prev, division: opt.value }))}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6">
              {/* Form fields same as AddExamPaper */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Name *</label>
                  <input type="text" name="paper_name" value={formData.paper_name} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Description *</label>
                  <input type="text" name="paper_description" value={formData.paper_description} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Schedule *</label>
                  <select name="exam_schedule_id" value={formData.exam_schedule_id} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5">
                    <option value="">Select Schedule</option>
                    {examSchedules.map((s) => (
                      <option key={s.examScheduleId} value={s.examScheduleId}>{s.examScheduleName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select name="subject_id" value={formData.subject_id} onChange={handleFormChange} required disabled={!formData.exam_schedule_id} className="w-full border rounded-lg px-4 py-2.5">
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.subject_id} value={sub.subject_id}>{sub.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Marks *</label>
                  <input type="number" name="min_marks" value={formData.min_marks} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks *</label>
                  <input type="number" name="max_marks" value={formData.max_marks} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Tool</label>
                  <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-50">{selectedToolName || "Auto-filled"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                  <input type="datetime-local" name="start_date_time" value={formData.start_date_time} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                  <input type="datetime-local" name="end_date_time" value={formData.end_date_time} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                  <input type="number" step="0.5" name="exam_duration" value={formData.exam_duration} onChange={handleFormChange} required className="w-full border rounded-lg px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <input type="text" name="remark" value={formData.remark} onChange={handleFormChange} className="w-full border rounded-lg px-4 py-2.5" />
                </div>
              </div>
            </div>

            {/* Sections */}
            {sections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Paper Sections</h2>
                {sections.map((section) => (
                  <div key={section.id} className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{section.section_name}</h3>
                      <button type="button" onClick={() => removeSection(section.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700">
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Section Name</label>
                        <input type="text" value={section.section_name} onChange={(e) => updateSection(section.id, "section_name", e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Marks</label>
                        <input type="number" value={section.total_marks} onChange={(e) => updateSection(section.id, "total_marks", e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Questions Count</label>
                        <input type="number" value={section.questions} readOnly className="w-full border rounded-lg px-4 py-2.5 bg-gray-100" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Select Questions</h4>
                      <div className="space-y-3">
                        {HARD_CODED_QUESTIONS.map((q) => {
                          const isChecked = section.selectedQuestions.some((sq) => sq.id === q.id);
                          return (
                            <label key={q.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input type="checkbox" checked={isChecked} onChange={() => toggleQuestion(section.id, q)} className="mt-1" />
                              <div>
                                <p className="font-medium">{q.question}</p>
                                <ul className="list-disc ml-5 text-sm text-gray-600">
                                  {q.options.map((opt, i) => (
                                    <li key={i}>{opt}</li>
                                  ))}
                                </ul>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button type="button" onClick={addSection} className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700">
                <Plus size={18} /> Add Section
              </button>

              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={() => setShowPreview(true)} className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Preview
                </button>
                <button type="submit" disabled={loading || !isFormValid()} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Creating..." : "Create Paper"}
                </button>
              </div>
            </div>
          </form>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
              <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 text-center">Exam Paper Preview</h2>
                <p className="text-lg font-semibold mb-6 text-center">{formData.paper_name || "Untitled Paper"}</p>

                {sections.map((section) => (
                  <div key={section.id} className="mb-8">
                    <h3 className="font-bold text-lg mb-4">{section.section_name}</h3>
                    {section.selectedQuestions.length === 0 ? (
                      <p className="text-gray-500 italic">No questions selected</p>
                    ) : (
                      section.selectedQuestions.map((q, idx) => (
                        <div key={q.id} className="mb-5">
                          <p className="font-medium">{idx + 1}. {q.question}</p>
                          <ul className="ml-6 mt-2 space-y-1">
                            {q.options.map((opt, i) => (
                              <li key={i}>{String.fromCharCode(65 + i)}. {opt}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                ))}

                <div className="flex justify-end mt-8">
                  <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-gray-600 text-white rounded-lg">
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePaper;