import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { uploadFileToS3 } from "../../../../../_services/api";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";
import { examgService } from "../Services/Exam.service";
import { toast } from "react-toastify";

/* ================= USER ================= */
const teacher = JSON.parse(localStorage.getItem("userProfile"));
const teacherId = teacher?.teacher_id;

const AddAnswerSheet = () => {
  const navigate = useNavigate();

  /* ================= FILTERS ================= */
  const [filters, setFilters] = useState({
    schedule: "",
    paper: "",
  });

  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);

  /* ================= DATA ================= */
  const [students, setStudents] = useState([]);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sweetAlert, setSweetAlert] = useState(null);

  /* ================= LOAD EXAM SCHEDULES ================= */
  useEffect(() => {
    if (!teacherId) return;

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => setExamSchedules(res || []))
      .catch(console.error);
  }, []);

  /* ================= FILTER HANDLERS ================= */
  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;

    setFilters({ schedule: scheduleId, paper: "" });
    setStudents([]);
    setAnswerSheets([]);
    setSubjects([]);

    if (!scheduleId) return;

    const selectedSchedule = examSchedules.find(
      (ex) => ex.exam_schedule_id === Number(scheduleId)
    );

    setSubjects(selectedSchedule?.teacher_subject_duties || []);
  };

  const handlePaperChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      paper: e.target.value,
    }));
  };

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    const loadStudents = async () => {
      if (!filters.schedule || !filters.paper) {
        setStudents([]);
        setAnswerSheets([]);
        return;
      }

      setLoading(true);
      try {
        const res = await examMarksEntryService.getMarksBySchedule(
          filters.schedule,
          filters.paper
        );

        const list = res.data?.students || res.data || [];
        list.sort((a, b) => Number(a.roll_number) - Number(b.roll_number));

        setStudents(list);

        setAnswerSheets(
          list.map((s) => ({
            student_id: s.student_id,
            roll_number: s.roll_number,
            student_name: `${s.student_firstname || ""} ${s.student_lastname || ""}`,
            prn: s.permanent_registration_number || "",
            attendance_status: "PRESENT",
            answersheetUrl: "",
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [filters.schedule, filters.paper]);

  /* ================= FILE UPLOAD ================= */
  const handleFileUpload = async (studentId, file) => {
    if (!file) return;

    setUploadingId(studentId);
    toast.info("Uploading answer sheet...");

    try {
      const s3Url = await uploadFileToS3(file);

      setAnswerSheets((prev) =>
        prev.map((s) =>
          s.student_id === studentId
            ? { ...s, answersheetUrl: s3Url }
            : s
        )
      );

      toast.success("File uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  /* ================= ATTENDANCE ================= */
  const handleAttendanceChange = (studentId, value) => {
    setAnswerSheets((prev) =>
      prev.map((s) =>
        s.student_id === studentId
          ? { ...s, attendance_status: value }
          : s
      )
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid = answerSheets.filter((s) => s.answersheetUrl);

    if (!valid.length) {
      setSweetAlert(
        <SweetAlert
          warning
          title="Nothing to Submit"
          onConfirm={() => setSweetAlert(null)}
        >
          Please upload at least one answer sheet.
        </SweetAlert>
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = valid.map((s) => ({
        exam_schedule_id: Number(filters.schedule),
        subject_id: Number(filters.paper),
        student_id: s.student_id,
        attendance_status: s.attendance_status,
        marks_distribution: [{ answersheetUrl: s.answersheetUrl }],
      }));

      await examMarksEntryService.submitMarksBatch(payload);

      setSweetAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setSweetAlert(null);
            navigate("/exam-management/answer-sheets");
          }}
        >
          Answer sheets saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setSweetAlert(
        <SweetAlert
          danger
          title="Save Failed"
          onConfirm={() => setSweetAlert(null)}
        >
          Failed to save answer sheets.
        </SweetAlert>
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {sweetAlert}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-blue-900">
          Upload Answer Sheets
        </h4>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2162c1] text-white rounded-lg text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={filters.schedule}
            onChange={handleScheduleChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Exam Schedule</option>
            {examSchedules.map((exam) => (
              <option
                key={exam.exam_schedule_id}
                value={exam.exam_schedule_id}
              >
                {exam.exam_schedule_name}
              </option>
            ))}
          </select>

          <select
            value={filters.paper}
            onChange={handlePaperChange}
            disabled={!subjects.length}
            className="border rounded-lg px-4 py-2 disabled:bg-gray-100"
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

      {/* ================= LOADING ================= */}
      {loading && (
        <p className="text-center text-blue-600 font-medium mt-6">
          Loading students...
        </p>
      )}

      {/* ================= TABLE ================= */}
      {!loading && students.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-xl shadow bg-white">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-2 w-20 text-center">Roll</th>
                    <th className="px-4 py-2">Student</th>
                    <th className="px-4 py-2">PRN</th>
                    <th className="px-4 py-2 w-40 text-center">Attendance</th>
                    <th className="px-4 py-2 w-72 text-center">Answer Sheet</th>
                  </tr>
                </thead>

                <tbody>
                  {answerSheets.map((s) => (
                    <tr key={s.student_id} className="border-b">
                      <td className="px-4 py-3 text-center">
                        {s.roll_number}
                      </td>
                      <td className="px-4 py-3">{s.student_name}</td>
                      <td className="px-4 py-3 text-center">
                        {s.prn || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={s.attendance_status}
                          onChange={(e) =>
                            handleAttendanceChange(
                              s.student_id,
                              e.target.value
                            )
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="MALPRACTICE">Malpractice</option>
                          <option value="REVIEW_FOR_ENTRY">
                            Review for Entry
                          </option>
                        </select>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={uploadingId === s.student_id}
                          onChange={(e) =>
                            handleFileUpload(
                              s.student_id,
                              e.target.files[0]
                            )
                          }
                        />

                        {s.answersheetUrl && (
                          <div className="text-xs text-green-600 mt-1">
                            Uploaded ✓
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={
                submitting ||
                !answerSheets.some((s) => s.answersheetUrl)
              }
              className={`px-10 py-3 rounded-lg font-medium text-white ${
                submitting ||
                !answerSheets.some((s) => s.answersheetUrl)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Saving..." : "Save Answer Sheets"}
            </button>
          </div>
        </form>
      )}

      {!loading &&
        students.length === 0 &&
        filters.schedule &&
        filters.paper && (
          <div className="mt-10 text-center text-gray-500">
            No students found for selected schedule and subject.
          </div>
        )}
    </div>
  );
};

export default AddAnswerSheet;
