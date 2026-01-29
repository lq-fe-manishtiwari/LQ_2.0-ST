'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, MapPin, Video, Plus, Eye, Edit, Trash2, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function DriveScheduling() {
  const [drives, setDrives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const navigate = useNavigate();
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setLoading(true);
    const mockData = [
      {
        drive_id: 1,
        placement_id: 'PL20260453',
        company_name: 'TCS',
        drive_date: '25/01/2026',
        drive_time: '10:00 AM',
        drive_type: 'online',
        venue: 'Google Meet',
        meeting_link: 'https://meet.google.com/tcs-drive-2026',
        total_students: 150,
        attended: 142,
        status: 'scheduled',
        rounds: 'Aptitude, Technical, HR',
        coordinator: 'Dr. Sharma'
      },
      {
        drive_id: 2,
        placement_id: 'PL20260454',
        company_name: 'Infosys',
        drive_date: '28/01/2026',
        drive_time: '02:00 PM',
        drive_type: 'offline',
        venue: 'Campus Auditorium - Hall A',
        meeting_link: '',
        total_students: 200,
        attended: 0,
        status: 'scheduled',
        rounds: 'Written Test, Group Discussion, Interview',
        coordinator: 'Prof. Patel'
      },
      {
        drive_id: 3,
        placement_id: 'PL20260455',
        company_name: 'Wipro',
        drive_date: '15/01/2026',
        drive_time: '11:00 AM',
        drive_type: 'online',
        venue: 'Zoom',
        meeting_link: 'https://zoom.us/j/wipro2026',
        total_students: 180,
        attended: 175,
        status: 'completed',
        rounds: 'Coding Round, Technical Interview',
        coordinator: 'Dr. Kumar'
      }
    ];
    setDrives(mockData);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
      ongoing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ongoing' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={'inline-flex items-center gap-1 px-3 py-1 ' + config.bg + ' ' + config.text + ' text-xs font-semibold rounded-full'}>
        {config.label}
      </span>
    );
  };

  const handleDelete = (driveId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setDrives(drives.filter(d => d.drive_id !== driveId));
        Swal.fire('Deleted!', 'Drive has been deleted.', 'success');
      }
    });
  };

  const paginatedData = useMemo(() => {
    let list = drives.filter(drive => {
      const matchesSearch = drive.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           drive.placement_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
                         (filterType === 'upcoming' && drive.status === 'scheduled') ||
                         (filterType === 'completed' && drive.status === 'completed');
      return matchesSearch && matchesType;
    });

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [drives, searchTerm, currentPage, filterType]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // Stats
  const stats = {
    total: drives.length,
    scheduled: drives.filter(d => d.status === 'scheduled').length,
    completed: drives.filter(d => d.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Drives</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search drives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'upcoming', 'completed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={'px-4 py-2 rounded-lg font-medium transition-all flex-1 sm:flex-none ' + (
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <button
            onClick={() => navigate('/teacher/placement/add-drive')}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Drive
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.drive_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{item.drive_date}</div>
                      <div className="text-xs text-gray-400">{item.drive_time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={'px-2 py-1 rounded text-xs font-medium capitalize ' + (
                        item.drive_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      )}>
                        {item.drive_type === 'online' ? <Video className="w-3 h-3 inline mr-1" /> : <MapPin className="w-3 h-3 inline mr-1" />}
                        {item.drive_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.venue}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.total_students}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{item.attended}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">{item.total_students}</span>
                        {item.status === 'completed' && (
                          <span className="text-xs text-green-600 font-medium">
                            ({Math.round((item.attended / item.total_students) * 100)}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/teacher/placement/drive-attendance/${item.drive_id}`)}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                          title="Attendance"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/placement/view-drive/${item.drive_id}`)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/placement/edit-drive/${item.drive_id}`)}
                          className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.drive_id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No drives found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-500">No drives found</p>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.drive_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.placement_id}</p>
                  <p className="text-sm text-gray-500">{item.company_name}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Date:</span> {item.drive_date}</div>
                  <div><span className="font-medium">Time:</span> {item.drive_time}</div>
                  <div><span className="font-medium">Type:</span> {item.drive_type}</div>
                  <div><span className="font-medium">Students:</span> {item.total_students}</div>
                  <div className="col-span-2"><span className="font-medium">Venue:</span> {item.venue}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Attendance:</span> {item.attended}/{item.total_students}
                    {item.status === 'completed' && (
                      <span className="text-green-600 ml-2">({Math.round((item.attended / item.total_students) * 100)}%)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => navigate(`/teacher/placement/drive-attendance/${item.drive_id}`)}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Attendance
                </button>
                <button
                  onClick={() => navigate(`/teacher/placement/view-drive/${item.drive_id}`)}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
