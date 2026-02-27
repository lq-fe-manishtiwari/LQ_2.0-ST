import React, { useEffect, useState } from "react";
import { examgService } from "../Services/Exam.service";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

const MarksEntry = () => {
  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState([]);

  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     Fetch Exam Schedules
  ==========================*/
  useEffect(() => {
    if (!teacherId) return;

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => setExamSchedules(res || []))
      .catch(console.error);
  }, [teacherId]);

  /* =========================
     Handle Exam Schedule Change
  ==========================*/
  const handleExamScheduleChange = (e) => {
    const scheduleId = Number(e.target.value);

    setSelectedExamScheduleId(scheduleId);
    setSelectedSubjectId("");
    setMarksData([]);
    setSubjects([]);

    if (!scheduleId) return;

    const selectedSchedule = examSchedules.find(
      (ex) => Number(ex.exam_schedule_id) === scheduleId
    );

    setSubjects(selectedSchedule?.teacher_subject_duties || []);
  };

  /* =========================
     Fetch Marks by Subject
  ==========================*/
  const handleSubjectChange = async (e) => {
    const subjectId = Number(e.target.value);
    setSelectedSubjectId(subjectId);

    if (!subjectId || !selectedExamScheduleId) return;

    setLoading(true);
    try {
      const response = await examMarksEntryService.getMarksBySchedule(
        selectedExamScheduleId,
        subjectId
      );

      const studentsList = response?.data || [];

      // Sort by roll number
      studentsList.sort(
        (a, b) =>
          parseInt(a.roll_number || 0) - parseInt(b.roll_number || 0)
      );

      setMarksData(studentsList);
    } catch (err) {
      console.error(err);
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* ========================= Filters ========================== */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
          <select
            className="border rounded-lg px-4 py-2 w-full sm:w-80"
            value={selectedExamScheduleId}
            onChange={handleExamScheduleChange}
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
            className="border rounded-lg px-4 py-2 w-full sm:w-72"
            value={selectedSubjectId}
            onChange={handleSubjectChange}
            disabled={!subjects.length}
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.subject_id} value={sub.subject_id}>
                {sub.subject_name}
              </option>
            ))}
          </select>
        </div>

        {/* ========================= DESKTOP TABLE ========================== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2162c1] text-white">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">ERN</th>
                <th className="px-4 py-3">Paper</th>
                <th className="px-4 py-3">Exam Type</th>
                <th className="px-4 py-3">Max Marks</th>
                <th className="px-4 py-3">Marks Obtained</th>
                <th className="px-4 py-3">Min Marks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : marksData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                marksData.map((row, index) => {
                  const subject =
                    row.subject_marks?.find(
                      (sub) =>
                        Number(sub.subject_id) ===
                        Number(selectedSubjectId)
                    ) || {};

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {row.student_firstname} {row.student_lastname}
                      </td>
                      <td className="px-4 py-3">{row.roll_number}</td>
                      <td className="px-4 py-3">
                        {row.permanent_registration_number}
                      </td>
                      <td className="px-4 py-3">
                        {subject.subject_name || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {subject.exam_type || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {subject.maximum_marks ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {subject.marks_obtained ?? "Not Entered"}
                      </td>
                      <td className="px-4 py-3">
                        {subject.minimum_marks ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                          {subject.attendance_status || "Not Marked"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================= MOBILE VIEW ========================== */}
        <div className="block md:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : marksData.length === 0 ? (
            <div className="text-center text-gray-500">
              No records found
            </div>
          ) : (
            marksData.map((row, index) => {
              const subject =
                row.subject_marks?.find(
                  (sub) =>
                    Number(sub.subject_id) ===
                    Number(selectedSubjectId)
                ) || {};

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow border p-4 space-y-2"
                >
                  <div className="font-semibold text-lg">
                    {row.student_firstname} {row.student_lastname}
                  </div>

                  <div className="text-sm text-gray-600">
                    Roll No: {row.roll_number}
                  </div>

                  <div className="text-sm text-gray-600">
                    PRN: {row.permanent_registration_number}
                  </div>

                  <div className="pt-2 border-t text-sm space-y-1">
                    <div>
                      <strong>Subject:</strong>{" "}
                      {subject.subject_name || "N/A"}
                    </div>
                    <div>
                      <strong>Exam:</strong>{" "}
                      {subject.exam_type || "-"}
                    </div>
                    <div>
                      <strong>Max Marks:</strong>{" "}
                      {subject.maximum_marks ?? "-"}
                    </div>
                    <div className="font-semibold">
                      <strong>Marks Obtained:</strong>{" "}
                      {subject.marks_obtained ?? "Not Entered"}
                    </div>
                    <div>
                      <strong>Min Marks:</strong>{" "}
                      {subject.minimum_marks ?? "-"}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {subject.attendance_status || "Not Marked"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================= Footer ========================== */}
        <div className="px-6 py-4 text-gray-500 text-center sm:text-left">
          Showing {marksData.length} entries
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;