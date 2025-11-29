import React from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddLeave() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-4 md:p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-pink-100 text-black px-4 py-2 
        rounded-full hover:bg-pink-200 transition mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>
               
      {/* Page Title */}
      <h1 className="text-center text-lg font-semibold mb-6">Edit Leave</h1>

      {/* Main Container */}
      <div className="bg-white w-full p-5 md:p-8 rounded-xl shadow-md max-w-6xl mx-auto">

        <h2 className="font-semibold mb-6 text-base md:text-lg">Leave Information</h2>

        {/* Responsive Grid */}
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-4 
          md:gap-6
        ">

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">Leave Type</label>
            <select className="w-full border rounded-lg p-2 text-sm outline-none">
              <option>select leave type</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">From Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm outline-none pr-10"
              />
              <Calendar className="absolute right-3 top-2.5" size={18} />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">To Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm outline-none pr-10"
              />
              <Calendar className="absolute right-3 top-2.5" size={18} />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">Department</label>
            <select className="w-full border rounded-lg p-2 text-sm outline-none">
              <option>select department</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">Name</label>
            <select className="w-full border rounded-lg p-2 text-sm outline-none">
              <option>select name</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2">Subject</label>
            <input
              type="text"
              placeholder="add subject for leave"
              className="w-full border rounded-lg p-2 text-sm outline-none"
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 md:gap-6 mt-10">
          <button className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
            Submit
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
