import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    User,
    BookOpen,
    Building2,
    Clock,
    Calendar as CalendarIcon,
    FlaskConical,
    Coffee,
    MoreVertical,
    Layers,
    Zap,
    Users,
    Menu,
    X,
    ChevronDown,
    CheckCircle,
    XCircle,
    Thermometer,
    Trophy,
    AlertCircle
} from "lucide-react";

/**
 * Advanced ViewTimetable Component
 * Modernized UI with dynamic calendar, smart schedule cards, and academic theme.
 * ALL DATA IS HARDCODED - NO API CALLS
 */
const MyView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false); // Changed to false since no API calls
    const [timetableData, setTimetableData] = useState(null);
    const [error, setError] = useState(null);
    const [academicInfo, setAcademicInfo] = useState(null);

    // Mobile State
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [mobileViewMode, setMobileViewMode] = useState("calendar"); // "calendar" or "schedule"
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop sidebar state
    const [viewMode, setViewMode] = useState("Day"); // "Day", "Week", "Month"
    const [showViewDropdown, setShowViewDropdown] = useState(false);

    // Attendance State for each slot
    const [attendanceData, setAttendanceData] = useState({});

    // Attendance options - REMOVED NOT_MARKED
    const attendanceOptions = [
        { id: "PRESENT", label: "Present", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
        { id: "ABSENT", label: "Absent", icon: XCircle, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
        { id: "MEDICAL_LEAVE", label: "Medical Leave", icon: Thermometer, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "SPORTS_ACTIVITY", label: "Sports Activity", icon: Trophy, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" }
    ];

    // Initialize attendance data with only 4 options
    useEffect(() => {
        const initAttendance = {};
        const statuses = ["PRESENT", "ABSENT", "MEDICAL_LEAVE", "SPORTS_ACTIVITY"];
        
        // Initialize attendance for all slots
        enhancedTimetableData.daily_timetable.forEach(day => {
            if (day.slots) {
                day.slots.forEach(slot => {
                    // Randomly assign one of the 4 statuses
                    initAttendance[slot.time_slot_id] = statuses[Math.floor(Math.random() * statuses.length)];
                });
            }
        });
        
        setAttendanceData(initAttendance);
    }, []);

    // Handle attendance change
    const handleAttendanceChange = (slotId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [slotId]: status
        }));
    };

    // Get attendance display info
    const getAttendanceInfo = (status) => {
        const option = attendanceOptions.find(opt => opt.id === status);
        return option || attendanceOptions[0]; // Default to Present if not found
    };

    // Hardcoded Academic Information
    const hardcodedAcademicInfo = {
        name: "B.Tech Computer Science - Semester 5",
        description: "Academic Year 2023-24 | Division A",
        template_type: "Regular",
        academic_year_id: "2023-24",
        semester_id: "SEM5",
        division_id: "DIV-A",
        college_id: "COLLEGE-001",
        template_info: {
            template_id: "TEMP-2023-CS-001",
            template_name: "CS Semester 5 Regular Template"
        }
    };

    // Hardcoded Timetable Data
    const hardcodedTimetableData = {
        period_info: {
            academic_year_id: "2023-24",
            semester_id: "SEM5",
            division_id: "DIV-A",
            college_id: "COLLEGE-001",
            start_date: "2023-11-01",
            end_date: "2023-11-30",
            working_days: 22,
            template_used: {
                template_id: "TEMP-2023-CS-001",
                template_name: "CS Semester 5 Regular Template"
            }
        },
        summary: {
            total_slots: 48,
            active_slots: 45,
            exception_slots: 3
        },
        daily_timetable: [
            {
                date: new Date().toISOString().split('T')[0],
                day_of_week: new Date().getDay(),
                is_working_day: true,
                slots: [
                    {
                        time_slot_id: "SLOT-001",
                        start_time: "09:00:00",
                        end_time: "10:30:00",
                        subject_name: "Data Structures & Algorithms",
                        teacher_name: "Dr. Rajesh Kumar",
                        classroom_name: "Room 301 - CS Block",
                        entry_type: "Lecture",
                        slot_name: "Morning Slot 1",
                        module_name: "Advanced Algorithms",
                        unit_name: "Unit 3: Graphs",
                        notes: "Bring Laptop for practical session",
                        subject_id: "SUB-CS301",
                        teacher_id: "TCH-001",
                        classroom_id: "ROOM-301",
                        is_exception: false,
                        exception_type: null,
                        source: "Regular Schedule"
                    },
                    {
                        time_slot_id: "SLOT-002",
                        start_time: "11:00:00",
                        end_time: "12:30:00",
                        subject_name: "Database Management Systems",
                        teacher_name: "Prof. Anjali Sharma",
                        classroom_name: "Room 305 - CS Block",
                        entry_type: "Lecture",
                        slot_name: "Morning Slot 2",
                        module_name: "SQL Optimization",
                        unit_name: "Unit 4: Transactions",
                        notes: "Assignment due next week",
                        subject_id: "SUB-CS302",
                        teacher_id: "TCH-002",
                        classroom_id: "ROOM-305",
                        is_exception: false,
                        exception_type: null,
                        source: "Regular Schedule"
                    },
                    {
                        time_slot_id: "SLOT-003",
                        start_time: "14:00:00",
                        end_time: "16:30:00",
                        subject_name: "Computer Networks Lab",
                        teacher_name: "Dr. Vikram Singh",
                        classroom_name: "Lab 401 - IT Block",
                        entry_type: "Practical",
                        slot_name: "Afternoon Lab",
                        module_name: "Network Protocols",
                        unit_name: "Unit 5: TCP/IP",
                        notes: "Group project demonstration",
                        subject_id: "SUB-CS303",
                        teacher_id: "TCH-003",
                        classroom_id: "LAB-401",
                        is_exception: false,
                        exception_type: null,
                        source: "Lab Schedule"
                    }
                ]
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
                day_of_week: (new Date().getDay() + 1) % 7,
                is_working_day: true,
                slots: [
                    {
                        time_slot_id: "SLOT-004",
                        start_time: "10:00:00",
                        end_time: "11:30:00",
                        subject_name: "Operating Systems",
                        teacher_name: "Dr. Meena Patel",
                        classroom_name: "Room 302 - CS Block",
                        entry_type: "Lecture",
                        slot_name: "Morning Slot 1",
                        module_name: "Process Management",
                        unit_name: "Unit 2: Scheduling",
                        notes: "Mid-term syllabus discussion",
                        subject_id: "SUB-CS304",
                        teacher_id: "TCH-004",
                        classroom_id: "ROOM-302",
                        is_exception: false,
                        exception_type: null,
                        source: "Regular Schedule"
                    },
                    {
                        time_slot_id: "SLOT-005",
                        start_time: "13:30:00",
                        end_time: "15:00:00",
                        subject_name: "Software Engineering",
                        teacher_name: "Prof. Rahul Verma",
                        classroom_name: "Room 303 - CS Block",
                        entry_type: "Tutorial",
                        slot_name: "Afternoon Tutorial",
                        module_name: "Agile Methodology",
                        unit_name: "Unit 3: Scrum",
                        notes: "Case study presentation",
                        subject_id: "SUB-CS305",
                        teacher_id: "TCH-005",
                        classroom_id: "ROOM-303",
                        is_exception: true,
                        exception_type: "Rescheduled",
                        source: "Modified Schedule"
                    }
                ]
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
                day_of_week: (new Date().getDay() + 2) % 7,
                is_working_day: true,
                slots: [
                    {
                        time_slot_id: "SLOT-006",
                        start_time: "09:30:00",
                        end_time: "11:00:00",
                        subject_name: "Artificial Intelligence",
                        teacher_name: "Dr. Priya Nair",
                        classroom_name: "Room 304 - CS Block",
                        entry_type: "Lecture",
                        slot_name: "Morning Slot 1",
                        module_name: "Machine Learning",
                        unit_name: "Unit 4: Neural Networks",
                        notes: "Guest lecture by industry expert",
                        subject_id: "SUB-CS306",
                        teacher_id: "TCH-006",
                        classroom_id: "ROOM-304",
                        is_exception: false,
                        exception_type: null,
                        source: "Regular Schedule"
                    }
                ]
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
                day_of_week: (new Date().getDay() + 3) % 7,
                is_working_day: false,
                slots: []
            }
        ]
    };

    // Generate additional dates for the current month
    const generateMonthData = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthData = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            
            // Skip weekends for sample data generation
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                monthData.push({
                    date: dateStr,
                    day_of_week: dayOfWeek,
                    is_working_day: false,
                    slots: []
                });
                continue;
            }

            // Generate random number of slots for each day (0-3)
            const slotCount = Math.floor(Math.random() * 4);
            const slots = [];

            for (let j = 0; j < slotCount; j++) {
                const subjects = [
                    "Data Structures", "Database Systems", "Operating Systems", 
                    "Computer Networks", "Software Engineering", "AI & ML",
                    "Web Development", "Mobile Computing", "Cyber Security"
                ];
                const teachers = [
                    "Dr. Rajesh Kumar", "Prof. Anjali Sharma", "Dr. Vikram Singh",
                    "Dr. Meena Patel", "Prof. Rahul Verma", "Dr. Priya Nair",
                    "Prof. Sanjay Gupta", "Dr. Anita Desai"
                ];
                const rooms = [
                    "Room 301", "Room 302", "Room 303", "Room 304", "Room 305",
                    "Lab 401", "Lab 402", "Seminar Hall", "Auditorium"
                ];
                const entryTypes = ["Lecture", "Practical", "Tutorial"];
                const times = [
                    { start: "09:00:00", end: "10:30:00" },
                    { start: "11:00:00", end: "12:30:00" },
                    { start: "14:00:00", end: "15:30:00" },
                    { start: "16:00:00", end: "17:30:00" }
                ];

                const timeSlot = times[j % times.length];
                slots.push({
                    time_slot_id: `SLOT-${dateStr.replace(/-/g, '')}-${j + 1}`,
                    start_time: timeSlot.start,
                    end_time: timeSlot.end,
                    subject_name: subjects[Math.floor(Math.random() * subjects.length)],
                    teacher_name: teachers[Math.floor(Math.random() * teachers.length)],
                    classroom_name: rooms[Math.floor(Math.random() * rooms.length)],
                    entry_type: entryTypes[Math.floor(Math.random() * entryTypes.length)],
                    slot_name: `Slot ${j + 1}`,
                    module_name: `Module ${Math.floor(Math.random() * 5) + 1}`,
                    unit_name: `Unit ${Math.floor(Math.random() * 8) + 1}`,
                    notes: Math.random() > 0.7 ? "Important: Bring textbook" : "",
                    subject_id: `SUB-${Math.floor(Math.random() * 900) + 100}`,
                    teacher_id: `TCH-${Math.floor(Math.random() * 900) + 100}`,
                    classroom_id: `ROOM-${Math.floor(Math.random() * 900) + 100}`,
                    is_exception: Math.random() > 0.85,
                    exception_type: Math.random() > 0.85 ? "Cancelled" : null,
                    source: Math.random() > 0.8 ? "Modified" : "Regular"
                });
            }

            monthData.push({
                date: dateStr,
                day_of_week: dayOfWeek,
                is_working_day: true,
                slots: slots
            });
        }

        return monthData;
    };

    // Add generated month data to hardcoded data
    const enhancedTimetableData = useMemo(() => {
        return {
            ...hardcodedTimetableData,
            daily_timetable: generateMonthData()
        };
    }, []);

    // Check mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize data on component mount
    useEffect(() => {
        setLoading(false);
        setAcademicInfo(hardcodedAcademicInfo);
        setTimetableData(enhancedTimetableData);
        setError(null);
    }, []);

    const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Helper functions for date ranges
    const getWeekRange = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const getMonthRange = (date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { start, end };
    };

    // Check if date is in current week range
    const isDateInWeekRange = (date) => {
        if (viewMode !== 'Week') return false;
        const { start, end } = getWeekRange(selectedDate);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= start && checkDate <= end;
    };

    // Check if date is in current month
    const isDateInMonthRange = (date) => {
        if (viewMode !== 'Month') return false;
        return date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
    };

    const getToolbarDateRange = () => {
        if (viewMode === 'Day') {
            return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
        } else if (viewMode === 'Week') {
            const { start, end } = getWeekRange(selectedDate);
            if (start.getMonth() === end.getMonth()) {
                return `${monthNames[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
            }
            if (start.getFullYear() === end.getFullYear()) {
                return `${monthNames[start.getMonth()]} ${start.getDate()} – ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
            }
            return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
        } else {
            return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
        }
    };

    // Create timetable metadata
    const timetableMeta = useMemo(() => {
        if (!timetableData || !timetableData.period_info) {
            return hardcodedAcademicInfo;
        }

        return {
            name: academicInfo?.name || timetableData.period_info.template_used?.template_name || "Period Timetable",
            description: academicInfo?.description || null,
            template_type: academicInfo?.template_type || null,
            academic_year_id: timetableData.period_info.academic_year_id,
            semester_id: timetableData.period_info.semester_id,
            division_id: timetableData.period_info.division_id,
            college_id: timetableData.period_info.college_id,
            template_info: timetableData.period_info.template_used
        };
    }, [timetableData, academicInfo]);

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let firstDayOfWeek = firstDayOfMonth.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const days = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ day: null, fullDate: null });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({
                day: i,
                fullDate: new Date(year, month, i)
            });
        }

        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1, d2) => {
        return d1 && d2 &&
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Convert API time format (HH:MM:SS) to display format (HH:MM AM/PM)
    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return null;

        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Get schedule data for selected date
    const scheduleData = useMemo(() => {
        if (!timetableData || !timetableData.daily_timetable) {
            // Return hardcoded data for today if no timetable data
            const today = new Date().toISOString().split('T')[0];
            if (today === selectedDate.toISOString().split('T')[0]) {
                return hardcodedTimetableData.daily_timetable[0].slots.map(slot => ({
                    id: slot.time_slot_id,
                    time: `${formatTimeForDisplay(slot.start_time)} - ${formatTimeForDisplay(slot.end_time)}`,
                    subject: slot.subject_name,
                    teacher: slot.teacher_name,
                    room: slot.classroom_name,
                    mode: slot.entry_type,
                    color: "#6366f1",
                    slot_name: slot.slot_name,
                    module_name: slot.module_name,
                    unit_name: slot.unit_name,
                    notes: slot.notes,
                    subject_id: slot.subject_id,
                    teacher_id: slot.teacher_id,
                    classroom_id: slot.classroom_id,
                    entry_type: slot.entry_type,
                    start_time_raw: slot.start_time,
                    end_time_raw: slot.end_time,
                    date: today,
                    is_active: !slot.is_exception,
                    is_exception: slot.is_exception,
                    exception_type: slot.exception_type,
                    day_of_week: new Date().getDay(),
                    is_working_day: true,
                    source: slot.source
                }));
            }
            return [];
        }

        const dateStr = selectedDate.toISOString().split('T')[0];

        // Find the day's schedule
        const daySchedule = timetableData.daily_timetable.find(day => day.date === dateStr);

        if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
            return [];
        }

        // Convert slots to UI format
        return daySchedule.slots.map((slot) => {
            const startTime = formatTimeForDisplay(slot.start_time);
            const endTime = formatTimeForDisplay(slot.end_time);

            return {
                id: slot.time_slot_id,
                time: startTime && endTime ? `${startTime} - ${endTime}` : null,
                subject: slot.subject_name,
                teacher: slot.teacher_name,
                room: slot.classroom_name,
                mode: slot.entry_type,
                color: "#6366f1",
                slot_name: slot.slot_name,
                module_name: slot.module_name,
                unit_name: slot.unit_name,
                notes: slot.notes,
                subject_id: slot.subject_id,
                teacher_id: slot.teacher_id,
                classroom_id: slot.classroom_id,
                entry_type: slot.entry_type,
                start_time_raw: slot.start_time,
                end_time_raw: slot.end_time,
                date: daySchedule.date,
                is_active: !slot.is_exception,
                is_exception: slot.is_exception,
                exception_type: slot.exception_type,
                day_of_week: daySchedule.day_of_week,
                is_working_day: daySchedule.is_working_day,
                source: slot.source
            };
        }).sort((a, b) => {
            // Sort by start time
            const timeA = a.start_time_raw || "";
            const timeB = b.start_time_raw || "";
            return timeA.localeCompare(timeB);
        });
    }, [selectedDate, timetableData]);

    const isSessionActive = (timeStr, slot) => {
        try {
            if (!timeStr || !slot) return false;

            const [startPart, endPart] = timeStr.split(" - ");
            const now = new Date();

            const parseTime = (time) => {
                if (!time) return null;
                const [t, modifier] = time.split(" ");
                let [hours, minutes] = t.split(":");
                if (hours === "12") hours = "00";
                if (modifier === "PM") hours = parseInt(hours, 10) + 12;
                const d = new Date(now);
                d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
                return d;
            };

            const startTime = parseTime(startPart);
            const endTime = parseTime(endPart);

            if (!startTime || !endTime) return false;

            return now >= startTime && now <= endTime && isSameDay(now, selectedDate);
        } catch (e) {
            return false;
        }
    };

    // Get summary statistics
    const summaryStats = useMemo(() => {
        if (!timetableData || !timetableData.summary) {
            return {
                total_slots: 48,
                active_slots: 45,
                exception_slots: 3
            };
        }

        return {
            total_slots: timetableData.summary.total_slots || 48,
            active_slots: (timetableData.summary.total_slots || 48) - (timetableData.summary.exception_slots || 3),
            exception_slots: timetableData.summary.exception_slots || 3
        };
    }, [timetableData]);

    // Get attendance statistics - UPDATED TO ONLY 4 OPTIONS
    const attendanceStats = useMemo(() => {
        const stats = {
            PRESENT: 0,
            ABSENT: 0,
            MEDICAL_LEAVE: 0,
            SPORTS_ACTIVITY: 0,
            total: 0
        };

        Object.values(attendanceData).forEach(status => {
            if (stats[status] !== undefined) {
                stats[status]++;
                stats.total++;
            }
        });

        return stats;
    }, [attendanceData]);

    // Loading state - Will not show since loading is false
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-bold text-sm md:text-base">Loading timetable...</p>
                </div>
            </div>
        );
    }

    // Error state - Will not show since there's no error
    if (error || !timetableData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                        <span className="text-xl md:text-2xl">⚠️</span>
                    </div>
                    <p className="mt-4 text-red-600 font-bold text-sm md:text-base">{error || "No timetable data found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors text-sm md:text-base"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Nav Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 py-3 shrink-0">
                <div className="flex items-center justify-between gap-3 md:gap-4 font-sans">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-slate-800 line-clamp-2 leading-tight">
                                {timetableMeta?.name || "B.Tech Computer Science - Semester 5"}
                            </h1>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="text-xs font-medium text-slate-400">
                                    College ID: {timetableMeta?.college_id || "COLLEGE-001"}
                                </span>
                                {timetableMeta?.template_info && (
                                    <>
                                        <span className="text-slate-300 text-xs">/</span>
                                        <span className="text-xs font-medium text-slate-500">
                                            Template ID: {timetableMeta.template_info.template_id || "TEMP-2023-CS-001"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Legend - Right Side */}
                    {!isMobile && (
                        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm"></div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Theory</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Practical</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Tutorial</span>
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-primary-50 text-slate-600"
                        >
                            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile View Mode Switcher */}
            {isMobile && (
                <div className="flex justify-center border-b border-slate-200 bg-white px-4">
                    <div className="flex w-full max-w-md">
                        <button
                            onClick={() => setMobileViewMode("calendar")}
                            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${mobileViewMode === "calendar"
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-400"
                                }`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setMobileViewMode("schedule")}
                            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${mobileViewMode === "schedule"
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-400"
                                }`}
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 flex overflow-hidden relative font-sans">
                {/* Left Column: Calendar & Filters - Animated Sidebar */}
                <aside
                    className={`
                        ${isMobile ? (mobileViewMode === 'calendar' ? 'w-full block p-4' : 'hidden') :
                            `fixed lg:relative z-30 h-full transition-all duration-500 ease-in-out border-r border-slate-200 bg-white
                        ${isSidebarOpen ? 'w-[300px] xl:w-[360px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full'}`}
                        overflow-y-auto overflow-x-hidden shrink-0
                    `}
                >
                    <div className="w-[300px] xl:w-[360px] p-4 md:p-5 flex flex-col gap-4 md:gap-5">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
                            {!isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors lg:hidden"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Calendar Card */}
                        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-sm font-bold md:font-black text-slate-800 flex items-center gap-2">
                                    <CalendarIcon size={18} className="text-primary-600" />
                                    <span>Date Browser</span>
                                </h2>
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 md:mb-6 text-center">
                                <span className="text-lg md:text-xl font-bold md:font-black text-slate-800">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                            </div>

                            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
                                {calendarDays.map(day => (
                                    <div key={day} className="text-center text-xs md:text-[10px] font-bold text-slate-400">{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarData.map((item, idx) => (
                                    <div key={idx} className="aspect-square flex items-center justify-center p-0.5">
                                        {item.day ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedDate(item.fullDate);
                                                    if (isMobile) {
                                                        setMobileViewMode("schedule");
                                                    }
                                                }}
                                                className={`w-full h-full flex flex-col items-center justify-center rounded-lg md:rounded-xl text-sm transition-all relative group
                                                    ${isSameDay(item.fullDate, selectedDate)
                                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105 font-bold"
                                                        : isDateInWeekRange(item.fullDate)
                                                            ? "bg-primary-100 text-primary-700 font-semibold ring-2 ring-primary-200"
                                                            : isDateInMonthRange(item.fullDate)
                                                                ? "bg-primary-50 text-primary-600 font-medium"
                                                                : "bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600"
                                                    }`}
                                            >
                                                <span className="relative z-10">{item.day}</span>
                                            </button>
                                        ) : (
                                            <div className="w-full h-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Date Range Info */}
                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-100">
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-500">Viewing Period</span>
                                        <span className="text-xs font-bold text-slate-700 text-right">
                                            {timetableData?.period_info?.start_date ?
                                                new Date(timetableData.period_info.start_date).toLocaleDateString('en-GB') :
                                                "01/11/2023"} -
                                            {timetableData?.period_info?.end_date ?
                                                new Date(timetableData.period_info.end_date).toLocaleDateString('en-GB') :
                                                "30/11/2023"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-500">Working Days</span>
                                        <span className="text-xs font-bold text-emerald-600">
                                            {timetableData?.period_info?.working_days || 22} days
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Summary in Sidebar */}
                        <div className="mt-4 md:mt-0 md:ml-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold text-slate-500">Attendance Overview</span>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    {attendanceOptions.map((option) => {
                                        const count = attendanceStats[option.id];
                                        const percentage = attendanceStats.total > 0 ? ((count / attendanceStats.total) * 100).toFixed(0) : 0;
                                        const OptionIcon = option.icon;
                                        
                                        return (
                                            <div key={option.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                                                <OptionIcon size={12} className={option.color} />
                                                <div className="flex-1">
                                                    <div className="text-xs font-medium text-slate-600">{count}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{option.label.split(' ')[0]}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-2 p-2 rounded-lg bg-primary-50 border border-primary-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-primary-700">Overall</p>
                                            <p className="text-sm font-bold text-primary-800">
                                                {attendanceStats.PRESENT} of {attendanceStats.total} slots
                                            </p>
                                        </div>
                                        <div className="text-lg font-black text-primary-600">
                                            {attendanceStats.total > 0 ? ((attendanceStats.PRESENT / attendanceStats.total) * 100).toFixed(0) : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Card for Sidebar */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 mt-auto">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Timetable Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">{summaryStats.total_slots}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Slots</span>
                                </div>
                                <div className="flex flex-col text-emerald-400">
                                    <span className="text-2xl font-black">{summaryStats.active_slots}</span>
                                    <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Column: Schedule Display */}
                <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 ${isMobile && mobileViewMode === "calendar" ? "hidden" : ""}`}>

                    {/* 🛠️ TEAMS-STYLE TOOLBAR */}
                    {!isMobile && (
                        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-3 md:px-4 lg:px-6 py-2 md:py-3 flex items-center justify-between gap-2 overflow-x-auto">
                            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
                                {/* Sidebar Toggle Icon */}
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`p-2 rounded-lg transition-all duration-300 ${isSidebarOpen ? 'text-primary-600 bg-primary-50' : 'text-slate-500 hover:bg-slate-100'}`}
                                    title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                                >
                                    <Layers size={18} />
                                </button>

                                <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>

                                {/* Today Button */}
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-primary-200 hover:text-primary-600 active:scale-95 transition-all shadow-sm"
                                >
                                    Today
                                </button>

                                {/* Date Navigation */}
                                <div className="flex items-center gap-1 ml-2 text-slate-500">
                                    <button
                                        onClick={() => {
                                            if (viewMode === 'Day') {
                                                setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
                                            } else if (viewMode === 'Week') {
                                                setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
                                            } else {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
                                                setSelectedDate(newDate);
                                                setCurrentDate(newDate);
                                            }
                                        }}
                                        className="p-1.5 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (viewMode === 'Day') {
                                                setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
                                            } else if (viewMode === 'Week') {
                                                setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
                                            } else {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
                                                setSelectedDate(newDate);
                                                setCurrentDate(newDate);
                                            }
                                        }}
                                        className="p-1.5 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                {/* Date Range Text */}
                                <div className="hidden lg:flex items-center gap-1.5 ml-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors">
                                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                        {getToolbarDateRange()}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                                </div>
                            </div>

                            {/* View Switcher Tabs */}
                            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 relative shrink-0">
                                <div className="flex items-center bg-slate-200/50 p-1 rounded-xl">
                                    {['Day', 'Week', 'Month'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${viewMode === mode
                                                ? "bg-white text-primary-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>

                                <button className="p-2 text-slate-500 hover:text-slate-700">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-3 md:p-4 lg:p-5 flex-1 flex flex-col overflow-hidden">
                        {viewMode === 'Day' ? (
                            <>
                                {/* Active Day Info */}
                                <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 mb-4 shrink-0">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border-2 shadow-inner shrink-0
                                            ${scheduleData.length === 0 ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-primary-50 border-primary-100 text-primary-600'}`}>
                                            <span className={`text-[10px] font-bold ${scheduleData.length === 0 ? 'text-slate-400' : 'text-primary-400'}`}>
                                                {monthNames[selectedDate.getMonth()].slice(0, 3)}
                                            </span>
                                            <span className="text-xl md:text-2xl font-bold leading-none mt-0.5">{selectedDate.getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
                                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDate.getDay()]}
                                            </h1>
                                            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">
                                                {scheduleData.length === 0 ? "No classes scheduled" : `${scheduleData.length} session${scheduleData.length !== 1 ? 's' : ''} scheduled`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Desktop Stats */}
                                    <div className="hidden md:flex items-center gap-6 lg:gap-8 border-l border-slate-100 pl-6 lg:pl-8">
                                        <div className="flex flex-col text-center">
                                            <span className="text-xs font-bold text-slate-500">Summary</span>
                                            <div className="flex gap-4 mt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-slate-800">{summaryStats.total_slots}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">Total</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-emerald-600">{summaryStats.active_slots}</span>
                                                    <span className="text-[10px] text-emerald-400 uppercase">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Back to Calendar Button */}
                                    {isMobile && mobileViewMode === "schedule" && (
                                        <button
                                            onClick={() => setMobileViewMode("calendar")}
                                            className="w-full py-2 bg-primary-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft size={16} />
                                            Back to Calendar
                                        </button>
                                    )}
                                </div>

                                {/* Schedule List */}
                                <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 md:space-y-4 pb-20 scroll-smooth">
                                    {scheduleData.length > 0 ? (
                                        scheduleData.map((slot) => {
                                            const attendanceInfo = getAttendanceInfo(attendanceData[slot.id]);
                                            const AttendanceIcon = attendanceInfo.icon;
                                            
                                            return (
                                                <div key={slot.id} className="group relative">
                                                    <div className={`bg-white rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 border transition-all duration-300 flex flex-col md:flex-row items-stretch gap-4 md:gap-6 relative z-10
                                                    ${isSessionActive(slot.time, slot) ? 'border-primary-500 shadow-lg shadow-primary-100 bg-primary-50/10' :
                                                            slot.is_exception ? 'border-red-200 bg-red-50/10' :
                                                                'border-transparent shadow-sm hover:shadow-lg hover:border-slate-200'}`}>

                                                        {isSessionActive(slot.time, slot) && (
                                                            <div className="absolute -top-2 left-4 md:left-6 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full shadow-lg z-20">
                                                                Live Now
                                                            </div>
                                                        )}

                                                        {slot.is_exception && (
                                                            <div className="absolute -top-2 left-4 md:left-6 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg z-20">
                                                                {slot.exception_type || "Exception"}
                                                            </div>
                                                        )}

                                                        {/* Time Badge */}
                                                        <div className="w-full md:w-32 flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-6 shrink-0">
                                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-sm
                                                            ${slot.mode === 'PRACTICAL' || slot.entry_type === 'Practical' ? 'bg-emerald-100 text-emerald-600' :
                                                                    slot.mode === 'TUTORIAL' || slot.entry_type === 'Tutorial' ? 'bg-purple-100 text-purple-600' :
                                                                        slot.mode === 'LECTURE' || slot.entry_type === 'Lecture' ? 'bg-blue-100 text-blue-600' :
                                                                            'bg-primary-100 text-primary-600'}`}>
                                                                {slot.mode === 'PRACTICAL' || slot.entry_type === 'Practical' ? <FlaskConical size={18} /> :
                                                                    slot.mode === 'TUTORIAL' || slot.entry_type === 'Tutorial' ? <Users size={18} /> :
                                                                        <BookOpen size={18} />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-slate-500">Timing</span>
                                                                <span className="text-sm font-bold text-slate-700 mt-0.5 whitespace-nowrap">
                                                                    {slot.time || "Time not set"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                                        ${slot.mode === 'PRACTICAL' || slot.entry_type === 'Practical' ? 'bg-emerald-50 text-emerald-600' :
                                                                                slot.mode === 'TUTORIAL' || slot.entry_type === 'Tutorial' ? 'bg-purple-50 text-purple-600' :
                                                                                    slot.mode === 'LECTURE' || slot.entry_type === 'Lecture' ? 'bg-blue-50 text-blue-600' :
                                                                                        'bg-primary-50 text-primary-600'}`}>
                                                                            {slot.entry_type || slot.mode || "CLASS"}
                                                                        </span>
                                                                        {slot.slot_name && (
                                                                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full">
                                                                                {slot.slot_name}
                                                                            </span>
                                                                        )}
                                                                        {slot.source && (
                                                                            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                                                                {slot.source}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="text-base md:text-lg font-bold text-slate-800">
                                                                        {slot.subject || "Data Structures & Algorithms"}
                                                                    </h3>

                                                                    {(slot.module_name || slot.unit_name) && (
                                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                                            {slot.module_name && (
                                                                                <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                                                                    Module: {slot.module_name}
                                                                                </span>
                                                                            )}
                                                                            {slot.unit_name && (
                                                                                <span className="text-xs font-medium px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                                                                                    Unit: {slot.unit_name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {slot.notes && (
                                                                        <div className="mt-1">
                                                                            <span className="text-xs text-slate-500">{slot.notes}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                                            <User size={14} />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-medium text-slate-500">Professor</span>
                                                                            <span className="text-sm font-medium text-slate-600 mt-0.5">
                                                                                {slot.teacher || "Dr. Rajesh Kumar"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-medium text-slate-500">Location</span>
                                                                            <span className="text-sm font-medium text-slate-600 mt-0.5">
                                                                                {slot.room || "Room 301 - CS Block"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Attendance Status Display */}
                                                        <div className="absolute top-4 right-4 z-30">
                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${attendanceInfo.bgColor} border ${attendanceInfo.borderColor} shadow-sm`}>
                                                                <AttendanceIcon size={14} className={attendanceInfo.color} />
                                                                <span className={`text-xs font-bold ${attendanceInfo.color}`}>
                                                                    {attendanceInfo.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-200 p-4 md:p-6">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 opacity-50">📚</div>
                                            <h2 className="text-lg md:text-xl font-bold text-slate-400">No Classes Scheduled</h2>
                                            <p className="text-slate-400 font-medium text-sm text-center mt-1">
                                                No active sessions scheduled for {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDate.getDay()]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : viewMode === 'Week' ? (
                            <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Week Header Labels */}
                                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/50 shrink-0 min-w-full">
                                    <div className="p-2 border-r border-slate-100"></div>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                                        const { start } = getWeekRange(selectedDate);
                                        const dayDate = new Date(start);
                                        dayDate.setDate(start.getDate() + idx);
                                        const isToday = isSameDay(dayDate, new Date());
                                        const isSelected = isSameDay(dayDate, selectedDate);

                                        return (
                                            <div key={idx} className={`p-2 text-center flex flex-col items-center gap-1 border-r border-slate-100 last:border-r-0 min-w-0
                                                ${isSelected ? 'bg-primary-50/30' : ''}`}>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-primary-600' : 'text-slate-400'}`}>
                                                    {dayName}
                                                </span>
                                                <button
                                                    onClick={() => setSelectedDate(dayDate)}
                                                    className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                                        ${isToday ? 'bg-primary-600 text-white shadow-md shadow-primary-200' :
                                                            isSelected ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-slate-100'}`}
                                                >
                                                    {dayDate.getDate()}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Week Grid with Time Slots */}
                                <div className="flex-1 overflow-auto min-h-0">
                                    <div className="grid grid-cols-[60px_repeat(7,1fr)] h-full w-full">
                                        {/* Time Slots Column */}
                                        <div className="sticky left-0 z-10 border-r border-slate-100 bg-slate-50 shadow-md md:shadow-none">
                                            {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                                <div key={hour} className="h-24 border-b border-slate-100 px-2 py-1 text-right">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day Columns */}
                                        {Array.from({ length: 7 }).map((_, idx) => {
                                            const { start } = getWeekRange(selectedDate);
                                            const dayDate = new Date(start);
                                            dayDate.setDate(start.getDate() + idx);
                                            const dayStr = dayDate.toISOString().split('T')[0];
                                            const dayData = timetableData?.daily_timetable?.find(d => d.date === dayStr);
                                            const slots = dayData?.slots || [];

                                            return (
                                                <div key={idx} className={`border-r border-slate-100 last:border-r-0 ${isSameDay(dayDate, selectedDate) ? 'bg-primary-50/5' : ''}`}>
                                                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                                        <div key={hour} className="h-24 border-b border-slate-100 p-1 relative">
                                                            {slots.filter(slot => {
                                                                const slotHour = slot.start_time ? parseInt(slot.start_time.split(':')[0]) : null;
                                                                return slotHour === hour || (slotHour === (hour - 12) && hour > 12);
                                                            }).map(slot => {
                                                                const attendanceInfo = getAttendanceInfo(attendanceData[slot.time_slot_id]);
                                                                return (
                                                                    <div key={slot.time_slot_id} className="absolute inset-1 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${attendanceInfo.id === 'PRESENT' ? 'bg-green-500' :
                                                                            attendanceInfo.id === 'ABSENT' ? 'bg-red-500' :
                                                                            attendanceInfo.id === 'MEDICAL_LEAVE' ? 'bg-blue-500' :
                                                                            attendanceInfo.id === 'SPORTS_ACTIVITY' ? 'bg-purple-500' :
                                                                            slot.entry_type === 'Practical' ? 'bg-emerald-500' :
                                                                            slot.entry_type === 'Tutorial' ? 'bg-purple-500' : 'bg-primary-500'
                                                                            }`}></div>
                                                                        <div className="p-1 pl-2">
                                                                            <div className="text-[8px] font-bold text-slate-400 mb-0.5 leading-none">
                                                                                {formatTimeForDisplay(slot.start_time)} - {formatTimeForDisplay(slot.end_time)}
                                                                            </div>
                                                                            <div className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight mb-0.5">{slot.subject_name}</div>
                                                                            {slot.module_name && (
                                                                                <div className="text-[8px] text-blue-600 font-medium truncate mb-0.5">📘 {slot.module_name}</div>
                                                                            )}
                                                                            <div className="text-[8px] text-slate-500 font-medium truncate mb-0.5 flex items-center gap-0.5">
                                                                                <attendanceInfo.icon size={8} className={attendanceInfo.color} />
                                                                                {attendanceInfo.label}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Month Header Labels */}
                                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="p-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Grid Content */}
                                <div className="flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-full" style={{ gridTemplateRows: 'repeat(6, minmax(80px, 1fr))' }}>
                                        {(() => {
                                            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                                            const startDay = startOfMonth.getDay();
                                            const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

                                            // Previous month filler days
                                            const prevMonthDays = [];
                                            for (let i = startDay - 1; i >= 0; i--) {
                                                const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -i);
                                                prevMonthDays.push(d);
                                            }

                                            // Current month days
                                            const currentDays = [];
                                            for (let i = 1; i <= totalDays; i++) {
                                                currentDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
                                            }

                                            // Next month filler days
                                            const nextMonthDays = [];
                                            const remaining = 42 - (prevMonthDays.length + currentDays.length);
                                            for (let i = 1; i <= remaining; i++) {
                                                nextMonthDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, i));
                                            }

                                            return [...prevMonthDays, ...currentDays, ...nextMonthDays].map((dayDate, idx) => {
                                                const dayStr = dayDate.toISOString().split('T')[0];
                                                const dayData = timetableData?.daily_timetable?.find(d => d.date === dayStr);
                                                const slots = dayData?.slots || [];
                                                const isToday = isSameDay(dayDate, new Date());
                                                const isSelected = isSameDay(dayDate, selectedDate);
                                                const isCurrentMonth = dayDate.getMonth() === selectedDate.getMonth();

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedDate(dayDate)}
                                                        className={`px-0.5 md:px-1 py-1 mt-0 first:mt-0 relative group cursor-pointer transition-all hover:bg-slate-50/50
                                                        ${!isCurrentMonth ? 'bg-slate-50/10' : ''}
                                                        ${isSelected ? 'bg-primary-50/30' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-center p-0.5 md:p-1">
                                                            <span className={`text-[10px] md:text-[11px] font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full
                                                            ${isToday ? 'bg-primary-600 text-white shadow-sm' :
                                                                    isSelected ? 'bg-primary-100 text-primary-700' :
                                                                        isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                                                                {dayDate.getDate()}
                                                            </span>
                                                        </div>
                                                        <div className="px-0.5 md:px-1 space-y-0.5 overflow-hidden">
                                                            {slots.slice(0, 3).map(slot => {
                                                                const attendanceInfo = getAttendanceInfo(attendanceData[slot.time_slot_id]);
                                                                return (
                                                                    <div key={slot.time_slot_id} className={`px-1 py-0.5 rounded-md ${attendanceInfo.bgColor} border ${attendanceInfo.borderColor} text-primary-700 text-[8px] font-semibold leading-tight flex items-center gap-1`}>
                                                                        <div className={`w-1 h-1 rounded-full shrink-0 ${attendanceInfo.color.replace('text-', 'bg-')}`}></div>
                                                                        <span className="truncate">{slot.subject_name}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {slots.length > 3 && (
                                                                <div className="text-[7px] md:text-[8px] font-black text-slate-400 pl-1 uppercase tracking-tighter">
                                                                    +{slots.length - 3} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Floating Action Button */}
            {isMobile && mobileViewMode === "calendar" && scheduleData.length > 0 && (
                <button
                    onClick={() => setMobileViewMode("schedule")}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 animate-bounce"
                >
                    <span className="text-lg font-bold">{scheduleData.length}</span>
                </button>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default MyView;