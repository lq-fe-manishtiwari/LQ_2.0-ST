'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Filter, ChevronDown, Plus, Upload, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";
// import OtherStaffBulkUploadModal from "../../OtherStaff/Dashboard/BulkUploadModal";
// import TeacherBulkUploadModal from "../../Teacher/Components/BulkUploadModal";
import { Link, useNavigate } from "react-router-dom";

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

export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'teacher' or 'other_staff'
  const [loadingToggle, setLoadingToggle] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [showOtherStaffBulkModal, setShowOtherStaffBulkModal] = useState(false);
  const [showTeacherBulkModal, setShowTeacherBulkModal] = useState(false);

  // Password protection states
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New states for toggle alerts
  const [showToggleSuccessAlert, setShowToggleSuccessAlert] = useState(false);
  const [showToggleErrorAlert, setShowToggleErrorAlert] = useState(false);
  const [toggleMessage, setToggleMessage] = useState('');

  const [filters, setFilters] = useState({
    activeInactiveStatus: 'all',
    role: '',
    designation: '',
    department: '',
    filterOpen: false,
  });

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    const closeDropdowns = () => {
      setShowAddDropdown(false);
      setShowBulkDropdown(false);
    };
    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  useEffect(() => {
    if (!isFetchedRef.current) {
      getAllStaff();
      isFetchedRef.current = true;
    }
  }, []);



  const getAllStaff = () => {
    setLoading(true);
    // Simulate API call with sample data
    setTimeout(() => {
      const sampleData = [
        {
          teacher_id: 1,
          firstname: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          mobile: "9876543210",
          employee_id: "EMP001",
          designation: "Senior Teacher",
          department: "Mathematics",
          roles: ["TEACHER"],
          active: true
        },
        {
          other_staff_id: 2,
          firstname: "Jane",
          lastname: "Smith",
          email: "jane.smith@example.com",
          mobile: "9876543211",
          employee_id: "EMP002",
          designation: "Administrator",
          department: "Administration",
          roles: ["ADMIN"],
          active: true
        },
        {
          teacher_id: 3,
          firstname: "Mike",
          lastname: "Johnson",
          email: "mike.johnson@example.com",
          mobile: "9876543212",
          employee_id: "EMP003",
          designation: "Teacher",
          department: "Science",
          roles: ["TEACHER"],
          active: false
        }
      ];
      setStaff(sampleData);
      setLoading(false);
    }, 1000);
  };



  /* ==================== PAGINATION & FILTERING ==================== */
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndPaginatedStaff = useMemo(() => {
    let list = [...staff];

    //  Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.firstname || ''} ${s.lastname || ''}`.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.designation?.toLowerCase().includes(q) ||
          s.employee_id?.toLowerCase().includes(q)
      );
    }

    //  Status Filter - Handle both active field and roles for status
    if (filters.activeInactiveStatus !== 'all') {
      const isActive = filters.activeInactiveStatus === 'active';
      list = list.filter((s) => {
        // If active field exists, use it. Otherwise, consider staff with roles as active
        if (s.hasOwnProperty('active')) {
          return s.active === isActive;
        }
        // For staff without active field, consider them active if they have roles
        return isActive ? s.roles && s.roles.length > 0 : !s.roles || s.roles.length === 0;
      });
    }

    //  Role Filter
    if (filters.role) {
      list = list.filter((s) =>
        s.roles?.includes(filters.role) || s.role === filters.role
      );
    }

    //  Designation Filter
    if (filters.designation) {
      list = list.filter((s) =>
        s.designation?.toLowerCase().includes(filters.designation.toLowerCase())
      );
    }

    // Department Filter
    if (filters.department) {
      list = list.filter((s) =>
        s.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    //  Pagination
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [
    staff,
    searchQuery,
    currentPage,
    filters.activeInactiveStatus,
    filters.role,
    filters.designation,
    filters.department,
  ]);

  const { currentEntries, totalEntries, totalPages, start, end } = filteredAndPaginatedStaff;

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  /* ==================== DELETE HANDLERS ==================== */
  const handleDelete = (id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setDeleteId(null);
    setDeleteType(null);
  };

  const handlePasswordConfirm = async () => {
    if (!password) {
      setErrorMessage("Please enter your admin password.");
      setShowErrorAlert(true);
      return;
    }

    // Mock password validation
    if (password === 'admin123') {
      // SUCCESS - Remove from local state
      setStaff(prev => prev.filter(s => {
        const staffId = s.teacher_id || s.other_staff_id;
        return staffId !== deleteId;
      }));

      setPasswordAlert(false);
      setPassword("");
      setDeleteId(null);
      setDeleteType(null);
      setShowSuccessAlert(true);
    } else {
      setPasswordAlert(false);
      setPassword("");
      setErrorMessage("Incorrect password. Please try again.");
      setShowErrorAlert(true);
    }
  };


  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setDeleteId(null);
    setDeleteType(null);
  };

  /* ==================== TOGGLE ACTIVE STATUS ==================== */
  const toggleActive = async (id, type) => {
    const member = staff.find((s) =>
      (type === 'teacher' ? s.teacher_id === id : s.other_staff_id === id)
    );

    if (!member) return;

    const newStatus = !member.active;
    const staffName = getStaffName(member);
    setLoadingToggle(id);

    // Mock API call with timeout
    setTimeout(() => {
      setStaff((prev) =>
        prev.map((s) => {
          if ((type === 'teacher' && s.teacher_id === id) ||
            (type === 'other_staff' && s.other_staff_id === id)) {
            return { ...s, active: newStatus };
          }
          return s;
        })
      );

      // Show success popup
      setToggleMessage(`${staffName} has been ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setShowToggleSuccessAlert(true);
      setLoadingToggle(null);
    }, 1000);
  };

  /* ==================== HELPER FUNCTIONS ==================== */
  const getStaffType = (member) => {
    return member.teacher_id ? 'teacher' : 'other_staff';
  };

  const getStaffId = (member) => {
    return member.teacher_id || member.other_staff_id;
  };

  const getStaffName = (member) => {
    return `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Unknown';
  };

  const getPrimaryRole = (member) => {
    return member.roles?.[0] || member.role || 'No Role';
  };

  const isActiveStaff = (member) => {
    return member.active !== false && member.roles && member.roles.length > 0;
  };

  // ==================== GET EDIT LINK ====================
  const getEditLink = (member) => {
    const staffId = getStaffId(member);
    return `/pms/user-dashboard/edit/${staffId}`;
  };

  const viewUser = (member) => {
    const staffId = member.teacher_id || member.other_staff_id;
    
    navigate(`/pms/user-dashboard/view-user/${staffId}`, {
      state: { userData: member }
    });
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search by name, email, or designation..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Filter</span>
            </button>

            {/* Add New User */}
            <Link to="/pms/user-dashboard/add">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                <Plus className="w-4 h-4" />
                Add New User
              </button>
            </Link>

          </div>

          {/* Bulk Upload Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBulkDropdown(prev => !prev);
                setShowAddDropdown(false);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>

            {showBulkDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBulkDropdown(false);
                    setShowOtherStaffBulkModal(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                >
                  Bulk Upload Other Staff
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBulkDropdown(false);
                    setShowTeacherBulkModal(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                >
                  Bulk Upload Teachers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Role Filter */}
            <CustomSelect
              label="Role"
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              options={['TEACHER', 'ADMIN', 'MANAGER', 'SUPERADMIN']}
              placeholder="All Roles"
            />

            {/* Designation Filter */}
            <CustomSelect
              label="Designation"
              value={filters.designation}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  designation: e.target.value,
                }))
              }
              options={[...new Set(staff.map((s) => s.designation).filter(Boolean))]}
              placeholder="All Designations"
            />

            {/* Department Filter */}
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              options={[...new Set(staff.map((s) => s.department).filter(Boolean))]}
              placeholder="All Departments"
            />

            {/* Status Filter */}
            <CustomSelect
              label="Status"
              value={filters.activeInactiveStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  activeInactiveStatus: e.target.value,
                }))
              }
              options={['active', 'inactive']}
              placeholder="All Status"
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="table-header bg-blue-600">
            <tr>
              <th className="table-th text-center">Name</th>
              <th className="table-th text-center">Role</th>
              <th className="table-th text-center">Designation</th>
              <th className="table-th text-center">Department</th>
              <th className="table-th text-center">Task</th>
              <th className="table-th table-cell-center text-center">Status</th>
              <th className="table-th table-cell-center text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                </td>
              </tr>
            ) : currentEntries.map((member) => {
              const staffType = getStaffType(member);
              const staffId = getStaffId(member);
              const editLink = getEditLink(member);

              return (
                <tr key={`${staffType}-${staffId}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getStaffName(member)}
                        </p>
                        <p className="text-xs text-gray-500">{member.employee_id || 'No ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPrimaryRole(member)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{member.designation || '-'}</td>
                  <td className="px-4 py-3">{member.department || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewUser(member)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staffType === 'teacher' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {staffType === 'teacher' ? 'Teacher' : 'Staff'}
                      </span> */}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(staffId, staffType)}
                      disabled={loadingToggle === staffId}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActiveStaff(member)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                      {loadingToggle === staffId ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                      ) : isActiveStaff(member) ? (
                        <ToggleRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 mr-1" />
                      )}
                      {isActiveStaff(member) ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link to={editLink}>
                        <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(staffId, staffType)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${currentPage === 1
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
              className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages
                ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : currentEntries.map((member) => {
          const staffType = getStaffType(member);
          const staffId = getStaffId(member);
          const editLink = getEditLink(member);
          return (
            <div key={`${staffType}-${staffId}`} className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getStaffName(member)}
                    </p>
                    <p className="text-sm text-gray-600">{member.designation || '-'}</p>
                    <p className="text-xs text-gray-500">{member.employee_id || 'No ID'}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(staffId, staffType)}
                  disabled={loadingToggle === staffId}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${isActiveStaff(member)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {loadingToggle === staffId ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  ) : isActiveStaff(member) ? (
                    <ToggleRight className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                  )}
                  {isActiveStaff(member) ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {member.email || 'No email'}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {member.mobile || 'No phone'}
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-2">Role:</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getPrimaryRole(member)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewUser(member)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link to={editLink}>
                    <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(staffId, staffType)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && totalEntries === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600">No users found.</p>
        </div>
      )}

      {/* Modals */}
      {showOtherStaffBulkModal && (
        <OtherStaffBulkUploadModal
          onClose={() => setShowOtherStaffBulkModal(false)}
          onSuccess={() => {
            setShowOtherStaffBulkModal(false);
            setAlert(
              <SweetAlert success title="Success!" onConfirm={() => setAlert(null)}>
                Other staff uploaded successfully!
              </SweetAlert>
            );
          }}
        />
      )}

      {showTeacherBulkModal && (
        <TeacherBulkUploadModal
          onClose={() => setShowTeacherBulkModal(false)}
          onSuccess={() => {
            setShowTeacherBulkModal(false);
            setAlert(
              <SweetAlert success title="Success!" onConfirm={() => setAlert(null)}>
                Teachers uploaded successfully!
              </SweetAlert>
            );
          }}
        />
      )}

      {/* ==================== NEW TOGGLE ALERTS ==================== */}

      {/* Toggle Success Alert */}
      {showToggleSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowToggleSuccessAlert(false)}
          confirmBtnCssClass="btn-confirm"
        >
          {toggleMessage}
        </SweetAlert>
      )}

      {/* Toggle Error Alert */}
      {showToggleErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowToggleErrorAlert(false)}
        >
          {toggleMessage}
        </SweetAlert>
      )}

      {/* Existing Alerts */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          confirmBtnText="Yes, delete it!"
          cancelBtnText="Cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this {deleteType === 'teacher' ? 'Teacher' : 'Staff'}?
        </SweetAlert>
      )}

      {alert}

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
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          confirmBtnCssClass="btn-confirm"
          title="Deleted Successfully!"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {deleteType === 'teacher' ? 'Teacher' : 'Staff'} has been successfully deleted.
        </SweetAlert>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setShowErrorAlert(false);
            setErrorMessage('');
          }}
        >
          {errorMessage}
        </SweetAlert>
      )}
    </div>
  
  );
}