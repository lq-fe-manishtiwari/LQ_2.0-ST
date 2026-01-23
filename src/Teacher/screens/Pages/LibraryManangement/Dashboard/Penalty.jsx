// components/Penalty.tsx
import React from 'react';

const penaltyRecords = [
  {
    book: "System Design Interview",
    category: "System Design",
    author: "Alex Xu",
    publisher: "Indie",
    department: "M.Tech",
    expectedReturn: "20 Jan 2026",
    actualReturn: "22 Jan 2026",
    penalty: 40,
    paid: "Yes",
    remark: "Late 2 days",
  },
  {
    book: "Clean Architecture",
    category: "Programming",
    author: "Robert C. Martin",
    publisher: "Pearson",
    department: "MCA",
    expectedReturn: "15 Jan 2026",
    actualReturn: "-",
    penalty: 210,
    paid: "No",
    remark: "Overdue",
  },
  {
    book: "Atomic Habits",
    category: "Self Help",
    author: "James Clear",
    publisher: "Random House",
    department: "BBA",
    expectedReturn: "25 Jan 2026",
    actualReturn: "20 Jan 2026",
    penalty: 0,
    paid: "Yes",
    remark: "On time",
  },
];

export default function Penalty() {
  // Calculate total pending penalty (only where paid = "No")
  const totalPendingPenalty = penaltyRecords
    .filter(record => record.paid === "No")
    .reduce((sum, record) => sum + record.penalty, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2162C1]">Penalty</h1>
          <p className="mt-2 text-gray-600">
            Track overdue books, penalties, and payment status
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Book Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Publisher</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Expected Return</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actual Return</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Penalty (₹)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {penaltyRecords.map((record, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.book}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.publisher}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.expectedReturn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.actualReturn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      {record.penalty > 0 ? (
                        <span className="text-red-600">₹{record.penalty}</span>
                      ) : (
                        <span className="text-green-600">₹{record.penalty}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          record.paid === "Yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.paid}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-700 font-medium">
              Total Pending Penalty: 
              <span className="text-red-600 font-bold ml-2">₹{totalPendingPenalty}</span>
            </div>
            <button className="px-8 py-3 bg-[#2162C1] text-white rounded-lg  transition-colors font-medium shadow-sm">
              Generate Penalty Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}