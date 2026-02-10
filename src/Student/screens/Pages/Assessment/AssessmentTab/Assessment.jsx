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
    ClipboardList, // Added for Responses View
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { assessmentService } from '../Services/assessment.service';
import { StudentService } from '../../Profile/Student.Service';
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
    const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);

    const [filters, setFilters] = useState({
        filterOpen: false,
        subject: '',
        status: '',
        category: '',
        type: ''
    });

    const customBlue = 'rgb(33 98 193 / var(--tw-bg-opacity, 1))';

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);

    const { profile, isLoaded, fetchProfile } = useUserProfile();

    useEffect(() => {
        if (!isLoaded) {
            fetchProfile();
        }
    }, [isLoaded, fetchProfile]);

    useEffect(() => {
        if (profile?.student_id) {
            loadAssessments();
        }
    }, [profile]);


    // Helper function to determine assessment status based on time
    const getAssessmentStatus = (item) => {
        // Check submission count first - if > 0, it's completed/submitted
        if (item.submission_count > 0) {
            return 'Completed';
        }

        // If there's a submission status, use it
        if (item.submission_status) {
            return item.submission_status;
        }

        // If offline mode, return "Not Attempted" for DRAFT
        if (item.mode === 'OFFLINE') {
            return item.status === 'DRAFT' ? 'Not Attempted' : item.status;
        }

        // For online assessments, check time windows
        if (item.test_start_datetime && item.test_end_datetime) {
            const now = new Date();
            const startTime = new Date(item.test_start_datetime);
            const endTime = new Date(item.test_end_datetime);

            if (now < startTime) {
                return 'Upcoming';
            } else if (now > endTime) {
                return 'Expired';
            } else {
                // Current time is between start and end
                return 'Not Attempted';
            }
        }

        // Fallback to original logic
        return item.status === 'DRAFT' ? 'Not Attempted' : item.status;
    };

    const loadAssessments = async () => {
        setLoading(true);
        try {
            const history = await StudentService.getStudentHistoryWithoutactive(profile.student_id);
            const activeSession = history?.find(h => h.active || h.is_active);

            if (activeSession) {
                const payload = {
                    academic_year_id: activeSession.academic_year?.academic_year_id || activeSession.academic_year_id,
                    semester_id: activeSession.semester?.semester_id || activeSession.semester_id,
                    division_id: activeSession.division?.division_id || activeSession.division_id,
                    current: "true"
                };

                const response = await assessmentService.getStudentAssessments([payload]);
                if (response) {

                    const mappedData = response.map(item => ({
                        id: item.assessment_id,
                        title: item.title,
                        subject: {
                            name: item.subject_name || "N/A",
                            color: '#3B82F6'
                        },
                        startDate: item.test_start_datetime ? new Date(item.test_start_datetime).toLocaleString() : "N/A",
                        endDate: item.test_end_datetime ? new Date(item.test_end_datetime).toLocaleString() : "N/A",
                        attempted: 0,
                        total: 0,
                        status: getAssessmentStatus(item),
                        proctoring: false,
                        offline: item.mode === 'OFFLINE',
                        type: item.mode || 'Online',
                        percentage: 0,
                        category: item.type === 'RUBRIC' ? 'Rubric' : (item.category || 'General'),
                        rubricType: item.rubric ? item.rubric.rubric_type : null,
                        duration: item.time_limit_minutes || 0,
                        questionCount: 0,
                        originalData: item
                    }));
                    setAssessments(mappedData);
                }
            }
        } catch (error) {
            console.error('Error loading assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const subjectOptions = Array.from(new Set(assessments.map(a => a.subject.name))).sort();
    const statusOptions = Array.from(new Set(assessments.map(a => a.status))).sort();
    const categoryOptions = Array.from(new Set(assessments.map(a => a.category))).sort();
    const typeOptions = Array.from(new Set(assessments.map(a => a.type))).sort();

    const filteredAssessments = React.useMemo(() => {
        return assessments.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.subject.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSubject = !filters.subject || a.subject.name === filters.subject;
            const matchesStatus = !filters.status || a.status === filters.status;
            const matchesCategory = !filters.category || a.category === filters.category;
            const matchesType = !filters.type || a.type === filters.type;

            return matchesSearch && matchesSubject && matchesStatus && matchesCategory && matchesType;
        });
    }, [assessments, searchTerm, filters]);


    const removeFilter = (filterType) => {
        setFilters(prev => ({ ...prev, [filterType]: '' }));
    };

    const clearAllFilters = () => {
        setFilters({
            filterOpen: false,
            subject: '',
            status: '',
            category: '',
            type: ''
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
    const handleOpenRubric = (assessmentData) => {
        setSelectedAssessmentData(assessmentData);
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
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

                <div className="flex flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2.5 rounded-lg shadow-sm transition-all flex-1 sm:flex-none"
                    >
                        <Filter className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium text-sm">Filter</span>
                        <ChevronDown
                            className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>
                </div>
            </div>

            {filters.filterOpen && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <CustomSelect
                            label="Subject"
                            value={filters.subject}
                            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                            options={subjectOptions}
                            placeholder="All Subjects"
                        />
                        <CustomSelect
                            label="Category"
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            options={categoryOptions}
                            placeholder="All Categories"
                        />
                        <CustomSelect
                            label="Assessment Type"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            options={typeOptions}
                            placeholder="All Types"
                        />
                        <CustomSelect
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            options={statusOptions}
                            placeholder="All Status"
                        />
                    </div>
                </div>
            )}

            {/* Mobile View (Cards) */}
            <div className="lg:hidden space-y-4 mb-6">
                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading assessments...</p>
                    </div>
                ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map((a) => (
                        <div key={a.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                        style={{ backgroundColor: a.subject.color }}>
                                        {a.proctoring ? <Video className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 leading-tight">{a.title}</div>
                                        <div className="text-[10px] text-gray-500">{a.subject.name} • {a.type}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                    ${a.status === 'Attempted' || a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            a.status === 'Upcoming' ? 'bg-purple-100 text-purple-700' :
                                                a.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {a.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-4">
                                <div>
                                    <div className="text-gray-400 mb-0.5 uppercase tracking-wider font-semibold" style={{ fontSize: '9px' }}>Category</div>
                                    <div className="text-gray-700 font-medium">
                                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold
                                            ${a.category?.includes('Rubric') ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                            {a.category || 'General'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-0.5 uppercase tracking-wider font-semibold" style={{ fontSize: '9px' }}>Duration</div>
                                    <div className="text-gray-700 font-medium">{a.duration} mins</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-0.5 uppercase tracking-wider font-semibold" style={{ fontSize: '9px' }}>Due Date</div>
                                    <div className="text-gray-700 font-medium">{a.endDate}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-0.5 uppercase tracking-wider font-semibold" style={{ fontSize: '9px' }}>Type</div>
                                    <div className="text-gray-700 font-medium italic">{a.rubricType || '-'}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 border-t pt-3">
                                {a.status === 'Not Attempted' ? (
                                    <button
                                        onClick={() => navigate(`/my-assessment/assessment/start/${a.id}`, { state: { title: a.title, subject: a.subject.name, duration: a.duration, category: a.category } })}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        <Clipboard className="w-4 h-4" /> Start
                                    </button>
                                ) : a.status === 'In Progress' ? (
                                    <button
                                        onClick={() => navigate(`/my-assessment/assessment/take/${a.id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" /> Continue
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/my-assessment/assessment/result/${a.id}`)}
                                        disabled={a.status !== 'Expired'}
                                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200 shadow-sm ${a.status === 'Expired'
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:shadow-md'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        title={a.status === 'Expired' ? "View Result" : "Result available after assessment expires"}
                                    >
                                        <Eye className="w-4 h-4" /> Result
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate(`/my-assessment/assessment/responses/${a.id}`)}
                                    disabled={a.status !== 'Expired'}
                                    className={`p-2 rounded-lg transition-colors ${a.status === 'Expired'
                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    title={a.status === 'Expired' ? "View Responses" : "Responses available after assessment expires"}
                                >
                                    <Eye className="w-4 h-4" />
                                </button>

                                {a.category?.includes('Rubric') && a.originalData && (
                                    <button
                                        onClick={() => handleOpenRubric(a.originalData)}
                                        className="p-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                                        title="Rubric"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                        <p className="text-gray-500">No assessments found</p>
                    </div>
                )}
            </div>

            {/* Desktop & Tablet Table View */}
            <div className="hidden lg:block w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="w-full overflow-x-auto blue-scrollbar border-b border-gray-100">
                    <div className="max-h-[550px] overflow-y-auto blue-scrollbar">
                        <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-th whitespace-nowrap">Assessment</th>
                                    <th className="table-th whitespace-nowrap">Subject</th>
                                    <th className="table-th whitespace-nowrap">Duration</th>
                                    <th className="table-th whitespace-nowrap">Category</th>
                                    <th className="table-th whitespace-nowrap text-center">Rubric Type</th>
                                    <th className="table-th whitespace-nowrap">Due Date</th>
                                    <th className="table-th whitespace-nowrap">Status</th>
                                    <th className="table-th whitespace-nowrap text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                <p>Loading assessments...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAssessments.length > 0 ? (
                                    filteredAssessments.map((a) => (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            <td className="table-td whitespace-nowrap py-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                                        style={{ backgroundColor: a.subject.color }}>
                                                        {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{a.title}</div>
                                                        <div className="text-[10px] text-gray-500 whitespace-nowrap">{a.type} Assessment</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-td text-sm text-gray-500">{a.subject.name}</td>
                                            <td className="table-td text-sm text-gray-500">{a.duration} mins</td>

                                            <td className="table-td text-sm text-gray-500 whitespace-nowrap py-1">
                                                <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide
                            ${a.category?.includes('Rubric') ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                    {a.category || 'General'}
                                                </span>
                                            </td>

                                            <td className="table-td text-sm text-gray-500 whitespace-nowrap py-1">
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

                                            <td className="table-td whitespace-nowrap py-1 text-sm text-gray-500">{a.endDate}</td>
                                            <td className="table-td whitespace-nowrap py-1">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Attempted' || a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                        a.status === 'Upcoming' ? 'bg-purple-100 text-purple-700' :
                                                            a.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="table-td text-center">
                                                <div className="flex justify-center gap-2">
                                                    {a.status === 'Not Attempted' ? (
                                                        <button
                                                            onClick={() => navigate(`/my-assessment/assessment/start/${a.id}`, {
                                                                state: {
                                                                    title: a.title,
                                                                    subject: a.subject.name,
                                                                    duration: a.duration,
                                                                    category: a.category
                                                                }
                                                            })}
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
                                                    ) : a.status === 'Upcoming' ? (
                                                        <button
                                                            disabled
                                                            className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed transition-all duration-200 shadow-sm"
                                                            title="Assessment not yet started"
                                                        >
                                                            <Clipboard className="w-5 h-5" />
                                                        </button>
                                                    ) : a.status === 'Expired' ? (
                                                        <button
                                                            disabled
                                                            className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed transition-all duration-200 shadow-sm"
                                                            title="Assessment has expired"
                                                        >
                                                            <Clipboard className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/my-assessment/assessment/result/${a.id}`)}
                                                            disabled={a.status !== 'Expired'}
                                                            className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${a.status === 'Expired'
                                                                ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:shadow-md'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            title={a.status === 'Expired' ? "View Result" : "Result available after assessment expires"}
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {/* View Responses Button */}
                                                    <button
                                                        onClick={() => navigate(`/my-assessment/assessment/responses/${a.id}`)}
                                                        disabled={a.status !== 'Expired'}
                                                        className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${a.status === 'Expired'
                                                            ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:shadow-md'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={a.status === 'Expired' ? "View Responses" : "Responses available after assessment expires"}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {a.category?.includes('Rubric') && a.originalData && (
                                                        <button
                                                            onClick={() => handleOpenRubric(a.originalData)}
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
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                            No assessments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Row - Pattern from reference */}
                {!loading && filteredAssessments.length > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
                        <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-400 bg-gray-100 cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                            Showing <strong>1</strong>–<strong>{filteredAssessments.length}</strong> of <strong>{filteredAssessments.length}</strong> entries
                        </span>
                        <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-400 bg-gray-100 cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>


            <RubricAssessmentView
                isOpen={showRubricView}
                onClose={() => setShowRubricView(false)}
                assessmentData={selectedAssessmentData}
            />
        </div >
    );
};

export default Assessment;

