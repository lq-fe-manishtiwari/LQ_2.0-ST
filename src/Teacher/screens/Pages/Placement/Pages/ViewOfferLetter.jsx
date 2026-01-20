'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Search, Eye, Upload } from 'lucide-react';

export default function ViewOfferLetter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [jobInfo] = useState({
    organization: '25 June',
    job_role: 'Java Developer',
    ctc: '12 LPA',
    opening_date: '25/06/2025',
    position_open_till: '03/07/2025'
  });

  const [students, setStudents] = useState([
    {
      student_id: 1,
      name: 'SHUBHAM SAWANT',
      interview_date: '15/12/2025',
      interview_time: '19:19',
      interview_round: 'HR Interview',
      interview_outcome: 'Selected',
      tpo_remarks: '-',
      status: 'Approve'
    }
  ]);

  const paginatedData = useMemo(() => {
    let list = students;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.name?.toLowerCase().includes(q)
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [students, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  return (
    <div className="p-0 md:p-0">
      {/* Header with Close Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Offer Letter</h2>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Job Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{jobInfo.organization}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Job Role</p>
            <p className="text-base font-medium text-gray-900">{jobInfo.job_role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CTC</p>
            <p className="text-base font-medium text-gray-900">{jobInfo.ctc}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Job Opening Date</p>
            <p className="text-base font-medium text-blue-600">{jobInfo.opening_date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Position Open Till Date</p>
            <p className="text-base font-medium text-gray-900">{jobInfo.position_open_till}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search students"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Interview Round</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Interview Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">TPO Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Upload</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.interview_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.interview_time}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.interview_round}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.interview_outcome}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.tpo_remarks}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                        title="Upload"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleView(student)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No students found
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
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          currentEntries.map((student) => (
            <div key={student.student_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    {student.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Date:</span> {student.interview_date}</div>
                  <div><span className="font-medium">Time:</span> {student.interview_time}</div>
                  <div><span className="font-medium">Round:</span> {student.interview_round}</div>
                  <div><span className="font-medium">Outcome:</span> {student.interview_outcome}</div>
                </div>
                <div><span className="font-medium">TPO Remarks:</span> {student.tpo_remarks}</div>
              </div>
              <div className="flex justify-end items-center gap-2">
                <button
                  className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                  title="Upload"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleView(student)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </button>
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

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Offer Letter Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Interview Date</p>
                    <p className="text-base font-semibold text-gray-900">{selectedStudent.interview_date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Interview Time</p>
                    <p className="text-base font-semibold text-gray-900">{selectedStudent.interview_time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Interview Round</p>
                    <p className="text-base font-semibold text-gray-900">{selectedStudent.interview_round}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Interview Outcome</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedStudent.interview_outcome === 'Selected' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedStudent.interview_outcome === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedStudent.interview_outcome}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">TPO Remarks</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedStudent.tpo_remarks || 'No remarks available'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
