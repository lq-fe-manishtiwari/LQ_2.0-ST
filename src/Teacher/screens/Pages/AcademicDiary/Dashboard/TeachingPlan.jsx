'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Trash2, Edit, Filter, ChevronDown, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert";
import { teacherProfileService } from '../Services/academicDiary.service';
import { teachingPlanService } from '../Services/teachingPlan.service';
import { api } from '@/_services/api';

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
                    className={`w-full px-3 py-2 border ${disabled
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                        : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
                        } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                        {value || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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

export default function TeachingPlanDashboard() {
    const [teachingPlans, setTeachingPlans] = useState([]);
    const [allTeachingPlans, setAllTeachingPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    // States for table functionality
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter State - Using Names matching TabularView logic
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: '',
    });

    // Filter visibility state
    const [filterOpen, setFilterOpen] = useState(false);

    // Pagination
    const entriesPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Load teaching plans based on current filters
    const loadAllTeachingPlans = async () => {
        setLoading(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;
            const teacher_id = userProfile.teacher_id;

            let response = [];

            if (collegeId && teacher_id) {
                response = await teachingPlanService.GetTeachingPlanByTeacherId(teacher_id, collegeId);
            }

            const normalizedResponse = Array.isArray(response) ? response.map(item => ({
                ...item,
                id: item.id || item.teaching_plan_id || item._id, // Handle potential ID field variations
                // Normalize fields for filtering
                program_name: item.academic_year?.program_name,
                batch_name: item.academic_year?.batch_name,
                academic_year_name: item.academic_year?.name,
                semester_name: item.semester?.name,
                division_name: item.division?.division_name || item.division_name,
                paper_name: item.subject?.name
            })) : [];

            setAllTeachingPlans(normalizedResponse);
            setTeachingPlans(normalizedResponse); // Initial set, will be filtered by useMemo
            setError(null);
        } catch (err) {
            console.error('Error loading teaching plans:', err);
            setError('Failed to load teaching plans from server');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadAllTeachingPlans();
    }, []);

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            program: '',
            batch: '',
            academicYear: '',
            semester: '',
            division: '',
            paper: '',
        });
    };

    // Derived Data for Filters (Unique Options from currently loaded data)
    // We compute options based on ALL data, but potentially dependent on other selected filters
    const filterOptions = useMemo(() => {
        const data = allTeachingPlans; // Use all data to generate options, or use filtered data to cascade? 
        // Typically cascade: Filter A selected -> Filter B shows only options available within A.

        let filteredForOptions = data;

        // Helper to get unique values
        const getUnique = (key) => [...new Set(filteredForOptions.map(item => item[key]).filter(Boolean))];

        // This is a simplified cascade where we filter options based on what's currently valid
        // But for the dropdown contents themselves, we might want to respect the hierarchy:
        // Program -> Batch -> Year -> Semester -> Division -> Paper

        const programOptions = [...new Set(data.map(item => item.program_name).filter(Boolean))];

        const batchData = filters.program ? data.filter(i => i.program_name === filters.program) : data;
        const batchOptions = [...new Set(batchData.map(item => item.batch_name).filter(Boolean))];

        const yearData = filters.batch ? batchData.filter(i => i.batch_name === filters.batch) : batchData;
        const yearOptions = [...new Set(yearData.map(item => item.academic_year_name).filter(Boolean))];

        const semesterData = filters.academicYear ? yearData.filter(i => i.academic_year_name === filters.academicYear) : yearData;
        const semesterOptions = [...new Set(semesterData.map(item => item.semester_name).filter(Boolean))];

        const divisionData = filters.semester ? semesterData.filter(i => i.semester_name === filters.semester) : semesterData;
        const divisionOptions = [...new Set(divisionData.map(item => item.division_name).filter(Boolean))];

        const paperData = filters.division ? divisionData.filter(i => i.division_name === filters.division) : divisionData;
        const paperOptions = [...new Set(paperData.map(item => item.paper_name).filter(Boolean))];


        return {
            program: programOptions,
            batch: batchOptions,
            academicYear: yearOptions,
            semester: semesterOptions,
            division: divisionOptions,
            paper: paperOptions
        };
    }, [allTeachingPlans, filters]);


    const paginatedData = useMemo(() => {
        let list = allTeachingPlans;

        // Apply Filters
        if (filters.program) list = list.filter(item => item.program_name === filters.program);
        if (filters.batch) list = list.filter(item => item.batch_name === filters.batch);
        if (filters.academicYear) list = list.filter(item => item.academic_year_name === filters.academicYear);
        if (filters.semester) list = list.filter(item => item.semester_name === filters.semester);
        if (filters.division) list = list.filter(item => item.division_name === filters.division);
        if (filters.paper) list = list.filter(item => item.paper_name === filters.paper);

        // Apply Search
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(item => {
                const teacherName = item.teacher_name || '';
                const subjectName = item.subject_name || '';
                const paperCode = item.paper_code || '';
                const module = item.module || '';

                return (
                    teacherName.toLowerCase().includes(q) ||
                    subjectName.toLowerCase().includes(q) ||
                    paperCode.toLowerCase().includes(q) ||
                    module.toLowerCase().includes(q)
                );
            });
        }

        // Pagination
        const totalEntries = list.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const currentEntries = list.slice(start, end);

        return { currentEntries, totalEntries, totalPages, start, end };
    }, [allTeachingPlans, searchTerm, currentPage, filters]);

    const { currentEntries, totalEntries, totalPages } = paginatedData;

    // Pagination handlers
    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
    const resetPage = () => setCurrentPage(1);

    // Delete functionality
    const handleDeleteConfirm = (id) => {
        const plan = allTeachingPlans.find(p => p.id === id);
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
                You will not be able to recover this teaching plan: {plan?.subject_name}!
            </SweetAlert>
        );
    };

    const confirmDelete = async (planId) => {
        try {
            await teachingPlanService.DeleteTeachingPlan(planId);
            setAllTeachingPlans(prev => prev.filter(p => p.id !== planId));
            setAlert(
                <SweetAlert
                    success
                    title="Deleted!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setAlert(null)}
                >
                    Teaching plan deleted successfully.
                </SweetAlert>
            );
        } catch (err) {
            console.error('Error deleting teaching plan:', err);
            setAlert(
                <SweetAlert
                    danger
                    title="Error!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to delete teaching plan.
                </SweetAlert>
            );
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'Completed':
                    return 'bg-green-100 text-green-800';
                case 'In Progress':
                    return 'bg-blue-100 text-blue-800';
                case 'Not Started':
                    return 'bg-gray-100 text-gray-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
            </span>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="p-0 md:p-0">
            {alert}

            {/* Filter Section - Collapsible */}
            {filterOpen && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" />
                            Filter Teaching Plans
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <CustomSelect
                            label="Program"
                            value={filters.program}
                            onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value, batch: '', academicYear: '', semester: '', division: '', paper: '' }))}
                            options={filterOptions.program}
                            placeholder="All Programs"
                        />
                        <CustomSelect
                            label="Batch"
                            value={filters.batch}
                            onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value, academicYear: '', semester: '', division: '', paper: '' }))}
                            options={filterOptions.batch}
                            placeholder="All Batches"
                            disabled={!filters.program}
                        />
                        <CustomSelect
                            label="Academic Year"
                            value={filters.academicYear}
                            onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value, semester: '', division: '', paper: '' }))}
                            options={filterOptions.academicYear}
                            placeholder="All Years"
                            disabled={!filters.batch}
                        />
                        <CustomSelect
                            label="Semester"
                            value={filters.semester}
                            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value, division: '', paper: '' }))}
                            options={filterOptions.semester}
                            placeholder="All Semesters"
                            disabled={!filters.academicYear}
                        />
                        <CustomSelect
                            label="Division"
                            value={filters.division}
                            onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value, paper: '' }))}
                            options={filterOptions.division}
                            placeholder="All Divisions"
                            disabled={!filters.semester}
                        />
                        <CustomSelect
                            label="Paper"
                            value={filters.paper}
                            onChange={(e) => setFilters(prev => ({ ...prev, paper: e.target.value }))}
                            options={filterOptions.paper}
                            placeholder="All Papers"
                        // disabled={!filters.division}
                        />
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search teaching plans"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            resetPage();
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
                    >
                        <Filter className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">Filter</span>
                        <ChevronDown
                            className={`w-4 h-4 text-blue-600 transition-transform ${filterOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {/* Add Teaching Plan Button */}
                    <button
                        onClick={() => navigate('/teacher/academic-diary/teaching-plan/add')}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Add Teaching Plan</span>
                    </button>
                </div>
            </div>

            {/* Desktop Table with Horizontal Scroll */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="h-[500px] overflow-y-auto blue-scrollbar">
                        <table className="w-full border-collapse min-w-[1200px]">
                            <thead className="bg-primary-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>Program</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>Batch</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>Academic Year</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>Semester</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>Division</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '180px' }}>Paper</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentEntries.length > 0 ? (
                                    currentEntries.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                {item.academic_year?.program_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                {item.academic_year?.batch_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap text-center">
                                                {item.academic_year?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap text-center">
                                                {item.semester?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap text-center">
                                                {item.division?.division_name || item.division_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap text-center">
                                                {item.subject?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/teacher/academic-diary/teaching-plan/view/${item.teaching_plan_id}`)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="View"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/teacher/academic-diary/teaching-plan/edit/${item.teaching_plan_id}`)}
                                                        className="text-green-600 hover:text-green-800 p-1"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConfirm(item.teaching_plan_id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
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
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No teaching plans found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalEntries > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
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
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {currentEntries.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                        <div className="text-gray-500">
                            <p className="text-lg font-medium mb-2">No teaching plans found</p>
                        </div>
                    </div>
                ) : (
                    currentEntries.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.teacher_name}</p>
                                    <p className="text-sm text-gray-500">{item.subject_name}</p>
                                    <p className="text-xs text-gray-400">{item.module}</p>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>

                            <div className="space-y-2 text-sm text-gray-700 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="font-medium">Topic:</span> {item.topic_covered}</div>
                                    <div><span className="font-medium">CO:</span> {item.co}</div>
                                    <div><span className="font-medium">Week:</span> {item.week}</div>
                                    <div><span className="font-medium">Hours:</span> {item.lecture_hours} hrs</div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => navigate(`/teacher/academic-diary/teaching-plan/view/${item.id}`)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/teacher/academic-diary/teaching-plan/edit/${item.id}`)}
                                    className="text-green-600 hover:text-green-800 p-1"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteConfirm(item.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
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
        </div>
    );
}