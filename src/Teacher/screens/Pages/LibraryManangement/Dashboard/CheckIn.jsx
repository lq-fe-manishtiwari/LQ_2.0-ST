// components/CheckIn.tsx
import React from 'react';

const FINE_PER_DAY = 20; // ₹20 per overdue day

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
    // fine will be calculated dynamically
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
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    isbn: "978-0201616224",
    borrower: "Ankit Verma",
    program: "B.Tech IT",
    dueDate: "20 Jan 2026",
    returnedOn: "22 Jan 2026",
    overdueDays: 2,
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    borrower: "Neha Kapoor",
    program: "MCA",
    dueDate: "10 Jan 2026",
    returnedOn: "22 Jan 2026",
    overdueDays: 12,
  },
];

export default function CheckIn() {
  // Calculate fine for each item dynamically
  const itemsWithFine = checkInItems.map(item => ({
    ...item,
    fine: item.overdueDays > 0 ? item.overdueDays * FINE_PER_DAY : 0,
  }));

  const totalReturns = itemsWithFine.length;
  const totalFine = itemsWithFine.reduce((sum, item) => sum + item.fine, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#2162C1]">Issue Book</h1>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#2162C1] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Book Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Borrower</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fine Per Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Returned On</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Overdue Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Fine (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {itemsWithFine.map((item, index) => (
                  <tr key={index} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.borrower}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> ₹{FINE_PER_DAY} </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-700 text-center sm:text-left">
              <span className="font-medium">Total Returns:</span> {totalReturns}
              <span className="mx-4">•</span>
              <span className="font-medium">Total Fine Pending:</span>{' '}
              <span className={totalFine > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                ₹{totalFine}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}