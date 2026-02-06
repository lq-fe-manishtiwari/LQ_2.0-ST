'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle, Clock, Calendar } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { api } from '../../../../../_services/api';

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

      const data = await studentPlacementService.getStudentInterviews(prnNo);
      setInterviews(data?.interviews || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowModal(true);
  };

  const paginatedData = useMemo(() => {
    let list = interviews.filter((i) =>
      i.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.job_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.placement_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;

    return {
      currentEntries: list.slice(start, start + entriesPerPage),
      totalEntries,
      totalPages,
      start
    };
  }, [interviews, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages, start } = paginatedData;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0">
      {/* Search */}
      <div className="mb-6 relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Total Rounds</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No interviews found
                  </td>
                </tr>
              ) : (
                currentEntries.map((item) => (
                  <tr key={item.application_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{item.company_name}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">{item.interview_rounds?.length || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors font-medium text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(start + entriesPerPage, totalEntries)} of {totalEntries} entries
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
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
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-500">No interviews found</p>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.application_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.placement_id}</p>
                  <p className="text-sm text-gray-500">{item.company_name}</p>
                  <p className="text-xs text-gray-400">{item.job_role}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-3">
                <span className="font-medium">Total Rounds:</span> {item.interview_rounds?.length || 0}
              </div>
              <button
                onClick={() => handleViewDetails(item)}
                className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {start + 1}–{Math.min(start + entriesPerPage, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedInterview.placement_id}</h2>
                <p className="text-sm opacity-90">{selectedInterview.company_name} - {selectedInterview.job_role}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Rounds Tracking</h3>

              {/* Rounds Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary-600">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Round</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Type</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Comment</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInterview.interview_applications?.map((app, idx) => (
                        <tr key={app.interview_round_application_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-center text-gray-900">{app.round_name}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{app.round_type}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{app.scheduled_date || '-'}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{app.scheduled_time || '-'}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            {app.attendance_status === 'PRESENT' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            ) : app.scheduled_date ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                <Clock className="w-3 h-3" />
                                Scheduled
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{app.rating || '-'}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{app.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Round Details - Grid Style */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Interview Process Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedInterview.interview_rounds?.map((round, idx) => {
                    const application = selectedInterview.interview_applications?.find(app => app.round_id === round.round_id);
                    const isCompleted = application?.attendance_status === 'PRESENT';
                    const isScheduled = application?.scheduled_date;

                    return (
                      <div key={round.round_id} className={`relative rounded-lg border-2 p-4 shadow-sm ${
                        isCompleted ? 'border-green-200 bg-green-50' :
                        isScheduled ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-white'
                      }`}>
                        {/* Round Number Badge */}
                        <div className="absolute -top-3 -left-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isScheduled ? 'bg-blue-500 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {round.round_order}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-end mb-2">
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {!isCompleted && isScheduled && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              <Clock className="w-3 h-3" />
                              Scheduled
                            </span>
                          )}
                          {!isCompleted && !isScheduled && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Pending</span>
                          )}
                        </div>

                        {/* Round Info */}
                        <div className="mb-3">
                          <h5 className="font-semibold text-gray-900 text-base">{round.round_name}</h5>
                          <p className="text-sm text-gray-600">{round.round_type}</p>
                        </div>

                        {round.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{round.description}</p>
                        )}

                        {/* Details Grid */}
                        <div className="space-y-2 text-sm">
                          {application?.scheduled_date && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span>{application.scheduled_date}</span>
                            </div>
                          )}
                          {application?.scheduled_time && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>{application.scheduled_time}</span>
                            </div>
                          )}
                          {application?.rating && (
                            <div className="text-gray-600">
                              <span className="font-medium">Rating:</span> <span className="text-green-600 font-semibold">{application.rating}/10</span>
                            </div>
                          )}
                          {round.duration_minutes && (
                            <div className="text-gray-600">
                              <span className="font-medium">Duration:</span> {round.duration_minutes} min
                            </div>
                          )}
                        </div>

                        {application?.comment && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 font-medium mb-1">TPO Comment:</p>
                            <p className="text-sm text-gray-700 italic line-clamp-2">"{application.comment}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
