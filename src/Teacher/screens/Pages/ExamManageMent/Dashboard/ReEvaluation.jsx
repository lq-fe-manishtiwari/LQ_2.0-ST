import React from "react";

const ReEvaluation = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Request ID</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Request Date</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Student Name</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Grade</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Class</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Exam Name</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Subject</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Previous Marks</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Updated Marks</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Status</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-12 text-gray-500 text-xl"
                >
                  No matching records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-gray-500 text-lg">Showing 0 entries</p>

          {/* Pagination */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button className="px-6 py-3 text-gray-500 hover:bg-gray-100">
              Previous
            </button>

            <button className="px-6 py-3 bg-blue-600 text-white text-lg bg-[#2162c1] text-white">
              1
            </button>

            <button className="px-6 py-3 text-gray-500 hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReEvaluation;
