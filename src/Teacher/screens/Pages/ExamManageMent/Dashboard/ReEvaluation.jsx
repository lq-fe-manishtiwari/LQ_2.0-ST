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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* =========================
            Exam Schedule Dropdown
        ==========================*/}
        <div className="p-4">
          <select
            className="border rounded-lg px-4 py-2 w-full sm:w-96"
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
        </div>

        {/* =========================
            TABLE VIEW (Desktop)
        ==========================*/}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="table-header">
              <tr className="bg-[#2162c1] text-white">
                <th className="px-4 py-3 bg-[#2162c1] text-white">Request ID</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Request Date</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Student Name</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Program</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Class</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Previous Marks</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Updated Marks</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Action</th>
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
                  <tr key={req.id} className="border-b hover:bg-gray-50">
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
            CARD VIEW (Mobile)
        ==========================*/}
        <div className="block md:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : revaluationRequests.length === 0 ? (
            <div className="text-center text-gray-500">
              No matching records found
            </div>
          ) : (
            revaluationRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg shadow border p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <div className="font-semibold text-lg">
                    {req.student_name}
                  </div>
                  <span className="text-sm text-gray-500">
                    #{req.id}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  Request Date: {req.request_date}
                </div>

                <div className="pt-2 border-t text-sm space-y-1">
                  <div><strong>Grade:</strong> {req.grade}</div>
                  <div><strong>Class:</strong> {req.class_name}</div>
                  <div><strong>Exam:</strong> {req.exam_name}</div>
                  <div><strong>Subject:</strong> {req.subject_name}</div>
                  <div><strong>Previous Marks:</strong> {req.previous_marks}</div>
                  <div className="font-semibold">
                    <strong>Updated Marks:</strong>{" "}
                    {req.updated_marks ?? "-"}
                  </div>
                  <div><strong>Status:</strong> {req.status}</div>
                </div>

                <button className="mt-2 w-full text-blue-600 border border-blue-600 rounded-lg py-2 hover:bg-blue-50">
                  Update Marks
                </button>
              </div>
            ))
          )}
        </div>

        {/* =========================
            Footer
        ==========================*/}
        <div className="px-6 py-4 text-gray-500 text-center sm:text-left">
          Showing {revaluationRequests.length} entries
        </div>
      </div>
    </div>
  );
};

export default ReEvaluation;
