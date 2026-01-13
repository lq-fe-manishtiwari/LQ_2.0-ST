import React, { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { examPaperService } from "../Services/ExamPaper.Service";
import { Plus, Trash2 } from "lucide-react";

const EditPaper = ({ paper, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // dropdown data
  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examTools, setExamTools] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [sections, setSections] = useState([]);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

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

  // ─────────────────────────────────────────────
  // Load dropdown data
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!collegeId) return;

    const loadData = async () => {
      const [
        scheduleRes,
        subjectRes,
        toolRes,
        semesterRes,
      ] = await Promise.all([
        examPaperService.getExamSchedules(collegeId),
        examPaperService.getSubjects(collegeId),
        examPaperService.getExamTools(),
        examPaperService.getSemesters(collegeId),
      ]);

      setExamSchedules(scheduleRes || []);
      setSubjects(subjectRes || []);
      setExamTools(toolRes || []);
      setSemesters(semesterRes || []);
    };

    loadData();
  }, [collegeId]);

  // ─────────────────────────────────────────────
  // Prefill edit data
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!paper) return;

    setFormData({
      paper_name: paper.paper_name,
      paper_description: paper.paper_description,
      exam_schedule_id: String(paper.exam_schedule_id),
      subject_id: String(paper.subject_id),
      exam_tool_id: String(paper.exam_tool_id),
      semester_id: String(paper.semester_id),
      start_date_time: paper.start_date_time?.slice(0, 16),
      end_date_time: paper.end_date_time?.slice(0, 16),
      exam_duration: (paper.exam_duration / 60).toString(),
      min_marks: paper.min_marks,
      max_marks: paper.max_marks,
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
  }, [paper]);

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
    setSections(sections.filter((s) => s.id !== id));
  };

  // ─────────────────────────────────────────────
  // Submit update
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        exam_duration: Number(formData.exam_duration) * 60,
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
        <SweetAlert success title="Updated">
          Exam paper updated successfully
        </SweetAlert>
      );

      onSuccess?.();
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert danger title="Error">
          Failed to update exam paper
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {alert}

      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Edit Exam Paper
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFO */}
        <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-6">
          <select
            name="exam_schedule_id"
            value={formData.exam_schedule_id}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Exam Schedule</option>
            {examSchedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.exam_schedule_name}
              </option>
            ))}
          </select>

          <select
            name="semester_id"
            value={formData.semester_id}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>

          <select
            name="exam_tool_id"
            value={formData.exam_tool_id}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Exam Tool</option>
            {examTools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tool_name}
              </option>
            ))}
          </select>

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
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Section
        </button>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Updating..." : "Update Paper"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPaper;
