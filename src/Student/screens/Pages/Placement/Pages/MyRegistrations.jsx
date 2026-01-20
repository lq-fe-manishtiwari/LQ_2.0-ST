'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Eye, Filter, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className="w-full px-3 py-2 border bg-white border-gray-300 cursor-pointer hover:border-blue-400 rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => handleSelect('')}>
              {placeholder}
            </div>
            {options.map(option => (
              <div key={option} className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => handleSelect(option)}>
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    filterOpen: false,
    status: ''
  });

  const navigate = useNavigate();
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const mockData = [
      {
        registration_id: 101,
        placement_id: 'PL20260453',
        organisation: 'Test',
        job_role: 'Test',
        applied_date: '20/01/2026',
        opening_date: '19/01/2026',
        position_open_till: '31/01/2026',
        interview_status: 'Approved',
        registration_link: 'ves-erp.learnqoch',
        status: 'shortlisted',
        ctc: '4.5 LPA',
        remarks: 'Application under review'
      },
      {
        registration_id: 102,
        placement_id: 'PL20260454',
        organisation: 'Test',
        job_role: 'Test',
        applied_date: '22/01/2026',
        opening_date: '19/01/2026',
        position_open_till: '31/01/2026',
        interview_status: '-',
        registration_link: 'ves-erp.learnqoch',
        status: 'pending',
        ctc: '5 LPA',
        remarks: 'Shortlisted for interview'
      },
      {
        registration_id: 103,
        placement_id: 'PL20260455',
        organisation: 'Wipro',
        job_role: 'Frontend Developer',
        applied_date: '15/01/2026',
        opening_date: '10/01/2026',
        position_open_till: '28/02/2026',
        interview_status: 'Rejected',
        registration_link: 'wipro.com/careers',
        status: 'rejected',
        ctc: '6 LPA',
        remarks: 'Not selected for this position'
      }
    ];
    setRegistrations(mockData);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      shortlisted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Shortlisted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' }
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
    let list = registrations;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.organisation?.toLowerCase().includes(q) ||
        item.job_role?.toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [registrations, searchTerm, currentPage, filters]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  // Stats
  const stats = {
    pending: registrations.filter(r => r.status === 'pending').length,
    shortlisted: registrations.filter(r => r.status === 'shortlisted').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-xl font-bold text-gray-900">{stats.shortlisted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search applications"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        <button
          onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all w-full sm:w-auto"
        >
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter</span>
          <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={['pending', 'shortlisted', 'rejected']}
              placeholder="Select Status"
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Opening Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Position Open Till</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Interview Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Registration Link</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.registration_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.applied_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.opening_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.organisation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.position_open_till}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.interview_status === 'Approved' ? 'bg-green-100 text-green-700' :
                        item.interview_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.interview_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      <a 
                        href={`https://${item.registration_link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.registration_link}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No applications found
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
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No applications found</p>
            </div>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.registration_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.placement_id}</p>
                  <p className="text-sm text-gray-500">{item.organisation}</p>
                  <p className="text-xs text-gray-400">{item.job_role}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.interview_status === 'Approved' ? 'bg-green-100 text-green-700' :
                  item.interview_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.interview_status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Applied On:</span> {item.applied_date}</div>
                  <div><span className="font-medium">Opening:</span> {item.opening_date}</div>
                  <div><span className="font-medium">Open Till:</span> {item.position_open_till}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Link:</span>{' '}
                    <a 
                      href={`https://${item.registration_link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {item.registration_link}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button
                  onClick={() => navigate(`/student-placement/registration-details/${item.registration_id}`)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
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
