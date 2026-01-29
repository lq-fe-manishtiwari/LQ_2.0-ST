'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, Video, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const navigate = useNavigate();
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    const mockData = [
      {
        interview_id: 201,
        placement_id: 'PL20260453',
        organisation: 'Test',
        job_opening_date: '19/01/2026',
        job_role: 'Test',
        interview_date: '20/01/2026',
        interview_time: '12:01',
        round: 'HR Interview',
        outcome: '',
        tpo_remark: '',
        student_registration: 'Yes',
        status: 'scheduled',
        interview_type: 'online',
        location: 'Google Meet',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        instructions: 'Please join 5 minutes early. Keep your ID card ready.'
      },
      {
        interview_id: 202,
        placement_id: 'PL20260454',
        organisation: 'Infosys',
        job_opening_date: '19/01/2026',
        job_role: 'System Engineer',
        interview_date: '28/01/2026',
        interview_time: '02:00 PM',
        round: 'Technical Round',
        outcome: 'Selected',
        tpo_remark: 'Good performance',
        student_registration: 'Yes',
        status: 'completed',
        interview_type: 'offline',
        location: 'Campus - Room 301',
        instructions: 'Bring resume copies and original certificates.'
      },
      {
        interview_id: 203,
        placement_id: 'PL20260455',
        organisation: 'Wipro',
        job_opening_date: '10/01/2026',
        job_role: 'Frontend Developer',
        interview_date: '15/01/2026',
        interview_time: '11:00 AM',
        round: 'Coding Round',
        outcome: 'Rejected',
        tpo_remark: 'Try again next time',
        student_registration: 'Yes',
        status: 'completed',
        interview_type: 'online',
        location: 'Zoom',
        result: 'Not Selected',
        instructions: 'Coding round - prepare data structures.'
      }
    ];
    setInterviews(mockData);
    setLoading(false);
  };

  const getStatusBadge = (status, result) => {
    if (status === 'completed') {
      if (result === 'Selected') {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CheckCircle className="w-3 h-3" />
            Selected
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
        <Clock className="w-3 h-3" />
        Scheduled
      </span>
    );
  };

  const paginatedData = useMemo(() => {
    let list = interviews.filter(interview => {
      const matchesSearch = interview.organisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           interview.job_role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
                         (filterType === 'upcoming' && interview.status === 'scheduled') ||
                         (filterType === 'completed' && interview.status === 'completed');
      return matchesSearch && matchesType;
    });

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [interviews, searchTerm, currentPage, filterType]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Interviews</p>
              <p className="text-xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'scheduled').length}
              </p>
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
              <p className="text-xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'upcoming', 'completed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={'px-4 py-2 rounded-lg font-medium transition-all ' + (
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Job Opening Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Job Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Round</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">TPO Remark</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Student Registration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.interview_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.organisation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_opening_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.interview_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.interview_time}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.round}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={'px-2 py-1 rounded text-xs font-medium ' + (
                        item.outcome === 'Selected' ? 'bg-green-100 text-green-700' :
                        item.outcome === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {item.outcome || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.tpo_remark || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.student_registration}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    No interviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
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
            <p className="text-lg font-medium text-gray-500">No interviews found</p>
          </div>
        ) : (
          currentEntries.map((interview) => (
            <div key={interview.interview_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{interview.placement_id}</p>
                  <p className="text-sm text-gray-500">{interview.organisation}</p>
                  <p className="text-xs text-gray-400">{interview.job_role}</p>
                </div>
                {getStatusBadge(interview.status, interview.result)}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Opening:</span> {interview.job_opening_date}</div>
                  <div><span className="font-medium">Date:</span> {interview.interview_date}</div>
                  <div><span className="font-medium">Time:</span> {interview.interview_time}</div>
                  <div><span className="font-medium">Round:</span> {interview.round}</div>
                  <div><span className="font-medium">Outcome:</span> {interview.outcome || '-'}</div>
                  <div><span className="font-medium">Registration:</span> {interview.student_registration}</div>
                </div>
                {interview.tpo_remark && (
                  <p className="text-xs text-gray-600 italic mt-2">TPO: "{interview.tpo_remark}"</p>
                )}
              </div>

              {interview.meeting_link && interview.status === 'scheduled' && (
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </a>
              )}
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
