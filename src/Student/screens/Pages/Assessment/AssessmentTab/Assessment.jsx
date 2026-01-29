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
    BookOpen, // Added for Rubric View
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import SweetAlert from "react-bootstrap-sweetalert"; // Removed to fix error
import RubricAssessmentView from './RubricAssessmentView'; // Added Component

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

    // State for Rubric Modal (Added)
    const [showRubricView, setShowRubricView] = useState(false);
    const [selectedRubricDetails, setSelectedRubricDetails] = useState({ type: 'ANALYTIC', status: 'Pending' });

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
            category: 'General',
            rubricType: null
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
            category: 'Rubric',
            rubricType: 'ANALYTIC'
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
            category: 'Rubric',
            rubricType: 'HOLISTIC'
        },
        // --- Added New Entries (10-12 diverse types) ---
        {
            id: 104,
            title: 'Chemistry Lab Safety',
            subject: { name: 'Science', color: '#10B981' },
            startDate: 'Oct 22, 10:00 AM',
            endDate: 'Oct 22, 11:00 AM',
            attempted: 30,
            total: 35,
            status: 'Completed',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 100,
            category: 'Rubric',
            rubricType: 'CHECKLIST'
        },
        {
            id: 105,
            title: 'History Research Project',
            subject: { name: 'English', color: '#F59E0B' },
            startDate: 'Oct 25, 09:00 AM',
            endDate: 'Nov 01, 05:00 PM',
            attempted: 5,
            total: 35,
            status: 'In Progress',
            proctoring: false,
            offline: false,
            type: 'Online',
            percentage: 20,
            category: 'Rubric',
            rubricType: 'ANALYTIC'
        },
        {
            id: 106,
            title: 'Computer Science Midterm',
            subject: { name: 'Computer Science', color: '#6366f1' },
            startDate: 'Oct 28, 02:00 PM',
            endDate: 'Oct 28, 04:00 PM',
            attempted: 35,
            total: 35,
            status: 'Attempted',
            proctoring: true,
            offline: false,
            type: 'Online',
            percentage: 95,
            category: 'General',
            rubricType: null
        },
        {
            id: 107,
            title: 'Oral Presentation - Literature',
            subject: { name: 'English', color: '#F59E0B' },
            startDate: 'Oct 30, 10:00 AM',
            endDate: 'Oct 30, 03:00 PM',
            attempted: 12,
            total: 35,
            status: 'In Progress',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 50,
            category: 'Rubric',
            rubricType: 'HOLISTIC'
        },
        {
            id: 108,
            title: 'Math Quiz - Calculus',
            subject: { name: 'Mathematics', color: '#3B82F6' },
            startDate: 'Nov 02, 11:00 AM',
            endDate: 'Nov 02, 12:00 PM',
            attempted: 0,
            total: 35,
            status: 'Not Attempted',
            proctoring: true,
            offline: false,
            type: 'Online',
            percentage: 0,
            category: 'General',
            rubricType: null
        },
        {
            id: 109,
            title: 'Design Thinking Workshop',
            subject: { name: 'Science', color: '#10B981' },
            startDate: 'Nov 05, 09:00 AM',
            endDate: 'Nov 05, 01:00 PM',
            attempted: 34,
            total: 35,
            status: 'Completed',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 98,
            category: 'Rubric',
            rubricType: 'CHECKLIST'
        },
        {
            id: 110,
            title: 'Java Programming Assignment',
            subject: { name: 'Computer Science', color: '#6366f1' },
            startDate: 'Nov 08, 10:00 AM',
            endDate: 'Nov 10, 11:59 PM',
            attempted: 20,
            total: 35,
            status: 'In Progress',
            proctoring: false,
            offline: false,
            type: 'Online',
            percentage: 60,
            category: 'Rubric',
            rubricType: 'ANALYTIC'
        },
        {
            id: 111,
            title: 'Environment Science Field Trip',
            subject: { name: 'Science', color: '#10B981' },
            startDate: 'Nov 12, 08:00 AM',
            endDate: 'Nov 12, 04:00 PM',
            attempted: 35,
            total: 35,
            status: 'Attempted',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 100,
            category: 'General',
            rubricType: null
        },
        {
            id: 112,
            title: 'Creative Writing Workshop',
            subject: { name: 'English', color: '#F59E0B' },
            startDate: 'Nov 15, 02:00 PM',
            endDate: 'Nov 15, 05:00 PM',
            attempted: 10,
            total: 35,
            status: 'Not Attempted',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 0,
            category: 'Rubric',
            rubricType: 'HOLISTIC'
        },
        {
            id: 113,
            title: 'Database Management Quiz',
            subject: { name: 'Computer Science', color: '#6366f1' },
            startDate: 'Nov 18, 11:00 AM',
            endDate: 'Nov 18, 12:00 PM',
            attempted: 33,
            total: 35,
            status: 'Completed',
            proctoring: true,
            offline: false,
            type: 'Online',
            percentage: 94,
            category: 'General',
            rubricType: null
        },
        {
            id: 114,
            title: 'Robotics Lab Evaluation',
            subject: { name: 'Science', color: '#10B981' },
            startDate: 'Nov 20, 09:00 AM',
            endDate: 'Nov 20, 12:00 PM',
            attempted: 35,
            total: 35,
            status: 'Completed',
            proctoring: false,
            offline: true,
            type: 'Offline',
            percentage: 100,
            category: 'Rubric',
            rubricType: 'CHECKLIST'
        }
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

    // Added Handler for Rubric
    const handleOpenRubric = (type, status) => {
        setSelectedRubricDetails({ type: type || 'ANALYTIC', status: status });
        setShowRubricView(true);
    };

    const isNextDisabled = () => {
        const today = new Date();
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        return nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth());
    };

    // Delete functionality (Replaced SweetAlert with Window.Confirm)
    const handleDeleteConfirm = (id) => {
        const assessment = assessments.find(a => a.id === id);
        // Replaced SweetAlert with native confirm to avoid dependency error
        if (window.confirm(`Are you sure you want to delete "${assessment?.title || 'this assessment'}"? You will not be able to recover it.`)) {
            confirmDelete(id);
        }
    };

    const confirmDelete = async (assessmentId) => {
        try {
            console.log('Deleting assessment with ID:', assessmentId);
            // Add your delete API call here
            // await assessmentService.deleteAssessment(assessmentId);

            // Use simple alert or toast instead of SweetAlert
            alert("Assessment deleted successfully.");

            // Reload assessments after successful deletion
            // loadAssessments();
        } catch (error) {
            console.error('Delete error:', error);
            alert("Failed to delete assessment. Please try again.");
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
            {/* Search and Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
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

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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

                    <button
                        onClick={() => navigate('/teacher/assessments/teacher-add-new-assessment')}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Create Assessment</span>
                    </button>
                </div>
            </div>

            {filters.filterOpen && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <CustomSelect
                            label="Program"
                            value={filters.program}
                            onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
                            options={programOptions}
                            placeholder="Select Program"
                        />
                        <CustomSelect
                            label="Batch"
                            value={filters.batch}
                            onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
                            options={batchOptions}
                            placeholder="Select Batch"
                            disabled={!filters.program}
                        />
                        <CustomSelect
                            label="Academic Year"
                            value={filters.academicYear}
                            onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                            options={academicYearOptions}
                            placeholder="Select Academic Year"
                            disabled={!filters.batch}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomSelect
                            label="Semester"
                            value={filters.semester}
                            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                            options={semesterOptions}
                            placeholder="Select Semester"
                            disabled={!filters.academicYear}
                        />
                        <CustomSelect
                            label="Subject"
                            value={filters.subject}
                            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                            options={subjectOptions}
                            placeholder="Select Subject"
                            disabled={!filters.semester}
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

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                      <div className="h-[500px] overflow-y-auto blue-scrollbar">
                    <table className="w-full">
                        <thead className="bg-[#2162C1]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Assessment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Questions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Rubric Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider bg-[#2162C1]">Action</th>
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
                                                    <div className="text-xs text-gray-500">{a.type} Assessment</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{a.subject.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">90 mins</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">25 Questions</td>

                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide
                            ${a.category?.includes('Rubric') ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                {a.category || 'General'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {a.rubricType ? (
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                ${a.rubricType.includes('ANALYTIC') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        a.rubricType.includes('HOLISTIC') ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {a.rubricType}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-500">{a.endDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Attempted' ? 'bg-green-100 text-green-700' :
                                                    a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {a.status === 'Not Attempted' ? (
                                                    <button
                                                        onClick={() => navigate(`/my-assessment/assessment/start/${a.id}`)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 shadow-sm hover:shadow-md group relative"
                                                        title="Start Assessment"
                                                    >
                                                        <Clipboard className="w-5 h-5" />
                                                    </button>
                                                ) : a.status === 'In Progress' ? (
                                                    <button
                                                        onClick={() => navigate(`/my-assessment/assessment/take/${a.id}`)}
                                                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all duration-200 shadow-sm hover:shadow-md group relative"
                                                        title="Continue Assessment"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/my-assessment/assessment/result/${a.id}`)}
                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200 shadow-sm hover:shadow-md group relative"
                                                        title="View Result"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {a.category?.includes('Rubric') && (
                                                    <button
                                                        onClick={() => handleOpenRubric(a.rubricType, a.status)}
                                                        className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all font-medium text-xs flex items-center gap-1 border border-purple-100 transform hover:scale-105"
                                                        title="View Rubric details"
                                                    >
                                                        <BookOpen className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        No assessments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                    <button disabled className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed">
                        Previous
                    </button>
                    <span className="text-gray-700 font-medium">
            Showing 1–{assessments.length} of {assessments.length} entries
                    </span>
                    <button disabled className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>

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
                        <div key={a.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: a.subject.color }}>
                                        {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{a.title}</p>
                                        <p className="text-sm text-gray-500">{a.subject.name}</p>
                                    </div>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Attempted' ? 'bg-green-100 text-green-700' :
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
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${a.percentage}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center flex-wrap gap-2">
                                {a.status === 'Not Attempted' ? (
                                    <button onClick={() => navigate(`/my-assessment/assessment/start/${a.id}`)} className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 shadow-sm" title="Start Assessment">
                                        <Clipboard className="w-6 h-6" />
                                    </button>
                                ) : a.status === 'In Progress' ? (
                                    <button onClick={() => navigate(`/my-assessment/assessment/take/${a.id}`)} className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 shadow-sm" title="Continue Assessment">
                                        <Edit className="w-6 h-6" />
                                    </button>
                                ) : (
                                    <button onClick={() => navigate(`/my-assessment/assessment/result/${a.id}`)} className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 shadow-sm" title="View Result">
                                        <Eye className="w-6 h-6" />
                                    </button>
                                )}
                                {a.category?.includes('Rubric') && (
                                    <button onClick={() => handleOpenRubric(a.rubricType, a.status)} className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 shadow-sm" title="View Rubric details">
                                        <BookOpen className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <RubricAssessmentView
                isOpen={showRubricView}
                onClose={() => setShowRubricView(false)}
                assessmentType={selectedRubricDetails.type}
                status={selectedRubricDetails.status}
            />
        </div>
    );
};

export default Assessment;

