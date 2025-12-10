import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import { useLocation } from "react-router-dom";

// Custom Select Component
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

export default function DepartmentPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null, name: '' });
  const [filters, setFilters] = useState({
    filterOpen: false,
    college: '',
    status: ''
  });

  // Filter options
  const collegeOptions = ['Engineering College', 'Science College', 'Business College', 'Arts College'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  // Dummy data
  const dummyDepartments = [
    { department_id: 1, department_name: "Computer Science", college: { college_name: "Engineering College" } },
    { department_id: 2, department_name: "Mathematics", college: { college_name: "Science College" } },
    { department_id: 3, department_name: "Physics", college: { college_name: "Science College" } },
    { department_id: 4, department_name: "Business Administration", college: { college_name: "Business College" } },
    { department_id: 5, department_name: "English Literature", college: { college_name: "Arts College" } }
  ];

  useEffect(() => {
    setDepartments(dummyDepartments);
    setFilteredDepartments(dummyDepartments);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    let filtered = departments;

    if (searchTerm.trim()) {
      filtered = filtered.filter((dept) =>
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.college?.college_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.college) {
      filtered = filtered.filter(dept => dept.college?.college_name === filters.college);
    }

    setFilteredDepartments(filtered);
  }, [searchTerm, departments, filters.college, filters.status]);

  const handleDeleteClick = (dept) => {
    setDeleteAlert({ show: true, id: dept.department_id, name: dept.department_name });
  };

  const handleConfirmDelete = () => {
    const updatedDepartments = departments.filter((d) => d.department_id !== deleteAlert.id);
    setDepartments(updatedDepartments);
    setFilteredDepartments(updatedDepartments);
    setDeleteAlert({ show: false, id: null, name: '' });
  };

  return (
    <div className="p-0">

      {/* Search + Filter + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none bg-white text-gray-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">

          {/* Filter button */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-xl shadow-sm flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          {/* Add Department */}
          <button
            onClick={() => navigate("add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md flex-1 sm:flex-none justify-center"
          >
            + Add New Department
          </button>

        </div>
      </div>

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <CustomSelect
              label="College"
              value={filters.college}
              onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
              options={collegeOptions}
              placeholder="Select College"
            />

            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={statusOptions}
              placeholder="Select Status"
            />

          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center table-header" style={{width: '40%'}}>Department Name</th>
                <th className="table-th text-center table-header" style={{width: '40%'}}>College</th>
                <th className="table-th text-center table-header" style={{width: '20%'}}>Actions</th>
              </tr>
            </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredDepartments.map((dept) => (
              <tr key={dept.department_id} className="hover:bg-gray-50">

                <td className="px-3 py-4 text-center">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {dept.department_name}
                  </p>
                </td>

                <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">
                  {dept.college?.college_name || "—"}
                </td>

                <td className="px-2 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">

                    {/* EDIT — Corrected */}
                    <button
                      className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                      onClick={() => navigate(`edit/${dept.department_id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDeleteClick(dept)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Delete Alert */}
      {deleteAlert.show && (
        <SweetAlert
          warning
          showCancel
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteAlert({ show: false })}
          confirmBtnText="OK"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
        >
          Do you want to delete {deleteAlert.name}?
        </SweetAlert>
      )}

    </div>
  );
}
