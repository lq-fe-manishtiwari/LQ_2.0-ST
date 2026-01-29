'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Eye, Filter, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();
  const entriesPerPage = 10;

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

      const response =
        await studentPlacementService.getStudentDriveApplications(prnNo);

      // ✅ FORCE ARRAY
      const applications = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setRegistrations(applications);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      shortlisted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }[status] || {};

    const Icon = config.icon || Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status || 'pending'}
      </span>
    );
  };

  const paginatedData = useMemo(() => {
    let list = Array.isArray(registrations) ? registrations : [];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.organisation?.toLowerCase().includes(q) ||
        item.job_role?.toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(item =>
        item.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
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
    pending: registrations.filter(r => r.status === 'pending').length,
    shortlisted: registrations.filter(r => r.status === 'shortlisted').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
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
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          options={['pending', 'shortlisted', 'rejected']}
          placeholder="Select Status"
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
          <div className="h-[500px] overflow-y-auto blue-scrollbar">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Placement ID</th>
              <th className="p-3 text-left">Organisation</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length ? currentEntries.map(item => (
              <tr key={item.registration_id} className="border-t">
                <td className="p-3">{item.placement_id}</td>
                <td className="p-3">{item.organisation}</td>
                <td className="p-3">{item.job_role}</td>
                <td className="p-3 text-center">{getStatusBadge(item.status)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalEntries > 0 && (
        <div className="flex justify-between mt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            Previous
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
