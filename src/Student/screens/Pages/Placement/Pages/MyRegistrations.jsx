'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Eye, Filter, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service.js';
import { api } from '../../../../../_services/api';

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
          className="w-full px-3 py-2 border bg-white border-gray-300 cursor-pointer rounded-lg flex justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full bg-white border rounded-lg mt-1">
            <div onClick={() => handleSelect('')} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
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
  const [filters, setFilters] = useState({ filterOpen: false, status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const entriesPerPage = 10;

  const handleStatusChange = (value) => {
    setFilters(f => ({ ...f, status: value }));
    setCurrentPage(1);
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.getUserProfile();
      const prnNo = res.data?.permanent_registration_number;

      if (!prnNo) {
        setRegistrations([]);
        return;
      }

      const response = await studentPlacementService.getStudentDriveApplications(prnNo);
      const applications = response?.applications || [];
      setRegistrations(applications);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status || 'PENDING'}
      </span>
    );
  };

  const paginatedData = useMemo(() => {
    let list = Array.isArray(registrations) ? registrations : [];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.placement_id?.toLowerCase().includes(q) ||
        item.application_data?.['Full Name']?.toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(item =>
        item.application_status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;

    return {
      currentEntries: list.slice(start, end),
      totalEntries,
      totalPages,
      start,
      end
    };
  }, [registrations, searchTerm, currentPage, filters]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const stats = {
    pending: registrations.filter(r => r.application_status?.toLowerCase() === 'pending').length,
    approved: registrations.filter(r => r.application_status?.toLowerCase() === 'approved').length,
    rejected: registrations.filter(r => r.application_status?.toLowerCase() === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="search"
          placeholder="Search applications"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={() => setFilters(f => ({ ...f, filterOpen: !f.filterOpen }))}
          className="border px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {filters.filterOpen && (
        <CustomSelect
          label="Status"
          value={filters.status}
          onChange={e => handleStatusChange(e.target.value)}
          options={['pending', 'approved', 'rejected']}
          placeholder="Select Status"
        />
      )}

      {/* ─────────── Desktop Table ─────────── */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <div className="h-[500px] overflow-y-auto blue-scrollbar">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Placement ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Drive ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Job Role IDs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.length ? currentEntries.map(item => (
                  <tr key={item.application_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.application_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.placement_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.drive_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_role_ids?.join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.application_data?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(item.application_status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────── Mobile Cards ─────────── */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No applications found</p>
              <p className="text-sm">
                {searchTerm || filters.status
                  ? `No applications found matching your search or filters`
                  : "No applications found. Try adjusting the search or contact support if the issue persists."}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div
              key={item.application_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.application_data?.['Full Name'] || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Application #{item.application_id}</p>
                </div>
                <div>{getStatusBadge(item.application_status)}</div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Placement ID:</span> {item.placement_id || 'N/A'}</div>
                  <div><span className="font-medium">Drive ID:</span> {item.drive_id}</div>
                  <div><span className="font-medium">Job Role IDs:</span> {item.job_role_ids?.join(', ') || 'N/A'}</div>
                  <div><span className="font-medium">Email:</span> {item.application_data?.email || 'N/A'}</div>
                  <div><span className="font-medium">Marks:</span> {item.application_data?.marks || 'N/A'}</div>
                  <div><span className="font-medium">Mobile:</span> {item.application_data?.mobile || 'N/A'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
