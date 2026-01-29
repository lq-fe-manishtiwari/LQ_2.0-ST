'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Eye, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
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
          className={`w-full px-3 py-2 border ${disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
            } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
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

export default function Offer() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    filterOpen: false,
    jobRole: '',
    department: '',
    class: '',
    semester: '',
    offerReceived: '',
    offerAccepted: ''
  });

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    const mockData = [
      {
        placement_id: 'PL20250446',
        organization: '25 June',
        opening_date: '25/06/2025',
        job_role: 'Java Developer',
        department: 'BCOM',
        class: 'GRade',
        semester: 'S1',
        division: 'A',
        received: '',
        date: '',
        accepted: '',
        student_registration: 'Yes'
      }
    ];
    setOffers(mockData);
    setLoading(false);
  };

  const paginatedData = useMemo(() => {
    let list = offers;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.organization?.toLowerCase().includes(q) ||
        item.job_role?.toLowerCase().includes(q) ||
        item.placement_id?.toLowerCase().includes(q)
      );
    }

    if (filters.jobRole) {
      list = list.filter(item => item.job_role === filters.jobRole);
    }
    if (filters.department) {
      list = list.filter(item => item.department === filters.department);
    }
    if (filters.class) {
      list = list.filter(item => item.class === filters.class);
    }
    if (filters.semester) {
      list = list.filter(item => item.semester === filters.semester);
    }
    if (filters.offerReceived) {
      list = list.filter(item => item.received === filters.offerReceived);
    }
    if (filters.offerAccepted) {
      list = list.filter(item => item.accepted === filters.offerAccepted);
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [offers, searchTerm, currentPage, filters]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  const handleView = (id) => {
    navigate(`/view-offer/${id}`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offer Management</h2>
          <p className="text-gray-600 mt-1">Manage job offers and acceptances</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search offers"
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
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomSelect
              label="Job Role"
              value={filters.jobRole}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, jobRole: e.target.value }));
                resetPage();
              }}
              options={['Java Developer', 'Developer', 'frontend', 'backend']}
              placeholder="Select Job Role"
            />
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, department: e.target.value }));
                resetPage();
              }}
              options={['BCOM', 'BCA', 'BSC']}
              placeholder="Select Department"
            />
            <CustomSelect
              label="Class"
              value={filters.class}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, class: e.target.value }));
                resetPage();
              }}
              options={['GRade', 'Grade A', 'Grade B']}
              placeholder="Select Class"
            />
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, semester: e.target.value }));
                resetPage();
              }}
              options={['S1', 'S2', 'S3', 'S4']}
              placeholder="Select Semester"
            />
            <CustomSelect
              label="Offer Received"
              value={filters.offerReceived}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, offerReceived: e.target.value }));
                resetPage();
              }}
              options={['Yes', 'No']}
              placeholder="Select Status"
            />
            <CustomSelect
              label="Offer Accepted"
              value={filters.offerAccepted}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, offerAccepted: e.target.value }));
                resetPage();
              }}
              options={['Yes', 'No']}
              placeholder="Select Status"
            />
          </div>
        </div>
      )}

      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Placement ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Organisation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Job Opening Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Job Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Semester</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Received</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Accepted</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Student Registration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.placement_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.organization}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.opening_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.job_role}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.class}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.semester}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.received || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.accepted || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.student_registration === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.student_registration}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => handleView(item.placement_id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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

      <div className="lg:hidden space-y-4">
        {currentEntries.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.placement_id}</p>
                <p className="text-xs text-gray-500 mt-1">{item.organization}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.student_registration === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {item.student_registration}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Opening Date:</span>
                <span className="text-gray-900 font-medium">{item.opening_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Job Role:</span>
                <span className="text-gray-900">{item.job_role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="text-gray-900">{item.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Class:</span>
                <span className="text-gray-900">{item.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Semester:</span>
                <span className="text-gray-900">{item.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Received:</span>
                <span className="text-gray-900">{item.received || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-900">{item.date || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accepted:</span>
                <span className="text-gray-900">{item.accepted || '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
              <button onClick={() => handleView(item.placement_id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1
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
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages
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
