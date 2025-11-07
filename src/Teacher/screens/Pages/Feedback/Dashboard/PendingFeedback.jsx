import React, { useState } from "react";

export default function PendingFeedback() {
  const feedbackForms = [
    { sr: 1, formName: "Student Feedback Form", formUrl: "https://example.com/student-feedback", startTime: "2025-11-01 10:00 AM", endTime: "2025-11-05 05:00 PM" },
    { sr: 2, formName: "Course Evaluation Form", formUrl: "https://example.com/course-eval", startTime: "2025-11-02 09:00 AM", endTime: "2025-11-06 06:00 PM" },
    { sr: 3, formName: "Teacher Feedback Form", formUrl: "https://example.com/teacher-feedback", startTime: "2025-11-03 08:30 AM", endTime: "2025-11-07 04:30 PM" },
    ...Array.from({ length: 30 }, (_, i) => ({
      sr: i + 4,
      formName: `Extra Feedback Form ${i + 4}`,
      formUrl: `https://example.com/form-${i + 4}`,
      startTime: "2025-11-04 09:00 AM",
      endTime: "2025-11-10 06:00 PM",
    })),
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const totalEntries = feedbackForms.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = feedbackForms.slice(indexOfFirstEntry, indexOfLastEntry);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Heading with Blue Background & White Text */}
      <h1 className="text-2xl md:text-3xl font-bold text-white bg-blue-700 px-6 py-4 rounded-t-xl shadow-md">
        Pending Feedback
      </h1>

      <div className="overflow-x-auto bg-white rounded-b-xl shadow-md border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-6 py-3 border-b font-semibold text-white">Sr No</th>
              <th className="px-6 py-3 border-b font-semibold text-white">Form Name</th>
              <th className="px-6 py-3 border-b font-semibold text-white">Form URL</th>
              <th className="px-6 py-3 border-b font-semibold text-white">Start Time</th>
              <th className="px-6 py-3 border-b font-semibold text-white">End Time</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((form) => (
              <tr
                key={form.sr}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-3 border-b">{form.sr}</td>
                <td className="px-6 py-3 border-b font-medium text-gray-800">
                  {form.formName}
                </td>
                <td className="px-6 py-3 border-b text-blue-600 underline cursor-pointer">
                  <a
                    href={form.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {form.formUrl}
                  </a>
                </td>
                <td className="px-6 py-3 border-b text-gray-700">
                  {form.startTime}
                </td>
                <td className="px-6 py-3 border-b text-gray-700">
                  {form.endTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Section */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-b-xl">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-white ${
              currentPage === 1
                ? "bg-blue-200 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Previous
          </button>

          <p className="text-gray-700 text-sm font-medium">
            Showing {indexOfFirstEntry + 1}–
            {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
          </p>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-white ${
              currentPage === totalPages
                ? "bg-blue-200 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}