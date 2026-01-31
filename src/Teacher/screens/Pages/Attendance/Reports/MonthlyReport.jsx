import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, Search, Loader2, FileSpreadsheet, FileText, FileJson, ChevronDown, Filter, ChevronUp } from 'lucide-react';
import AttendanceFilters from "../../Attendance/Components/AttendanceFilters";
import { timetableService } from '../../TimeTable/Services/timetable.service';
import { TeacherAttendanceManagement } from '../Services/attendance.service';
import { api } from '../../../../../_services/api';

const MonthlyReport = () => {
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);


    // Date range state instead of single month
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [selectedSubject, setSelectedSubject] = useState('all');
    const [filterType, setFilterType] = useState('all'); // 'all', 'highest', 'lowest', 'below35'
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    // Export Dropdown State
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Header filters state
    const [filters, setFilters] = useState({
        program: "",
        programName: "",
        batch: "",
        batchName: "",
        academicYear: "",
        yearName: "",
        semester: "",
        semesterName: "",
        division: "",
        divisionName: "",
    });

    const [apiIds, setApiIds] = useState({
        academicYearId: null,
        semesterId: null,
        divisionId: null,
        collegeId: null
    });

    // Subject/Paper options
    const [paperOptions, setPaperOptions] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(false);

    const [summaryData, setSummaryData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const teacherId = currentTeacherId;

    const stats = summaryData ? {
        avg: summaryData.average_attendance_percentage?.toFixed(2) || 0,
        highest: summaryData.highest_attendance_percentage?.toFixed(2) || 0,
        lowest: summaryData.lowest_attendance_percentage?.toFixed(2) || 0,
        below35: summaryData.below_threshold_count || 0
    } : {
        avg: 0,
        highest: 0,
        lowest: 0,
        below35: 0
    };
    useEffect(() => {
        const getTeacherIdFromStorage = () => {
            let teacherId = null;
            const userProfileStr =
                localStorage.getItem("userProfile") ||
                sessionStorage.getItem("userProfile");
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
                if (response?.success) {
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
        fetchAllocations();
    }, [currentTeacherId]);

    useEffect(() => {
        const fetchMonthlySummary = async () => {
            if (
                !teacherId ||
                !apiIds.collegeId ||
                !apiIds.academicYearId ||
                !apiIds.semesterId ||
                !apiIds.divisionId ||
                !startDate ||
                !endDate
            ) {
                setStudents([]);
                setSummaryData(null);
                return;
            }

            try {
                setLoading(true);

                const params = {
                    teacherId,
                    collegeId: apiIds.collegeId,
                    academicYearId: apiIds.academicYearId,
                    semesterId: apiIds.semesterId,
                    divisionId: apiIds.divisionId,
                    startDate,
                    endDate
                };

                if (selectedSubject !== 'all') {
                    params.paperId = selectedSubject;
                }

                console.log("Teacher Monthly Summary Params:", params);

                const response = await TeacherAttendanceManagement.getSummaryReport(params);

                if (response?.success && response.data) {
                    setSummaryData(response.data);

                    const getStatus = (p) => {
                        if (p >= 75) return 'Excellent';
                        if (p >= 35) return 'Good';
                        return 'Poor';
                    };

                    const formattedStudents = (response.data.student_details || []).map(s => ({
                        id: s.student_id,
                        rollNo: s.roll_number || '-',
                        name: s.student_name,
                        present: s.present_count,
                        absent: s.absent_count,
                        percentage: s.attendance_percentage,
                        status: getStatus(s.attendance_percentage)
                    }));

                    setStudents(formattedStudents);
                } else {
                    setStudents([]);
                    setSummaryData(null);
                }
            } catch (err) {
                console.error("Teacher monthly summary error:", err);
                setStudents([]);
                setSummaryData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlySummary();
    }, [
        teacherId,
        startDate,
        endDate,
        selectedSubject,
        apiIds.collegeId,
        apiIds.academicYearId,
        apiIds.semesterId,
        apiIds.divisionId
    ]);

    // Extract numeric IDs from filters
    useEffect(() => {
        const extractNumericId = (str) => {
            if (!str) return null;
            const match = str.toString().match(/\d+/);
            return match ? Number(match[0]) : Number(str);
        };

        setApiIds(prev => ({
            ...prev,
            academicYearId: extractNumericId(filters.academicYear),
            semesterId: extractNumericId(filters.semester),
            divisionId: extractNumericId(filters.division)
        }));
    }, [filters.academicYear, filters.semester, filters.division]);

    // Initialize collegeId
    useEffect(() => {
        const college = JSON.parse(localStorage.getItem("activeCollege"));
        if (college?.id) {
            setApiIds(prev => ({
                ...prev,
                collegeId: Number(college.id)
            }));
        }
    }, []);

    // Fetch papers/subjects
    useEffect(() => {
        const fetchPapers = async () => {
            if (!apiIds.academicYearId || !apiIds.semesterId) {
                setPaperOptions([]);
                setSelectedSubject('all');
                return;
            }

            try {
                setLoadingPapers(true);
                const papers = await timetableService.getPaperAllocationsByAcademicYearAndSemester(
                    apiIds.academicYearId,
                    apiIds.semesterId
                );

                const formattedPapers = papers.map(paper => ({
                    value: paper.allocation_id.toString(),
                    label: `${paper.subject?.name || 'Unnamed Paper'}`,
                    id: paper.allocation_id,
                    name: paper.subject?.name || 'Unnamed Paper',
                    code: paper.subject?.subject_code || ''
                }));

                setPaperOptions(formattedPapers);
            } catch (error) {
                console.error('Error loading papers:', error);
                setPaperOptions([]);
            } finally {
                setLoadingPapers(false);
            }
        };

        fetchPapers();
    }, [apiIds.academicYearId, apiIds.semesterId]);

    // Filter and sort data based on filterType
    // Filter students based on filterType
    const getFilteredStudents = () => {
        let result = [...students];

        // Filter by searchTerm
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name?.toLowerCase().includes(lower) ||
                s.rollNo?.toLowerCase().includes(lower)
            );
        }

        switch (filterType) {
            case 'highest':
                return result.sort((a, b) => b.percentage - a.percentage);
            case 'lowest':
                return result.sort((a, b) => a.percentage - b.percentage);
            case 'below35':
                return result.filter(s => s.percentage < 35);
            case 'all':
            default:
                return result;
        }
    };
    const filteredStudents = getFilteredStudents();

    // Show this when filter is active
    const isFiltered = filterType !== 'all';

    const personWiseData = filteredStudents;

    // Download PDF
    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text('Student Monthly Attendance Report', 140, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Period: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`, 14, 22);

        autoTable(doc, {
            head: [['ID / Roll No', 'Student Name', 'Present', 'Absent', 'Percentage', 'Status']],
            body: personWiseData.map(s => [
                s.rollNo,
                s.name,
                s.present,
                s.absent,
                `${s.percentage}%`,
                s.status
            ]),
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`Monthly_Attendance_Report_${startDate}_to_${endDate}.pdf`);
        setShowExportMenu(false);
    };

    // Download Excel
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(personWiseData.map(s => ({
            'ID / Roll No': s.rollNo,
            'Student Name': s.name,
            'Present': s.present,
            'Absent': s.absent,
            'Percentage': s.percentage + '%',
            'Status': s.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Monthly_Attendance_Report_${startDate}_to_${endDate}.xlsx`);
        setShowExportMenu(false);
    };

    // Download CSV
    const downloadCSV = () => {
        if (!personWiseData.length) return;

        const headers = ["ID / Roll No,Student Name,Present,Absent,Percentage,Status"];
        const rows = personWiseData.map(s =>
            `"${s.rollNo}","${s.name}","${s.present}","${s.absent}","${s.percentage}%","${s.status}"`
        );

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Monthly_Attendance_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const handleCardClick = (type) => {
        setFilterType(type);
    };

    // Mobile card view
    const MobileAttendanceCard = ({ person }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 leading-snug">{person.name}</h3>
                    <p className="text-[10px] text-gray-400  font-bold tracking-wider mt-0.5">Roll No: {person.rollNo}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 leading-none">{person.percentage}%</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${person.percentage >= 95 ? 'bg-green-50 text-green-700' :
                        person.percentage >= 85 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                        {person.status}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-50">
                <div>
                    <p className="text-[10px] text-gray-400  font-bold tracking-wider mb-0.5">Present</p>
                    <p className="text-sm font-medium text-green-600">{person.present} Days</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400  font-bold tracking-wider mb-0.5">Absent</p>
                    <p className="text-sm font-medium text-red-600">{person.absent} Days</p>
                </div>
            </div>
        </div>
    );

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getCardTitle = () => {
        const dateRange = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;

        switch (filterType) {
            case 'highest':
                return `Highest Attendance (${dateRange})`;
            case 'lowest':
                return `Lowest Attendance (${dateRange})`;
            case 'below35':
                return `Below 35% Attendance (${dateRange})`;
            case 'all':
            default:
                return `Period Report (${dateRange})`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Academic Filters
                </h3>

                <AttendanceFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    allocations={allocations}
                    loadingAllocations={loadingAllocations}
                    showPaperFilter={true}
                    showTimeSlotFilter={false}
                />
            </div>

            {/* Period and Export */}
            <div className="flex flex-col lg:flex-row items-end gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                {/* From Date */}
                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                {/* To Date */}
                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                {/* Subject/Paper */}


                {/* Search */}
                <div className="w-full lg:flex-1 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Student
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or roll no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Export Dropdown */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={loading || personWiseData.length === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-green-600 border border-green-700 rounded-lg text-white hover:bg-green-700 shadow-md transition-all ${(loading || personWiseData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-1">
                                <button onClick={downloadExcel} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <span>Excel (.xlsx)</span>
                                </button>
                                <button onClick={downloadCSV} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span>CSV (.csv)</span>
                                </button>
                                <button onClick={downloadPDF} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors">
                                    <FileJson className="w-4 h-4 text-red-600" />
                                    <span>PDF (.pdf)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. All Students - Average Attendance */}
                <button
                    onClick={() => handleCardClick('all')}
                    className={`bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'all' ? 'border-green-500 shadow-lg' : 'border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-green-600 mb-1">Avg Attendance</p>
                            <p className="text-3xl font-bold text-green-900">{stats.avg}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 2. Highest Attendance */}
                <button
                    onClick={() => handleCardClick('highest')}
                    className={`bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'highest' ? 'border-blue-500 shadow-lg' : 'border-blue-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-600 mb-1">Highest Attendance</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.highest}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 3. Lowest Attendance */}
                <button
                    onClick={() => handleCardClick('lowest')}
                    className={`bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'lowest' ? 'border-orange-500 shadow-lg' : 'border-orange-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-orange-600 mb-1">Lowest Attendance</p>
                            <p className="text-3xl font-bold text-orange-900">{stats.lowest}%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 4. Below 35% */}
                <button
                    onClick={() => handleCardClick('below35')}
                    className={`bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'below35' ? 'border-red-500 shadow-lg' : 'border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-red-600 mb-1">Below 35%</p>
                            <p className="text-3xl font-bold text-red-900">{stats.below35}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                    </div>
                </button>
            </div>

            {/* Monthly Report View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">{getCardTitle()}</h3>
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-bold text-blue-600">{personWiseData.length}</span> records
                    </div>
                </div>

                {isMobileView ? (
                    <div className="p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                        {personWiseData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                No records found matching your criteria.
                            </div>
                        ) : (
                            personWiseData.map((person) => (
                                <MobileAttendanceCard key={person.id} person={person} />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="max-h-[500px] overflow-y-auto blue-scrollbar">
                            <table className="w-full min-w-max">
                                <thead className="bg-blue-800 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">ID / Roll No</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Name</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Present</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Absent</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Percentage</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {personWiseData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-white">
                                                No records found matching the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        personWiseData.map((person) => (
                                            <tr key={person.id} className="hover:bg-blue-50 transition-colors duration-150 bg-white">
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-sm text-gray-700">{person.rollNo}</td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-sm font-semibold text-gray-900">{person.name}</td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-bold">
                                                        {person.present} Days
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[11px] font-bold">
                                                        {person.absent} Days
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-sm font-bold text-gray-900">
                                                    {person.percentage}%
                                                </td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                                    <span className={`px-4 py-1 rounded-full text-[11px] font-bold  tracking-wide ${person.percentage >= 95 ? 'bg-green-100 text-green-700' :
                                                        person.percentage >= 85 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {person.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
