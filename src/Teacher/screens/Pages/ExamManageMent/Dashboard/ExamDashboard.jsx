import { useEffect, useState } from "react";
import { examgService } from "../../ExamManageMent/Services/Exam.service";

const ExamDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get collegeId from localStorage
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

   const teacher = JSON.parse(localStorage.getItem("userProfile"));
   const teacherId = teacher?.teacher_id;

  useEffect(() => {
    if (!collegeId) {
      console.warn("College ID not found in localStorage");
      setLoading(false);
      return;
    }

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => {
        setExams(res || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching exam duties:", error);
        setLoading(false);
      });
  }, [collegeId]);

  // ✅ Helper to format dates safely
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(); // Default: MM/DD/YYYY, you can customize
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="rounded-xl shadow overflow-hidden bg-white">
        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Course</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Allocated By</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Start Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">End Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper / Duty</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Marks Entry</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-700 text-lg"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              exams.map((item, index) => {
                const subject = item.teacher_subject_duties?.[0] || {};
                const duty = item.duty_assignments?.[0] || {};

                return (
                  <tr key={index} className="border-t">
                    {/* Exam Name */}
                    <td className="px-4 py-3">{duty?.notes || "Exam Duty"}</td>

                    {/* Course */}
                    <td className="px-4 py-3">{subject?.subject_name || "-"}</td>

                    {/* Allocated By */}
                    <td className="px-4 py-3">
                      {item.teacher_first_name} {item.teacher_last_name}
                    </td>

                    {/* Start Date */}
                    <td className="px-4 py-3">{formatDate(duty?.start_date)}</td>

                    {/* End Date */}
                    <td className="px-4 py-3">{formatDate(duty?.end_date)}</td>

                    {/* Paper / Duty Type */}
                    <td className="px-4 py-3">{duty?.duty_type || "-"}</td>

                    {/* Marks Entry */}
                    <td className="px-4 py-3">
                      {duty?.duty_type === "MARKS_ENTRY" ? (
                        <button className="text-blue-600 hover:underline">
                          Enter Marks
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <p className="text-gray-600">Showing {exams.length} entries</p>

          <div className="flex items-center border rounded overflow-hidden">
            <button
              disabled
              className="px-4 py-2 text-gray-400 cursor-not-allowed"
            >
              Previous
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white">1</button>

            <button
              disabled
              className="px-4 py-2 text-gray-400 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;
