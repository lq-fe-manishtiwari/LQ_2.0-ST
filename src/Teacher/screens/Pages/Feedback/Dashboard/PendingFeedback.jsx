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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Heading (Same as AtktStudent) */}
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
          Pending Feedback
        </h1>

        {/* Desktop Table (Same CSS as AtktStudent) */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg  border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] ">
              <thead className="table-header text-white">
                <tr style={{backgroundColor:"#2162C1"}}>
                  <th className="table-th text-center text-white " style={{backgroundColor:"#2162C1"}}>Sr No</th>
                  <th className="table-th text-center " style={{backgroundColor:"#2162C1"}}>Form Name</th>
                  <th className="table-th text-center "style={{backgroundColor:"#2162C1"}}>Form URL</th>
                  <th className="table-th text-center "style={{backgroundColor:"#2162C1"}}>Start Time</th>
                  <th className="table-th text-center "style={{backgroundColor:"#2162C1"}}>End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.map((form) => (
                  <tr key={form.sr} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">{form.sr}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{form.formName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={form.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 font-medium"
                      >
                        {form.formUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{form.startTime}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{form.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (Same as AtktStudent) */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-white ${
                  currentPage === 1
                    ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Showing {indexOfFirstEntry + 1}–{Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
              </span>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-white ${
                  currentPage === totalPages
                    ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Mobile Cards (Same as AtktStudent) */}
        {/* Mobile Cards (Fixed) */}
<div className="lg:hidden space-y-4">
  {currentEntries.map((form) => (
    <div key={form.sr} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
      <div className="mb-4">
        {/* Form Name with Label */}
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Form Name</p>
          <p className="font-semibold text-gray-900">{form.formName}</p>
        </div>

        {/* Sr No */}
        <p className="text-xs text-gray-500">Sr No: {form.sr}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        {/* URL */}
        <div>
          <span className="font-medium">URL:</span>
          <a
            href={form.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 underline hover:text-blue-800 break-all"
          >
            {form.formUrl}
          </a>
        </div>

        {/* Start & End Time */}
        <div className="flex justify-between gap-3 text-xs">
          <span>
            <span className="font-medium">Start:</span> {form.startTime}
          </span>
          <span>
            <span className="font-medium">End:</span> {form.endTime}
          </span>
        </div>
      </div>
    </div>
  ))}

  {/* Mobile Pagination */}
  {totalEntries > 0 && (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === 1
            ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Previous
      </button>

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === totalPages
            ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Next
      </button>
    </div>
  )}
</div>

        {/* Empty State */}
        {totalEntries === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">No pending feedback forms found.</p>
          </div>
        )}
      </div>
    </div>
  );
}