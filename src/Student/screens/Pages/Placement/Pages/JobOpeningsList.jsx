'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { getJobOpeningsForStudent } from '../Services/studentPlacement.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';
import RegistrationForm from './RegistrationForm';

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

  const [showRegistration, setShowRegistration] = useState(false);
const [selectedJob, setSelectedJob] = useState(null);


  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getUserProfile();
      const studentId = res.data?.student_id;
      
      if (!studentId) {
        console.error('Student ID not found');
        setJobs([]);
        return;
      }
      
      const jobOpenings = await getJobOpeningsForStudent(studentId);
      setJobs(jobOpenings || []);
    } catch (error) {
      console.error('Failed to load job openings:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = useMemo(() => {
    let list = jobs;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.company?.company_name?.toLowerCase().includes(q) ||
        item.job_roles?.some(role => role.role_name?.toLowerCase().includes(q)) ||
        item.job_opening_id?.toString().includes(q)
      );
    }

    if (filters.role) {
      list = list.filter(item => 
        item.job_roles?.some(role => role.role_name === filters.role)
      );
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

 const handleApply = (job) => {
  console.log(job);
  setSelectedJob({
    jobdata:job,
    jobOpeningId: job.job_opening_id,
    companyName: job.company?.company_name,
    collegeId: job.college_id
  });
  setShowRegistration(true);
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
                {jobs.flatMap(job => job.job_roles || []).map(role => (
                  <option key={role.job_role_id} value={role.role_name}>{role.role_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Job Opening ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Opening Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">CTC Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Application Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50  tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.job_opening_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.job_opening_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.company?.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_opening_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.job_roles?.map(role => role.role_name).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.vacancy_details?.length > 0 && 
                        `₹${item.vacancy_details[0].min_ctc}L - ₹${item.vacancy_details[0].max_ctc}L`
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.application_deadline}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.venue}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                     <button
  onClick={() => handleApply(item)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
  disabled={item.status !== 'OPEN'}
>
  Apply
</button>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filters.role ? 'No jobs found matching your search or filters' : 'No jobs found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
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
            <div key={item.job_opening_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.company?.company_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.job_roles?.map(role => role.role_name).join(', ')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">ID:</span> {item.job_opening_id}</div>
                  <div><span className="font-medium">CTC:</span> 
                    {item.vacancy_details?.length > 0 && 
                      `₹${item.vacancy_details[0].min_ctc}L - ₹${item.vacancy_details[0].max_ctc}L`
                    }
                  </div>
                  <div><span className="font-medium">Opening:</span> {item.job_opening_date}</div>
                  <div><span className="font-medium">Deadline:</span> {item.application_deadline}</div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button
                  onClick={() => handleApply(item)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  disabled={item.status !== 'OPEN'}
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
      {showRegistration && selectedJob && (
  <RegistrationForm
    job={selectedJob.jobdata}  
    jobOpeningId={selectedJob.jobOpeningId}
    collegeId={selectedJob.collegeId}
    companyName={selectedJob.companyName}
    onClose={() => setShowRegistration(false)}
  />
)}

    </div>
  );
}
