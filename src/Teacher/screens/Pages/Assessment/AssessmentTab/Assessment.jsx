'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Clipboard,
  Video,
  ChevronDown,
  Filter,
  X,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert";

const Assessment = () => {
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  
  const [filters, setFilters] = useState({
    filterOpen: false,
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    subject: '',
    status: ''
  });

  const customBlue = 'rgb(33 98 193 / var(--tw-bg-opacity, 1))';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Mock filter options
  const programOptions = ['MCA-BTech-Graduation', 'BCA', 'BBA', 'M.Tech'];
  const batchOptions = ['Batch 2021', 'Batch 2022', 'Batch 2023', 'Batch 2024'];
  const academicYearOptions = ['2023-24', '2024-25', '2025-26'];
  const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];
  const subjectOptions = ['Mathematics', 'Science', 'English', 'Computer Science'];
  const statusOptions = ['All', 'Active', 'Inactive', 'Completed'];
  
  const grades = [
    { id: '1', name: 'Grade 1' },
    { id: '2', name: 'Grade 2' },
    { id: '3', name: 'Grade 3' },
  ];

  const classes = [
    { id: 'FY', name: 'FY' },
    { id: 'SY', name: 'SY' },
    { id: 'TY', name: 'TY' },
  ];

  const divisions = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
  ];

  const subjects = [
    { id: '1', name: 'Mathematics', color: '#3B82F6' },
    { id: '2', name: 'Science', color: '#10B981' },
    { id: '3', name: 'English', color: '#F59E0B' },
  ];

  const assessments = [
    {
      id: 101,
      title: 'Unit Test 1 - Algebra & Geometry',
      subject: { name: 'Mathematics', color: '#3B82F6' },
      startDate: 'Oct 15, 10:00 AM',
      endDate: 'Oct 15, 11:30 AM',
      attempted: 28,
      total: 35,
      status: 'Attempted',
      proctoring: true,
      offline: false,
      type: 'Online',
      percentage: 80,
    },
    {
      id: 102,
      title: 'Physics Practical Exam',
      subject: { name: 'Science', color: '#10B981' },
      startDate: 'Oct 18, 09:00 AM',
      endDate: 'Oct 18, 12:00 PM',
      attempted: 0,
      total: 35,
      status: 'Not Attempted',
      proctoring: false,
      offline: true,
      type: 'Offline',
      percentage: 0,
    },
    {
      id: 103,
      title: 'English Essay Writing',
      subject: { name: 'English', color: '#F59E0B' },
      startDate: 'Oct 20, 02:00 PM',
      endDate: 'Oct 20, 04:00 PM',
      attempted: 15,
      total: 35,
      status: 'In Progress',
      proctoring: false,
      offline: false,
      type: 'Online',
      percentage: 43,
    },
  ];

  // Handle Program Selection
  const handleProgramChange = (e) => {
    setFilters(prev => ({ ...prev, program: e.target.value }));
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({ ...prev, [filterType]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      filterOpen: false,
      program: '',
      batch: '',
      academicYear: '',
      semester: '',
      subject: '',
      status: ''
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    if (nextYear < today.getFullYear() || (nextYear === today.getFullYear() && nextMonth <= today.getMonth())) {
      setCurrentMonth(nextMonth);
      setCurrentYear(nextYear);
    }
  };

  const isNextDisabled = () => {
    const today = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth());
  };

  // Delete functionality
  const handleDeleteConfirm = (id) => {
    const assessment = assessments.find(a => a.id === id);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(id)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover "{assessment?.title || 'this assessment'}"!
      </SweetAlert>
    );
  };

  const confirmDelete = async (assessmentId) => {
    try {
      console.log('Deleting assessment with ID:', assessmentId);
      // Add your delete API call here
      // await assessmentService.deleteAssessment(assessmentId);
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Assessment deleted successfully.
        </SweetAlert>
      );
      // Reload assessments after successful deletion
      // loadAssessments();
    } catch (error) {
      console.error('Delete error:', error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to delete assessment. Please try again.
        </SweetAlert>
      );
    }
  };
  // Custom Select Component from TeacherList
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

  return (
    <div className="p-0 md:p-0">
      {alert}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for assessments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filter Toggle */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          {/* Create Button */}
          <button
            onClick={() => navigate('/teacher/assessments/teacher-add-new-assessment')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Filter Panel - 2 Rows */}
      {filters.filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Program */}
            <CustomSelect
              label="Program"
              value={filters.program}
              onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              options={programOptions}
              placeholder="Select Program"
            />

            {/* Batch */}
            <CustomSelect
              label="Batch"
              value={filters.batch}
              onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
              options={batchOptions}
              placeholder="Select Batch"
              disabled={!filters.program}
            />

            {/* Academic Year */}
            <CustomSelect
              label="Academic Year"
              value={filters.academicYear}
              onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
              options={academicYearOptions}
              placeholder="Select Academic Year"
              disabled={!filters.batch}
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Semester */}
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={!filters.academicYear}
            />

            {/* Subject */}
            <CustomSelect
              label="Subject"
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              options={subjectOptions}
              placeholder="Select Subject"
              disabled={!filters.semester}
            />

            {/* Status */}
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

      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.length > 0 ? (
                assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: a.subject.color }}>
                          {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{a.title}</div>
                          <div className="text-xs text-gray-500">{a.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.subject.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.startDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.endDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'Attempted' ? 'bg-green-100 text-green-700' : 
                        a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${a.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{a.attempted}/{a.total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/teacher/assessments/assessment/view/${a.id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Assessment"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/teacher/assessments/assessment/edit/${a.id}`)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit Assessment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
  onClick={() =>
    navigate(`/teacher/assessments/check-papers/${a.id}`, {
      state: { assessmentData: a },
    })
  }
  className="p-1 text-purple-600 hover:bg-purple-50 rounded"
  title="Check Papers"
>
  <Clipboard className="w-4 h-4" />
</button>

                        <button 
                          onClick={() => handleDeleteConfirm(a.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No assessments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
          <button
            disabled
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Showing 1–{assessments.length} of {assessments.length} entries
          </span>
          <button
            disabled
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No assessments found</p>
              <p className="text-sm">No assessments found. Try adjusting the search or contact support if the issue persists.</p>
            </div>
          </div>
        ) : (
          assessments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: a.subject.color }}>
                    {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.subject.name}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  a.status === 'Attempted' ? 'bg-green-100 text-green-700' : 
                  a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {a.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Start:</span> {a.startDate}</div>
                  <div><span className="font-medium">End:</span> {a.endDate}</div>
                  <div><span className="font-medium">Type:</span> {a.type}</div>
                  <div><span className="font-medium">Progress:</span> {a.attempted}/{a.total}</div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Completion</span>
                    <span>{a.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${a.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <button 
                  onClick={() => navigate(`/teacher/assessments/assessment/view/${a.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="View Assessment"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate(`/teacher/assessments/assessment/edit/${a.id}`)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Edit Assessment"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/admin-assessment/assessment/check-papers', { state: { assessmentData: a } })}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                  title="Check Papers"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteConfirm(a.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
        <button
          disabled
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium text-xs">
          1–{assessments.length} of {assessments.length}
        </span>
        <button
          disabled
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Assessment;
