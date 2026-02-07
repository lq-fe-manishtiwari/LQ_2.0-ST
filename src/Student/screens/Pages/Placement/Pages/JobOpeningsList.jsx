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
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
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
              <th className="px-4 py-3 text-center text-sm">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {currentEntries.map(row => {
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
                    {appliedPlacementIds.has(row.placement_id) ? (
                      <span className="inline-flex items-center text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Applied
                      </span>
                    ) : (
                      <button
                        disabled={disabled}
                        onClick={() => handleApply(row)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded disabled:opacity-50"
                      >
                        {deadlineOver ? 'Closed' : 'Apply'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t text-sm">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              {(currentPage - 1) * entriesPerPage + 1}–
              {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* REGISTRATION FORM */}
      {showRegistration && selectedJob && (
        <RegistrationForm
          job={selectedJob.jobdata}
          jobOpeningId={selectedJob.jobOpeningId}
          placementId={selectedJob.placementId}
          collegeId={selectedJob.collegeId}
          companyName={selectedJob.companyName}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false);
            loadJobs();
          }}
        />
      )}
    </div>
  );
}
