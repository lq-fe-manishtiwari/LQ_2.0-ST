'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';

export default function EligibilityCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // ✅ formData now includes name and field details
  const [formData, setFormData] = useState([
    { id: 1, name: '', fieldType: '', fieldValue: '' }
  ]);

  useEffect(() => {
    fetchCriteria();
  }, []);

  // ================= FETCH =================

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;

      const data = await placementService.getEligibilityCriteriaByCollege(collegeId);
      console.log('Eligibility API Response:', data);
      
      // API returns direct array format
      const criteriaList = Array.isArray(data) ? data : [];
      
      console.log('Processed Criteria List:', criteriaList);
      
      // Map to correct field names based on API response structure
      const validCriteria = criteriaList
        .filter(item => item && item.criteria_name && item.criteria_id)
        .map(item => ({
          id: item.criteria_id,
          name: item.criteria_name,
          rawFields: item.criteria_field || [],
          fields: Array.isArray(item.criteria_field) ? 
            item.criteria_field.map(f => {
              // Get all keys except field_id
              const fieldKeys = Object.keys(f).filter(key => key !== 'field_id');
              return fieldKeys.map(key => `${key}: ${f[key]}`).join(', ');
            }).join('; ') : 
            'N/A'
        }));
      
      console.log('Final Mapped Criteria:', validCriteria);
      setCriteria(validCriteria);
      setCurrentPage(1); // Reset pagination after fetch
    } catch (error) {
      console.error('Error fetching eligibility criteria:', error);
      setCriteria([]);
      if (!error.message?.includes('not found')) {
        Swal.fire('Error', 'Failed to fetch eligibility criteria', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD / EDIT =================

  const handleAdd = () => {
    setEditingId(null);
    setFormData([{ id: 1, name: '', fieldType: '', fieldValue: '' }]);
    setShowModal(true);
  };

  const handleEdit = (criterion) => {
    setEditingId(criterion.id);
    
    // Use rawFields to preserve all existing fields
    if (criterion.rawFields && criterion.rawFields.length > 0) {
      setFormData(
        criterion.rawFields.map(f => {
          const fieldKey = Object.keys(f).find(k => k !== 'field_id');
          return {
            id: f.field_id,
            name: criterion.name,
            fieldType: fieldKey || '',
            fieldValue: f[fieldKey] || ''
          };
        })
      );
    } else {
      setFormData([{
        id: null,
        name: criterion.name,
        fieldType: '',
        fieldValue: ''
      }]);
    }
    
    setShowModal(true);
  };

  // ================= FORM HELPERS =================

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addRow = () => {
    setFormData([
      ...formData,
      { id: null, name: '', fieldType: '', fieldValue: '' }
    ]);
  };

  const removeRow = (index) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;

      if (editingId) {
        // UPDATE → all rows
        const payload = {
          criteria_name: formData[0].name,
          criteria_field: formData.map(row => ({
            field_id: row.id || `fld_${Math.random().toString(36).substr(2, 8)}`,
            [row.fieldType]: row.fieldValue
          })),
          is_deleted: false
        };
        console.log('UPDATE Payload:', JSON.stringify(payload, null, 2));
        
        try {
          const result = await placementService.updateEligibilityCriteria(editingId, payload);
          console.log('UPDATE Result:', result);
          Swal.fire('Updated!', 'Eligibility criteria updated successfully.', 'success');
        } catch (updateError) {
          console.error('Update failed:', updateError);
          throw new Error('Server error occurred while updating. Please try again.');
        }
      } else {
        // CREATE → all rows
        const payload = {
          college_id: collegeId,
          criteria_name: formData[0].name,
          criteria_field: formData.map(row => ({
            field_id: `fld_${Math.random().toString(36).substr(2, 8)}`,
            [row.fieldType]: row.fieldValue
          })),
          is_deleted: false
        };
        console.log('CREATE Payload:', JSON.stringify(payload, null, 2));
        
        try {
          const result = await placementService.createEligibilityCriteria(payload);
          console.log('CREATE Result:', result);
          Swal.fire('Added!', 'Eligibility criteria added successfully.', 'success');
        } catch (createError) {
          console.error('Create failed:', createError);
          throw new Error('Server error occurred while creating. Please try again.');
        }
      }

      setShowModal(false);
      fetchCriteria();

    } catch (error) {
      console.error('Submit Error Details:', {
        message: error.message,
        stack: error.stack,
        originalError: error.originalError
      });
      Swal.fire(
        'Error',
        error.message || 'Failed to save eligibility criteria',
        'error'
      );
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await placementService.deleteEligibilityCriteria(id);
      Swal.fire('Deleted!', 'Eligibility criteria deleted.', 'success');
      fetchCriteria();
    }
  };

  // ================= PAGINATION =================

  const paginatedData = useMemo(() => {
    let list = criteria;

    if (searchTerm) {
      list = list.filter(item => {
        const name = item.name || '';
        const fields = typeof item.fields === 'object' ? JSON.stringify(item.fields) : (item.fields || '');
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               fields.toLowerCase().includes(searchTerm.toLowerCase());
      });
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
  }, [criteria, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  // ================= UI =================

  return (
    <div className="p-0 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search eligibility criteria"
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
          <span className="font-medium">Add Criteria</span>
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Criteria Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Fields</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {typeof item.fields === 'object' ? 
                        (item.fields.value || JSON.stringify(item.fields)) : 
                        (item.fields || 'N/A')
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No criteria found matching your search' : 'No eligibility criteria found'}
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
              onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
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
              onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
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
            <p className="text-lg font-medium mb-2 text-gray-500">No criteria found</p>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {typeof item.fields === 'object' ? 
                      (item.fields.value || JSON.stringify(item.fields)) : 
                      (item.fields || 'N/A')
                    }
                  </p>
                </div>
              </div>
              <div className="flex justify-end items-center gap-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">
                {editingId ? 'Edit' : 'Add'} Eligibility Criteria
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {formData.map((item, index) => (
                  <div key={index} className="border p-3 rounded-lg space-y-3">
                    <input
                      type="text"
                      placeholder="Criteria name"
                      value={item.name}
                      onChange={(e) =>
                        handleChange(index, 'name', e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Field type (e.g., above, min, max, C1)"
                      value={item.fieldType}
                      onChange={(e) =>
                        handleChange(index, 'fieldType', e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Field value (e.g., 75%, 7.5, 10.0)"
                      value={item.fieldValue}
                      onChange={(e) =>
                        handleChange(index, 'fieldValue', e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded"
                      required
                    />

                    {!editingId && formData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {!editingId && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-blue-600 text-sm"
                  >
                    + Add another criteria
                  </button>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 