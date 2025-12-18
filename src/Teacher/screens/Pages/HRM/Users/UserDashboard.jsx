'use client';

import React, { useState } from 'react';
import { Filter, ChevronDown, Plus, Upload, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';

export default function UserDashboard() {
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [filters, setFilters] = useState({
    activeInactiveStatus: 'all',
    role: '',
    designation: '',
    department: '',
    filterOpen: false,
  });

  // Mock data for UI demonstration
  const mockStaff = [
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      employee_id: 'EMP001',
      designation: 'Senior Teacher',
      department: 'Mathematics',
      roles: ['TEACHER'],
      active: true,
      mobile: '+1234567890',
      type: 'teacher'
    },
    {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
      employee_id: 'EMP002',
      designation: 'Administrator',
      department: 'Administration',
      roles: ['ADMIN'],
      active: false,
      mobile: '+0987654321',
      type: 'other_staff'
    }
  ];

  // UI Handlers (no actual functionality)
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilterPanel = () => {
    setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }));
  };

  const handleDeleteClick = (id, type) => {
    console.log(`Delete clicked for ${type} with ID: ${id}`);
    alert(`This would delete ${type} with ID: ${id} in a real application`);
  };

  const handleToggleStatus = (id, type) => {
    console.log(`Toggle status for ${type} with ID: ${id}`);
    alert(`This would toggle status for ${type} with ID: ${id} in a real application`);
  };

  const handleAddNew = (type) => {
    console.log(`Add new ${type}`);
    alert(`This would open add ${type} form in a real application`);
  };

  const handleBulkUpload = (type) => {
    console.log(`Bulk upload for ${type}`);
    alert(`This would open bulk upload for ${type} in a real application`);
  };

  const handleViewDetails = (id, type) => {
    console.log(`View details for ${type} with ID: ${id}`);
    alert(`This would view ${type} details with ID: ${id} in a real application`);
  };

  const handleEdit = (id, type) => {
    console.log(`Edit ${type} with ID: ${id}`);
    alert(`This would edit ${type} with ID: ${id} in a real application`);
  };

  // UI Helper functions
  const getStaffName = (member) => {
    return `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Unknown';
  };

  const getPrimaryRole = (member) => {
    return member.roles?.[0] || 'No Role';
  };

  const isActiveStaff = (member) => {
    return member.active === true;
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
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              onClick={toggleFilterPanel}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Filter</span>
            </button>

            {/* Add New User Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddDropdown(prev => !prev);
                  setShowBulkDropdown(false);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add New User
              </button>

              {showAddDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg rounded-md z-20">
                  <button
                    onClick={() => handleAddNew('teacher')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                  >
                    Add Teacher
                  </button>
                  <button
                    onClick={() => handleAddNew('other_staff')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                  >
                    Add Other Staff
                  </button>
                  <button
                    onClick={() => handleAddNew('guest')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                  >
                    Add Guest
                  </button>
                </div>
              )}
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
                    onClick={() => handleBulkUpload('other_staff')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                  >
                    Bulk Upload Other Staff
                  </button>
                  <button
                    onClick={() => handleBulkUpload('teacher')}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="">All Roles</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>

              {/* Designation Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.designation}
                  onChange={(e) => setFilters(prev => ({ ...prev, designation: e.target.value }))}
                >
                  <option value="">All Designations</option>
                  <option value="Senior Teacher">Senior Teacher</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Administration">Administration</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, activeInactiveStatus: e.target.value }))}
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getStaffName(member)}</div>
                        <div className="text-sm text-gray-500">{member.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPrimaryRole(member)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(member.id, member.type)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleStatus(member.id, member.type)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isActiveStaff(member)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isActiveStaff(member) ? (
                        <>
                          <ToggleRight className="w-4 h-4 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(member.id, member.type)}
                        className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(member.id, member.type)}
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {mockStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{getStaffName(member)}</h3>
                    <p className="text-sm text-gray-500">{member.designation}</p>
                    <p className="text-xs text-gray-400">{member.employee_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(member.id, member.type)}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    isActiveStaff(member)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isActiveStaff(member) ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {member.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {member.mobile}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Role:</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getPrimaryRole(member)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleViewDetails(member.id, member.type)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(member.id, member.type)}
                  className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(member.id, member.type)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-700 text-sm">
            This is a UI-only demonstration. All buttons show alerts instead of actual functionality.
            In a real application, this would connect to backend APIs.
          </p>
        </div>
      </div>
    </div>
  );
}