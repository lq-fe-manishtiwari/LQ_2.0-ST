import React from "react";

export default function PendingFeedback() {
  const feedbackForms = [
    {
      sr: 1,
      formName: "Student Feedback Form",
      formUrl: "https://example.com/student-feedback",
      startTime: "2025-11-01 10:00 AM",
      endTime: "2025-11-05 05:00 PM",
    },
    {
      sr: 2,
      formName: "Course Evaluation Form",
      formUrl: "https://example.com/course-eval",
      startTime: "2025-11-02 09:00 AM",
      endTime: "2025-11-06 06:00 PM",
    },
    {
      sr: 3,
      formName: "Teacher Feedback Form",
      formUrl: "https://example.com/teacher-feedback",
      startTime: "2025-11-03 08:30 AM",
      endTime: "2025-11-07 04:30 PM",
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
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">Form URL</th>
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">Start Time</th>
              <th style={{ backgroundColor: customBlue }} className="px-6 py-3 border-b">End Time</th>
            </tr>
          </thead>
          <tbody>
            {feedbackForms.map((form) => (
              <tr key={form.sr} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-3 border-b">{form.sr}</td>
                <td className="px-6 py-3 border-b font-medium text-gray-800">{form.formName}</td>
                <td className="px-6 py-3 border-b text-blue-600 underline cursor-pointer">
                  <a href={form.formUrl} target="_blank" rel="noopener noreferrer">
                    {form.formUrl}
                  </a>
                </td>
                <td className="px-6 py-3 border-b text-gray-700">{form.startTime}</td>
                <td className="px-6 py-3 border-b text-gray-700">{form.endTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}