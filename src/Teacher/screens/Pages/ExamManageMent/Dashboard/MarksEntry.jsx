import React from "react";

const MarksEntry = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Table Container with fixed height for scrolling */}
        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <table className="w-full border-collapse min-w-[1600px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-600 text-white text-left">
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Exam Name</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Exam Type</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Program</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Class</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Course</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Student Name</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Roll Number</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">ERN Number</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Total Marks</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Marks Obtained</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Question Paper</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Student Answer Sheet</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Graded Sheet</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Status</th>
                <th className="px-4 py-4 text-lg bg-[#2162c1] text-white">Action</th>
              </tr>
            </thead>

            <tbody>
              {/* Multiple rows for testing scrolling */}
              {Array.from({ length: 50 }).map((_, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">Mid Term Exam {index + 1}</td>
                  <td className="px-4 py-4">Theory</td>
                  <td className="px-4 py-4">B.Tech</td>
                  <td className="px-4 py-4">CSE-A</td>
                  <td className="px-4 py-4">Data Structures</td>
                  <td className="px-4 py-4">John Doe {index + 1}</td>
                  <td className="px-4 py-4">R00{index + 1}</td>
                  <td className="px-4 py-4">ERN00{index + 1}</td>
                  <td className="px-4 py-4">100</td>
                  <td className="px-4 py-4">8{index % 10}</td>
                  <td className="px-4 py-4">
                    <button className="text-blue-600 hover:underline">
                      Download
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-blue-600 hover:underline">
                      Upload
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {index % 3 === 0 ? 'Graded' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-gray-500 text-lg">Showing 50 entries</p>

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

export default MarksEntry;