'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AddDrive() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    placement_id: '',
    company_name: '',
    drive_date: '',
    drive_time: '',
    drive_type: 'online',
    venue: '',
    meeting_link: '',
    rounds: '',
    coordinator: '',
    total_students: '',
    instructions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.placement_id || !formData.company_name || !formData.drive_date || !formData.drive_time) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Drive Scheduled!',
      text: 'Placement drive has been scheduled successfully',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      navigate('/teacher/placement/drive-scheduling');
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Add New Drive</h2>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
          onClick={() => navigate('/teacher/placement/drive-scheduling')}
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placement ID */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Placement ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="placement_id"
              value={formData.placement_id}
              onChange={handleChange}
              placeholder="PL20260453"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="TCS"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Drive Date */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Drive Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="drive_date"
              value={formData.drive_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Drive Time */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Drive Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="drive_time"
              value={formData.drive_time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Drive Type */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Drive Type <span className="text-red-500">*</span>
            </label>
            <select
              name="drive_type"
              value={formData.drive_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Venue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder={formData.drive_type === 'online' ? 'Google Meet / Zoom' : 'Campus Auditorium'}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Meeting Link (if online) */}
          {formData.drive_type === 'online' && (
            <div className="md:col-span-2">
              <label className="block font-medium mb-1 text-gray-700">
                Meeting Link
              </label>
              <input
                type="url"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Rounds */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Interview Rounds
            </label>
            <input
              type="text"
              name="rounds"
              value={formData.rounds}
              onChange={handleChange}
              placeholder="Aptitude, Technical, HR"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Coordinator */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Coordinator Name
            </label>
            <input
              type="text"
              name="coordinator"
              value={formData.coordinator}
              onChange={handleChange}
              placeholder="Dr. Sharma"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Total Students */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Total Students Expected
            </label>
            <input
              type="number"
              name="total_students"
              value={formData.total_students}
              onChange={handleChange}
              placeholder="150"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1 text-gray-700">
              Instructions for Students
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="6"
              placeholder="Please join 10 minutes early. Keep your ID card ready..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/teacher/placement/drive-scheduling')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Schedule Drive
          </button>
        </div>
      </form>
    </div>
  );
}
