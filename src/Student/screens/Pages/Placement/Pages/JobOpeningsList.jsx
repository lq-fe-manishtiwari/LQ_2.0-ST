'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../../../../_services/api';
import {
  getJobOpeningsForStudent,
  getCampusDrivesForStudent
} from '../Services/studentPlacement.service';
import RegistrationForm from './RegistrationForm';

/* ===================== ACTION BUTTON COMPONENT ===================== */
const ActionButton = ({ row, appliedPlacementIds, deadlineOver, onApply, isMobile }) => {
  if (appliedPlacementIds.has(row.placement_id)) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
      </span>
    );
  }
  
  if (deadlineOver) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Closed
      </span>
    );
  }
  
  return (
    <button
      onClick={() => onApply(row)}
      disabled={row.status === 'APPLIED'}
      className={`inline-flex items-center ${isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-1.5 text-xs'} rounded-full font-semibold transition-colors ${
        row.status === 'APPLIED'
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isMobile ? 'Apply Now' : 'Apply'}
    </button>
  );
};

export default function JobList() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState({ show: false, job: null });
  const [appliedPlacementIds, setAppliedPlacementIds] = useState(new Set());

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* ===================== DEBOUNCED SEARCH ===================== */
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    loadJobs();
  }, []);

  /* ===================== HELPERS ===================== */
  const isDeadlineOver = lastDate => {
    if (!lastDate) return false;
    return new Date(lastDate).setHours(23, 59, 59, 999) < new Date();
  };

  const formatDate = date => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Applied': { bg: 'bg-green-100', text: 'text-green-700', label: 'Applied' },
      'Scheduled': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
      'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      'Completed': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' },
      'Expired': { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' }
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

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
              : { company_name: vacancy.company_name },

          role_name: vacancy.role || vacancy.role_name,
          min_ctc: vacancy.min_ctc,
          max_ctc: vacancy.max_ctc,
          vacancy: vacancy.vacancy ?? 0,

          opening_date:
            sourceType === 'JOB'
              ? job.job_opening_date
              : job.drive_date,

          last_date: job.application_deadline,

          createdSortDate:
            sourceType === 'JOB'
              ? job.job_opening_date
              : job.drive_date,

          status:
            sourceType === 'CAMPUS' && job.status === 'SCHEDULED'
              ? 'OPEN'
              : job.status,

          placement_status: job.placement_status,
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
        combined = combined.concat(flattenVacancies(jobData, 'JOB'));

        jobData.forEach(job => {
          job.student_applications?.forEach(app => {
            if (app.placement_id) appliedIds.add(app.placement_id);
          });
        });
      }

      if (results[1].status === 'fulfilled') {
        const campusDrives = results[1].value?.campusDrives || [];
        combined = combined.concat(flattenVacancies(campusDrives, 'CAMPUS'));

        campusDrives.forEach(drive => {
          drive.student_applications?.forEach(app => {
            if (app.placement_id) appliedIds.add(app.placement_id);
          });
        });
      }

      setRows(combined);
      setAppliedPlacementIds(appliedIds);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FILTER + SORT + PAGINATION ===================== */
  const paginatedData = useMemo(() => {
    let list = [...rows];

    list.sort((a, b) => {
      const dateA = new Date(a.createdSortDate || 0);
      const dateB = new Date(b.createdSortDate || 0);
      if (dateB - dateA !== 0) return dateB - dateA;
      return b.placement_id.localeCompare(a.placement_id);
    });

    const seen = new Set();
    list = list.filter(item => {
      if (seen.has(item.placement_id)) return false;
      seen.add(item.placement_id);
      return true;
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

  const handleApply = useCallback(row => {
    setRegistration({
      show: true,
      job: {
        jobdata: row.originalJobData,
        jobOpeningId: row.job_opening_id,
        placementId: row.placement_id,
        companyName: row.company?.company_name,
        collegeId: row.college_id
      }
    });
  }, []);

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div>

      {/* SEARCH */}
      <div className="mb-6 relative w-full sm:w-80">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Search placement / role / company"
          onChange={e => debouncedSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl"
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-primary-600 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm">Placement ID</th>
              <th className="px-4 py-3 text-center text-sm">Company</th>
              <th className="px-4 py-3 text-center text-sm">Role</th>
              <th className="px-4 py-3 text-center text-sm">CTC</th>
              <th className="px-4 py-3 text-center text-sm">Vacancy</th>
              <th className="px-4 py-3 text-center text-sm">Opening Date</th>
              <th className="px-4 py-3 text-center text-sm">Last Date</th>
              <th className="px-4 py-3 text-center text-sm">Status</th>
              <th className="px-4 py-3 text-center text-sm">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {currentEntries.length > 0 ? (
              currentEntries.map(row => {
                const deadlineOver = isDeadlineOver(row.last_date);
                const disabled = deadlineOver || row.status !== 'OPEN';

                return (
                  <tr key={row.placement_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-sm">{row.placement_id}</td>
                    <td className="px-4 py-3 text-center text-sm">{row.company?.company_name}</td>
                    <td className="px-4 py-3 text-center text-sm">{row.role_name}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      ₹{row.min_ctc}L – ₹{row.max_ctc}L
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{row.vacancy}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {formatDate(row.opening_date)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {formatDate(row.last_date)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(row.placement_status || row.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActionButton 
                        row={row} 
                        appliedPlacementIds={appliedPlacementIds} 
                        deadlineOver={deadlineOver} 
                        onApply={handleApply}
                        isMobile={false}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No job openings found matching your search' : 'No job openings available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t text-sm">
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

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No job openings found</p>
              <p className="text-sm">
                {searchTerm ? 'No job openings found matching your search' : 'No job openings available at the moment'}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map(row => {
            const deadlineOver = isDeadlineOver(row.last_date);
            const disabled = deadlineOver || row.status !== 'OPEN';

            return (
              <div
                key={row.placement_id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{row.company?.company_name}</p>
                    <p className="text-sm text-gray-500">{row.role_name}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {row.placement_id}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">CTC:</span> ₹{row.min_ctc}L – ₹{row.max_ctc}L</div>
                    <div><span className="font-medium">Vacancy:</span> {row.vacancy}</div>
                    <div><span className="font-medium">Opening:</span> {formatDate(row.opening_date)}</div>
                    <div><span className="font-medium">Deadline:</span> {formatDate(row.last_date)}</div>
                  </div>
                  <div className="pt-2">
                    {getStatusBadge(row.placement_status || row.status)}
                  </div>
                </div>

                <div className="flex justify-end">
                  <ActionButton 
                    row={row} 
                    appliedPlacementIds={appliedPlacementIds} 
                    deadlineOver={deadlineOver} 
                    onApply={handleApply}
                    isMobile={true}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MOBILE PAGINATION */}
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
      {registration.show && registration.job && (
        <RegistrationForm
          job={registration.job.jobdata}
          jobOpeningId={registration.job.jobOpeningId}
          placementId={registration.job.placementId}
          collegeId={registration.job.collegeId}
          companyName={registration.job.companyName}
          onClose={() => setRegistration({ show: false, job: null })}
          onSuccess={() => {
            setRegistration({ show: false, job: null });
            loadJobs();
          }}
        />
      )}
    </div>
  );
}
  