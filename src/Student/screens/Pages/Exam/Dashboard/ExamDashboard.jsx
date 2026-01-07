import React from "react";
import { useNavigate } from "react-router-dom";

const ExamDashboard = () => {
  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="w-full sm:w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg">
          Fill Form
        </button>
      </div>

      {/* Title */}
      <h2 className="text-4xl font-semibold text-gray-500 mb-2">
        Submitted Exam Forms
      </h2>

      {/* Empty State */}
      <p className="text-lg text-gray-500">
        No exam forms found.
      </p>
    </div>
  );
};

export default ExamDashboard;
