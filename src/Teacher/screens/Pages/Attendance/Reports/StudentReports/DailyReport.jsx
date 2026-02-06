import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { Download, Search, Loader2, FileSpreadsheet, FileText, FileJson, ChevronDown, Filter, ChevronUp, Calendar } from 'lucide-react';
import AttendanceFilters from "../../../Attendance/Components/AttendanceFilters";
import { timetableService } from "../../../TimeTable/Services/timetable.service";
import { api } from '../../../../../../_services/api';
import { TeacherAttendanceManagement } from '../../Services/attendance.service';

const StudentDailyReport = () => {

    const [currentTeacherId, setCurrentTeacherId] = useState(null);


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [filterType, setFilterType] = useState('all'); // 'all', 'present', 'absent'
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
        programId: null,
        collegeId: null
    });

    // Allocations
    // ===============================
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);


    // Subject/Paper options
    const [paperOptions, setPaperOptions] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(false);

    // Student data
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(false);

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
            divisionId: extractNumericId(filters.division),
            programId: extractNumericId(filters.program)
        }));
    }, [filters.academicYear, filters.semester, filters.division, filters.program]);

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


    // This for the filter
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
                } else {
                    setAllocations([]);
                }
            } catch (error) {
                console.error("Error fetching allocations:", error);
                setAllocations([]);
            } finally {
                setLoadingAllocations(false);
            }
        };

        fetchAllocations();
    }, [currentTeacherId]);





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


    useEffect(() => {
        const fetchTeacherDailyReport = async () => {
            if (
                !currentTeacherId ||
                !apiIds.collegeId ||
                !apiIds.academicYearId ||
                !apiIds.semesterId ||
                !apiIds.divisionId ||
                !selectedDate
            ) {
                setAllStudents([]);
                return;
            }

            try {
                setLoading(true);
                const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

                const params = {
                    teacherId: currentTeacherId,
                    collegeId: apiIds.collegeId,
                    academicYearId: apiIds.academicYearId,
                    semesterId: apiIds.semesterId,
                    divisionId: apiIds.divisionId,
                    programId: apiIds.programId,
                    date: formattedDate
                };

                if (selectedSubject !== 'all') {
                    params.paperId = selectedSubject;
                }

                const response = await TeacherAttendanceManagement.getDailyReport(params);

                if (response?.success && response.data) {
                    const students = response.data.attendance_records.map(record => ({
                        id: record.student_id,
                        rollNo: record.roll_number || '-',
                        name: record.student_name,
                        status: (record.status_code || 'P'),
                        reason: record.remarks || '-'
                    }));

                    setAllStudents(students);
                } else {
                    setAllStudents([]);
                }
            } catch (error) {
                console.error("Teacher report error:", error);
                setAllStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherDailyReport();
    }, [
        currentTeacherId,
        selectedDate,
        selectedSubject,
        apiIds.collegeId,
        apiIds.academicYearId,
        apiIds.semesterId,
        apiIds.divisionId
    ]);


    // Calculate statistics
    const stats = {
        total: allStudents.length,
        present: allStudents.filter(s => s.status === 'P').length,
        absent: allStudents.filter(s => s.status === 'A').length,
        onLeave: allStudents.filter(s => s.status === 'OL' || s.status === 'ML').length,
    };
    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    // Filter students based on filterType and searchTerm
    const filteredStudents = allStudents.filter(student => {
        const matchesFilterType = () => {
            if (filterType === 'all') return true;
            if (filterType === 'present') return student.status === 'P';
            if (filterType === 'absent') return student.status === 'A' || student.status === 'OL' || student.status === 'ML';
            return true;
        };

        const matchesSearch = () => {
            if (!searchTerm) return true;
            const lower = searchTerm.toLowerCase();
            return (
                student.name?.toLowerCase().includes(lower) ||
                student.rollNo?.toLowerCase().includes(lower)
            );
        };

        return matchesFilterType() && matchesSearch();
    });

    const formattedSelectedDate = moment(selectedDate).format('DD-MM-YYYY');

    // Download PDF
    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text('Student Daily Attendance Report', 140, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Date: ${formattedSelectedDate}`, 14, 22);

        const paperLabel = paperOptions.find(p => p.value === selectedSubject)?.label || 'All';
        doc.text(`Paper: ${paperLabel}`, 14, 27);

        autoTable(doc, {
            head: [['Roll No', 'Student Name', 'Status', 'Reason']],
            body: filteredStudents.map(student => [
                student.rollNo,
                student.name,
                student.status === 'P' ? 'Present' : student.status === 'ML' ? 'Medical Leave' : student.status === 'OL' ? 'On Leave' : 'Absent',
                student.reason
            ]),
            startY: 32,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`Daily_Attendance_Report_${formattedSelectedDate}.pdf`);
        setShowExportMenu(false);
    };

    // Download Excel
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredStudents.map(s => ({
            'Roll No': s.rollNo,
            'Student Name': s.name,
            'Status': s.status === 'P' ? 'Present' : s.status === 'ML' ? 'Medical Leave' : s.status === 'OL' ? 'On Leave' : 'Absent',
            'Reason': s.reason
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Daily_Attendance_Report_${formattedSelectedDate}.xlsx`);
        setShowExportMenu(false);
    };

    // Download CSV
    const downloadCSV = () => {
        if (!filteredStudents.length) return;

        const headers = ["Roll No,Student Name,Status,Reason"];
        const rows = filteredStudents.map(s =>
            `"${s.rollNo}","${s.name}","${s.status === 'P' ? 'Present' : s.status === 'ML' ? 'Medical Leave' : s.status === 'OL' ? 'On Leave' : 'Absent'}","${s.reason}"`
        );

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Daily_Attendance_Report_${formattedSelectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const handleCardClick = (type) => {
        setFilterType(type);
    };

    // Mobile card view
    const MobileAttendanceCard = ({ student }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 leading-snug">{student.name}</h3>
                    <p className="text-[10px] text-gray-400  font-bold tracking-wider mt-0.5">Roll No: {student.rollNo}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.status === 'P' ? 'bg-green-50 text-green-700' :
                    student.status === 'ML' ? 'bg-blue-50 text-blue-700' :
                        student.status === 'OL' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                    }`}>
                    {student.status === 'P' ? 'Present' : student.status === 'ML' ? 'Medical Leave' : student.status === 'OL' ? 'On Leave' : 'Absent'}
                </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-50">
                <p className="text-[10px] text-gray-400  font-bold tracking-wider mb-1">Reason</p>
                <p className="text-xs text-gray-600 italic">{student.reason}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Academic Filters */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">
                    Academic Filters
                </h3>

                <AttendanceFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    showPaperFilter={false}
                    showTimeSlotFilter={false}
                    allocations={allocations}
                    loadingAllocations={loadingAllocations}
                />

            </div>


            {/* Date, Subject, Search and Export */}
            <div className="flex flex-col lg:flex-row items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paper
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!apiIds.academicYearId || !apiIds.semesterId || loadingPapers}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                    >
                        <option value="all">Select Paper</option>
                        {loadingPapers ? (
                            <option value="" disabled>Loading subjects...</option>
                        ) : (
                            paperOptions.map(paper => (
                                <option key={paper.id} value={paper.value}>
                                    {paper.label}
                                </option>
                            ))
                        )}
                    </select>
                </div>

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

                {/* Export Button */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={loading || filteredStudents.length === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-green-600 border border-green-700 rounded-lg text-white hover:bg-green-700 shadow-md transition-all ${(loading || filteredStudents.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div
                    onClick={() => handleCardClick('all')}
                    className={`cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'all' ? 'border-blue-600 shadow-md' : 'border-blue-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Total Students</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleCardClick('present')}
                    className={`cursor-pointer bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'present' ? 'border-green-600 shadow-md' : 'border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Present</p>
                            <p className="text-3xl font-bold text-green-900">{stats.present}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleCardClick('absent')}
                    className={`cursor-pointer bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'absent' ? 'border-red-600 shadow-md' : 'border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Absent</p>
                            <p className="text-3xl font-bold text-red-900">{stats.absent}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 mb-1">Attendance %</p>
                            <p className="text-3xl font-bold text-purple-900">{stats.percentage}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Info */}
            {filterType !== 'all' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-800">
                            Showing {filteredStudents.length} {filterType === 'present' ? 'present' : 'absent'} students
                        </p>
                        <button
                            onClick={() => setFilterType('all')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Show All
                        </button>
                    </div>
                </div>
            )}

            {/* Student List View */}
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">
                        {filterType === 'all' ? 'All Students' : filterType === 'present' ? 'Present Students' : 'Absent Students'}
                    </h3>
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-bold text-blue-600">{filteredStudents.length}</span> students
                    </div>
                </div>

                {isMobileView ? (
                    <div className="p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                No students found matching your criteria.
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <MobileAttendanceCard key={student.id} student={student} />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="max-h-[500px] overflow-y-auto blue-scrollbar">
                            <table className="w-full min-w-max">
                                <thead className="bg-blue-800 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-bold  tracking-wider">Roll No</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-bold  tracking-wider">Student Name</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-bold  tracking-wider">Status</th>
                                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-bold  tracking-wider">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No students found matching the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-700">{student.rollNo}</td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm font-semibold text-gray-900">{student.name}</td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                                    <span className={`px-4 py-1 rounded-full text-[11px] font-bold  tracking-wide ${student.status === 'P' ? 'bg-green-100 text-green-700' :
                                                        student.status === 'ML' ? 'bg-blue-100 text-blue-700' :
                                                            student.status === 'OL' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {student.status === 'P' ? 'Present' :
                                                            student.status === 'ML' ? 'Medical Leave' :
                                                                student.status === 'OL' ? 'On Leave' : 'Absent'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-600">{student.reason}</td>
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


export default StudentDailyReport;
