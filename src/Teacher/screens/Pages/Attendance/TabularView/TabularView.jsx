import React, { useState, useRef, useEffect } from 'react';
import { User, X, Check, Activity, Stethoscope, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Trophy, AlertCircle, Coffee, Save, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AttendanceFilters from '../Components/AttendanceFilters';
import AttendanceActionBar from './AttendanceActionBar';
import { api } from '../../../../../_services/api';
import { TeacherAttendanceManagement } from '../Services/attendance.service';
import SweetAlert from 'react-bootstrap-sweetalert';

export default function TabularView() {
    const location = useLocation();
    // Cache initial location state to prevent re-renders when history state is cleared
    const navigationRef = useRef(location.state);
    const passedSlot = navigationRef.current?.slot;
    const fromTimetable = navigationRef.current?.fromTimetable;

    // State for filters
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: '',
        timeSlot: ''
    });

    const [showFilters, setShowFilters] = useState(true);

    // SweetAlert state
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // State for allocations
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [collegeId, setCollegeId] = useState(null);

    // State for time slots
    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

    // State for student fetching
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentsFetched, setStudentsFetched] = useState(false);

    // State for attendance statuses
    const [attendanceStatuses, setAttendanceStatuses] = useState([]);
    const [loadingStatuses, setLoadingStatuses] = useState(false);

    const [students, setStudents] = useState([]);

    // Date state with localStorage check
    const [selectedDate, setSelectedDate] = useState(() => {
        // Check if there's a saved state
        const savedState = localStorage.getItem('attendanceTabularViewState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                if (parsedState.selectedDate) {
                    return parsedState.selectedDate;
                }
            } catch (error) {
                console.error('Error reading saved date:', error);
            }
        }

        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    // Calendar dropdown state
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);

    const [activePopup, setActivePopup] = useState(null);
    const [selectAll, setSelectAll] = useState(false);

    // Flag to track if filters were set from timetable
    const [filtersSetFromTimetable, setFiltersSetFromTimetable] = useState(false);

    // Process timetable navigation when component mounts
    useEffect(() => {
        const handleTimetableNavigation = () => {
            if (fromTimetable && passedSlot && !filtersSetFromTimetable) {
                const slot = passedSlot;
                console.log("DEBUG: handleTimetableNavigation - received slot:", slot);

                const newFilters = {
                    program: slot.program_id?.toString() || '',
                    batch: slot.batch_id?.toString() || '',
                    academicYear: slot.academic_year_id?.toString() || '',
                    semester: slot.semester_id?.toString() || '',
                    division: slot.division_id?.toString() || '',
                    paper: slot.subject_id?.toString() || '',
                    timeSlot: slot.time_slot_id?.toString() || ''
                };

                console.log("DEBUG: handleTimetableNavigation - applying filters", newFilters);
                setFilters(newFilters);
                setFiltersSetFromTimetable(true);
 
                // Set date from slot
                if (slot.date) {
                    try {
                        let dateStr = slot.date;
                        // Ensure proper format (YYYY-MM-DD)
                        if (typeof dateStr === 'string' && dateStr.includes('-')) {
                            // Already in correct format
                            setSelectedDate(dateStr);
                        } else {
                            // Parse and format
                            const date = new Date(dateStr);
                            if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const formattedDate = `${year}-${month}-${day}`;
                                setSelectedDate(formattedDate);
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing slot date:", error);
                    }
                }
 
                // Create a manual time slot object
                if (slot.start_time && slot.end_time) {
                    const manualTimeSlot = {
                        timetable_id: slot.time_slot_id || `temp_${Date.now()}`,
                        time_slot_id: slot.time_slot_id,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        slot_name: slot.slot_name || `${slot.start_time} - ${slot.end_time}`,
                        fromTimetable: true
                    };
 
                    setTimeSlots([manualTimeSlot]);
                }
 
                // Clear the location state to prevent re-applying on refresh
                if (window.history.replaceState) {
                    window.history.replaceState({}, document.title);
                }
            }
        };
 
        handleTimetableNavigation();
    }, [fromTimetable, passedSlot]);

    // Auto-select first available filter values
    useEffect(() => {
        if (allocations.length > 0 && !filters.paper && !fromTimetable) {
            const firstAlloc = allocations[0];
            const newFilters = {
                program: firstAlloc.program?.program_id?.toString() || '',
                batch: firstAlloc.batch?.batch_id?.toString() || '',
                academicYear: firstAlloc.academic_year_id?.toString() || '',
                semester: firstAlloc.semester_id?.toString() || '',
                division: firstAlloc.division_id?.toString() || '',
                paper: firstAlloc.subjects?.[0]?.subject_id?.toString() || '',
                timeSlot: ''
            };
            console.log("DEBUG: Auto-selecting first allocation for TabularView", newFilters);
            setFilters(newFilters);
        }
    }, [allocations, fromTimetable]);

    // Restore saved state on component mount (only if not from timetable)
    useEffect(() => {
        if (!fromTimetable) {
            const savedState = localStorage.getItem('attendanceTabularViewState');
            if (savedState) {
                try {
                    const parsedState = JSON.parse(savedState);

                    // Restore filters
                    if (parsedState.filters) {
                        setFilters(parsedState.filters);
                    }

                    // Clean up - remove from localStorage after restoring
                    localStorage.removeItem('attendanceTabularViewState');

                } catch (error) {
                    console.error('Error restoring saved state:', error);
                    localStorage.removeItem('attendanceTabularViewState');
                }
            }
        }
    }, [fromTimetable]);

    // Fetch teacher ID and allocations
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

    // Fetch teacher allocations
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

    // Auto-select first values when allocations load (only if not from timetable)
    useEffect(() => {
        if (allocations.length > 0 && !filters.paper && !filtersSetFromTimetable) {
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
    }, [allocations, filters.paper, filtersSetFromTimetable]);

    // Fetch time slots when paper is selected
    useEffect(() => {
        const fetchTimeSlots = async () => {
            // If coming from timetable and we already have a manual time slot, skip fetch
            if (fromTimetable && filtersSetFromTimetable && timeSlots.length > 0 && timeSlots[0]?.fromTimetable) {
                console.log("DEBUG: Using manual time slot from timetable");
                return;
            }

            if (filters.paper && filters.academicYear && filters.semester && filters.division && currentTeacherId && collegeId) {
                setLoadingTimeSlots(true);
                try {
                    const params = {
                        teacherId: currentTeacherId,
                        subjectId: filters.paper,
                        date: selectedDate,
                        academicYearId: filters.academicYear,
                        semesterId: filters.semester,
                        divisionId: filters.division,
                        collegeId: collegeId
                    };
                    const response = await TeacherAttendanceManagement.getTimeSlots(params);
                    console.log("DEBUG: getTimeSlots response:", response);

                    if (response && response.data && response.data.length > 0) {
                        // Filter out holidays - only show non-holiday time slots
                        const validTimeSlots = response.data.filter(slot => !slot.is_holiday);

                        if (validTimeSlots.length > 0) {
                            console.log("DEBUG: Setting validTimeSlots:", validTimeSlots);
                            setTimeSlots(validTimeSlots);
                            // Auto-select first time slot only if none currently selected
                            if (!filters.timeSlot) {
                                const firstSlotId = validTimeSlots[0].time_slot_id?.toString();
                                console.log("DEBUG: Auto-selecting first time slot:", firstSlotId);
                                setFilters(prev => ({ ...prev, timeSlot: firstSlotId }));
                            }
                        } else {
                            // All slots are holidays, clear everything
                            setTimeSlots([]);
                            setFilters(prev => ({ ...prev, timeSlot: '' }));
                        }
                    } else {
                        // No time slots available
                        setTimeSlots([]);
                        setFilters(prev => ({ ...prev, timeSlot: '' }));
                    }
                } catch (error) {
                    console.error("Error fetching time slots:", error);
                    setTimeSlots([]);
                    setFilters(prev => ({ ...prev, timeSlot: '' }));
                } finally {
                    setLoadingTimeSlots(false);
                }
            } else {
                setTimeSlots([]);
                setFilters(prev => ({ ...prev, timeSlot: '' }));
            }
        };

        fetchTimeSlots();
    }, [filters.paper, filters.academicYear, filters.semester, filters.division, currentTeacherId, selectedDate, collegeId, fromTimetable, filtersSetFromTimetable]);

    // Fetch students based on filters
    useEffect(() => {
        const fetchStudents = async () => {
            // Determine params based on source
            let params = null;
            let isFromTimetable = false;

            if (fromTimetable && passedSlot && !studentsFetched) {
                params = {
                    academicYearId: passedSlot.academic_year_id,
                    semesterId: passedSlot.semester_id,
                    divisionId: passedSlot.division_id,
                    subjectId: passedSlot.subject_id
                };
                isFromTimetable = true;
            } else if (filters.academicYear && filters.semester && filters.division && filters.paper) {
                params = {
                    academicYearId: filters.academicYear,
                    semesterId: filters.semester,
                    divisionId: filters.division,
                    subjectId: filters.paper
                };
            }

            if (!params) {
                // Clear students if filters are incomplete and not from timetable
                if (students.length > 0) {
                    setStudents([]);
                    setStudentsFetched(false);
                }
                return;
            }

            setLoadingStudents(true);
            try {
                const response = await TeacherAttendanceManagement.getAttendanceStudents(params);

                if (response && response.success && response.data) {
                    // Handle both response formats: { students: [] } or just []
                    const studentList = Array.isArray(response.data) ? response.data :
                        (response.data.students || []);

                    if (studentList.length > 0) {
                        const formattedStudents = studentList.map(s => {
                            const fullName = [s.firstname, s.middlename, s.lastname].filter(Boolean).join(' ');
                            return {
                                ...s,
                                id: s.student_id,
                                name: fullName,
                                roll_number: s.roll_number,
                                email: s.email,
                                avatar: s.avatar,
                                status: 'P', // Default to present
                                selected: false,
                                program_id: s.program_id || parseInt(filters.program || (isFromTimetable ? passedSlot.program_id : 0)),
                                batch_id: s.batch_id || parseInt(filters.batch || (isFromTimetable ? passedSlot.batch_id : 0)),
                                academic_year_id: s.academic_year_id || parseInt(params.academicYearId),
                                semester_id: s.semester_id || parseInt(params.semesterId),
                                division_id: s.division_id || parseInt(params.divisionId),
                                subject_id: s.subject_id || parseInt(params.subjectId)
                            };
                        });

                        // Robust alphanumeric sorting by roll_number
                        formattedStudents.sort((a, b) => {
                            const rollA = String(a.roll_number || '');
                            const rollB = String(b.roll_number || '');
                            return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
                        });

                        console.log(`DEBUG: fetchStudents - setting students array (count: ${formattedStudents.length}) with default 'P'`);
                        setStudents(formattedStudents);
                        setStudentsFetched(true);
                    } else {
                        console.log("DEBUG: No students found in division");
                        setStudents([]);
                        setStudentsFetched(true);
                    }
                }
            } catch (error) {
                console.error("DEBUG: Error fetching students:", error);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [filters.academicYear, filters.semester, filters.division, filters.paper]);

    // Fetch existing attendance when time slot is selected
    useEffect(() => {
        const fetchExistingAttendance = async () => {
            console.log("DEBUG: fetchExistingAttendance triggered", {
                timeSlot: filters.timeSlot,
                studentsCount: students.length,
                filters: filters
            });
            if (filters.timeSlot && students.length > 0 && filters.academicYear && filters.semester && filters.division && filters.paper) {
                try {
                    let selectedTimeSlot;

                    // If coming from timetable with manual time slot and it hasn't been changed
                    if (fromTimetable && filtersSetFromTimetable && timeSlots.length > 0 && timeSlots[0]?.fromTimetable) {
                        selectedTimeSlot = timeSlots[0];
                    } else {
                        // Find in fetched time slots or manual slots based on current filter
                        // Prefer time_slot_id for matching as it's more specific
                        selectedTimeSlot = timeSlots.find(slot =>
                            slot.time_slot_id?.toString() === filters.timeSlot
                        );

                        // Fallback to timetable_id only if no match found with time_slot_id
                        if (!selectedTimeSlot) {
                            selectedTimeSlot = timeSlots.find(slot =>
                                slot.timetable_id?.toString() === filters.timeSlot
                            );
                        }
                    }

                    if (!selectedTimeSlot) return;

                    const payload = {
                        academic_year_id: parseInt(filters.academicYear),
                        semester_id: parseInt(filters.semester),
                        division_id: parseInt(filters.division),
                        subject_id: parseInt(filters.paper),
                        time_slot_id: selectedTimeSlot.time_slot_id,
                        timetable_allocation_id: selectedTimeSlot.timetable_allocation_id || "",
                        timetable_id: selectedTimeSlot.timetable_id,
                        date: selectedDate
                    };

                    console.log("DEBUG: Fetching existing attendance with payload:", payload);
                    setLoadingStudents(true);

                    const response = await TeacherAttendanceManagement.getAttendanceList(payload);
                    console.log("DEBUG: Attendance List Response:", response);

                    if (response && response.success && response.data && response.data.length > 0) {
                        // Attendance exists, update student statuses
                        console.log(`DEBUG: fetchExistingAttendance - found ${response.data.length} records. Updating student state.`);
                        setStudents(prevStudents => {
                            const updatedStudents = prevStudents.map(student => {
                                const attendanceRecord = response.data.find(a => a.student_id === student.id);
                                if (attendanceRecord && attendanceRecord.status) {
                                    const statusToSet = attendanceRecord.status.status_code || 'P';
                                    console.log(`   - Student ${student.id} (${student.roll_number}): Mapping API status ${JSON.stringify(attendanceRecord.status)} -> ${statusToSet}`);
                                    return {
                                        ...student,
                                        status: statusToSet
                                    };
                                }
                                return student;
                            });
                            console.log("DEBUG: fetchExistingAttendance - students state update complete");
                            return updatedStudents;
                        });
                    } else {
                        // No attendance data for this slot, reset all to 'P'
                        console.log("DEBUG: fetchExistingAttendance - no records found in API response. Resetting all to 'P'.");
                        setStudents(prevStudents =>
                            prevStudents.map(student => ({
                                ...student,
                                status: 'P'
                            }))
                        );
                    }
                } catch (error) {
                    console.error("Error fetching existing attendance:", error);
                    // Keep default statuses on error
                } finally {
                    setLoadingStudents(false);
                }
            }
        };

        fetchExistingAttendance();
    }, [filters.timeSlot, students.length, studentsFetched, attendanceStatuses.length, timeSlots, filters.academicYear, filters.semester, filters.division, filters.paper, selectedDate, refreshTrigger]);

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

    console.log("DEBUG: Filtered Students for Rendering:", filteredStudents.length, filteredStudents);

    // Filter handlers
    const handleFilterChange = (newFilters) => {
        console.log("DEBUG: handleFilterChange called with:", newFilters);
        setFilters(newFilters);
        // If user manually changes filters, reset the timetable flag
        if (filtersSetFromTimetable) {
            console.log("DEBUG: Resetting filtersSetFromTimetable to false");
            setFiltersSetFromTimetable(false);
        }
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
            paper: '',
            timeSlot: ''
        });
        setFiltersSetFromTimetable(false);
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

    // Robust status finding
    const getStatusByCodes = (codes) => {
        return attendanceStatuses.find(s =>
            codes.includes(String(s.status_code || '').toUpperCase()) ||
            codes.includes(String(s.status_name || '').toUpperCase())
        );
    };

    const presentStatusCode = getStatusByCodes(['P', 'PR', 'PRESENT'])?.status_code || 'P';
    const absentStatusCode = getStatusByCodes(['A', 'AB', 'ABSENT'])?.status_code || 'A';

    // Mark all students as present
    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: presentStatusCode })));
    };

    // Mark all students as absent
    const markAllAbsent = () => {
        setStudents(students.map(s => ({ ...s, status: absentStatusCode })));
    };

    const handleStatusClick = (student, e) => {
        e.stopPropagation();
        // Toggle between dynamic present and absent codes
        const currentStatus = String(student.status || '').toUpperCase();
        const isPresent = currentStatus === 'P' || currentStatus === 'PR' || currentStatus === 'PRESENT';

        if (isPresent) {
            updateStudentStatus(student.id, absentStatusCode);
        } else {
            updateStudentStatus(student.id, presentStatusCode);
        }
    };

    // Toggle individual student status (Legacy wrapper)
    const toggleStudentStatus = (id) => {
        const student = students.find(s => s.id === id);
        if (student) {
            const currentStatus = String(student.status || '').toUpperCase();
            const isPresent = currentStatus === 'P' || currentStatus === 'PR' || currentStatus === 'PRESENT';
            updateStudentStatus(id, isPresent ? absentStatusCode : presentStatusCode);
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

    // Success Alert
    const handleSuccessAlertConfirm = () => {
        setShowSuccessAlert(false);
        setRefreshTrigger(prev => prev + 1);
    };
    const handleErrorAlertConfirm = () => {
        setShowErrorAlert(false);
    };

    // API Integration for submitting attendance
    const handleSubmitAttendance = async () => {
        if (!filters.academicYear || !filters.semester || !filters.division || !filters.paper || !filters.timeSlot) {
            setAlertMessage("Please select all filters including Time Slot before submitting.");
            setShowErrorAlert(true);
            return;
        }

        // Find selected time slot details
        let selectedTimeSlot;

        // If coming from timetable with manual time slot
        if (fromTimetable && timeSlots.length > 0 && timeSlots[0]?.fromTimetable) {
            selectedTimeSlot = timeSlots[0];
        } else {
            // Find in fetched time slots or manual slots based on current filter
            // Prefer time_slot_id for matching as it's more specific
            selectedTimeSlot = timeSlots.find(slot =>
                slot.time_slot_id?.toString() === filters.timeSlot
            );

            // Fallback to timetable_id only if no match found with time_slot_id
            if (!selectedTimeSlot) {
                selectedTimeSlot = timeSlots.find(slot =>
                    slot.timetable_id?.toString() === filters.timeSlot
                );
            }
        }

        if (!selectedTimeSlot) {
            setAlertMessage("Selected time slot not found. Please refresh and try again.");
            setShowErrorAlert(true);
            return;
        }

        // Map status codes to status IDs from API
        const getStatusId = (statusCode) => {
            // First try direct match
            let status = attendanceStatuses.find(s => s.status_code === statusCode);

            // If not found and it's 'P', try common alternatives
            if (!status && statusCode === 'P') {
                status = attendanceStatuses.find(s =>
                    s.status_code === 'PR' ||
                    s.status_code?.toUpperCase() === 'PRESENT' ||
                    s.status_name?.toUpperCase() === 'PRESENT'
                );
            }

            // If not found and it's 'A', try common alternatives
            if (!status && statusCode === 'A') {
                status = attendanceStatuses.find(s =>
                    s.status_code === 'AB' ||
                    s.status_code?.toUpperCase() === 'ABSENT' ||
                    s.status_name?.toUpperCase() === 'ABSENT'
                );
            }

            // Last resort: case-insensitive name matching
            if (!status) {
                const sCode = String(statusCode).toUpperCase().trim();
                const searchLabel = (sCode === 'P' || sCode === 'PR' || sCode.includes('PRESENT')) ? 'PRESENT'
                    : (sCode === 'A' || sCode === 'AB' || sCode.includes('ABSENT')) ? 'ABSENT'
                        : sCode;

                status = attendanceStatuses.find(s =>
                    s.status_name?.toUpperCase().includes(searchLabel) ||
                    s.status_code?.toUpperCase().includes(searchLabel)
                );
            }

            console.log(`DEBUG: Mapping status code ${statusCode} to ID:`, status?.status_id);
            return status?.status_id || null;
        };

        const attendanceData = {
            academic_year_id: parseInt(filters.academicYear),
            semester_id: parseInt(filters.semester),
            division_id: parseInt(filters.division),
            subject_id: parseInt(filters.paper),
            college_id: collegeId,
            timetable_id: selectedTimeSlot.timetable_id,
            timetable_allocation_id: selectedTimeSlot.timetable_allocation_id || null,
            time_slot_id: selectedTimeSlot.time_slot_id,
            date: selectedDate,
            students: students.map(s => ({
                student_id: s.id,
                status_id: getStatusId(s.status),
                remarks: s.status === 'P' ? 'Present' : s.status === 'A' ? 'Absent' : attendanceStatuses.find(st => st.status_code === s.status)?.status_name || ''
            }))
        };

        try {
            const response = await TeacherAttendanceManagement.saveDailyAttendance(attendanceData);
            if (response.success) {
                // Show success SweetAlert
                setShowSuccessAlert(true);
            } else {
                setAlertMessage('Failed to save attendance: ' + (response.message || 'Unknown error'));
                setShowErrorAlert(true);
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            setAlertMessage('An error occurred while saving attendance.');
            setShowErrorAlert(true);
        }
    };

    const selectedCount = students.filter(s => s.selected).length;

    // Map API statuses to UI format with icons
    const getIconForStatus = (statusCode) => {
        const s = String(statusCode || '').toUpperCase();
        if (s === 'P' || s === 'PR' || s === 'PRESENT') return <Check size={16} />;
        if (s === 'A' || s === 'AB' || s === 'ABSENT') return <X size={16} />;

        const iconMap = {
            'OA': <Activity size={16} />,
            'SA': <Trophy size={16} />,
            'ML': <Stethoscope size={16} />,
            'SL': <AlertCircle size={16} />,
            'CM': <Coffee size={16} />,
        };
        return iconMap[s] || <MoreHorizontal size={16} />;
    };

    // Get Present and Absent statuses from API
    const presentStatus = getStatusByCodes(['P', 'PR', 'PRESENT']);
    const absentStatus = getStatusByCodes(['A', 'AB', 'ABSENT']);

    // All other statuses (excluding P and A) for bulk actions dropdown
    const otherStatuses = attendanceStatuses
        .filter(status => {
            const sc = String(status.status_code || '').toUpperCase();
            return sc !== 'P' && sc !== 'PR' && sc !== 'PRESENT' &&
                sc !== 'A' && sc !== 'AB' && sc !== 'ABSENT';
        })
        .map(status => ({
            id: status.status_code,
            label: status.status_name,
            icon: getIconForStatus(status.status_code),
            color: status.color_code || '#6B7280'
        }));

    // Deprecated helpers removed in favor of dynamic logic

    const activeStudent = students.find(s => s.id === activePopup);

    console.log("DEBUG: TabularView Rendering - Current Filters:", filters);
    console.log("DEBUG: TabularView Rendering - First Student Status:", students[0]?.name, "->", students[0]?.status);
    console.log("DEBUG: TabularView Rendering - Available TimeSlots:", timeSlots);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 relative min-h-[400px]">
            {/* Filter Section - Using reusable component */}
            <div className="border-b border-gray-200">
                <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Student Attendance</h2>
                        {/* {fromTimetable && passedSlot && (
                            <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                Auto-filled from Timetable
                            </div>
                        )} */}
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
                        timeSlots={timeSlots}
                        loadingTimeSlots={loadingTimeSlots}
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
                            onClick={() => handleBulkStatusUpdate(presentStatusCode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                            <Check size={16} /> Mark Present
                        </button>
                        <button
                            onClick={() => handleBulkStatusUpdate(absentStatusCode)}
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
                {!filters.paper || !filters.timeSlot ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {!filters.paper ? 'Select Filters to Mark Attendance' : 'No Time Slot Available'}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {!filters.paper
                                ? 'Please select Program, Academic Year, Semester, Division, and Paper to load the student list.'
                                : 'No valid time slots found for the selected date. This might be a holiday or no classes are scheduled.'}
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
                    <div className="attendance-content-wrapper">
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-6">

                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-semibold text-gray-700">Total Present: </span>
                                    <span className="text-lg font-bold text-green-600">
                                        {filteredStudents.filter(s => {
                                            const status = String(s.status || '').toUpperCase().trim();
                                            return status === 'P' || status === 'PR' || status === 'PRESENT' || status.includes('PRESENT');
                                        }).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-semibold text-gray-700">Total Absent: </span>
                                    <span className="text-lg font-bold text-red-600">
                                        {filteredStudents.filter(s => {
                                            const status = String(s.status || '').toUpperCase().trim();
                                            return status === 'A' || status === 'AB' || status === 'ABSENT' || status.includes('ABSENT');
                                        }).length}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 font-medium">
                                Showing {filteredStudents.length} Students
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
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
                                        {/* <th className="table-th text-center">
                                        Program
                                    </th> */}
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
                                                    <div className="bg-blue-100 rounded-lg p-2 w-10 h-10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                                                        <User size={18} />
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
                                                <td className="py-3 px-3 sm:px-6 text-gray-800 text-xs sm:text-sm font-medium whitespace-nowrap">
                                                    {student.roll_number || 'N/A'}
                                                </td>
                                                <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                                    {batchName}
                                                </td>
                                                <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                                    {divisionName}
                                                </td>
                                                <td className="py-3 px-3 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">
                                                    {semesterName}
                                                </td>
                                                <td className="py-3 px-3 sm:px-6">
                                                    <div className="flex justify-center">
                                                        {(() => {
                                                            const statusObj = attendanceStatuses.find(st => st.status_code === student.status);
                                                            const color = statusObj?.color_code || (student.status === presentStatusCode ? '#16a34a' : student.status === absentStatusCode ? '#dc2626' : '#6B7280');
                                                            const Icon = getIconForStatus(student.status);

                                                            return (
                                                                <button
                                                                    onClick={(e) => handleStatusClick(student, e)}
                                                                    className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md min-w-[120px] justify-center"
                                                                    style={{
                                                                        backgroundColor: `${color}15`,
                                                                        color: color,
                                                                        border: `1px solid ${color}30`,
                                                                        animation: "statusChange 0.4s ease-out",
                                                                    }}
                                                                >
                                                                    {Icon}
                                                                    <span className="font-semibold">
                                                                        {(statusObj?.status_name || student.status).toUpperCase()}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
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

            {/* SweetAlert Components */}

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

            {/* Error SweetAlert */}
            {showErrorAlert && (
                <SweetAlert
                    error
                    title="Error"
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-error"
                    onConfirm={handleErrorAlertConfirm}
                    onCancel={() => setShowErrorAlert(false)}
                >
                    {alertMessage}
                </SweetAlert>
            )}

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
        </div>
    );
}