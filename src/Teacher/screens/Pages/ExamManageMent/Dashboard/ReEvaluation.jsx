import React, { useEffect, useState } from "react";
import { examgService } from "../Services/Exam.service";

const ReEvaluation = () => {
  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  const [examSchedules, setExamSchedules] = useState([]);
  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState("");
  const [revaluationRequests, setRevaluationRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     Fetch Exam Schedules
  ==========================*/
  useEffect(() => {
    if (!teacherId) return;

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => setExamSchedules(res || []))
      .catch((err) => console.error(err));
  }, [teacherId]);

  /* =========================
     Fetch Revaluation Requests
  ==========================*/
  const handleExamScheduleChange = async (e) => {
    const examScheduleId = e.target.value;
    setSelectedExamScheduleId(examScheduleId);

    if (!examScheduleId) return;

    setLoading(true);
    try {
      const data =
        await examgService.getTeacherRevaluationRequests(
          teacherId,
          examScheduleId
        );
      setRevaluationRequests(data || []);
    } catch (err) {
      console.error(err);
      setRevaluationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* =========================
            Exam Schedule Dropdown
        ==========================*/}
        <div className="p-4">
          <select
            className="border rounded-lg px-4 py-2 w-96"
            value={selectedExamScheduleId}
            onChange={handleExamScheduleChange}
          >
            <option value="">Select Exam Schedule</option>
            {examSchedules.map((exam) => (
              <option key={exam.exam_schedule_id} value={exam.exam_schedule_id}>
                {exam.exam_schedule_name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
            Table
        ==========================*/}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#2162c1] text-white">
                <th className="px-4 py-4">Request ID</th>
                <th className="px-4 py-4">Request Date</th>
                <th className="px-4 py-4">Student Name</th>
                <th className="px-4 py-4">Grade</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Exam Name</th>
                <th className="px-4 py-4">Subject</th>
                <th className="px-4 py-4">Previous Marks</th>
                <th className="px-4 py-4">Updated Marks</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : revaluationRequests.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-gray-500">
                    No matching records found
                  </td>
                </tr>
              ) : (
                revaluationRequests.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="px-4 py-3">{req.id}</td>
                    <td className="px-4 py-3">{req.request_date}</td>
                    <td className="px-4 py-3">{req.student_name}</td>
                    <td className="px-4 py-3">{req.grade}</td>
                    <td className="px-4 py-3">{req.class_name}</td>
                    <td className="px-4 py-3">{req.exam_name}</td>
                    <td className="px-4 py-3">{req.subject_name}</td>
                    <td className="px-4 py-3">{req.previous_marks}</td>
                    <td className="px-4 py-3">
                      {req.updated_marks ?? "-"}
                    </td>
                    <td className="px-4 py-3">{req.status}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:underline">
                        Update Marks
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            Footer
        ==========================*/}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-gray-500">
            Showing {revaluationRequests.length} entries
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReEvaluation;
