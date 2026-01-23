// components/CheckOut.tsx
import React, { useState } from 'react';

const checkoutItems = [
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    publisher: "O'Reilly",
    pendingDays: 12,
    issueDate: "08 Jan 2026",
    program: "M.Tech",
    category: "Computer Science",
    status: "Pending",
  },
  {
    title: "Staff Engineer",
    author: "Will Larson",
    publisher: "Indie / Self Published",
    pendingDays: 5,
    issueDate: "14 Jan 2026",
    program: "B.Tech CSE",
    category: "Professional Development",
    status: "Pending",
  },
];

export default function CheckOut() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Extract unique values for dropdowns (you can make this dynamic later)
  const categories = [...new Set(checkoutItems.map(item => item.category))];
  const authors = [...new Set(checkoutItems.map(item => item.author))];
  const publishers = [...new Set(checkoutItems.map(item => item.publisher))];
  const statuses = ['Pending', 'Checked Out', 'Overdue', 'Returned']; // Example statuses

  // Filter items based on selected dropdowns
  const filteredItems = checkoutItems.filter(item => {
    return (
      (!selectedCategory || item.category === selectedCategory) &&
      (!selectedAuthor || item.author === selectedAuthor) &&
      (!selectedPublisher || item.publisher === selectedPublisher) &&
      (!selectedStatus || item.status === selectedStatus)
    );
  });

  const totalBooks = filteredItems.length;
  const totalPendingDays = filteredItems.reduce((sum, item) => sum + item.pendingDays, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2162C1]">Checkout</h1>
        </div>
        {/* Filter Dropdowns - Exactly like your screenshot */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
              >
                <option value="">All Publishers</option>
                {publishers.map((pub) => (
                  <option key={pub} value={pub}>
                    {pub}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Book Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Publisher
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Pending Days
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Program
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map((item, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-yellow-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.publisher}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.pendingDays > 7 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.pendingDays} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.issueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.program}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      No books match the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-700">
                <span className="font-medium">Total Books:</span> {totalBooks}
                <span className="mx-4">•</span>
                <span className="font-medium">Total Pending Days:</span> {totalPendingDays}
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          By confirming, you agree to return the books within the pending days.
        </div>
      </div>
    </div>
  );
}