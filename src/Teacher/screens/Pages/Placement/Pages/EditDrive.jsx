import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function EditDrive() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    placementId: '',
    company: '',
    date: '',
    time: '',
    type: 'offline',
    venue: '',
    meetingLink: '',
    rounds: '',
    coordinator: '',
    totalStudents: '',
    instructions: ''
  });

  useEffect(() => {
    loadDriveData();
  }, [driveId]);

  const loadDriveData = async () => {
    // Mock data - replace with API call
    const mockData = {
      placementId: 'PL2026001',
      company: 'TCS',
      date: '2026-02-15',
      time: '10:00',
      type: 'offline',
      venue: 'Seminar Hall A',
      meetingLink: '',
      rounds: '3',
      coordinator: 'Dr. Sharma',
      totalStudents: '120',
      instructions: 'Students must bring ID cards and resume copies'
    };
    setFormData(mockData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Drive Updated!',
        text: 'Placement drive has been updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/teacher/placement/drive-scheduling');
    }, 1000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Edit Placement Drive</h2>
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
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Placement ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="placementId"
              value={formData.placementId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Drive Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Row 3 - Conditional fields based on type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.type === 'offline' || formData.type === 'hybrid') && (
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Venue {(formData.type === 'offline' || formData.type === 'hybrid') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                required={formData.type === 'offline' || formData.type === 'hybrid'}
              />
            </div>
          )}

          {(formData.type === 'online' || formData.type === 'hybrid') && (
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Meeting Link {(formData.type === 'online' || formData.type === 'hybrid') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                required={formData.type === 'online' || formData.type === 'hybrid'}
              />
            </div>
          )}
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Number of Rounds <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rounds"
              value={formData.rounds}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Coordinator <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="coordinator"
              value={formData.coordinator}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Total Students <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalStudents"
              value={formData.totalStudents}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            rows="6"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Enter any special instructions for students..."
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Drive'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/placement/drive-scheduling')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
