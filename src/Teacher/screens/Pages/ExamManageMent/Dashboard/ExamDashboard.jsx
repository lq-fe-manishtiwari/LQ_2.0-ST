import React from "react";

const ExamDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" rounded-xl shadow overflow-hidden">
        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Course</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Allocated By</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Start Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">End Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Marks Entry</th>
            </tr>
          </thead>


          <tbody>
            <tr>
              <td
                colSpan="7"
                className="text-center py-10 text-gray-700 text-lg"
              >
                No matching records found
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <p className="text-gray-600">Showing 0 entries</p>

          {/* Pagination */}
          <div className="flex items-center border rounded overflow-hidden">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">
              Previous
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white">
              1
            </button>

            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;
