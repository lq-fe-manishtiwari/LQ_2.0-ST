import React, { useEffect, useState } from "react";
import { examgService } from "../Services/Exam.service";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const ReEvaluation = () => {
  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  const [examSchedules, setExamSchedules] = useState([]);
  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState("");
  const [revaluationRequests, setRevaluationRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [marksDistribution, setMarksDistribution] = useState(null);

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
     Fetch Revaluation Requests
  ==========================*/
  const handleExamScheduleChange = async (e) => {
    const examScheduleId = e.target.value;
    setSelectedExamScheduleId(examScheduleId);

    if (!examScheduleId) return;

    setLoading(true);
    try {
      const data = await examgService.getTeacherRevaluationRequests(
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

  /* =========================
     Open Modal
  ==========================*/
  const openModal = (req) => {
    setSelectedRequest(req);
    setUpdatedMarks(req.new_marks_obtained ?? "");
    setAttendanceStatus(req.attendance_status ?? "PRESENT");
    setMarksDistribution(req.marks_distribution ?? null);
    setRemarks("");
    setShowModal(true);
  };

  /* =========================
     Submit Updated Marks
  ==========================*/
  const handleSubmit = async () => {
    if (!updatedMarks) {
      alert("Please enter updated marks");
      return;
    }

    const payload = {
      revaluation_request_id: selectedRequest.revaluation_request_id,
      new_marks_obtained: Number(updatedMarks),
      new_attendance_status: attendanceStatus,
      newMarksDistribution: marksDistribution,
      reviewComments: remarks,
    };

    try {
      setLoading(true);

      await examgService.updateRevaluationMarks(
        selectedRequest.revaluation_request_id,
        payload,
        teacherId
      );

      // 🔄 Update UI
      setRevaluationRequests((prev) =>
        prev.map((item) =>
          item.revaluation_request_id ===
          selectedRequest.revaluation_request_id
            ? {
                ...item,
                new_marks_obtained: Number(updatedMarks),
                request_status: "APPROVED",
              }
            : item
        )
      );

      setShowModal(false);
    } catch (error) {
      console.error("Error updating marks", error);
      alert("Failed to update marks");
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
              <tr>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Request ID</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Request Date</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Student</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Exam</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Previous</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Updated</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : revaluationRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                revaluationRequests.map((req) => (
                  <tr
                    key={req.revaluation_request_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      #{req.revaluation_request_id}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{req.student_name}</td>
                    <td className="px-4 py-3">{req.exam_schedule_name}</td>
                    <td className="px-4 py-3">{req.subject_name}</td>
                    <td className="px-4 py-3">{req.old_marks_obtained}</td>
                    <td className="px-4 py-3">
                      {req.new_marks_obtained ?? "-"}
                    </td>
                    <td className="px-4 py-3">{req.request_status}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(req)}
                        className="text-blue-600 hover:text-blue-800"
                        // disabled={req.request_status !== "PENDING"}
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            MOBILE VIEW
        ==========================*/}
        <div className="md:hidden p-4 space-y-4">
          {revaluationRequests.map((req) => (
            <div
              key={req.revaluation_request_id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between">
                <div className="font-semibold">{req.student_name}</div>
                <button
                  onClick={() => openModal(req)}
                  disabled={req.request_status !== "PENDING"}
                >
                  <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {req.exam_schedule_name} – {req.subject_name}
              </div>

              <div className="text-sm mt-2">
                <div>Previous: {req.old_marks_obtained}</div>
                <div>Updated: {req.new_marks_obtained ?? "-"}</div>
                <div>Status: {req.request_status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================
          MODAL
      ==========================*/}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Update Re-Evaluation Marks</h2>

            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Student:</strong> {selectedRequest.student_name}</div>
              <div><strong>Subject:</strong> {selectedRequest.subject_name}</div>
              <div><strong>Previous Marks:</strong> {selectedRequest.old_marks_obtained}</div>
            </div>

            <input
              type="number"
              placeholder="Updated Marks"
              value={updatedMarks}
              onChange={(e) => setUpdatedMarks(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <select
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>

            <textarea
              placeholder="Review Comments"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReEvaluation;
