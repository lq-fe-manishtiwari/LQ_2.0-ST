import React, { useState } from "react";

const Result = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6  rounded-lg">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-blue-500 table-header text-white">
            <tr className="bg-blue-500 table-header ">
              <th className="p-4 text-left bg-blue-700  ">Exam Name</th>
              <th className="p-4 text-left bg-blue-700 ">Program</th>
              <th className="p-4 text-left bg-blue-700">Class</th>
              <th className="p-4 text-left bg-blue-700">Marks Obtained</th>
              <th className="p-4 text-left bg-blue-700">Total Marks</th>
              <th className="p-4 text-left bg-blue-700">Grade</th>
              <th className="p-4 text-left bg-blue-700">Result Status</th>
              <th className="p-4 text-left bg-blue-700">Grade Card</th>
              <th className="p-4 text-left bg-blue-700">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan="9"
                className="p-6 text-center text-gray-500 bg-gray-50"
              >
                No matching records found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <p className="text-gray-500">
          Showing 0 entries
        </p>

        <div className="flex border rounded-md overflow-hidden">
          <button className="px-4 py-2 border-r text-gray-500 hover:bg-gray-100">
            Previous
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white">
            1
          </button>
          <button className="px-4 py-2 border-l text-gray-500 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
