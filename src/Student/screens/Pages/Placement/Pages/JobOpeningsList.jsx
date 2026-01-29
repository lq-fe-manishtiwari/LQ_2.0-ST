'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { getJobOpeningsForStudent } from '../Services/studentPlacement.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getUserId } = useUserProfile();

  const [filters, setFilters] = useState({
    filterOpen: false,
    role: '',
    department: ''
  });

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Get student ID using useUserProfile hook like AddStudentProject
      const res = await api.getUserProfile();
      const studentId = res.data?.student_id; // Assuming userId is the student ID
      // console.log(res);
      
      if (!studentId) {
        console.error('Student ID not found');
        setJobs([]);
        return;
      }
      
      const jobOpenings = await getJobOpeningsForStudent(studentId);
      setJobs(jobOpenings || []);
    } catch (error) {
      console.error('Failed to load job openings:', error);
      // Fallback to mock data
      const mockData = [
        {
          placement_id: 'PL20260101',
          organisation: 'Infosys',
          opening_date: '15/01/2026',
          job_role: 'Software Engineer',
          selection_criteria: 'CGPA >= 7.0, No backlogs',
          ctc: '8.5',
          job_description: 'Full stack development with Java and React',
          position_open_till: '28/02/2026',
          expected_joining_date: '01/07/2026'
        },
        {
          placement_id: 'PL20260102',
          organisation: 'TCS',
          opening_date: '20/01/2026',
          job_role: 'System Engineer',
          selection_criteria: 'CGPA >= 6.5, All branches',
          ctc: '7.2',
          job_description: 'Software development and maintenance',
          position_open_till: '15/03/2026',
          expected_joining_date: '15/07/2026'
        }
      ];
      setJobs(mockData);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = useMemo(() => {
    let list = jobs;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.organisation?.toLowerCase().includes(q) ||
        item.job_role?.toLowerCase().includes(q) ||
        item.placement_id?.toLowerCase().includes(q)
      );
    }

    if (filters.role) {
      list = list.filter(item => item.job_role === filters.role);
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [jobs, searchTerm, currentPage, filters]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  const handleApply = (id, company) => {
    setAlert(
      <SweetAlert
        success
        title="Application Submitted!"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        Your application to {company} has been submitted successfully!
      </SweetAlert>
    );
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for jobs"
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
        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                <option value="">All Roles</option>
                <option value="Test">Test</option>
              </select>
            </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Selection Criteria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">CTC (LPA)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Position Open Till</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Expected Joining Date</th>
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
                    <td className="px-6 py-4 text-sm text-gray-500">{item.selection_criteria}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.ctc}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.position_open_till}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.expected_joining_date}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleApply(item.placement_id, item.organisation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Apply
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filters.role ? 'No jobs found matching your search or filters' : 'No jobs found'}
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
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
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
              <p className="text-lg font-medium mb-2">No jobs found</p>
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
                  <div><span className="font-medium">CTC:</span> {item.ctc} LPA</div>
                  <div><span className="font-medium">Opening:</span> {item.opening_date}</div>
                  <div><span className="font-medium">Deadline:</span> {item.position_open_till}</div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button
                  onClick={() => handleApply(item.placement_id, item.organisation)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
