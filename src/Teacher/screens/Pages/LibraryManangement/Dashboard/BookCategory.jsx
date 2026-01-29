import React, { useState } from 'react';
import { BookOpenIcon } from '@heroicons/react/24/solid';

// Updated data with books in every category
const categories = [
  {
    name: "Computer",
    count: 124,
    color: "indigo",
    books: [
      { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", image: "https://m.media-amazon.com/images/I/91l3y7Y0WIL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Introduction to Algorithms", author: "Thomas H. Cormen", image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Computer Networking: A Top-Down Approach", author: "James Kurose", image: "https://m.media-amazon.com/images/I/91o0S4w2hOL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Programming",
    count: 98,
    color: "purple",
    books: [
      { title: "Clean Code", author: "Robert C. Martin", image: "https://m.media-amazon.com/images/I/51ZSpmaCooL._AC_UF1000,1000_QL80_.jpg" },
      { title: "The Pragmatic Programmer", author: "Andrew Hunt", image: "https://m.media-amazon.com/images/I/51W1s0lS7AL._AC_UF1000,1000_QL80_.jpg" },
      { title: "You Don't Know JS", author: "Kyle Simpson", image: "https://m.media-amazon.com/images/I/81l3y7Y0WIL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Management",
    count: 76,
    color: "amber",
    books: [
      { title: "The Lean Startup", author: "Eric Ries", image: "https://m.media-amazon.com/images/I/81jgCiNJPUL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Good to Great", author: "Jim Collins", image: "https://m.media-amazon.com/images/I/81g4w5rL4DL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Atomic Habits", author: "James Clear", image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Design Reference",
    count: 62,
    color: "red",
    books: [
      { title: "The Design of Everyday Things", author: "Don Norman", image: "https://m.media-amazon.com/images/I/81g4w5rL4DL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Don't Make Me Think", author: "Steve Krug", image: "https://m.media-amazon.com/images/I/81g4w5rL4DL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Sprint", author: "Jake Knapp", image: "https://m.media-amazon.com/images/I/81jgCiNJPUL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Mathematics",
    count: 58,
    color: "emerald",
    books: [
      { title: "Calculus", author: "James Stewart", image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Linear Algebra and Its Applications", author: "David C. Lay", image: "https://m.media-amazon.com/images/I/91l3y7Y0WIL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Engineering",
    count: 45,
    color: "blue",
    books: [
      { title: "Engineering Mechanics", author: "R.C. Hibbeler", image: "https://m.media-amazon.com/images/I/81g4w5rL4DL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Fluid Mechanics", author: "Frank M. White", image: "https://m.media-amazon.com/images/I/81jgCiNJPUL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "Fiction",
    count: 32,
    color: "amber",
    books: [
      { title: "The Alchemist", author: "Paulo Coelho", image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg" },
      { title: "1984", author: "George Orwell", image: "https://m.media-amazon.com/images/I/81g4w5rL4DL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
  {
    name: "History",
    count: 28,
    color: "emerald",
    books: [
      { title: "Sapiens", author: "Yuval Noah Harari", image: "https://m.media-amazon.com/images/I/81jgCiNJPUL._AC_UF1000,1000_QL80_.jpg" },
      { title: "Guns, Germs, and Steel", author: "Jared Diamond", image: "https://m.media-amazon.com/images/I/91o0S4w2hOL._AC_UF1000,1000_QL80_.jpg" },
    ]
  },
];

export default function BookCategory() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const openCategory = (category) => {
    setSelectedCategory(category);
  };

  const closeModal = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#2162C1]">Book Categories</h1>
          <p className="mt-3 text-lg text-gray-600">Explore our collection by category</p>
        </div>

        {/* All Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-${cat.color}-50 to-${cat.color}-100 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-${cat.color}-200 group relative overflow-hidden`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold text-${cat.color}-800 group-hover:text-${cat.color}-900 transition-colors`}>
                    {cat.name}
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">{cat.count} books</p>
                </div>

                {/* Book Icon instead of number */}
                <BookOpenIcon
                  className="h-12 w-12 text-[#2162C1]/80 group-hover:text-[#2162C1] group-hover:scale-110 transition-all duration-300"
                />
              </div>

              {/* View Books Button */}
              <div className="mt-8">
                <button
                  onClick={() => openCategory(cat)}
                  className={`w-full px-6 py-3 bg-${cat.color}-600 hover:bg-${cat.color}-700 text-white rounded-xl transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95`}
                >
                  View Books
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for showing books */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h2 className={`text-2xl font-bold text-${selectedCategory.color}-800`}>
                    {selectedCategory.name}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedCategory.books.length} books found</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.books.map((book, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group"
                  >
                    <div className="h-64 overflow-hidden">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 line-clamp-2">{book.title}</h4>
                      <p className="text-gray-600 mt-1 text-sm">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 text-right rounded-b-2xl">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}