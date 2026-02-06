'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../../../../_services/api';
import {
  getJobOpeningsForStudent,
  getCampusDrivesForStudent
} from '../Services/studentPlacement.service';
import RegistrationForm from './RegistrationForm';

export default function JobList() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedPlacementIds, setAppliedPlacementIds] = useState(new Set());

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJobs();
    
    // Load applied IDs from localStorage on mount
    try {
      const stored = localStorage.getItem('appliedPlacementIds');
      if (stored) {
        const storedIds = JSON.parse(stored);
        setAppliedPlacementIds(new Set(storedIds));
      }
    } catch (err) {
      console.error('Failed to load applied IDs:', err);
    }
  }, []);

  /* ===================== NORMALIZATION ===================== */

  const flattenVacancies = (jobs = [], sourceType) => {
    const result = [];

    jobs.forEach(job => {
      (job.vacancy_details || []).forEach(vacancy => {
        result.push({
          placement_id: vacancy.placement_id,
          sourceType,

          job_opening_id:
            sourceType === 'JOB' ? job.job_opening_id : job.drive_id,

          company:
            sourceType === 'JOB'
              ? job.company
              : job.companies?.[0] || {},

          role_name: vacancy.role,
          min_ctc: vacancy.min_ctc,
          max_ctc: vacancy.max_ctc,

          job_opening_date:
            sourceType === 'JOB'
              ? job.job_opening_date
              : job.drive_date,

          application_deadline: job.application_deadline,
          venue: job.venue,

          status:
            sourceType === 'CAMPUS' && job.status === 'SCHEDULED'
              ? 'OPEN'
              : job.status,

          college_id: job.college_id,

          originalJobData: {
            ...job,
            vacancy_details: [vacancy]
          }
        });
      });
    });

    return result;
  };

  /* ===================== LOAD DATA ===================== */

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getUserProfile();
      const studentId = res.data?.student_id;

      if (!studentId) {
        setRows([]);
        return;
      }

      const results = await Promise.allSettled([
        getJobOpeningsForStudent(studentId),
        getCampusDrivesForStudent(studentId)
      ]);

      let combined = [];
      const appliedIds = new Set();

      if (results[0].status === 'fulfilled') {
        const jobData = results[0].value || [];
        combined = combined.concat(
          flattenVacancies(jobData, 'JOB')
        );
        
        // Track applied placement IDs from job openings
        jobData.forEach(job => {
          if (job.student_applications && Array.isArray(job.student_applications)) {
            job.student_applications.forEach(app => {
              if (app.placement_id) appliedIds.add(app.placement_id);
            });
          }
        });
      }

      if (results[1].status === 'fulfilled') {
        const campusDrives = results[1].value?.campusDrives || [];
        combined = combined.concat(
          flattenVacancies(campusDrives, 'CAMPUS')
        );
        
        // Track applied placement IDs from campus drives
        campusDrives.forEach(drive => {
          if (drive.student_applications && Array.isArray(drive.student_applications)) {
            drive.student_applications.forEach(app => {
              if (app.placement_id) appliedIds.add(app.placement_id);
            });
          }
        });
      }

      setRows(combined);
      
      // Load from localStorage and merge with API data
      try {
        const stored = localStorage.getItem('appliedPlacementIds');
        if (stored) {
          const storedIds = JSON.parse(stored);
          storedIds.forEach(id => appliedIds.add(id));
        }
      } catch (err) {
        console.error('Failed to load applied IDs:', err);
      }
      
      setAppliedPlacementIds(appliedIds);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FILTER + PAGINATION ===================== */

  const paginatedData = useMemo(() => {
    let list = rows;

    // Sort by date - latest first
    list = list.sort((a, b) => {
      const dateA = new Date(a.job_opening_date || 0);
      const dateB = new Date(b.job_opening_date || 0);
      return dateB - dateA;
    });

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.company?.company_name?.toLowerCase().includes(q) ||
        item.role_name?.toLowerCase().includes(q) ||
        item.placement_id?.toString().includes(q)
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;

    return {
      currentEntries: list.slice(start, end),
      totalEntries,
      totalPages
    };
  }, [rows, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleApply = row => {
    setSelectedJob({
      jobdata: row.originalJobData,
      jobOpeningId: row.job_opening_id,
      placementId: row.placement_id,
      companyName: row.company?.company_name,
      collegeId: row.college_id
    });
    setShowRegistration(true);
  };

  const handleApplicationSuccess = () => {
    if (selectedJob?.placementId) {
      const newAppliedIds = new Set([...appliedPlacementIds, selectedJob.placementId]);
      setAppliedPlacementIds(newAppliedIds);
      
      // Persist to localStorage
      try {
        localStorage.setItem('appliedPlacementIds', JSON.stringify([...newAppliedIds]));
      } catch (err) {
        console.error('Failed to save applied IDs:', err);
      }
    }
    setShowRegistration(false);
    setSelectedJob(null);
  };

  /* ===================== UI ===================== */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0">

      {/* SEARCH */}
      <div className="mb-6 relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search placement / role / company"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Company</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Role</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">CTC</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No records found matching your search' : 'No records found'}
                  </td>
                </tr>
              ) : (
                currentEntries.map(row => (
                  <tr
                    key={`${row.sourceType}-${row.placement_id}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{row.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{row.company?.company_name}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{row.role_name}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                      ₹{row.min_ctc}L – ₹{row.max_ctc}L
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{row.status}</td>
                    <td className="px-6 py-4 text-center">
                      {appliedPlacementIds.has(row.placement_id) ? (
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-600 rounded-full font-medium text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(row)}
                          disabled={row.status !== 'OPEN'}
                          className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                        >
                          Apply
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {(currentPage - 1) * entriesPerPage + 1}–{Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No records found</p>
              <p className="text-sm">
                {searchTerm ? 'No records found matching your search' : 'No placement opportunities available at the moment.'}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map(row => (
            <div
              key={`${row.sourceType}-${row.placement_id}`}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{row.company?.company_name}</p>
                  <p className="text-sm text-gray-500">{row.role_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  row.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {row.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Placement ID:</span> {row.placement_id}</div>
                  <div><span className="font-medium">CTC:</span> ₹{row.min_ctc}L – ₹{row.max_ctc}L</div>
                </div>
              </div>

              <div className="flex justify-end">
                {appliedPlacementIds.has(row.placement_id) ? (
                  <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-600 rounded-full font-medium text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(row)}
                    disabled={row.status !== 'OPEN'}
                    className="w-full sm:w-auto px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {(currentPage - 1) * entriesPerPage + 1}–{Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
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

      {/* REGISTRATION FORM */}
      {showRegistration && selectedJob && (
        <RegistrationForm
          job={selectedJob.jobdata}
          jobOpeningId={selectedJob.jobOpeningId}
          placementId={selectedJob.placementId}
          collegeId={selectedJob.collegeId}
          companyName={selectedJob.companyName}
          onClose={() => {
            setShowRegistration(false);
            setSelectedJob(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}
