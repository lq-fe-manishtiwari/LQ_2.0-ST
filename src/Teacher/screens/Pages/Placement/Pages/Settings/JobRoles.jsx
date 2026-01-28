'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';

export default function JobRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [formData, setFormData] = useState({
    role_name: '',
    job_code: '',
    job_description: '',
    job_category_id: 1
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;
      const response = await placementService.getJobRolesByCollege(collegeId);
      const data = response?.jobRoles || response || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
      if (!error.message?.includes('not found')) {
        Swal.fire('Error', 'Failed to fetch job roles', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ role_name: '', job_code: '', job_description: '', job_category_id: 1 });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingId(role.job_role_id || role.id);
    setFormData(role);
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

      if (editingId) {
        await placementService.updateJobRole(editingId, payload);
        Swal.fire('Updated!', 'Job role updated successfully.', 'success');
      } else {
        await placementService.createJobRole(payload);
        Swal.fire('Added!', 'Job role added successfully.', 'success');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to save job role', 'error');
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
        await placementService.deleteJobRole(id);
        Swal.fire('Deleted!', 'Job role has been deleted.', 'success');
        fetchRoles();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete job role', 'error');
      }
    }
  };

  const paginatedData = useMemo(() => {
    let list = Array.isArray(roles) ? roles : [];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => item.title?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q));
    }
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);
    return { currentEntries, totalEntries, totalPages, start, end };
  }, [roles, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;
  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  return (
    <div className="p-0 md:p-0">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search job roles"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Role</span>
        </button>
      </div>

      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Role Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Job Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50  tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((role) => (
                  <tr key={role.job_role_id || role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{role.role_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{role.job_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{role.job_description}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(role.job_role_id || role.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No roles found matching your search' : 'No job roles found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Previous</button>
            <span className="text-gray-700 font-medium">Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries</span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Next</button>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">No roles found</p>
          </div>
        ) : (
          currentEntries.map((role) => (
            <div key={role.job_role_id || role.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{role.role_name}</p>
                  <p className="text-sm text-gray-500">{role.job_code}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div><span className="font-medium">Description:</span> {role.job_description}</div>
              </div>
              <div className="flex justify-end items-center gap-2">
                <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                <button onClick={() => handleDelete(role.job_role_id || role.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Previous</button>
          <span className="text-gray-700 font-medium text-xs">{paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Next</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit' : 'Add'} Job Role</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Code</label>
                  <input
                    type="text"
                    value={formData.job_code}
                    onChange={(e) => setFormData({ ...formData, job_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
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
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
