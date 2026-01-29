import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ViewDrive() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [driveData, setDriveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriveData();
  }, [driveId]);

  const loadDriveData = async () => {
    setLoading(true);
    // Mock data - replace with API call
    const mockData = {
      id: driveId,
      placementId: 'PL2026001',
      company: 'TCS',
      date: '15/02/2026',
      time: '10:00 AM',
      type: 'Offline',
      venue: 'Seminar Hall A',
      meetingLink: '',
      rounds: 3,
      coordinator: 'Dr. Sharma',
      totalStudents: 120,
      attendedStudents: 115,
      instructions: 'Students must bring ID cards and resume copies. Dress code: Formal',
      status: 'Scheduled',
      createdBy: 'Admin',
      createdDate: '10/01/2026'
    };
    setDriveData(mockData);
    setLoading(false);
  };

  const handleEdit = () => {
    navigate(`/teacher/placement/edit-drive/${driveId}`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Delete Drive?',
      text: 'Are you sure you want to delete this placement drive?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Drive has been deleted',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/teacher/placement/drive-scheduling');
      }
    });
  };

  const handleAttendance = () => {
    navigate(`/teacher/placement/drive-attendance/${driveId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!driveData) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Drive not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const config = {
      'Scheduled': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-700' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700' }
    };
    const style = config[status] || config['Scheduled'];
    return (
      <span className={`px-3 py-1 ${style.bg} ${style.text} text-sm font-semibold rounded-full`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">View Drive Details</h2>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
          onClick={() => navigate('/teacher/placement/drive-scheduling')}
        >
          ✕
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
        {/* Header Section */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{driveData.company}</h3>
              <p className="text-sm text-gray-500 mt-1">Placement ID: {driveData.placementId}</p>
            </div>
            {getStatusBadge(driveData.status)}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
            <p className="text-gray-900">{driveData.date}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Time</label>
            <p className="text-gray-900">{driveData.time}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
            <p className="text-gray-900">{driveData.type}</p>
          </div>

          {driveData.venue && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Venue</label>
              <p className="text-gray-900">{driveData.venue}</p>
            </div>
          )}

          {driveData.meetingLink && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Meeting Link</label>
              <a 
                href={driveData.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Join Meeting
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Rounds</label>
            <p className="text-gray-900">{driveData.rounds}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Coordinator</label>
            <p className="text-gray-900">{driveData.coordinator}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Total Students</label>
            <p className="text-gray-900">{driveData.totalStudents}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Attended</label>
            <p className="text-gray-900 font-semibold text-green-600">{driveData.attendedStudents}</p>
          </div>
        </div>

        {/* Instructions */}
        {driveData.instructions && (
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Instructions</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{driveData.instructions}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            onClick={handleAttendance}
          >
            Track Attendance
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
            onClick={() => navigate('/teacher/placement/drive-scheduling')}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
