import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, Plus, Upload, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";

export default function UserDashboard() {
  // Hardcoded user data
  const [users, setUsers] = useState([
    {
      id: 1,
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      mobile: "9876543210",
      designation: "Math Teacher",
      department: "Mathematics",
      employee_id: "EMP001",
      role: "TEACHER",
      active: true
    },
    {
      id: 2,
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      mobile: "9876543211",
      designation: "Physics Teacher",
      department: "Science",
      employee_id: "EMP002",
      role: "TEACHER",
      active: true
    },
    {
      id: 3,
      firstname: "Robert",
      lastname: "Johnson",
      email: "robert.j@example.com",
      mobile: "9876543212",
      designation: "Administrator",
      department: "Administration",
      employee_id: "EMP003",
      role: "ADMIN",
      active: true
    },
    {
      id: 4,
      firstname: "Sarah",
      lastname: "Williams",
      email: "sarah.w@example.com",
      mobile: "9876543213",
      designation: "Lab Assistant",
      department: "Science",
      employee_id: "EMP004",
      role: "LAB_ASSISTANT",
      active: false
    },
    {
      id: 5,
      firstname: "Michael",
      lastname: "Brown",
      email: "michael.b@example.com",
      mobile: "9876543214",
      designation: "Chemistry Teacher",
      department: "Science",
      employee_id: "EMP005",
      role: "TEACHER",
      active: true
    },
    {
      id: 6,
      firstname: "Emily",
      lastname: "Davis",
      email: "emily.d@example.com",
      mobile: "9876543215",
      designation: "Librarian",
      department: "Library",
      employee_id: "EMP006",
      role: "LIBRARIAN",
      active: true
    },
    {
      id: 7,
      firstname: "David",
      lastname: "Wilson",
      email: "david.w@example.com",
      mobile: "9876543216",
      designation: "Physical Education",
      department: "Sports",
      employee_id: "EMP007",
      role: "TEACHER",
      active: false
    },
    {
      id: 8,
      firstname: "Lisa",
      lastname: "Taylor",
      email: "lisa.t@example.com",
      mobile: "9876543217",
      designation: "Principal",
      department: "Administration",
      employee_id: "EMP008",
      role: "ADMIN",
      active: true
    },
    {
      id: 9,
      firstname: "Thomas",
      lastname: "Anderson",
      email: "thomas.a@example.com",
      mobile: "9876543218",
      designation: "Computer Teacher",
      department: "Computer Science",
      employee_id: "EMP009",
      role: "TEACHER",
      active: true
    },
    {
      id: 10,
      firstname: "Jennifer",
      lastname: "Martin",
      email: "jennifer.m@example.com",
      mobile: "9876543219",
      designation: "Accountant",
      department: "Accounts",
      employee_id: "EMP010",
      role: "ACCOUNTANT",
      active: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loadingToggle, setLoadingToggle] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  // Password protection states
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [filters, setFilters] = useState({
    activeInactiveStatus: 'all',
    role: '',
    designation: '',
    department: '',
    filterOpen: false,
  });

  /* ==================== PAGINATION & FILTERING ==================== */
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndPaginatedUsers = useMemo(() => {
    let list = [...users];

    // 🔍 Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (user) =>
          `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q) ||
          user.designation?.toLowerCase().includes(q) ||
          user.employee_id?.toLowerCase().includes(q)
      );
    }

    // 🔽 Status Filter
    if (filters.activeInactiveStatus !== 'all') {
      const isActive = filters.activeInactiveStatus === 'active';
      list = list.filter((user) => user.active === isActive);
    }

    // 🎭 Role Filter
    if (filters.role) {
      list = list.filter((user) => user.role === filters.role);
    }

    // 🏷 Designation Filter
    if (filters.designation) {
      list = list.filter((user) =>
        user.designation?.toLowerCase().includes(filters.designation.toLowerCase())
      );
    }

    // 🏫 Department Filter
    if (filters.department) {
      list = list.filter((user) =>
        user.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    // 📌 Pagination
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [
    users,
    searchQuery,
    currentPage,
    filters.activeInactiveStatus,
    filters.role,
    filters.designation,
    filters.department,
  ]);

  const { currentEntries, totalEntries, totalPages, start, end } = filteredAndPaginatedUsers;

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  /* ==================== DELETE HANDLERS ==================== */
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setDeleteId(null);
  };

  const handlePasswordConfirm = async () => {
    try {
      if (!password) {
        setErrorMessage("Please enter your admin password.");
        setShowErrorAlert(true);
        return;
      }

      // Hardcoded password check (for demo purposes only)
      if (password !== "admin123") {
        setErrorMessage("Incorrect password. Please try again.");
        setShowErrorAlert(true);
        return;
      }

      // Remove user from hardcoded data
      setUsers(prev => prev.filter(user => user.id !== deleteId));

      setPasswordAlert(false);
      setPassword("");
      setDeleteId(null);
      setShowSuccessAlert(true);

    } catch (error) {
      console.log("Delete error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setShowErrorAlert(true);
    }
  };

  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setDeleteId(null);
  };

  /* ==================== TOGGLE ACTIVE STATUS ==================== */
  const toggleActive = async (id) => {
    setLoadingToggle(id);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update user status in hardcoded data
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === id) {
            return { ...user, active: !user.active };
          }
          return user;
        })
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage('Failed to update status. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoadingToggle(null);
    }
  };

  /* ==================== HELPER FUNCTIONS ==================== */
  const getUserName = (user) => {
    return `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown';
  };

  const getRoleDisplay = (role) => {
    return role ? role.replace('_', ' ') : 'No Role';
  };

  const isActiveUser = (user) => {
    return user.active === true;
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
            <button
              onClick={() => alert("Add New User functionality would be implemented here")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </button>

            {/* Bulk Upload */}
            <button
              onClick={() => alert("Bulk Upload functionality would be implemented here")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.role}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                >
                  <option value="">All Roles</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="LAB_ASSISTANT">Lab Assistant</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="COUNSELOR">Counselor</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>

              {/* Designation Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.designation}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      designation: e.target.value,
                    }))
                  }
                >
                  <option value="">All Designations</option>
                  {[...new Set(users.map((u) => u.designation).filter(Boolean))].map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.department}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                >
                  <option value="">All Departments</option>
                  {[...new Set(users.map((u) => u.department).filter(Boolean))].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      activeInactiveStatus: e.target.value,
                    }))
                  }
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="table-header">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Role</th>
                <th className="table-th">Designation</th>
                <th className="table-th">Department</th>
                <th className="table-th table-cell-center">Status</th>
                <th className="table-th table-cell-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEntries.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getUserName(user)}
                        </p>
                        <p className="text-xs text-gray-500">{user.employee_id || 'No ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.designation || '-'}</td>
                  <td className="px-4 py-3">{user.department || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(user.id)}
                      disabled={loadingToggle === user.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActiveUser(user)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {loadingToggle === user.id ? (
                        <span className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-1" />
                      ) : isActiveUser(user) ? (
                        <ToggleRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 mr-1" />
                      )}
                      {isActiveUser(user) ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        onClick={() => alert(`Edit ${getUserName(user)}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentEntries.map((user) => (
            <div key={user.id} className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getUserName(user)}
                    </p>
                    <p className="text-sm text-gray-600">{user.designation || '-'}</p>
                    <p className="text-xs text-gray-500">{user.employee_id || 'No ID'}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(user.id)}
                  disabled={loadingToggle === user.id}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActiveUser(user)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {loadingToggle === user.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-1" />
                  ) : isActiveUser(user) ? (
                    <ToggleRight className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                  )}
                  {isActiveUser(user) ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {user.email || 'No email'}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.mobile || 'No phone'}
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-2">Role:</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getRoleDisplay(user.role)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  className="p-2 bg-blue-100 rounded"
                  onClick={() => alert(`View details for ${getUserName(user)}`)}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 bg-yellow-100 rounded"
                  onClick={() => alert(`Edit ${getUserName(user)}`)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {totalEntries === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">No users found.</p>
          </div>
        )}

        {/* Alerts */}
        {showAlert && (
          <SweetAlert
            warning
            showCancel
            confirmBtnText="Yes, delete it!"
            cancelBtnText="Cancel"
            title="Are you sure?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          >
            Do you want to delete this user?
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
                Enter admin password: <strong>admin123</strong> (for demo)
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
                  placeholder="Enter password (admin123)"
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
            title="Deleted Successfully!"
            onConfirm={() => setShowSuccessAlert(false)}
          >
            User has been successfully deleted.
          </SweetAlert>
        )}

        {/* Error Alert */}
        {showErrorAlert && (
          <SweetAlert
            error
            title="Error!"
            onConfirm={() => {
              setShowErrorAlert(false);
              setErrorMessage('');
            }}
          >
            {errorMessage}
          </SweetAlert>
        )}
      </div>
    </div>
  );
}