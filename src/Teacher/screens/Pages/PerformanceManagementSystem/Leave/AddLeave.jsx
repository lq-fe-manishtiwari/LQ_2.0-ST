import React, { useState } from "react";
import { Calendar, X } from "lucide-react"; // Removed unused ArrowLeft, added X
import { useNavigate } from "react-router-dom";

export default function AddLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    department: "",
    name: "",
    subject: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    // You can add API call here
  };

  const handleCancel = () => {
    navigate("/pms/leave");
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-4 md:p-6">
      {/* Main Container */}
      <div className="bg-white w-full p-5 md:p-8 rounded-xl shadow-md max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          {/* LEFT: HEADING */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-700">Add Leave</h2>
          </div>

          {/* RIGHT: CLOSE BUTTON */}
          <button
            onClick={handleCancel}
            className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 sm:w-10 sm:h-10 
            flex items-center justify-center rounded-full shadow-md transition-all duration-200
            hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
              <select 
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                required
              >
                <option value="">select leave type</option>
                <option value="sick">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2">From Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500 pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2">To Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500 pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2">Department</label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                required
              >
                <option value="">select department</option>
                <option value="hr">Human Resources</option>
                <option value="it">IT</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2">Name</label>
              <select 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                required
              >
                <option value="">select name</option>
                <option value="john">John Doe</option>
                <option value="jane">Jane Smith</option>
                <option value="mike">Mike Johnson</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="add subject for leave"
                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 md:gap-6 mt-10">
            <button 
              type="submit"
              className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}