import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { examPaperService } from "../Services/ExamPaper.Service";

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

const CreatePaper = ({ dutyId, examSchedule, subjectId, subjectName, onClose }) => {
  const [sections, setSections] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    paper_name: "",
    paper_description: "",
    exam_schedule_id: examSchedule?.examScheduleId || "",
    subject_id: subjectId || "",
    exam_tool_id: "",
    start_date_time: "",
    end_date_time: "",
    exam_duration: "",
    remark: "",
    min_marks: "",
    max_marks: "",
  });

  const [selectedToolName, setSelectedToolName] = useState("");

  // Helper to format datetime for <input type="datetime-local">
  const toDateTimeLocal = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };

  // Auto-fill tool name, start/end time, and duration directly from props
  useEffect(() => {
    console.log('examSchedule in CreatePaper:', examSchedule);
    console.log('subjectId in CreatePaper:', subjectId);
    
    if (!examSchedule || !subjectId) return;

    // Tool name / ID
    setSelectedToolName(examSchedule.examToolTypeName || "Theory");

    // Find the course that matches the selected subject
    const matchingCourse = examSchedule.courses?.find(
      (course) => String(course.subjectId) === String(subjectId)
    );

    console.log('matchingCourse found:', matchingCourse);

    if (matchingCourse) {
      const start = toDateTimeLocal(matchingCourse.startExamDateTime);
      const end = toDateTimeLocal(matchingCourse.endExamDateTime);

      let duration = "";
      if (start && end) {
        const diffMs = new Date(end) - new Date(start);
        duration = (diffMs / (1000 * 60 * 60)).toFixed(1); // hours with 1 decimal
      }

      setFormData((prev) => ({
        ...prev,
        start_date_time: start,
        end_date_time: end,
        exam_duration: duration,
      }));
    }
  }, [examSchedule, subjectId]);

  // Add a new section
  const addSection = () => {
    const newId = sections.length + 1;
    const newLetter = String.fromCharCode(65 + sections.length); // A, B, C...
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

  // Remove a section
  const removeSection = (id) => {
    setSections(sections.filter((sec) => sec.id !== id));
  };

  // Update section fields
  const updateSection = (id, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  // Toggle question selection in a section
  const toggleQuestion = (sectionId, question) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const exists = section.selectedQuestions.some((q) => q.id === question.id);
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

  // Form validation
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

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      const collegeId = activeCollege?.id;
      const teacherId = userProfile?.teacher_id;

      const paperData = {
        paper_name: formData.paper_name,
        paper_description: formData.paper_description,
        exam_schedule_id: Number(formData.exam_schedule_id),
        subject_id: Number(formData.subject_id),
        exam_tool_id: Number(formData.exam_tool_id || 1),
        college_id: Number(collegeId),
        teacher_id: Number(teacherId),
        start_date_time: formData.start_date_time,
        end_date_time: formData.end_date_time,
        exam_duration: Number(formData.exam_duration),
        remark: formData.remark,
        min_marks: Number(formData.min_marks),
        max_marks: Number(formData.max_marks),
        sections: sections.map((sec) => ({
          section_name: sec.section_name,
          total_marks: Number(sec.total_marks),
          questions: sec.questions,
        })),
      };

      await examPaperService.saveExampaper(paperData);
      alert("Exam Paper Created Successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to create paper:", error);
      alert("Failed to create exam paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-gray-50 w-full max-w-5xl my-8 mx-4 rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-8">
          {/* Exam Schedule Details Card */}
          <div className="bg-blue-50 rounded-lg p-5 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Exam Schedule Details</h3>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Exam Schedule:</span>
                <p className="text-gray-900 font-semibold">{examSchedule?.examScheduleName || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Subject:</span>
                <p className="text-gray-900 font-semibold">{subjectName || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Academic Year:</span>
                <p className="text-gray-800">{examSchedule?.academicYear || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Semester:</span>
                <p className="text-gray-800">{examSchedule?.semester || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Division:</span>
                <p className="text-gray-800">{examSchedule?.division || "N/A"}</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-blue-800 mb-8">Create Question Paper</h2>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6">
              {/* Paper Name & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Name *</label>
                  <input
                    type="text"
                    name="paper_name"
                    value={formData.paper_name}
                    onChange={handleFormChange}
                    placeholder="Enter paper name"
                    required
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Description *</label>
                  <input
                    type="text"
                    name="paper_description"
                    value={formData.paper_description}
                    onChange={handleFormChange}
                    placeholder="Short description"
                    required
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Marks *</label>
                  <input
                    type="number"
                    name="min_marks"
                    value={formData.min_marks}
                    onChange={handleFormChange}
                    placeholder="e.g. 35"
                    min="0"
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    name="max_marks"
                    value={formData.max_marks}
                    onChange={handleFormChange}
                    placeholder="e.g. 100"
                    min="0"
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Tool</label>
                  <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700">
                    {selectedToolName || "Auto-filled"}
                  </div>
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="start_date_time"
                    value={formData.start_date_time}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="end_date_time"
                    value={formData.end_date_time}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    name="exam_duration"
                    value={formData.exam_duration}
                    onChange={handleFormChange}
                    placeholder="Auto-calculated"
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark (optional)</label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleFormChange}
                  placeholder="Any additional notes"
                  className="w-full border rounded-lg px-4 py-2.5"
                />
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
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Section Name</label>
                        <input
                          type="text"
                          value={section.section_name}
                          onChange={(e) => updateSection(section.id, "section_name", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Marks</label>
                        <input
                          type="number"
                          value={section.total_marks}
                          onChange={(e) => updateSection(section.id, "total_marks", e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full border rounded-lg px-4 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Questions Count</label>
                        <input
                          type="number"
                          value={section.questions}
                          readOnly
                          className="w-full border rounded-lg px-4 py-2.5 bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Select Questions</h4>
                      <div className="space-y-3">
                        {HARD_CODED_QUESTIONS.map((q) => {
                          const isChecked = section.selectedQuestions.some((sq) => sq.id === q.id);
                          return (
                            <label
                              key={q.id}
                              className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleQuestion(section.id, q)}
                                className="mt-1"
                              />
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <button
                type="button"
                onClick={addSection}
                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus size={18} /> Add Section
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                <p className="text-lg font-semibold mb-6 text-center">
                  {formData.paper_name || "Untitled Paper"}
                </p>

                {sections.length === 0 ? (
                  <p className="text-center text-gray-500">No sections added yet.</p>
                ) : (
                  sections.map((section) => (
                    <div key={section.id} className="mb-8">
                      <h3 className="font-bold text-lg mb-4">{section.section_name}</h3>
                      {section.selectedQuestions.length === 0 ? (
                        <p className="text-gray-500 italic">No questions selected</p>
                      ) : (
                        section.selectedQuestions.map((q, idx) => (
                          <div key={q.id} className="mb-5">
                            <p className="font-medium">
                              {idx + 1}. {q.question}
                            </p>
                            <ul className="ml-6 mt-2 space-y-1">
                              {q.options.map((opt, i) => (
                                <li key={i}>
                                  {String.fromCharCode(65 + i)}. {opt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  ))
                )}

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg"
                  >
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