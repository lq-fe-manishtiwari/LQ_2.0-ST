// components/Penalty.tsx
import React from 'react';

const penaltyRecords = [
  {
    borrower: "Rahul Sharma",
    book: "Designing Data-Intensive Applications",
    overdueDays: 14,
    finePerDay: 20,
    totalFine: 280,
    status: "Pending",
  },
  {
    borrower: "Priya Singh",
    book: "Clean Code",
    overdueDays: 7,
    finePerDay: 20,
    totalFine: 140,
    status: "Paid",
  },
  {
    borrower: "Amit Kumar",
    book: "Staff Engineer",
    overdueDays: 3,
    finePerDay: 20,
    totalFine: 60,
    status: "Pending",
  },
];

export default function Penalty() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2162C1]">Penalty</h1>
        </div>

        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Borrower</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Book</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Overdue Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white"> Fine Per Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total Fine</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penaltyRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.borrower}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.book}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.overdueDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{record.finePerDay}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">₹{record.totalFine}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.status === 'Pending' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex justify-between items-center">
            <div className="text-gray-700 font-medium">
              Total Pending Fines: ₹{penaltyRecords.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.totalFine, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}