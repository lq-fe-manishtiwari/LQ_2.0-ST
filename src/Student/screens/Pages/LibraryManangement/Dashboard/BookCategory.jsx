// components/BookCategory.tsx
import React from 'react';

const categories = [
  { name: "Computer Science", count: 124, color: "indigo" },
  { name: "Programming", count: 98, color: "purple" },
  { name: "Management", count: 76, color: "pink" },
  { name: "Design Reference", count: 62, color: "rose" },
  { name: "Mathematics", count: 58, color: "teal" },
  { name: "Engineering", count: 45, color: "blue" },
  { name: "Fiction", count: 32, color: "amber" },
  { name: "History", count: 28, color: "emerald" },
];

export default function BookCategory() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Book Categories</h1>
          <p className="mt-2 text-gray-600">Manage and view all book categories in the library</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-${cat.color}-50 to-${cat.color}-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-${cat.color}-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold text-${cat.color}-800`}>{cat.name}</h3>
                  <p className="text-gray-600 mt-1">{cat.count} books</p>
                </div>
                <span className={`text-4xl font-extrabold text-${cat.color}-600/30`}>{cat.count}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <button className={`px-4 py-2 bg-${cat.color}-600 text-white rounded-lg hover:bg-${cat.color}-700 transition-colors text-sm font-medium`}>
                  View Books
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}