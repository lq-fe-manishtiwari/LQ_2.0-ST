import React, { useEffect, useState } from "react";
import { examgService } from "../../ExamManageMent/Services/Exam.service";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ teacherId from localStorage
  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    examgService
      .getExamSchedulesByTeacher(teacherId)
      .then((res) => {
        setSchedules(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teacherId]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(schedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = schedules.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ✅ Format Date
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  // ✅ Format Time
  const formatTime = (dateTimeStr) =>
    dateTimeStr
      ? new Date(dateTimeStr).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Classroom</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Course</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Start Time</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">End Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No exam schedules found
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">
                    {item.exam_schedule_name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    Room {item.classroom_id || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {item.subject_name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(item.exam_date)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTime(item.start_exam_date_time)}
                  </td>
                  <td className="px-4 py-3">
                    {formatTime(item.end_exam_date_time)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ✅ Footer with Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <p className="text-gray-600">
            Showing {currentData.length} of {schedules.length} entries
          </p>

          <div className="flex items-center border rounded overflow-hidden">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white">
              {currentPage}
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
