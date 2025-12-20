import React from "react";

const Schedule = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white">Exam Name</th>
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white ">Classroom</th>
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white">Course</th>
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white">Exam Date</th>
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white">Start Time</th>
              <th className="px-6 py-4 text-lg bg-[#2162c1] text-white">End Time</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan="6"
                className="text-center py-10 text-gray-500 text-xl"
              >
                No exam schedules found
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-gray-500 text-lg">Showing 0 entries</p>

          {/* Pagination */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button className="px-6 py-3 text-gray-500 hover:bg-gray-100">
              Previous
            </button>

            <button className="px-6 py-3 bg-blue-600 text-white ">
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

export default Schedule;
