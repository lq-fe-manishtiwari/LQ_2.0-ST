'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
} from 'lucide-react';

import SweetAlert from 'react-bootstrap-sweetalert';
// import DocumentViewer from './Components/DocumentViewer';
import Loader from '../Components/Loader';

// Custom Select Components
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentTable = ({
  documents = [],
  onView,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalEntries = documents.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = documents.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <>
      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">File Name</th>
                <th className="table-th text-center">File Description</th>
                <th className="table-th text-center">Attachment</th>
                <th className="table-th text-center">Uploaded on</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="table-td text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-gray-500">Loading documents...</p>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-td text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No documents found</p>
                      <p className="text-sm">
                        No documents found. Try adjusting the filters or contact support if the
                        issue persists.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{document.fileName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{document.fileDescription}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onView(document)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{document.uploadedOn}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(document)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(document.id)}
                          className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <Loader size="lg" className="mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No documents found</p>
              <p className="text-sm">
                No documents found. Try adjusting the filters or contact support if the issue
                persists.
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{document.fileName}</p>
                  <p className="text-sm text-gray-500">{document.fileDescription}</p>
                </div>
                <button 
                  onClick={() => onView(document)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div><span className="font-medium">Uploaded:</span> {document.uploadedOn}</div>
              </div>

              <div className="flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(document)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(document.id)}
                    className="p-2.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default function Document() {
  const [loading, setLoading] = useState(true);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  
  // Success/Error Alert States
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [documents] = useState([
    {
      id: "D001",
      fileName: "SSC Marksheet",
      fileDescription: "I have uploaded a ssc marksheet which is important for the data of education",
      uploadedOn: "20-09-2025 12:00 PM",
      department: "HR",
      name: "Manish Tiwari"
    },
    {
      id: "D002",
      fileName: "SSC Marksheet",
      fileDescription: "I have uploaded a ssc marksheet which is important for the data of education",
      uploadedOn: "20-09-2025 12:00 PM",
      department: "IT",
      name: "Priya Sharma"
    },
    {
      id: "D003",
      fileName: "SSC Marksheet",
      fileDescription: "I have uploaded a ssc marksheet which is important for the data of education",
      uploadedOn: "20-09-2025 12:00 PM",
      department: "Finance",
      name: "Rahul Kumar"
    },
    {
      id: "D004",
      fileName: "SSC Marksheet",
      fileDescription: "I have uploaded a ssc marksheet which is important for the data of education",
      uploadedOn: "20-09-2025 12:00 PM",
      department: "Marketing",
      name: "Anjali Patel"
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    filterOpen: false,
    department: '',
    name: ''
  });

  const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
  const names = ['Manish Tiwari', 'Priya Sharma', 'Rahul Kumar', 'Anjali Patel'];

  const filteredDocuments = useMemo(() => {
    let list = documents;
    
    // Search filter
    if (searchQuery) {
      list = list.filter(
        (document) =>
          document.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          document.fileDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          document.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Department filter
    if (filters.department) {
      list = list.filter(document => document.department === filters.department);
    }
    
    // Name filter
    if (filters.name) {
      list = list.filter(document => document.name === filters.name);
    }
    
    return list;
  }, [documents, searchQuery, filters.department, filters.name]);

  const handleView = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleEdit = (document) => {
    console.log('Edit document:', document);
  };

  const handleDelete = (id) => {
    setDocumentToDelete(id);
    setShowAlert(true);
  };
  
  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };
  
  const handleCancelDelete = () => {
    setShowAlert(false);
    setDocumentToDelete(null);
  };
  
  const handlePasswordConfirm = () => {
    if (password === 'admin123') {
      setTimeout(() => {
        setPasswordAlert(false);
        setPassword('');
        setDocumentToDelete(null);
        setAlertMessage('Document deleted successfully!');
        setShowDeleteSuccessAlert(true);
      }, 500);
    } else {
      setPasswordAlert(false);
      setPassword('');
      setAlertMessage('Incorrect password. Document deletion failed.');
      setShowDeleteErrorAlert(true);
    }
  };
  
  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword('');
    setDocumentToDelete(null);
  };

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6">

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for documents"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter */}
        <div className="flex justify-end gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all w-full sm:w-auto"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="w-full sm:w-80">
              <CustomSelect
                label="Department"
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                options={departments}
                placeholder="Select Department"
              />
            </div>
            
            <div className="w-full sm:w-80">
              <CustomSelect
                label="Name"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                options={names}
                placeholder="Select Name"
              />
            </div>
          </div>
        </div>
      )}

      <DocumentTable
        documents={filteredDocuments}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
{/*       
      <DocumentViewer
        isOpen={showDocumentModal}
        document={selectedDocument}
        onClose={() => setShowDocumentModal(false)}
      /> */}
      
      {/* Delete Confirmation Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this Document?
        </SweetAlert>
      )}
      
      {/* Password Protected Delete Confirmation */}
      {passwordAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 sm:px-0">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
              Admin Verification Required
            </h3>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              Enter your admin password to confirm deletion.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordConfirm();
              }}
              className="flex flex-col"
            >
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 text-center text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition text-sm sm:text-base"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {/* Error Alert */}
      {showDeleteErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowDeleteErrorAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}