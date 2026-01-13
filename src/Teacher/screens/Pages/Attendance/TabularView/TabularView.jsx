import React, { useState, useRef, useEffect } from 'react';
import { User, X, Check, Activity, Stethoscope, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Trophy, AlertCircle, Coffee, Save, Trash2 } from 'lucide-react';
import AttendanceFilters from '../Components/AttendanceFilters';
import AttendanceActionBar from './AttendanceActionBar';
import { api } from '../../../../../_services/api';
import { AttendanceManagement } from '../Services/attendance.service';

export default function TabularView() {
    // State for filters
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: ''
    });

    const [showFilters, setShowFilters] = useState(true);

    // State for allocations
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);

    // State for student fetching
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentsFetched, setStudentsFetched] = useState(false);

    // Initial hardcoded students for fallback
    const hardcodedStudents = [
        { id: 101, name: 'Sample Student 1', program: 'B.Tech', batch: 'CS-A', division: 'A', status: 'P', selected: false, paper: 'Data Structures', semester: 3, academicYear: '2023-24', program_id: 1, batch_id: 1, academic_year_id: 1, semester_id: 1, division_id: 1, subject_id: 1 },
        { id: 102, name: 'Sample Student 2', program: 'B.Tech', batch: 'CS-A', division: 'A', status: 'P', selected: false, paper: 'Data Structures', semester: 3, academicYear: '2023-24', program_id: 1, batch_id: 1, academic_year_id: 1, semester_id: 1, division_id: 1, subject_id: 1 },
    ];

    const [students, setStudents] = useState([]);

    // Date state
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });


    // Calendar dropdown state
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);

    const [activePopup, setActivePopup] = useState(null);
    const [selectAll, setSelectAll] = useState(false);

    // Fetch teacher ID and allocations
    useEffect(() => {
        const getTeacherIdFromStorage = () => {
            let teacherId = null;
            const userProfileStr = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
            if (userProfileStr) {
                try {
                    const userProfile = JSON.parse(userProfileStr);
                    if (userProfile?.teacher_id) {
                        teacherId = userProfile.teacher_id;
                    }
                } catch (e) {
                    console.error("Error parsing userProfile:", e);
                }
            }
            return teacherId ? parseInt(teacherId, 10) : null;
        };

        const teacherId = getTeacherIdFromStorage();
        if (teacherId && !isNaN(teacherId)) {
            setCurrentTeacherId(teacherId);
        }
    }, []);

    useEffect(() => {
        const fetchAllocations = async () => {
            if (!currentTeacherId) return;
            setLoadingAllocations(true);
            try {
                const response = await api.getTeacherAllocatedPrograms(currentTeacherId);

                if (response.success) {
                    const data = response.data;
                    const allAllocations = [
                        ...(data.class_teacher_allocation || []),
                        ...(data.normal_allocation || [])
                    ];
                    setAllocations(allAllocations);
                }
            } catch (error) {
                console.error("Error fetching allocations:", error);
            } finally {
                setLoadingAllocations(false);
            }
        };

        if (currentTeacherId) {
            fetchAllocations();
        }
    }, [currentTeacherId]);

    // Auto-select first values when allocations load
    useEffect(() => {
        if (allocations.length > 0 && !filters.paper) {
            const firstAlloc = allocations[0];
            const newFilters = {
                program: firstAlloc.program?.program_id?.toString() || '',
                batch: firstAlloc.batch?.batch_id?.toString() || '',
                academicYear: firstAlloc.academic_year_id?.toString() || '',
                semester: firstAlloc.semester_id?.toString() || '',
                division: firstAlloc.division_id?.toString() || '',
                paper: firstAlloc.subjects?.[0]?.subject_id?.toString() || ''
            };
            setFilters(newFilters);
        }
    }, [allocations]);


    // Fetch students based on filters
    useEffect(() => {
        const fetchStudents = async () => {
            // Only fetch if all required filters are selected
            if (filters.academicYear && filters.semester && filters.division && filters.paper) {
                setLoadingStudents(true);
                try {
                    const params = {
                        academicYearId: filters.academicYear,
                        semesterId: filters.semester,
                        divisionId: filters.division,
                        subjectId: filters.paper
                    };
                    const response = await AttendanceManagement.getAttendanceStudents(params);

                    if (response.success && response.data && response.data.length > 0) {
                        const formattedStudents = response.data.map(s => ({
                            id: s.student_id || s.id,
                            name: s.full_name || `${s.firstname} ${s.lastname}`,
                            status: 'P', // Default to present
                            selected: false,
                            ...s
                        }));
                        setStudents(formattedStudents);
                        setStudentsFetched(true);
                    } else {
                        // If no data from API, use hardcoded students for testing
                        // Mapping them to match current filters so they aren't filtered out by the UI
                        const fallbackStudents = hardcodedStudents.map(s => ({
                            ...s,
                            program_id: parseInt(filters.program),
                            batch_id: parseInt(filters.batch),
                            academic_year_id: parseInt(filters.academicYear),
                            semester_id: parseInt(filters.semester),
                            division_id: parseInt(filters.division),
                            subject_id: parseInt(filters.paper)
                        }));
                        setStudents(fallbackStudents);
                        setStudentsFetched(true);
                    }

                } catch (error) {
                    console.error("Error fetching students:", error);
                    const fallbackStudents = hardcodedStudents.map(s => ({
                        ...s,
                        program_id: parseInt(filters.program),
                        batch_id: parseInt(filters.batch),
                        academic_year_id: parseInt(filters.academicYear),
                        semester_id: parseInt(filters.semester),
                        division_id: parseInt(filters.division),
                        subject_id: parseInt(filters.paper)
                    }));
                    setStudents(fallbackStudents);
                    setStudentsFetched(true);
                } finally {
                    setLoadingStudents(false);
                }
            } else {
                // Clear students if filters are reset
                setStudents([]);
                setStudentsFetched(false);
            }
        };

        fetchStudents();
    }, [filters.academicYear, filters.semester, filters.division, filters.paper]);


    // Filter students based on selected filters
    const filteredStudents = students.filter(student => {
        if (filters.program && student.program_id !== parseInt(filters.program)) return false;
        if (filters.batch && student.batch_id !== parseInt(filters.batch)) return false;
        if (filters.academicYear && student.academic_year_id !== parseInt(filters.academicYear)) return false;
        if (filters.semester && student.semester_id !== parseInt(filters.semester)) return false;
        if (filters.division && student.division_id !== parseInt(filters.division)) return false;
        if (filters.paper && student.subject_id !== parseInt(filters.paper)) return false;
        return true;
    });

    // Filter handlers
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setFilters({
            program: '',
            batch: '',
            academicYear: '',
            semester: '',
            division: '',
            paper: ''
        });
    };

    const applyFilters = () => {
        setShowFilters(false);
    };

    // Calendar functions
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (date) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        setSelectedDate(dateString);
        setShowCalendar(false);
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const getMonthYearString = () => {
        return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        daysOfWeek.forEach(day => {
            days.push(
                <div key={`header-${day}`} className="text-xs font-medium text-gray-500 text-center py-1">
                    {day}
                </div>
            );
        });

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }

        const selectedDay = parseInt(selectedDate.split('-')[2]);
        const selectedMonth = parseInt(selectedDate.split('-')[1]) - 1;
        const selectedYear = parseInt(selectedDate.split('-')[0]);

        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = day === selectedDay && month === selectedMonth && year === selectedYear;
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                        ${isSelected ? 'bg-blue-600 text-white' :
                            isToday ? 'bg-blue-100 text-blue-600' :
                                'hover:bg-gray-100 text-gray-700'}`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Mark all students as present
    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: 'P' })));
    };

    // Mark all students as absent
    const markAllAbsent = () => {
        setStudents(students.map(s => ({ ...s, status: 'A' })));
    };

    // Toggle individual student status between P and A
    const toggleStudentStatus = (id) => {
        setStudents(students.map(s =>
            s.id === id ? { ...s, status: s.status === 'P' ? 'A' : 'P' } : s
        ));
    };

    const handleStatusClick = (student, e) => {
        e.stopPropagation();
        if (student.status !== 'A') {
            updateStudentStatus(student.id, 'A');
        } else {
            setActivePopup(student.id);
        }
    };

    const updateStudentStatus = (id, newStatus) => {
        setStudents(students.map(s =>
            s.id === id ? { ...s, status: newStatus } : s
        ));
        setActivePopup(null);
    };

    const handleCheckboxChange = (id) => {
        setStudents(students.map(student =>
            student.id === id ? { ...student, selected: !student.selected } : student
        ));
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setStudents(students.map(student => ({
            ...student,
            selected: newSelectAll
        })));
    };

    // Bulk status update
    const handleBulkStatusUpdate = (status) => {
        setStudents(students.map(student =>
            student.selected ? { ...student, status: status, selected: false } : student
        ));
        setSelectAll(false);
    };

    // API Integration for submitting attendance
    const handleSubmitAttendance = async () => {
        if (!filters.academicYear || !filters.semester || !filters.division || !filters.paper) {
            alert("Please select all filters (Academic Year, Semester, Division, Paper) before submitting.");
            return;
        }

        const attendanceData = {
            academic_year_id: parseInt(filters.academicYear),
            semester_id: parseInt(filters.semester),
            division_id: parseInt(filters.division),
            subject_id: parseInt(filters.paper),
            date: selectedDate,
            attendance: students.map(s => ({
                student_id: s.id,
                status: s.status
            }))
        };

        try {
            const response = await AttendanceManagement.saveDailyAttendance(attendanceData);
            if (response.success) {
                alert('Attendance saved successfully!');
            } else {
                alert('Failed to save attendance: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('An error occurred while saving attendance.');
        }
    };

    const selectedCount = students.filter(s => s.selected).length;

    const otherStatuses = [
        { id: 'OA', label: 'Other Activity', icon: <Activity size={16} />, color: 'bg-orange-500' },
        { id: 'SA', label: 'Sports Activity', icon: <Trophy size={16} />, color: 'bg-yellow-500' },
        { id: 'ML', label: 'Medical Leave', icon: <Stethoscope size={16} />, color: 'bg-blue-500' },
        { id: 'SL', label: 'Sick Leave', icon: <AlertCircle size={16} />, color: 'bg-indigo-500' },
    ];


    const getStatusColor = (status) => {
        switch (status) {
            case 'P': return 'bg-green-500';
            case 'A': return 'bg-red-500';
            case 'OA': return 'bg-orange-500';
            case 'ML': return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'P': return 'P';
            case 'A': return 'A';
            case 'OA': return 'OA';
            case 'ML': return 'ML';
            default: return '?';
        }
    };

    const activeStudent = students.find(s => s.id === activePopup);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 relative min-h-[400px]">
            {/* Filter Section - Using reusable component */}
            <div className="border-b border-gray-200">
                <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Student Attendance</h2>
                    </div>

                    {/* AttendanceFilters Component */}
                    <AttendanceFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        showFilters={showFilters}
                        onToggleFilters={toggleFilters}
                        onResetFilters={resetFilters}
                        onApplyFilters={applyFilters}
                        allocations={allocations}
                        loadingAllocations={loadingAllocations}
                        compact={true}
                    />
                </div>
            </div>

            {/* Header with Calendar */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 relative" ref={calendarRef}>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity"
                        >
                            <Calendar size={18} className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Attendance: <span className="font-semibold text-blue-700">{formatDate(selectedDate)}</span>
                            </span>
                        </button>

                        {/* Calendar Dropdown */}
                        {showCalendar && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-64 sm:w-72 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={() => navigateMonth('prev')}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="font-medium text-gray-700 text-sm">
                                        {getMonthYearString()}
                                    </span>
                                    <button
                                        onClick={() => navigateMonth('next')}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {renderCalendar()}
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        Selected: <span className="font-medium">{formatDate(selectedDate)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                        Showing {filteredStudents.length} of {students.length} students
                    </div>
                    <AttendanceActionBar
                        onMarkAllPresent={markAllPresent}
                        onMarkAllAbsent={markAllAbsent}
                    />
                </div>
            </div>

            {/* Bulk Action Bar (Now above Table) */}
            <div className={`px-4 sm:px-6 py-3 bg-white border-b border-gray-100 transition-all duration-300 ${selectedCount > 0 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-4 whitespace-nowrap overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shrink-0">
                        <span className="font-bold text-sm">{selectedCount}</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Selected</span>
                        <button
                            onClick={() => setStudents(students.map(s => ({ ...s, selected: false })))}
                            className="ml-1 hover:text-blue-900"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 shrink-0"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkStatusUpdate('P')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                            <Check size={16} /> Mark Present
                        </button>
                        <button
                            onClick={() => handleBulkStatusUpdate('A')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                            <X size={16} /> Mark Absent
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 shrink-0"></div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {otherStatuses.map(status => (
                            <button
                                key={status.id}
                                onClick={() => handleBulkStatusUpdate(status.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors text-sm font-medium shrink-0"
                            >
                                {status.icon} {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Table or Empty State/Loader */}
            <div className="relative min-h-[300px]">
                {!filters.paper ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Filters to Mark Attendance</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Please select Program, Academic Year, Semester, Division, and Paper to load the student list.
                        </p>
                    </div>
                ) : loadingStudents ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Fetching Students...</p>
                    </div>
                ) : (studentsFetched && students.length === 0) ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            No students match the selected criteria for this subject and division.
                        </p>
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">

                            {/* ... table content ... */}

                            <thead className="table-header">
                                <tr>
                                    <th className="table-th text-center">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                        </div>
                                    </th>
                                    <th className="table-th text-center">
                                        Profile
                                    </th>
                                    <th className="table-th text-center">Name</th>
                                    <th className="table-th text-center">Roll No.</th>
                                    <th className="table-th text-center">
                                        Program
                                    </th>
                                    <th className="table-th text-center">
                                        Batch
                                    </th>
                                    <th className="table-th text-center">
                                        Division
                                    </th>
                                    {/* <th className="table-th text-center">
                                        Paper
                                    </th> */}
                                    <th className="table-th text-center">
                                        Semester
                                    </th>
                                    {/* <th className="table-th text-center">
                                        Acadmic Year
                                    </th> */}
                                    <th className="table-th text-center">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((student) => {
                                    // Get filter options for display
                                    const getUniqueOptions = (filterFn, mapFn) => {
                                        const map = new Map();
                                        allocations.filter(filterFn).forEach(item => {
                                            const { id, name } = mapFn(item);
                                            if (id) map.set(id, name);
                                        });
                                        return Array.from(map.entries()).map(([value, name]) => ({ value: value.toString(), name }));
                                    };

                                    const programOptions = getUniqueOptions(
                                        () => true,
                                        (item) => ({ id: item.program?.program_id, name: item.program?.program_name })
                                    );

                                    const batchOptions = getUniqueOptions(
                                        (item) => !filters.program || item.program?.program_id == filters.program,
                                        (item) => ({ id: item.batch?.batch_id, name: item.batch?.batch_name })
                                    );

                                    const academicYearOptions = getUniqueOptions(
                                        (item) => (!filters.program || item.program?.program_id == filters.program) &&
                                            (!filters.batch || item.batch?.batch_id == filters.batch),
                                        (item) => ({ id: item.academic_year_id, name: item.academic_year?.name })
                                    );

                                    const semesterOptions = getUniqueOptions(
                                        (item) => (!filters.program || item.program?.program_id == filters.program) &&
                                            (!filters.batch || item.batch?.batch_id == filters.batch) &&
                                            (!filters.academicYear || item.academic_year_id == filters.academicYear),
                                        (item) => ({ id: item.semester_id, name: item.semester?.name })
                                    );

                                    const divisionOptions = getUniqueOptions(
                                        (item) => (!filters.program || item.program?.program_id == filters.program) &&
                                            (!filters.batch || item.batch?.batch_id == filters.batch) &&
                                            (!filters.academicYear || item.academic_year_id == filters.academicYear) &&
                                            (!filters.semester || item.semester_id == filters.semester),
                                        (item) => ({ id: item.division_id, name: item.division?.division_name })
                                    );

                                    const paperOptions = () => {
                                        const map = new Map();
                                        allocations.filter(item =>
                                            (!filters.program || item.program?.program_id == filters.program) &&
                                            (!filters.batch || item.batch?.batch_id == filters.batch) &&
                                            (!filters.academicYear || item.academic_year_id == filters.academicYear) &&
                                            (!filters.semester || item.semester_id == filters.semester) &&
                                            (!filters.division || item.division_id == filters.division)
                                        ).forEach(alloc => {
                                            if (alloc.subjects && Array.isArray(alloc.subjects)) {
                                                alloc.subjects.forEach(sub => {
                                                    map.set(sub.subject_id.toString(), sub.name);
                                                });
                                            }
                                        });
                                        return Array.from(map.entries()).map(([value, name]) => ({ value, name }));
                                    };

                                    const programName = programOptions.find(p => p.value === student.program_id?.toString())?.name || student.program;
                                    const batchName = batchOptions.find(b => b.value === student.batch_id?.toString())?.name || student.batch;
                                    const divisionName = divisionOptions.find(d => d.value === student.division_id?.toString())?.name || student.division;
                                    const paperName = paperOptions().find(p => p.value === student.subject_id?.toString())?.name || student.paper;
                                    const academicYearName = academicYearOptions.find(y => y.value === student.academic_year_id?.toString())?.name || student.academicYear;
                                    const semesterName = semesterOptions.find(s => s.value === student.semester_id?.toString())?.name || student.semester;

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`hover:bg-gray-50 transition-colors relative z-0 ${student.selected ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="py-3 px-3 sm:px-6">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={student.selected}
                                                        onChange={() => handleCheckboxChange(student.id)}
                                                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 sm:px-6 hidden sm:table-cell">
                                                <div className="bg-blue-600 rounded-full p-1 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white shrink-0">
                                                    <User size={14} className="sm:w-5 sm:h-5" />
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 sm:px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800 font-medium text-xs sm:text-sm whitespace-nowrap">{student.name}</span>
                                                    <span className="text-gray-500 text-xs sm:hidden">
                                                        {programName} • {batchName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                                {paperName}
                                            </td>
                                            <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                                {programName}
                                            </td>
                                            <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                                {batchName}
                                            </td>
                                            <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                                {divisionName}
                                            </td>
                                            {/* <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                                <div className="max-w-[120px] truncate" title={paperName}>
                                                    {paperName}
                                                </div>
                                            </td> */}
                                            <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">
                                                {semesterName}
                                            </td>
                                            {/* <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">
                                                <div className="max-w-[80px] truncate" title={academicYearName}>
                                                    {academicYearName}
                                                </div>
                                            </td> */}
                                            <td className="py-3 px-3 sm:px-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => toggleStudentStatus(student.id)}
                                                        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${student.status === 'P' ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700" :
                                                            student.status === 'A' ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700" :
                                                                student.status === 'OA' ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700" :
                                                                    student.status === 'SA' ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700" :
                                                                        student.status === 'ML' ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700" :
                                                                            student.status === 'SL' ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700" :
                                                                                "bg-gray-100 text-gray-700"
                                                            }`}
                                                        style={{
                                                            animation: "statusChange 0.4s ease-out",
                                                        }}
                                                    >
                                                        {student.status === 'P' ? <Check size={16} className="animate-bounce-in" /> :
                                                            student.status === 'A' ? <X size={16} className="animate-bounce-in" /> :
                                                                student.status === 'OA' ? <Activity size={16} className="animate-bounce-in" /> :
                                                                    student.status === 'SA' ? <Trophy size={16} className="animate-bounce-in" /> :
                                                                        student.status === 'ML' ? <Stethoscope size={16} className="animate-bounce-in" /> :
                                                                            student.status === 'SL' ? <AlertCircle size={16} className="animate-bounce-in" /> :
                                                                                <MoreHorizontal size={16} className="animate-bounce-in" />
                                                        }
                                                        <span className="font-semibold">
                                                            {student.status === 'P' ? 'Present' :
                                                                student.status === 'A' ? 'Absent' :
                                                                    student.status === 'OA' ? 'Other' :
                                                                        student.status === 'SA' ? 'Sports' :
                                                                            student.status === 'ML' ? 'Medical' :
                                                                                student.status === 'SL' ? 'Sick' :
                                                                                    student.status}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>



            {/* Hoisted Popup Modal */}
            {
                activePopup && activeStudent && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-[9998]"
                            onClick={() => setActivePopup(null)}
                        ></div>

                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] w-[90%] max-w-80 p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Select Status</h3>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{activeStudent.name}</p>
                                </div>
                                <button
                                    onClick={() => setActivePopup(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Date info in popup */}
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center space-x-2">
                                <Calendar size={16} className="text-blue-600" />
                                <span className="text-xs sm:text-sm text-blue-700 font-medium">
                                    Date: {formatDate(selectedDate)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => updateStudentStatus(activeStudent.id, 'P')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                                        <Check size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Present</div>
                                        <div className="text-xs opacity-80">Mark as Present</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => updateStudentStatus(activeStudent.id, 'OA')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                                        <Activity size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Other Activity</div>
                                        <div className="text-xs opacity-80">Sports, Events, etc.</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => updateStudentStatus(activeStudent.id, 'ML')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                                        <Stethoscope size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Medical Leave</div>
                                        <div className="text-xs opacity-80">Approved Medical Leave</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => updateStudentStatus(activeStudent.id, 'A')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-sm">
                                        <X size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Absent</div>
                                        <div className="text-xs opacity-80">Mark as Absent</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )
            }

            {/* Empty State
            {filteredStudents.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {Object.values(filters).some(f => f)
                                ? "Try adjusting your filters to find students."
                                : "No students available for the selected criteria."}
                        </p>
                        {Object.values(filters).some(f => f) && (
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
            )} */}

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes statusChange {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                @keyframes bounce-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-bounce-in {
                    animation: bounce-in 0.4s ease-out;
                }
            `}</style>
            {/* Bottom Action Footer */}
            {
                filteredStudents.length > 0 && !loadingStudents && (
                    <div className="px-6 py-6 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <button
                            onClick={handleSubmitAttendance}
                            className="flex items-center gap-3 px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95 text-base group"
                        >
                            <Save size={20} className="group-hover:rotate-12 transition-transform" />
                            <span>Submit Daily Attendance</span>
                        </button>
                    </div>
                )
            }
        </div >
    );
}