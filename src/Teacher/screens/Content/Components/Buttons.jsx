'use client';

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Upload, Filter, X, ChevronDown } from "lucide-react";

export default function Buttons() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="p-4">
      {/* Top Row: Filter + Action Buttons */}
      <div className="flex justify-between items-center mb-2">
        {/* Left: Filter Button */}
        <button
          onClick={() => setFilterOpen(prev => !prev)}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter</span>
        </button>

        {/* Right: Action Buttons */}
        <div className="flex gap-2">
          <Link to="/content/add-content">
            <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
              <Plus className="w-4 h-4" />
              My Content
            </button>
          </Link>
          
          <Link to="/content/student-project">
          <button className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
            {/* <Upload className="w-4 h-4" /> */}
            Student Project
          </button>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-2 border border-gray-200 transition-all">
          {/* Example Filter Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Program */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="">Select Program</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="">Select Class</option>
                <option value="Class 7A">Class 7A</option>
                <option value="Class 7C">Class 7C</option>
                <option value="Class 8A">Class 8A</option>
                <option value="Class 8B">Class 8B</option>
                <option value="Class 9B">Class 9B</option>
                <option value="Class 10A">Class 10A</option>
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Division</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
