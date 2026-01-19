import React, { useState, useEffect } from 'react';
import AttendanceFilters from '../Components/AttendanceFilters';
import { api } from '../../../../../_services/api';
import { TeacherAttendanceManagement } from '../Services/attendance.service';

export default function CardView() {
    // State for selected year and month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    // State for filters (removed timeSlot)
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
    const [collegeId, setCollegeId] = useState(null);

    // State for attendance statuses
    const [attendanceStatuses, setAttendanceStatuses] = useState([]);
    const [loadingStatuses, setLoadingStatuses] = useState(false);

    // State for student attendance data
    const [students, setStudents] = useState([]);

    // Months array
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];


    // Fetch teacher ID and collegeId
    useEffect(() => {
        const getTeacherIdFromStorage = () => {
            let teacherId = null;
            let collegeId = null;
            const userProfileStr = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
            if (userProfileStr) {
                try {
                    const userProfile = JSON.parse(userProfileStr);
                    if (userProfile?.teacher_id) {
                        teacherId = userProfile.teacher_id;
                    }
                    if (userProfile?.college_id) {
                        collegeId = userProfile.college_id;
                    }
                } catch (e) {
                    console.error("Error parsing userProfile:", e);
                }
            }
            return {
                teacherId: teacherId ? parseInt(teacherId, 10) : null,
                collegeId: collegeId ? parseInt(collegeId, 10) : null
            };
        };

        const { teacherId, collegeId: fetchedCollegeId } = getTeacherIdFromStorage();
        if (teacherId && !isNaN(teacherId)) {
            setCurrentTeacherId(teacherId);
        }
        if (fetchedCollegeId && !isNaN(fetchedCollegeId)) {
            setCollegeId(fetchedCollegeId);
        }
    }, []);

    // Fetch attendance statuses when collegeId is available
    useEffect(() => {
        const fetchAttendanceStatuses = async () => {
            if (collegeId) {
                setLoadingStatuses(true);
                try {
                    const response = await TeacherAttendanceManagement.getAttendanceStatuses(collegeId);
                    if (response && response.success && response.data) {
                        setAttendanceStatuses(response.data);
                    } else {
                        setAttendanceStatuses([]);
                    }
                } catch (error) {
                    console.error("Error fetching attendance statuses:", error);
                    setAttendanceStatuses([]);
                } finally {
                    setLoadingStatuses(false);
                }
            }
        };

        fetchAttendanceStatuses();
    }, [collegeId]);

    // Fetch allocations
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

    // Auto-select first available filter values
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
        loadStudentsData();
    };

    // Get days in selected month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

    // Load students data from API based on filters
    const loadStudentsData = async () => {
        if (!filters.academicYear || !filters.semester || !filters.division || !filters.paper) {
            setStudents([]);
            return;
        }

        try {
            const year = selectedYear;
            const month = selectedMonth;
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);

            const formatDate = (date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            const startDateStr = formatDate(firstDay);
            const endDateStr = formatDate(lastDay);

            const currentAlloc = allocations.find(a =>
                a.academic_year_id == filters.academicYear &&
                a.semester_id == filters.semester &&
                a.division_id == filters.division &&
                a.subjects?.some(s => s.subject_id == filters.paper)
            );

            const payload = {
                academic_year_id: parseInt(filters.academicYear),
                semester_id: parseInt(filters.semester),
                division_id: parseInt(filters.division),
                subject_id: parseInt(filters.paper),
                start_date: startDateStr,
                end_date: endDateStr,
                timetable_allocation_id: currentAlloc?.timetable_allocation_id || null,
                timetable_id: currentAlloc?.timetable_id || null
            };

            const response = await TeacherAttendanceManagement.getAttendanceBySubject(payload);

            if (response && response.success && response.data) {
                const studentMap = {};

                response.data.forEach(record => {
                    const studentId = record.student_id;
                    if (!studentMap[studentId]) {
                        const sDetails = record.student_details || {};
                        studentMap[studentId] = {
                            id: studentId,
                            rollNo: sDetails.roll_number || 'N/A',
                            name: [sDetails.firstname, sDetails.middlename, sDetails.lastname].filter(Boolean).join(' '),
                            attendance: {},
                        };
                        days.forEach(d => {
                            studentMap[studentId].attendance[d] = '';
                        });
                    }

                    const dateObj = new Date(record.date);
                    const day = dateObj.getDate();

                    if (studentMap[studentId].attendance.hasOwnProperty(day)) {
                        studentMap[studentId].attendance[day] = record.status?.status_code || '';
                    }
                });

                const formattedStudents = Object.values(studentMap).map((student, index) => {
                    const attendanceValues = Object.values(student.attendance);
                    return {
                        ...student,
                        srNo: String(index + 1).padStart(2, '0'),
                        totalPresent: attendanceValues.filter(v => v === 'P').length,
                        totalAbsent: attendanceValues.filter(v => v === 'A').length
                    };
                });

                setStudents(formattedStudents);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setStudents([]);
        }
    };

    useEffect(() => {
        loadStudentsData();
    }, [selectedYear, selectedMonth, filters, allocations]);

    const hexToTextColor = (hexColor) => {
        const colorMap = {
            '#00FF00': 'text-green-600',
            '#de2b2b': 'text-red-600',
            '#3ce0ec': 'text-cyan-600',
            '#79bdcd': 'text-blue-600',
            '#c4c73d': 'text-yellow-600',
            '#c170c7': 'text-purple-600',
            '#4cb84c': 'text-green-600',
        };
        return colorMap[hexColor] || 'text-gray-600';
    };

    const attendanceOptions = attendanceStatuses.map(status => ({
        value: status.status_code,
        label: status.status_name,
        textColor: hexToTextColor(status.color_code),
        hexColor: status.color_code
    }));

    const getStatusStyle = (status) => {
        const statusObj = attendanceOptions.find(opt => opt.value === status);
        return statusObj?.textColor || 'text-gray-400';
    };

    const getMonthName = (monthNumber) => {
        return months.find(m => m.value === monthNumber)?.label || '';
    };

    return (
        <div className="min-h-screen bg-gray-50 md:p-6">
            <div className="bg-white md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                        Student Attendance - {getMonthName(selectedMonth)} {selectedYear}
                    </h3>
                </div>

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

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="w-full sm:w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Month & Year
                            </label>
                            <input
                                type="month"
                                value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [year, month] = e.target.value.split('-');
                                    setSelectedYear(parseInt(year));
                                    setSelectedMonth(parseInt(month));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {attendanceOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: option.hexColor }}
                            ></div>
                            <span className={`text-sm font-medium ${option.textColor}`}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto relative">
                    <div className="min-w-[1000px]">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-3 py-3 text-center bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Sr No
                                    </th>
                                    <th className="px-3 py-3 text-center bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Roll No.
                                    </th>
                                    <th className="px-4 py-3 text-left bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="px-2 py-3 text-center border-r border-gray-200 text-xs font-semibold text-gray-600">
                                            {day}
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 text-center bg-green-50 border-r border-gray-200 text-xs font-semibold text-green-700">
                                        Present
                                    </th>
                                    <th className="px-3 py-3 text-center bg-red-50 text-xs font-semibold text-red-700">
                                        Absent
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-3 border-r border-gray-200 text-center bg-white">
                                            {student.srNo}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center bg-white">
                                            {student.rollNo}
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-200 text-left bg-white font-medium">
                                            {student.name}
                                        </td>
                                        {days.map(day => (
                                            <td key={day} className={`px-2 py-3 text-center border-r border-gray-200 font-bold ${getStatusStyle(student.attendance[day])}`}>
                                                {student.attendance[day]}
                                            </td>
                                        ))}
                                        <td className="px-3 py-3 text-center bg-green-50/30 border-r border-gray-200 font-bold text-green-700">
                                            {student.totalPresent}
                                        </td>
                                        <td className="px-3 py-3 text-center bg-red-50/30 font-bold text-red-700">
                                            {student.totalAbsent}
                                        </td>
                                    </tr>
                                ))}

                                {/* Daily Present Count Row */}
                                {students.length > 0 && (
                                    <tr className="bg-blue-50/50 font-bold border-t-2 border-blue-100">
                                        <td colSpan="3" className="px-4 py-3 text-blue-800 text-sm">
                                            Daily Present Count
                                        </td>
                                        {days.map(day => {
                                            const presentCount = students.filter(s => s.attendance[day] === 'P').length;
                                            return (
                                                <td key={day} className="px-2 py-3 text-center border-r border-gray-200 text-blue-700">
                                                    {presentCount > 0 ? presentCount : '-'}
                                                </td>
                                            );
                                        })}
                                        <td colSpan="2" className="bg-blue-50/50"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{students.length}</span> students
                    </div>
                </div>
            </div>
        </div>
    );
}