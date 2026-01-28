'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';

export default function PlacementRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [formData, setFormData] = useState({ rule_name: '', rule_description: '', is_active: true });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;
      const response = await placementService.getPlacementRulesByCollege(collegeId);
      console.log('PlacementRules API Response:', response);
      const data = response?.rules || response || [];
      console.log('PlacementRules Data:', data);
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setRules([]);
      if (!error.message?.includes('not found')) {
        Swal.fire('Error', 'Failed to fetch placement rules', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRule(null);
    setFormData({ rule_name: '', rule_description: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({ rule_name: rule.rule_name, rule_description: rule.rule_description, is_active: rule.active });
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

      if (editingRule) {
        await placementService.updatePlacementRule(editingRule.rule_id, payload);
        Swal.fire('Updated!', 'Rule updated successfully', 'success');
      } else {
        await placementService.createPlacementRule(payload);
        Swal.fire('Added!', 'Rule added successfully', 'success');
      }
      setShowModal(false);
      fetchRules();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to save rule', 'error');
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
        await placementService.deletePlacementRule(id);
        Swal.fire('Deleted!', 'Rule has been deleted.', 'success');
        fetchRules();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete rule', 'error');
      }
    }
  };

  const toggleRule = async (id) => {
    try {
      const rule = rules.find(r => r.rule_id === id);
      await placementService.updatePlacementRuleStatus(id, !rule.active);
      fetchRules();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to update rule status', 'error');
    }
  };

  const paginatedData = useMemo(() => {
    let list = Array.isArray(rules) ? rules : [];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => item.rule_name?.toLowerCase().includes(q) || item.rule_description?.toLowerCase().includes(q));
    }
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);
    return { currentEntries, totalEntries, totalPages, start, end };
  }, [rules, searchTerm, currentPage]);

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
            placeholder="Search rules"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add Rule</span>
        </button>
      </div>

      <div className="hidden lg:block space-y-4">
        {currentEntries.length > 0 ? (
          currentEntries.map(rule => (
            <div key={rule.rule_id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{rule.rule_name}</p>
                <p className="text-sm text-gray-600">{rule.rule_description}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={rule.active} onChange={() => toggleRule(rule.rule_id)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <button onClick={() => handleEdit(rule)} className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(rule.rule_id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">{searchTerm ? 'No rules found matching your search' : 'No placement rules found'}</p>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">No rules found</p>
          </div>
        ) : (
          currentEntries.map((rule) => (
            <div key={rule.rule_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{rule.rule_name}</p>
                  <p className="text-sm text-gray-500">{rule.rule_description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={rule.active} onChange={() => toggleRule(rule.rule_id)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(rule)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(rule.rule_id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalEntries > 0 && (
        <div className="flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Previous</button>
          <span className="text-gray-700 font-medium text-xs lg:text-sm">{paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>Next</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingRule ? 'Edit Rule' : 'Add Rule'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rule Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rule Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.rule_description}
                    onChange={(e) => setFormData({ ...formData, rule_description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Enable this rule</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingRule ? 'Update' : 'Add'} Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
