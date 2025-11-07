import React, { useState } from "react";

export default function SubmittedFeedback() {
  const submittedForms = [
    {
      sr: 1,
      formName: "Semester Feedback Form",
      submittedDate: "2025-11-03 11:00 AM",
      responseLink: "https://example.com/response-1",
    },
    {
      sr: 2,
      formName: "Teacher Evaluation Form",
      submittedDate: "2025-11-04 02:15 PM",
      responseLink: "https://example.com/response-2",
    },
    // Add 30+ dummy entries for pagination testing
    ...Array.from({ length: 35 }, (_, i) => ({
      sr: i + 3,
      formName: `Submitted Form ${i + 3}`,
      submittedDate: `2025-11-${5 + (i % 5)} ${9 + (i % 12)}:${(i % 60)
        .toString()
        .padStart(2, "0")} ${i % 2 === 0 ? "AM" : "PM"}`,
      responseLink: `https://example.com/response-${i + 3}`,
    })),
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Pagination Logic
  const totalEntries = submittedForms.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = submittedForms.slice(indexOfFirstEntry, indexOfLastEntry);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Blue Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-white bg-blue-700 px-6 py-4 rounded-t-xl shadow-md mb-0">
        Submitted Feedback
      </h1>

      <div className="overflow-x-auto bg-white rounded-b-xl shadow-md border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-700 text-white d-flex ">
            <tr>
              <th className="px-6 py-3 border-b font-semibold text-center">Sr No</th>
              <th className="px-6 py-3 border-b font-semibold text-center">Form Name</th>
              <th className="px-6 py-3 border-b font-semibold text-center">Submitted Date</th>
              <th className="px-6 py-3 border-b font-semibold text-center">View Response</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((form) => (
                <tr
                  key={form.sr}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-6 py-3 border-b">{form.sr}</td>
                  <td className="px-6 py-3 border-b font-medium text-gray-800">
                    {form.formName}
                  </td>
                  <td className="px-6 py-3 border-b text-gray-700">
                    {form.submittedDate}
                  </td>
                  <td className="px-6 py-3 border-b">
                    <a
                      href={form.responseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 font-medium"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No submitted forms yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
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
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
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