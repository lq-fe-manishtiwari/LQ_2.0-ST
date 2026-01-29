'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentConsents() {
  const [consents, setConsents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const navigate = useNavigate();
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    setLoading(true);
    const mockData = [
      {
        student_id: 1,
        roll_no: 'CS2021001',
        name: 'Rahul Sharma',
        department: 'Computer Science',
        semester: '6th',
        consent_status: 'accepted',
        consent_date: '15/01/2026',
        signature: 'Digital Signature',
        opted_out: false
      },
      {
        student_id: 2,
        roll_no: 'CS2021002',
        name: 'Priya Patel',
        department: 'Computer Science',
        semester: '6th',
        consent_status: 'accepted',
        consent_date: '16/01/2026',
        signature: 'Digital Signature',
        opted_out: false
      },
      {
        student_id: 3,
        roll_no: 'CS2021003',
        name: 'Amit Kumar',
        department: 'Computer Science',
        semester: '6th',
        consent_status: 'opted_out',
        consent_date: '17/01/2026',
        signature: 'Digital Signature',
        opted_out: true,
        opt_out_reason: 'Pursuing higher studies'
      },
      {
        student_id: 4,
        roll_no: 'IT2021001',
        name: 'Sneha Reddy',
        department: 'Information Technology',
        semester: '6th',
        consent_status: 'pending',
        consent_date: '-',
        signature: '-',
        opted_out: false
      }
    ];
    setConsents(mockData);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Accepted' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: XCircle, label: 'Pending' },
      opted_out: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Opted Out' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={'inline-flex items-center gap-1 px-3 py-1 ' + config.bg + ' ' + config.text + ' text-xs font-semibold rounded-full'}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const paginatedData = useMemo(() => {
    let list = consents.filter(consent => {
      const matchesSearch = consent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consent.roll_no?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || consent.consent_status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [consents, searchTerm, currentPage, filterStatus]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // Stats
  const stats = {
    total: consents.length,
    accepted: consents.filter(c => c.consent_status === 'accepted').length,
    pending: consents.filter(c => c.consent_status === 'pending').length,
    opted_out: consents.filter(c => c.consent_status === 'opted_out').length
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Opted Out</p>
              <p className="text-xl font-bold text-gray-900">{stats.opted_out}</p>
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
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'accepted', 'pending', 'opted_out'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={'px-4 py-2 rounded-lg font-medium transition-all flex-1 sm:flex-none text-xs sm:text-sm ' + (
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              {status === 'opted_out' ? 'Opted Out' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <button
            onClick={() => alert('Exporting consent data...')}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Consent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.roll_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.consent_date}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(item.consent_status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/teacher/placement/view-consent/${item.student_id}`)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No consents found
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
            <p className="text-lg font-medium text-gray-500">No consents found</p>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.student_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.roll_no}</p>
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.department}</p>
                </div>
                {getStatusBadge(item.consent_status)}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Semester:</span> {item.semester}</div>
                  <div><span className="font-medium">Date:</span> {item.consent_date}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/teacher/placement/view-consent/${item.student_id}`)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
                >
                  View Details
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
