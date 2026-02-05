'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, CheckCircle, MapPin } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { api } from '../../../../../_services/api';

/* -------------------- MAPPER FUNCTION -------------------- */
const mapInterviewResponseToUI = (apiInterviews = []) => {
  const rows = [];

  apiInterviews.forEach((app) => {
    const {
      placement_id,
      company_name,
      job_role,
      interview_applications = []
    } = app;

    interview_applications.forEach((roundApp) => {
      const isCompleted = roundApp.attendance_status !== null;
      const isSelected =
        roundApp.is_last_round === true &&
        roundApp.is_selected_for_next_round === true;

      rows.push({
        interview_id: roundApp.interview_round_application_id,
        placement_id,
        organisation: company_name,
        job_role,

        interview_date: roundApp.scheduled_date || '-',
        interview_time: roundApp.scheduled_time || '-',
        venue: roundApp.round_type === 'HR' ? 'Campus / HR Room' : 'Online',

        round: roundApp.round_name,

        outcome: isSelected
          ? 'Selected'
          : roundApp.is_last_round
          ? 'Rejected'
          : '',

        tpo_remark: roundApp.comment || '-',
        student_registration: 'Yes',

        status: isCompleted ? 'completed' : 'scheduled',
        result: isSelected ? 'Selected' : null
      });
    });
  });

  return rows;
};
/* --------------------------------------------------------- */

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);

      const res = await api.getUserProfile();
      const prnNo = res?.data?.permanent_registration_number;

      if (!prnNo) {
        setInterviews([]);
        return;
      }

      const interviewRes =
        await studentPlacementService.getStudentInterviews(prnNo);

      const normalizedData = mapInterviewResponseToUI(
        interviewRes?.interviews || []
      );

      setInterviews(normalizedData);
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, result) => {
    if (status === 'completed') {
      if (result === 'Selected') {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CheckCircle className="w-3 h-3" />
            Selected
          </span>
        );
      }
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
        <Clock className="w-3 h-3" />
        Scheduled
      </span>
    );
  };

  const paginatedData = useMemo(() => {
    let list = interviews.filter((i) => {
      const matchesSearch =
        i.organisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.job_role?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'all' ||
        (filterType === 'upcoming' && i.status === 'scheduled') ||
        (filterType === 'completed' && i.status === 'completed');

      return matchesSearch && matchesType;
    });

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;

    return {
      currentEntries: list.slice(start, start + entriesPerPage),
      totalEntries,
      totalPages
    };
  }, [interviews, searchTerm, filterType, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Search & Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="search"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full sm:w-80"
        />

        {['all', 'upcoming', 'completed'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-lg ${
              filterType === t
                ? 'bg-blue-600 text-white'
                : 'border bg-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="p-3 text-left">Placement ID</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Round</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              {/* <th className="p-3 text-left">Venue</th> */}
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No interviews found
                </td>
              </tr>
            ) : (
              currentEntries.map((item) => (
                <tr key={item.interview_id} className="border-t">
                  <td className="p-3">{item.placement_id}</td>
                  <td className="p-3">{item.organisation}</td>
                  <td className="p-3">{item.job_role}</td>
                  <td className="p-3">{item.round}</td>
                  <td className="p-3">{item.interview_date}</td>
                  <td className="p-3">{item.interview_time}</td>
                  {/* <td className="p-3 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {item.venue}
                  </td> */}
                  <td className="p-3">
                    {getStatusBadge(item.status, item.result)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
