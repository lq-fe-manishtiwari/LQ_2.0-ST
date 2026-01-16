import React, { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { examPaperService } from "../Services/ExamPaper.Service";
import { fetchExamScheduleById } from "../Services/examSchedule.graphql.service";
import { Plus, Trash2 } from "lucide-react";

const EditPaper = ({ paper, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // dropdown data
  const [examSchedule, setExamSchedule] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [sections, setSections] = useState([]);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = userProfile?.teacher_id;

  const [formData, setFormData] = useState({
    paper_name: "",
    paper_description: "",
    exam_schedule_id: "",
    subject_id: "",
    exam_tool_id: "",
    semester_id: "",
    start_date_time: "",
    end_date_time: "",
    exam_duration: "",
    min_marks: "",
    max_marks: "",
    remark: "",
  });

  // Load schedule details and dependent data
  useEffect(() => {
    if (!paper?.exam_schedule_id || !collegeId) return;

    const loadData = async () => {
      setLoadingSchedule(true);
      try {
        const scheduleData = await fetchExamScheduleById(paper.exam_schedule_id);

        setExamSchedule(scheduleData);

        if (scheduleData?.courses) {
          const courseSubjects = scheduleData.courses.map(course => ({
            id: course.subjectId,
            subject_name: course.subjectDetails?.subjectName || `Subject ${course.subjectId}`
          }));
          setSubjects(courseSubjects);
        }
      } catch (error) {
        console.error("Failed to load schedule/tool details:", error);
        setAlert(
          <SweetAlert
            danger
            title="Error"
            confirmBtnText="OK"
            confirmBtnBsStyle="danger"
            confirmBtnCssClass="btn-confirm fw-bold"
            onConfirm={() => setAlert(null)}
          >
            Failed to load required data.
          </SweetAlert>
        );
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadData();
  }, [paper?.exam_schedule_id, collegeId]);

  // ─────────────────────────────────────────────
  // Prefill edit data
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!paper || !examSchedule) return;

    const matchingCourse = examSchedule.courses?.find(
      (c) => String(c.subjectId) === String(paper.subject_id)
    );

    setFormData({
      paper_name: paper.paper_name,
      paper_description: paper.paper_description,
      exam_schedule_id: String(paper.exam_schedule_id),
      subject_id: String(paper.subject_id),
      exam_tool_id: String(matchingCourse?.tool?.toolId || paper.exam_tool_id || ""),
      semester_id: String(examSchedule.semesterId || paper.semester_id || ""),
      start_date_time: paper.start_date_time?.slice(0, 16),
      end_date_time: paper.end_date_time?.slice(0, 16),
      exam_duration: (paper.exam_duration / 60).toString(),
      min_marks: String(matchingCourse?.tool?.minimumMarks || paper.min_marks || ""),
      max_marks: String(matchingCourse?.tool?.maximumMarks || paper.max_marks || ""),
      remark: paper.remark || "",
    });

    if (paper.sections?.length) {
      setSections(
        paper.sections.map((s, i) => ({
          id: i + 1,
          section_name: s.section_name,
          total_marks: s.total_marks,
          questions: s.questions,
        }))
      );
    }
  }, [paper, examSchedule]);

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: sections.length + 1,
        section_name: `Section ${String.fromCharCode(65 + sections.length)}`,
        total_marks: 0,
        questions: 0,
      },
    ]);
  };

  const updateSection = (id, field, value) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSection = (id) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="OK"
        cancelBtnText="Cancel"
        confirmBtnBsStyle="warning"
        confirmBtnCssClass="btn-confirm fw-bold"
        cancelBtnBsStyle="default"
        title="Delete Section?"
        onConfirm={() => {
          setSections(sections.filter((s) => s.id !== id));
          setAlert(
            <SweetAlert
              success
              title="Deleted!"
              confirmBtnText="OK"
              confirmBtnBsStyle="success"
              confirmBtnCssClass="btn-confirm fw-bold"
              onConfirm={() => setAlert(null)}
            >
              Section removed successfully.
            </SweetAlert>
          );
        }}
        onCancel={() => setAlert(null)}
      >
        Are you sure you want to delete this section? This action cannot be undone.
      </SweetAlert>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        paper_name: formData.paper_name,
        paper_description: formData.paper_description,
        exam_schedule_id: Number(formData.exam_schedule_id),
        subject_id: Number(formData.subject_id),
        exam_tool_id: Number(formData.exam_tool_id),
        college_id: Number(collegeId),
        teacher_id: Number(teacherId),
        exam_duration: Number(formData.exam_duration) * 60,
        remark: formData.remark,
        min_marks: Number(formData.min_marks),
        max_marks: Number(formData.max_marks),
        start_date_time: `${formData.start_date_time}:00`,
        end_date_time: `${formData.end_date_time}:00`,
        sections: sections.map((s) => ({
          section_name: s.section_name,
          total_marks: Number(s.total_marks),
          questions: Number(s.questions),
        })),
      };

      await examPaperService.updateExamPaper(
        paper.exam_paper_id,
        payload
      );

      setAlert(
        <SweetAlert
          success
          title="Success!"
          confirmBtnText="OK"
          confirmBtnBsStyle="success"
          confirmBtnCssClass="btn-confirm fw-bold"
          onConfirm={() => {
            setAlert(null);
            onSuccess?.();
          }}
        >
          Exam paper updated successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnText="OK"
          confirmBtnBsStyle="danger"
          confirmBtnCssClass="btn-confirm fw-bold"
          onConfirm={() => setAlert(null)}
        >
          Failed to update exam paper. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  if (loadingSchedule) {
    return <div className="p-6 text-center">Loading paper details...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {alert}

      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Edit Exam Paper
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFO */}
        <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Schedule</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100">
              {examSchedule?.examScheduleName || "Loading..."}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100">
              {examSchedule?.semester?.name || "Loading..."}
            </div>
          </div>

            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={(e) => {
                const newSubjectId = e.target.value;
                const course = examSchedule?.courses?.find(c => String(c.subjectId) === String(newSubjectId));
                setFormData(prev => ({
                  ...prev,
                  subject_id: newSubjectId,
                  exam_tool_id: course?.tool?.toolId ? String(course.tool.toolId) : prev.exam_tool_id
                }));
              }}
            className="border rounded-lg px-4 py-2"
            >
              <option value="">Select Subject</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name}
                </option>
              ))}
            </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Tool</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {(() => {
                const course = examSchedule?.courses?.find(c => String(c.subjectId) === String(formData.subject_id));
                return course?.tool?.toolName || "Auto-filled";
              })()}
            </div>
          </div>

            <input
              name="paper_name"
              value={formData.paper_name}
              onChange={handleChange}
              placeholder="Paper Name"
            className="border rounded-lg px-4 py-2"
            />

            <input
              name="paper_description"
              value={formData.paper_description}
              onChange={handleChange}
              placeholder="Paper Description"
            className="border rounded-lg px-4 py-2"
            />
        </div>

        {/* DATE & MARKS */}
        <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-6">
            <input
              type="datetime-local"
              name="start_date_time"
              value={formData.start_date_time}
              onChange={handleChange}
            className="border rounded-lg px-4 py-2"
            />
            <input
              type="datetime-local"
              name="end_date_time"
              value={formData.end_date_time}
              onChange={handleChange}
            className="border rounded-lg px-4 py-2"
            />
            <input
              name="exam_duration"
              value={formData.exam_duration}
              onChange={handleChange}
              placeholder="Duration (hrs)"
            className="border rounded-lg px-4 py-2"
            />

            <input
              name="min_marks"
              value={formData.min_marks}
              onChange={handleChange}
              placeholder="Min Marks"
            className="border rounded-lg px-4 py-2"
            />
            <input
              name="max_marks"
              value={formData.max_marks}
              onChange={handleChange}
              placeholder="Max Marks"
            className="border rounded-lg px-4 py-2"
            />
            <input
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Remark"
            className="border rounded-lg px-4 py-2"
            />
        </div>

        {/* SECTIONS */}
        {sections.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between mb-4">
              <input
                value={s.section_name}
                onChange={(e) =>
                  updateSection(s.id, "section_name", e.target.value)
                }
                className="border px-3 py-2 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeSection(s.id)}
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                value={s.total_marks}
                onChange={(e) =>
                  updateSection(s.id, "total_marks", e.target.value)
                }
                placeholder="Total Marks"
                className="border px-3 py-2 rounded-lg"
              />
              <input
                value={s.questions}
                onChange={(e) =>
                  updateSection(s.id, "questions", e.target.value)
                }
                placeholder="Questions"
                className="border px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={18} /> Add Section
        </button>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Paper"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPaper;