import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fetchExamScheduleById } from "../Services/examSchedule.graphql.service";
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

const CreatePaper = ({ dutyId, examScheduleId, onClose }) => {
  const [sections, setSections] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    paper_name: "",
    paper_description: "",
    exam_schedule_id: examScheduleId || "",
    subject_id: "",
    exam_tool_id: "",
    start_date_time: "",
    end_date_time: "",
    exam_duration: "",
    remark: "",
    min_marks: "",
    max_marks: "",
  });

  const [examScheduleData, setExamScheduleData] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedToolName, setSelectedToolName] = useState("");

  // Load exam schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!examScheduleId) return;
      
      setApiLoading(true);
      try {
        const response = await fetchExamScheduleById(examScheduleId);
        if (response) {
          const scheduleData = {
            examScheduleId: response.examScheduleId,
            examScheduleName: response.examScheduleName,
            academicYear: response.academicYear,
            semester: response.semester,
            division: response.division,
            tool: response.tool,
            courses: response.courses?.map(course => ({
              examScheduleCourseId: course.examScheduleCourseId,
              subjectId: course.subjectId,
              subjectName: course.subject?.subjectName || `Subject ${course.subjectId}`,
              examDate: course.examDate,
              startExamDateTime: course.startExamDateTime,
              endExamDateTime: course.endExamDateTime
            })) || []
          };
          setExamScheduleData(scheduleData);
        }
      } catch (error) {
        console.error('Failed to fetch exam schedule:', error);
      } finally {
        setApiLoading(false);
      }
    };

    fetchScheduleData();
  }, [examScheduleId]);

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

  // Load subjects & tool when exam schedule data is available
  useEffect(() => {
    if (!examScheduleData) {
      setSubjects([]);
      setSelectedToolName("");
      return;
    }

    if (examScheduleData.courses) {
      setSubjects(
        examScheduleData.courses.map((c) => ({
          subject_id: c.subjectId,
          subject_name: c.subjectName || `Subject ${c.subjectId}`,
        }))
      );
      setFormData((prev) => ({
        ...prev,
        exam_tool_id: examScheduleData.tool?.toolId || "",
      }));
      setSelectedToolName(examScheduleData.tool?.toolName || "");
    }
  }, [examScheduleData]);

  // Auto-fill dates & duration when subject selected
  useEffect(() => {
    if (!examScheduleData || !formData.subject_id) {
      setFormData((prev) => ({
        ...prev,
        start_date_time: "",
        end_date_time: "",
        exam_duration: "",
      }));
      return;
    }

    const selectedCourse = examScheduleData.courses?.find(
      (c) => Number(c.subjectId) === Number(formData.subject_id)
    );

    if (!selectedCourse) return;

    const toDateTimeLocal = (iso) => (iso && typeof iso === 'string' ? iso.slice(0, 16) : "");

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
  }, [examScheduleData, formData.subject_id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);

    try {
      const paperData = {
        paper_name: formData.paper_name,
        paper_description: formData.paper_description,
        exam_schedule_id: formData.exam_schedule_id,
        subject_id: formData.subject_id,
        exam_tool_id: formData.exam_tool_id,
        start_date_time: formData.start_date_time,
        end_date_time: formData.end_date_time,
        exam_duration: formData.exam_duration,
        remark: formData.remark,
        min_marks: formData.min_marks,
        max_marks: formData.max_marks,
        sections: sections
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
          {/* Exam Schedule Info Display */}
          {apiLoading ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-600">Loading exam schedule...</p>
            </div>
          ) : examScheduleData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Exam Schedule Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Academic Year:</span>
                  <p className="text-gray-800">{examScheduleData.academicYear?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Semester:</span>
                  <p className="text-gray-800">{examScheduleData.semester?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Division:</span>
                  <p className="text-gray-800">{examScheduleData.division?.divisionName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tool:</span>
                  <p className="text-gray-800">{examScheduleData.tool?.toolName}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800">Create Question Paper</h2>
            <p className="text-lg"><strong>Duty ID:</strong> {dutyId}</p>
          </div>

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

              {/* Exam Schedule & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Schedule *</label>
                  <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700">
                    {examScheduleData?.examScheduleName || "Loading..."}
                  </div>
                  <input type="hidden" name="exam_schedule_id" value={formData.exam_schedule_id} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleFormChange}
                    required
                    disabled={!examScheduleData}
                    className="w-full border rounded-lg px-4 py-2.5"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_name}
                      </option>
                    ))}
                  </select>
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
                    {selectedToolName || "Auto-filled after schedule selection"}
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