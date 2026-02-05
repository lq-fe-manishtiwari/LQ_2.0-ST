'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJobs();
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

          // 🔑 keep full object for registration form
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

      if (results[0].status === 'fulfilled') {
        combined = combined.concat(
          flattenVacancies(results[0].value || [], 'JOB')
        );
      }

      if (results[1].status === 'fulfilled') {
        const campusDrives =
          results[1].value?.campusDrives || [];

        combined = combined.concat(
          flattenVacancies(campusDrives, 'CAMPUS')
        );
      }

      setRows(combined);
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
      totalPages,
      start,
      end
    };
  }, [rows, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

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
    <div className="p-4">

      {/* SEARCH */}
      <div className="mb-6 relative w-80">
        <Search className="absolute left-3 top-3 text-gray-400" />
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

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Placement ID</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">CTC</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}

            {currentEntries.map(row => (
              <tr
                key={`${row.sourceType}-${row.placement_id}`}
                className="border-t"
              >
                <td className="px-6 py-4">{row.placement_id}</td>
                <td className="px-6 py-4">{row.company?.company_name}</td>
                <td className="px-6 py-4">{row.role_name}</td>
                <td className="px-6 py-4">
                  ₹{row.min_ctc}L – ₹{row.max_ctc}L
                </td>
                <td className="px-6 py-4">{row.status}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleApply(row)}
                    disabled={row.status !== 'OPEN'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        />
      )}
    </div>
  );
}
