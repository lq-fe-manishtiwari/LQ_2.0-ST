'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';

export default function InterviewRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [formData, setFormData] = useState({
    round_name: '',
    round_type: '',
    description: ''
  });

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;
      const response = await placementService.getInterviewRoundsByCollege(collegeId);
      console.log('Interview Rounds API Response:', response);
      const data = response?.interviewRounds || response || [];
      setRounds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching interview rounds:', error);
      setRounds([]);
      if (!error.message?.includes('not found')) {
        Swal.fire('Error', 'Failed to fetch interview rounds', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRound(null);
    setFormData({ round_name: '', round_type: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (round) => {
    setEditingRound(round);
    setFormData({
      round_name: round.round_name,
      round_type: round.round_type,
      description: round.description
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;
      
      const payload = {
        college_id: collegeId,
        ...formData
      };

      if (editingRound) {
        await placementService.updateInterviewRound(editingRound.round_id, payload);
        Swal.fire('Updated!', 'Interview round updated successfully', 'success');
      } else {
        await placementService.createInterviewRound(payload);
        Swal.fire('Added!', 'Interview round added successfully', 'success');
      }
      setShowModal(false);
      fetchRounds();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to save interview round', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await placementService.deleteInterviewRound(id);
        Swal.fire('Deleted!', 'Interview round has been deleted.', 'success');
        fetchRounds();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete interview round', 'error');
      }
    }
  };

  // Filtered + Paginated Data
  const paginatedData = useMemo(() => {
    let list = rounds;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.round_name?.toLowerCase().includes(q) ||
        item.round_type?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [rounds, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  return (
    <div className="p-0 md:p-0">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for rounds"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Round</span>
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Round Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((round) => (
                  <tr key={round.round_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{round.round_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{round.round_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{round.description}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEdit(round)} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(round.round_id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No rounds found matching your search' : 'No interview rounds found'}
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
              className={`px-4 py-2 rounded-md ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
            </span>
            <button
              onClick={handleNext}
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
              <p className="text-lg font-medium mb-2">No rounds found</p>
              <p className="text-sm">
                {searchTerm ? 'No rounds found matching your search' : 'No interview rounds found'}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((round) => (
            <div key={round.round_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{round.round_name}</p>
                  <p className="text-sm text-gray-500">{round.round_type}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div><span className="font-medium">Description:</span> {round.description}</div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <button onClick={() => handleEdit(round)} className="text-blue-600 hover:text-blue-800">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(round.round_id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
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
            className={`px-4 py-2 rounded-md ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={handleNext}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingRound ? 'Edit' : 'Add'} Interview Round</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round Name</label>
                  <input
                    type="text"
                    value={formData.round_name}
                    onChange={(e) => setFormData({ ...formData, round_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.round_type}
                    onChange={(e) => setFormData({ ...formData, round_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingRound ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 