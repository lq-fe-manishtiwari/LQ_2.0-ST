import React, { useEffect, useState } from "react";
import { examPaperService } from "../Services/ExamPaper.Service";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const Paper = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const collegeId = activeCollege?.id;
  const teacherId = userProfile?.teacher_id;

  useEffect(() => {
    const fetchPapers = async () => {
      if (!collegeId || !teacherId) return;

      try {
        setLoading(true);
        const response = await examPaperService.getPaperByCollegeTeacher(collegeId, teacherId);
        setPapers(response || []);
      } catch (error) {
        console.error("Failed to fetch papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [collegeId, teacherId]);

  // Helper to format date/time
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // HH:MM
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="table-header">
            <tr className="bg-blue-600 text-white text-left">
               <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Schedule</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Program</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Semester</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Time</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 text-xl">
                  Loading...
                </td>
              </tr>
            ) : papers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 text-xl">
                  No matching records found
                </td>
              </tr>
            ) : (
              papers.map((paper) => (
                <tr key={paper.exam_paper_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{paper.exam_schedule_name}</td>
                  <td className="px-6 py-4">{paper.paper_name}</td>
                  <td className="px-6 py-4">{paper.academic_year?.program_name}</td>
                  <td className="px-6 py-4">{paper.semester?.name}</td>
                  <td className="px-6 py-4">{paper.subject_name}</td>
                  <td className="px-6 py-4">{formatDate(paper.start_date_time)}</td>
                  <td className="px-6 py-4">{formatTime(paper.start_date_time)}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <EyeIcon className="h-5 w-5 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <PencilSquareIcon className="h-5 w-5 text-green-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-gray-500 text-lg">
            Showing {papers.length} {papers.length === 1 ? "entry" : "entries"}
          </p>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button className="px-6 py-3 text-gray-500 hover:bg-gray-100">Previous</button>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold">1</button>
            <button className="px-6 py-3 text-gray-500 hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paper;
