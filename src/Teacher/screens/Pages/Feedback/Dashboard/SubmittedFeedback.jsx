import React from "react";

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
  ];

  const customBlue = "rgb(33 98 193)";

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-white">
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">Sr No</th>
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">Form Name</th>
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">Submitted Date</th>
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">View Response</th>
            </tr>
          </thead>
          <tbody>
            {submittedForms.map((form) => (
              <tr key={form.sr} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-3 border-b">{form.sr}</td>
                <td className="px-6 py-3 border-b font-medium text-gray-800">{form.formName}</td>
                <td className="px-6 py-3 border-b text-gray-700">{form.submittedDate}</td>
                <td className="px-6 py-3 border-b">
                  <a
                    href={form.responseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submittedForms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No submitted forms yet.
          </div>
        )}
      </div>
    </div>
  );
}