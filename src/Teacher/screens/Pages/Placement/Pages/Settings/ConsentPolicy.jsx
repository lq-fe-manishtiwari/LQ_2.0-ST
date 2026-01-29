'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Search, Trash2, Download, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { placementService } from '../../Services/placement.service';
import { uploadFileToS3 } from '@/_services/api';

export default function ConsentPolicy() {
  const [consentPolicyFile, setConsentPolicyFile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    policyName: '',
    policyDescription: ''
  });

  // Get college ID from localStorage
  const getCollegeId = () => {
    const activeCollege = JSON.parse(localStorage.getItem('activeCollege'));
    return activeCollege?.id || 1;
  };
  
  const collegeId = getCollegeId();

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await placementService.getPlacementPoliciesByCollege(collegeId);
      const policiesArray = response?.policies || response || [];
      setPolicies(Array.isArray(policiesArray) ? policiesArray : []);
    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies([]);
      if (!error.message?.includes('not found')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load policies'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setConsentPolicyFile(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select a PDF file',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleUpload = async () => {
    if (!consentPolicyFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a PDF file to upload'
      });
      return;
    }

    if (!formData.policyName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter a policy name'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload file to S3
      const filePath = await uploadFileToS3(consentPolicyFile);
      
      // Create policy record with uploaded file path
      const policyData = {
        college_id: collegeId,
        policy_name: formData.policyName,
        policy_description: formData.policyDescription,
        policy_document_path: filePath
      };

      await placementService.createPlacementPolicy(policyData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Policy uploaded successfully',
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form
      setConsentPolicyFile(null);
      setFormData({ policyName: '', policyDescription: '' });
      document.getElementById('consentPolicyUpload').value = '';
      
      // Reload policies
      loadPolicies();
    } catch (error) {
      console.error('Error uploading policy:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to upload policy'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId) => {
    const result = await Swal.fire({
      title: 'Delete Policy?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await placementService.deletePlacementPolicy(policyId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Policy has been deleted',
          timer: 2000,
          showConfirmButton: false
        });
        loadPolicies();
      } catch (error) {
        console.error('Error deleting policy:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete policy'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    let list = Array.isArray(policies) ? policies : [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(policy =>
        policy.policy_name?.toLowerCase().includes(q) ||
        policy.policy_description?.toLowerCase().includes(q)
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [policies, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // Download with authentication
  const handleDownload = async (policy) => {
    try {
      // Direct download from S3 URL (no auth needed for S3)
      const link = document.createElement('a');
      link.href = policy.policy_document_path;
      link.download = `${policy.policy_name}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: error.message || 'Unable to download the file. Please try again.'
      });
    }
  };

  // View PDF with authentication
  const handleViewPDF = async (policy) => {
    try {
      // Direct view from S3 URL (no auth needed for S3)
      window.open(policy.policy_document_path, '_blank');
    } catch (error) {
      console.error('View error:', error);
      Swal.fire({
        icon: 'error',
        title: 'View Failed',
        text: 'Unable to view the file. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Policy</h3>
        <p className="text-sm text-gray-600 mb-4">
          Students will download this policy, sign it, and upload from their settings
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.policyName}
              onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Placement Policy 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.policyDescription}
              onChange={(e) => setFormData({ ...formData, policyDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the policy"
              rows="3"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">Upload Consent Policy PDF</p>
            <p className="text-xs text-gray-500 mb-4">PDF only, max 10MB</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="consentPolicyUpload"
            />
            <label
              htmlFor="consentPolicyUpload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
            >
              Choose File
            </label>
            {consentPolicyFile && (
              <p className="text-sm text-green-600 mt-3 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Selected: {consentPolicyFile.name}
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !consentPolicyFile}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
          >
            {loading ? 'Uploading...' : 'Upload Policy'}
          </button>
        </div>
      </div>

      {/* Policies List Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Policies</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">
                      Policy Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-50  tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.length > 0 ? (
                    currentEntries.map((policy) => (
                      <tr key={policy.policy_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {policy.policy_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {policy.policy_description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {policy.policy_document_path ? (
                            <button
                              onClick={() => handleViewPDF(policy)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                              View PDF
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {policy.policy_document_path && (
                              <button
                                onClick={() => handleDownload(policy)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(policy.policy_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'No policies found matching your search' : 'No policies found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}
            {totalEntries > 0 && (
              <div className="hidden lg:flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {currentEntries.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-lg font-medium mb-2 text-gray-500">
                    {searchTerm ? 'No policies found matching your search' : 'No policies found'}
                  </p>
                </div>
              ) : (
                currentEntries.map((policy) => (
                  <div key={policy.policy_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{policy.policy_name}</h3>
                        <p className="text-sm text-gray-500">{policy.policy_description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      {policy.policy_document_path && (
                        <button
                          onClick={() => handleViewPDF(policy)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View PDF
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {policy.policy_document_path && (
                        <button
                          onClick={() => handleDownload(policy)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(policy.policy_id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
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
          </>
        )}
      </div>
    </div>
  );
}
