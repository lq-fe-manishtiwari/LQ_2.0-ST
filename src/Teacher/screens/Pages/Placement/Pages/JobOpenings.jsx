'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Filter, ChevronDown, X, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert";

// Custom Select Component
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

export default function JobOpeningDashboard() {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    filterOpen: false,
    jobRole: '',
    department: '',
    class: '',
    semester: ''
  });

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - replace with actual API call
  useEffect(() => {
    loadJobOpenings();
  }, []);

  const loadJobOpenings = async () => {
    setLoading(true);
    // Mock data
    const mockData = [
      {
        placement_id: 452,
        organisation: 'LQ',
        opening_date: '15/12/2025',
        job_role: 'frontend',
        department: 'BCOM',
        class: 'GRade',
        semester: 'S1',
        selection_criteria: 'A',
        ctc: '12 LPA',
        job_description: 'JD',
        position_open_till: '15/12/2025',
        expected_joining_date: '24/12/2025'
      }
    ];
    setJobOpenings(mockData);
    setLoading(false);
  };

  const paginatedData = useMemo(() => {
    let list = jobOpenings;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.organisation?.toLowerCase().includes(q) ||
        item.job_role?.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q)
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

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [jobOpenings, searchTerm, currentPage, filters]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  const handleDeleteConfirm = (id) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(id)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover this record!
      </SweetAlert>
    );
  };

  const confirmDelete = async (id) => {
    try {
      // API call to delete
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Job opening deleted successfully.
        </SweetAlert>
      );
      loadJobOpenings();
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to delete job opening.
        </SweetAlert>
      );
    }
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
      {alert}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search job openings"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          <button
            onClick={() => navigate('/teacher/placement/jobs/add')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Job Opening</span>
          </button>
        </div>
      </div>

      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CustomSelect
              label="Job Role"
              value={filters.jobRole}
              onChange={(e) => setFilters(prev => ({ ...prev, jobRole: e.target.value }))}
              options={['frontend', 'backend', 'fullstack', 'designer']}
              placeholder="Select Job Role"
            />
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              options={['BCOM', 'BCA', 'BSC']}
              placeholder="Select Department"
            />
            <CustomSelect
              label="Class"
              value={filters.class}
              onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              options={['Grade A', 'Grade B']}
              placeholder="Select Class"
            />
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              options={['S1', 'S2', 'S3', 'S4']}
              placeholder="Select Semester"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Opening Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Job Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Selection Criteria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">CTC (LPA)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Position Open Till</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Expected Joining</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.placement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.organisation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.opening_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.selection_criteria}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.ctc}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.position_open_till}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.expected_joining_date}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/teacher/placement/jobs/view/${item.placement_id}`)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/placement/jobs/edit/${item.placement_id}`)}
                          className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(item.placement_id)}
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
                  <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                    No job openings found
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
              <p className="text-lg font-medium mb-2">No job openings found</p>
            </div>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.placement_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.organisation}</p>
                  <p className="text-sm text-gray-500">{item.job_role}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">ID:</span> {item.placement_id}</div>
                  <div><span className="font-medium">CTC:</span> {item.ctc}</div>
                  <div><span className="font-medium">Department:</span> {item.department}</div>
                  <div><span className="font-medium">Class:</span> {item.class}</div>
                  <div><span className="font-medium">Opening:</span> {item.opening_date}</div>
                  <div><span className="font-medium">Closing:</span> {item.position_open_till}</div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/jobs/view/${item.placement_id}`)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/placement/jobs/edit/${item.placement_id}`)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(item.placement_id)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
