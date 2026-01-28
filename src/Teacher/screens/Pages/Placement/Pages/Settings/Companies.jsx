'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const entriesPerPage = 10;

  // Get college ID from localStorage
  const getCollegeId = () => {
    const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
    return activeCollege?.id || 1;
  };

  const [formData, setFormData] = useState({
    company_id: null,
    college_id: getCollegeId(),
    company_name: '',
    website: '',
    email: '',
    phone: '',
    location: [],
    industry: '',
    currentLocation: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
      const collegeId = activeCollege?.id || 1;
      const response = await placementService.getAllCompanies(collegeId);
      const data = response?.companies || response || [];
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to fetch companies', 'error');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    let filtered = Array.isArray(companies) ? companies : [];
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.company_name.toLowerCase().includes(q) ||
        company.email.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q)
      );
    }
    
    const totalEntries = filtered.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = filtered.slice(start, end);
    
    return { currentEntries, totalEntries, totalPages, start, end };
  }, [companies, searchTerm, currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      college_id: formData.college_id,
      company_name: formData.company_name,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      industry: formData.industry
    };

    try {
      if (editMode) {
        await placementService.updateCompany(formData.company_id, payload);
        Swal.fire('Success', 'Company updated successfully', 'success');
      } else {
        await placementService.createCompany(payload);
        Swal.fire('Success', 'Company added successfully', 'success');
      }
      fetchCompanies();
      resetForm();
    } catch (error) {
      Swal.fire('Error', error.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (company) => {
    setFormData({
      company_id: company.company_id,
      college_id: company.college_id,
      company_name: company.company_name,
      website: company.website,
      email: company.email,
      phone: company.phone,
      location: company.location || [],
      industry: company.industry,
      currentLocation: ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleStatusToggle = async (company) => {
    const newStatus = company.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await placementService.updateCompany(company.company_id, {
        ...company,
        status: newStatus
      });
      Swal.fire('Success', `Company status changed to ${newStatus}`, 'success');
      fetchCompanies();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (companyId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await placementService.deleteCompany(companyId);
        Swal.fire('Deleted!', 'Company has been deleted', 'success');
        fetchCompanies();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete company', 'error');
      }
    }
  };

  const addLocation = () => {
    const trimmed = formData.currentLocation.trim();
    if (trimmed && !formData.location.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        location: [...prev.location, trimmed],
        currentLocation: ''
      }));
    }
  };

  const removeLocation = (loc) => {
    setFormData(prev => ({
      ...prev,
      location: prev.location.filter(l => l !== loc)
    }));
  };

  const resetForm = () => {
    setFormData({
      company_id: null,
      college_id: getCollegeId(),
      company_name: '',
      website: '',
      email: '',
      phone: '',
      location: [],
      industry: '',
      currentLocation: ''
    });
    setEditMode(false);
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-700">Companies</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Locations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50  tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.currentEntries.length > 0 ? (
                  filteredCompanies.currentEntries.map(company => (
                    <tr key={company.company_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.company_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.industry}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {company.location && Array.isArray(company.location) && company.location.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {company.location.map((loc, idx) => (
                              <span key={idx} className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">{loc}</span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleStatusToggle(company)}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            company.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {company.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleEdit(company)} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(company.company_id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No companies found matching your search' : 'No companies found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredCompanies.totalEntries > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Showing {filteredCompanies.start + 1}–{Math.min(filteredCompanies.end, filteredCompanies.totalEntries)} of {filteredCompanies.totalEntries} entries
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === filteredCompanies.totalPages}
                className={`px-4 py-2 rounded-md ${currentPage === filteredCompanies.totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Next
              </button>
            </div>
          )}

        <div className="lg:hidden space-y-4">
          {filteredCompanies.currentEntries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
              <p className="text-lg font-medium mb-2 text-gray-500">
                {searchTerm ? 'No companies found matching your search' : 'No companies found'}
              </p>
            </div>
          ) : (
            filteredCompanies.currentEntries.map(company => (
              <div key={company.company_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.company_name}</h3>
                    <p className="text-sm text-gray-500">{company.industry}</p>
                  </div>
                  <button
                    onClick={() => handleStatusToggle(company)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {company.status}
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div><span className="font-medium">Email:</span> {company.email}</div>
                  <div><span className="font-medium">Phone:</span> {company.phone}</div>
                  {company.location && Array.isArray(company.location) && company.location.length > 0 && (
                    <div>
                      <span className="font-medium">Locations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.location.map((loc, idx) => (
                          <span key={idx} className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">{loc}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(company)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(company.company_id)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredCompanies.totalEntries > 0 && (
          <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium text-xs">
              {filteredCompanies.start + 1}–{Math.min(filteredCompanies.end, filteredCompanies.totalEntries)} of {filteredCompanies.totalEntries}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === filteredCompanies.totalPages}
              className={`px-4 py-2 rounded-md ${currentPage === filteredCompanies.totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Next
            </button>
          </div>
        )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">{editMode ? 'Edit Company' : 'Add Company'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Industry <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>

                </div>

                <div>
                  <label className="block font-medium mb-1">Locations</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.location.map((loc, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
                        {loc}
                        <button type="button" onClick={() => removeLocation(loc)} className="hover:text-teal-900">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add location (Press Space or Enter)"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          addLocation();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={addLocation}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {editMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
