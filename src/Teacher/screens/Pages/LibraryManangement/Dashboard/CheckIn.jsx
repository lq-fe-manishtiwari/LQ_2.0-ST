// components/CheckIn.tsx
import React from 'react';

const checkInItems = [
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    borrower: "Rahul Sharma",
    program: "M.Tech",
    dueDate: "08 Jan 2026",
    returnedOn: "22 Jan 2026",
    overdueDays: 14,
    fine: 280,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    borrower: "Priya Singh",
    program: "B.Tech CSE",
    dueDate: "15 Jan 2026",
    returnedOn: "22 Jan 2026",
    overdueDays: 7,
    fine: 140,
  },
];

export default function CheckIn() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2162C1]">Check-In</h1>
        </div>

        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Book Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Borrower</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Returned On</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Overdue Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fine (₹)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {checkInItems.map((item, index) => (
                  <tr key={index} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.borrower}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.returnedOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        item.overdueDays > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.overdueDays} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.fine > 0 ? `₹${item.fine}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Confirm Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex justify-between items-center">
            <div className="text-gray-700">
              <span className="font-medium">Total Returns:</span> {checkInItems.length}
              <span className="mx-4">•</span>
              <span className="font-medium">Total Fine Pending:</span> ₹{checkInItems.reduce((sum, i) => sum + i.fine, 0)}
            </div>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
              Process All Returns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}