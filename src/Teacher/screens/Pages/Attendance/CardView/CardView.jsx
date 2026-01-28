import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AttendanceFilters from '../Components/AttendanceFilters';
import { api } from '../../../../../_services/api';
import { TeacherAttendanceManagement } from '../Services/attendance.service';
import { Calendar, AlertCircle, Users, CheckCircle2, Save, RotateCcw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import SweetAlert from 'react-bootstrap-sweetalert';

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

    // State for attendance data
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // State for pending changes: { [day]: { [studentId]: { statusId, remarks } } }
    const [pendingChanges, setPendingChanges] = useState({});

    // State for selected days in the month for bulk actions
    const [selectedDays, setSelectedDays] = useState([]);

    // Months array
    const months = useMemo(() => [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ], []);

    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const days = useMemo(() => Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1), [selectedYear, selectedMonth]);

    const getMonthName = (monthValue) => {
        return months.find(m => m.value === monthValue)?.label || '';
    };

    // Robust matching for Present/Absent
    const isPresent = useCallback((status) => {
        const code = String(status?.status_code || '').toUpperCase();
        const name = String(status?.status_name || '').toUpperCase();
        return ['P', 'PR', 'PRESENT'].includes(code) ||
            name.includes('PRESENT') ||
            (code.length <= 2 && code.startsWith('P'));
    }, []);

    const isAbsent = useCallback((status) => {
        const code = String(status?.status_code || '').toUpperCase();
        const name = String(status?.status_name || '').toUpperCase();
        return ['A', 'AB', 'ABSENT'].includes(code) ||
            name.includes('ABSENT') ||
            (code.length <= 2 && code.startsWith('A'));
    }, []);

    // Sorted statuses: Present, then Absent, then Others
    const sortedStatuses = useMemo(() => {
        const pList = attendanceStatuses.filter(s => isPresent(s));
        const aList = attendanceStatuses.filter(s => isAbsent(s));
        const otherList = attendanceStatuses.filter(s => !isPresent(s) && !isAbsent(s));

        const combined = [...pList, ...aList, ...otherList];
        const unique = [];
        const seen = new Set();
        combined.forEach(s => {
            if (!seen.has(s.status_id)) {
                unique.push(s);
                seen.add(s.status_id);
            }
        });
        return unique;
    }, [attendanceStatuses, isPresent, isAbsent]);

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
        fetchAttendanceData();
    };

    const getMonthDateRange = () => {
        const year = selectedYear;
        const month = String(selectedMonth).padStart(2, '0');
        const lastDay = getDaysInMonth(selectedYear, selectedMonth);
        return {
            start_date: `${year}-${month}-01`,
            end_date: `${year}-${month}-${String(lastDay).padStart(2, '0')}`
        };
    };

    const fetchAttendanceData = useCallback(async () => {
        if (!filters.academicYear || !filters.semester || !filters.division || !filters.paper) {
            setAttendanceData([]);
            return;
        }

        setLoading(true);
        try {
            const dateRange = getMonthDateRange();
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
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
                timetable_allocation_id: currentAlloc?.timetable_allocation_id || "",
                timetable_id: currentAlloc?.timetable_id || 0
            };

            const response = await TeacherAttendanceManagement.getAttendanceBySubject(payload);
            if (response.success && response.data) {
                processAttendanceData(response.data);
                setPendingChanges({});
                setSelectedDays([]);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    }, [filters, selectedYear, selectedMonth, allocations]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const processAttendanceData = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            setAttendanceData([]);
            return;
        }

        const studentMap = new Map();
        data.forEach(record => {
            const studentId = record.student_id;
            const date = new Date(record.date);
            const day = date.getDate();
            const status = record.status;

            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    id: studentId,
                    rollNo: record.student_details?.roll_number || record.roll_number || '-',
                    name: `${record.student_details?.firstname || record.firstname || ''} ${record.student_details?.middlename || record.middlename || ''} ${record.student_details?.lastname || record.lastname || ''}`.trim(),
                    attendance: {},
                    metadata: {}
                });
            }

            const student = studentMap.get(studentId);
            student.attendance[day] = status;
            student.metadata[day] = {
                time_slot_id: record.time_slot_id,
                timetable_allocation_id: record.timetable_allocation_id,
                timetable_id: record.timetable_id
            };
        });

        const studentsArray = Array.from(studentMap.values()).map((student, index) => ({
            ...student,
            srNo: String(index + 1).padStart(2, '0')
        }));

        setAttendanceData(studentsArray);
    };

    const getStatusStyle = (status) => {
        if (!status) return { color: '#9ca3af', backgroundColor: '#f9fafb' };
        if (status.color_code) {
            return {
                color: status.color_code,
                backgroundColor: `${status.color_code}15`,
                border: `1.5px solid ${status.color_code}40`
            };
        }
        if (isPresent(status)) return { color: '#10b981', backgroundColor: '#ecfdf5', border: '1.5px solid #10b98140' };
        if (isAbsent(status)) return { color: '#ef4444', backgroundColor: '#fef2f2', border: '1.5px solid #ef444440' };
        return { color: '#6b7280', backgroundColor: '#f3f4f6', border: '1.5px solid #6b728040' };
    };

    const toggleStatus = (studentId, day) => {
        if (sortedStatuses.length < 2) return;

        setAttendanceData(prev => prev.map(student => {
            if (student.id === studentId) {
                const currentStatus = student.attendance[day];
                let nextStatus;

                if (!currentStatus) {
                    nextStatus = sortedStatuses[0];
                } else {
                    const currentIndex = sortedStatuses.findIndex(s => s.status_id === currentStatus.status_id);
                    nextStatus = sortedStatuses[(currentIndex + 1) % sortedStatuses.length];
                }

                setPendingChanges(prevChanges => {
                    const newDayChanges = { ...(prevChanges[day] || {}) };
                    newDayChanges[studentId] = {
                        statusId: nextStatus.status_id,
                        statusName: nextStatus.status_name
                    };
                    return { ...prevChanges, [day]: newDayChanges };
                });

                return {
                    ...student,
                    attendance: { ...student.attendance, [day]: nextStatus }
                };
            }
            return student;
        }));
    };

    const toggleDaySelection = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const markAllPresentGlobal = () => {
        if (selectedDays.length === 0) {
            Swal.fire({
                title: 'No Dates Selected',
                text: 'Please select dates in the table header first.',
                icon: 'warning',
                confirmButtonColor: '#FF9013',
                customClass: {
                    confirmButton: 'btn-confirm'
                }
            });
            return;
        }

        const targetStatus = sortedStatuses.find(s => isPresent(s));
        if (!targetStatus) return;

        const allChanges = { ...pendingChanges };
        const updatedData = attendanceData.map(student => {
            const updatedAttendance = { ...student.attendance };
            selectedDays.forEach(day => {
                updatedAttendance[day] = targetStatus;
                if (!allChanges[day]) allChanges[day] = {};
                allChanges[day][student.id] = {
                    statusId: targetStatus.status_id,
                    statusName: targetStatus.status_name
                };
            });
            return { ...student, attendance: updatedAttendance };
        });

        setAttendanceData(updatedData);
        setPendingChanges(allChanges);
        setSelectedDays([]);
    };

    const markAllAbsentGlobal = () => {
        if (selectedDays.length === 0) {
            Swal.fire({
                title: 'No Dates Selected',
                text: 'Please select dates in the table header first.',
                icon: 'warning',
                confirmButtonColor: '#FF9013',
                customClass: {
                    confirmButton: 'btn-confirm'
                }
            });
            return;
        }

        const targetStatus = sortedStatuses.find(s => isAbsent(s));
        if (!targetStatus) return;

        const allChanges = { ...pendingChanges };
        const updatedData = attendanceData.map(student => {
            const updatedAttendance = { ...student.attendance };
            selectedDays.forEach(day => {
                updatedAttendance[day] = targetStatus;
                if (!allChanges[day]) allChanges[day] = {};
                allChanges[day][student.id] = {
                    statusId: targetStatus.status_id,
                    statusName: targetStatus.status_name
                };
            });
            return { ...student, attendance: updatedAttendance };
        });

        setAttendanceData(updatedData);
        setPendingChanges(allChanges);
        setSelectedDays([]);
    };

    const handleSubmit = async () => {
        const modifiedDays = Object.keys(pendingChanges);
        if (modifiedDays.length === 0) return;

        const result = await Swal.fire({
            title: 'Submit Changes?',
            text: `You have modified attendance for ${modifiedDays.length} day(s).`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Submit',
            confirmButtonColor: '#FF9013',
            cancelButtonColor: '#2162C1',
            customClass: {
                confirmButton: 'btn-confirm',
                cancelButton: 'btn-cancel'
            }
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const payload = modifiedDays.map(day => {
                const dayDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const studentsList = Object.keys(pendingChanges[day]).map(studId => ({
                    student_id: parseInt(studId),
                    status_id: pendingChanges[day][studId].statusId,
                    remarks: pendingChanges[day][studId].statusName
                }));

                const student = attendanceData.find(s => s.id === parseInt(Object.keys(pendingChanges[day])[0]));
                const meta = student?.metadata[day] || {};

                const currentAlloc = allocations.find(a =>
                    a.academic_year_id == filters.academicYear &&
                    a.semester_id == filters.semester &&
                    a.division_id == filters.division &&
                    a.subjects?.some(s => s.subject_id == filters.paper)
                );

                return {
                    academic_year_id: parseInt(filters.academicYear),
                    semester_id: parseInt(filters.semester),
                    division_id: parseInt(filters.division),
                    subject_id: parseInt(filters.paper),
                    college_id: collegeId,
                    date: dayDate,
                    time_slot_id: meta.time_slot_id || 0,
                    timetable_allocation_id: meta.timetable_allocation_id || currentAlloc?.timetable_allocation_id || "",
                    timetable_id: meta.timetable_id || currentAlloc?.timetable_id || 0,
                    students: studentsList,
                };
            });

            const response = await TeacherAttendanceManagement.saveMultipleBulkAttendance(payload);
            if (response.success) {
                setShowSuccessAlert(true);

            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message || 'Failed to submit data',
                    icon: 'error',
                    confirmButtonColor: '#FF9013',
                    customClass: {
                        confirmButton: 'btn-confirm'
                    }
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong',
                icon: 'error',
                confirmButtonColor: '#FF9013',
                customClass: {
                    confirmButton: 'btn-confirm'
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAttendanceTotals = (student) => {
        const attendanceValues = Object.values(student.attendance);
        const present = attendanceValues.filter(s => isPresent(s)).length;
        const absent = attendanceValues.filter(s => isAbsent(s)).length;
        return { present, absent };
    };

    const getDailyPresentCount = (day) => {
        return attendanceData.filter(student => isPresent(student.attendance[day])).length;
    };

    const hasChanges = Object.keys(pendingChanges).length > 0;

    const resetChanges = () => {
        if (hasChanges) {
            Swal.fire({
                title: 'Discard All Changes?',
                text: 'All unsaved modifications will be permanently lost.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Discard',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#2162C1',
                customClass: {
                    confirmButton: 'btn-confirm',
                    cancelButton: 'btn-cancel'
                }
            }).then(result => {
                if (result.isConfirmed) fetchAttendanceData();
            });
        }
    };

    // Success Alert Handler
    const handleSuccessAlertConfirm = () => {
        setShowSuccessAlert(false);
        fetchAttendanceData();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-full overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 font-sans">
                {/* Top Row: Title, Filters Toggle, Month Picker, Submit */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                            Student Attendance - {getMonthName(selectedMonth)} {selectedYear}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium select-none text-ellipsis overflow-hidden">Select dates in table header to apply bulk marking</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {/* Month Picker */}
                        <div className="relative">
                            <input
                                type="month"
                                value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [year, month] = e.target.value.split('-');
                                    setSelectedYear(parseInt(year));
                                    setSelectedMonth(parseInt(month));
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer font-bold text-gray-700 h-[40px] text-sm"
                            />
                        </div>

                        {/* Submit Section */}
                        <div className="flex items-center gap-3">
                            {hasChanges && (
                                <div className="hidden lg:flex items-center shrink-0 pr-2">
                                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black tracking-wider rounded-full border border-amber-200 animate-pulse flex items-center gap-1">
                                        <AlertCircle size={10} /> Unsaved Changes
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!hasChanges || isSubmitting}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-xs transition-all shadow-md active:scale-95 h-[40px] whitespace-nowrap shrink-0 group ${hasChanges
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                {isSubmitting ? <RotateCcw className="animate-spin w-3 h-3" /> : <Save className={`w-3 h-3 ${hasChanges ? 'group-hover:scale-110 transition-transform' : ''}`} />}
                                {isSubmitting ? 'Saving...' : 'Submit Attendance'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mt-6">
                    <AttendanceFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        showFilters={showFilters}
                        onToggleFilters={toggleFilters}
                        onResetFilters={resetFilters}
                        onApplyFilters={applyFilters}
                        showTimeSlotFilter={false}
                        allocations={allocations}
                        loadingAllocations={loadingAllocations}
                        compact={true}
                    />
                </div>

                {/* Status & Bulk Actions Row */}
                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Legend Section */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            {sortedStatuses.map(status => (
                                <div
                                    key={status.status_id}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest transition-all hover:translate-y-[-1px]"
                                    style={{
                                        backgroundColor: `${status.color_code}10`,
                                        borderColor: `${status.color_code}30`,
                                        color: status.color_code
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color_code }}></span>
                                    {status.status_name}
                                </div>
                            ))}
                        </div>
                        {selectedDays.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-left-4">
                                <CheckCircle2 size={12} />
                                {selectedDays.length} Dates Selected
                                <button onClick={() => setSelectedDays([])} className="ml-1 text-red-500 hover:underline">Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Global Actions Row */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                        {hasChanges && (
                            <button
                                onClick={resetChanges}
                                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 font-bold text-xs transition-all hover:bg-red-50 rounded-lg mr-1 group"
                            >
                                <RotateCcw size={14} className="group-hover:rotate-[-90deg] transition-transform" />
                                <span>Discard Changes</span>
                            </button>
                        )}
                        <button
                            onClick={markAllPresentGlobal}
                            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-xs ${selectedDays.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:translate-y-[-2px]'}`}
                        >
                            <CheckCircle2 size={14} />
                            <span>Mark All Present</span>
                        </button>
                        <button
                            onClick={markAllAbsentGlobal}
                            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-xs ${selectedDays.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:translate-y-[-2px]'}`}
                        >
                            <AlertCircle size={14} />
                            <span>Mark All Absent</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold">Synchronizing records...</p>
                    </div>
                </div>
            ) : attendanceData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                        <Calendar size={48} />
                        <h3 className="text-xl font-bold text-gray-800">No records found</h3>
                        <p className="max-w-xs mx-auto text-sm">Please update your filters or check the selected month.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full text-center border-collapse table-fixed min-w-max text-xs">
                            <thead>
                                <tr className="bg-blue-800 text-white border-b border-blue-900">
                                    <th className="py-4 px-2 w-[60px] bg-blue-800 z-50 sticky left-0 font-bold border-r border-blue-700 shadow-sm">SR</th>
                                    <th className="py-4 px-2 w-[80px] bg-blue-800 z-50 sticky left-[60px] font-bold border-r border-blue-700 shadow-sm">Roll</th>
                                    <th className="py-4 px-6 w-[240px] text-left bg-blue-800 z-50 sticky left-[140px] font-bold border-r border-blue-700 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Student Name</th>
                                    {days.map(day => {
                                        const isSelected = selectedDays.includes(day);
                                        return (
                                            <th
                                                key={day}
                                                onClick={() => toggleDaySelection(day)}
                                                className={`p-0 border-r border-blue-700 w-14 cursor-pointer transition-all hover:bg-blue-700 relative overflow-hidden ${isSelected ? 'bg-blue-600' : ''}`}
                                            >
                                                <div className="flex flex-col items-center justify-center py-2 h-full">
                                                    {isSelected ? (
                                                        <div className="bg-white text-blue-800 rounded p-0.5 animate-in zoom-in-50 duration-200">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-[11px] h-[20px] flex items-center justify-center">{day}</span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="py-4 px-3 w-20 bg-blue-900 font-bold text-green-300 border-l border-blue-700">Present</th>
                                    <th className="py-4 px-3 w-20 bg-blue-900 font-bold text-red-300">Absent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendanceData.map((student) => {
                                    const totals = getAttendanceTotals(student);
                                    return (
                                        <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-3 border-r border-gray-300 text-gray-400 font-bold bg-white group-hover:bg-blue-50 sticky left-0 z-40 border-b-2 border-gray-300">{student.srNo}</td>
                                            <td className="py-3 border-r border-gray-300 text-gray-500 font-bold bg-white group-hover:bg-blue-50 sticky left-[60px] z-40 border-b-2 border-gray-300">{student.rollNo}</td>
                                            <td className="py-3 px-6 border-r border-gray-300 text-left bg-white group-hover:bg-blue-50 sticky left-[140px] z-40 shadow-[2px_0_5px_rgba(0,0,0,0.02)] border-b-2 border-gray-300">
                                                <span className="truncate block max-w-[180px] font-bold text-gray-700">{student.name}</span>
                                            </td>
                                            {days.map(day => {
                                                const isColSelected = selectedDays.includes(day);
                                                return (
                                                    <td key={day} className={`p-1 border-r border-gray-300 border-b-2 border-gray-300 transition-colors ${isColSelected ? 'bg-blue-50/40' : ''}`}>
                                                        <button
                                                            onClick={() => toggleStatus(student.id, day)}
                                                            className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg font-black text-[10px] transition-all transform active:scale-75 ${pendingChanges[day]?.[student.id] ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : ''
                                                                }`}
                                                            style={getStatusStyle(student.attendance[day])}
                                                        >
                                                            {student.attendance[day]?.status_code || ''}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                            <td className="py-3 border-r border-gray-300 bg-green-50/10 font-bold text-green-600 border-l border-gray-300 border-b-2 border-gray-300">
                                                {totals.present}
                                            </td>
                                            <td className="py-3 bg-red-50/10 font-bold text-red-600 border-b-2 border-gray-300">
                                                {totals.absent}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer for Daily Present Totals */}
                            <tfoot>
                                <tr className="bg-gray-100 border-t-2 border-gray-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                                    <td colSpan="3" className="py-4 px-6 text-right font-black text-[11px] text-gray-700 tracking-wider sticky left-0 z-40 bg-gray-100 border-r border-gray-300">
                                        Total Present Count
                                    </td>
                                    {days.map(day => (
                                        <td key={day} className="py-4 border-r border-gray-300 font-black text-[11px] text-blue-700 bg-white">
                                            {getDailyPresentCount(day)}
                                        </td>
                                    ))}
                                    <td colSpan="2" className="bg-gray-50 border-l border-gray-300"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Success SweetAlert */}
            {showSuccessAlert && (
                <SweetAlert
                    success
                    title="Success"
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={handleSuccessAlertConfirm}
                    onCancel={() => setShowSuccessAlert(false)}
                >
                    Attendance saved successfully!
                </SweetAlert>
            )}

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}