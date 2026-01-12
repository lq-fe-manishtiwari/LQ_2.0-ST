import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    User,
    BookOpen,
    Building2,
    Calendar as CalendarIcon,
    FlaskConical,
    MoreVertical,
    Menu,
    X,
    ChevronDown,
    Layers,
    Clock,
    Tag,
    Filter,
    School,
    Users,
    Book,
    CalendarDays
} from "lucide-react";
import AttendanceFilters from '../Components/AttendanceFilters';
import { api } from '../../../../../_services/api';

const TimetableView = () => {
    const navigate = useNavigate();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState("Day");

    // Mobile state
    const [mobileViewMode, setMobileViewMode] = useState("calendar");
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Week view slot popup state
    const [showWeekSlotPopup, setShowWeekSlotPopup] = useState(false);
    const [selectedWeekSlot, setSelectedWeekSlot] = useState(null);

    // Month view popup state
    const [showMonthPopup, setShowMonthPopup] = useState(false);
    const [popupDate, setPopupDate] = useState(null);
    const [popupData, setPopupData] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: ''
    });
    
    const [showFilters, setShowFilters] = useState(false);
    
    // State for allocations
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);

    // Static data for demonstration
    const staticAcademicInfo = {
        name: "Computer Science - 2024",
        description: "Bachelor of Computer Science - Semester 4",
        template_type: "division",
        academic_year_id: 1,
        semester_id: 1,
        division_id: 1,
        college_id: 1
    };

    // Static timetable data for demonstration
    const [timetableData, setTimetableData] = useState({
        daily_timetable: generateStaticTimetableData()
    });

    // Fetch teacher ID
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

    // Check mobile screen
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Helper functions
    const getWeekRange = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
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

    // Get selected month range for display
    const getSelectedMonthRange = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        return { start, end };
    };

    const isSameDay = (d1, d2) => {
        return d1 && d2 &&
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Format time from "HH:MM:SS" to "HH:MM"
    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return "";
        return timeString.split(':').slice(0, 2).join(':');
    };

    // Convert date to YYYY-MM-DD format
    const formatDateToYMD = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date to readable string
    const formatDateToReadable = (date) => {
        if (!date) return "";
        return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Format date to DD/MM/YYYY for display
    const formatDisplayDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Get period display text based on view mode
    const getPeriodDisplayText = () => {
        if (viewMode === 'Month') {
            const { start, end } = getSelectedMonthRange();
            return `${formatDisplayDate(start)} to ${formatDisplayDate(end)}`;
        } else if (viewMode === 'Week') {
            const { start, end } = getWeekRange(selectedDate);
            return `${formatDisplayDate(start)} to ${formatDisplayDate(end)}`;
        } else {
            return formatDateToReadable(selectedDate);
        }
    };

    // Get schedule for specific date from static data
    const getScheduleForDate = (date) => {
        if (!timetableData || !timetableData.daily_timetable) {
            return { slots: [], isHoliday: false, holidayName: null };
        }

        const dateStr = formatDateToYMD(date);
        const daySchedule = timetableData.daily_timetable.find(day => day.date === dateStr);

        if (!daySchedule) {
            return { slots: [], isHoliday: false, holidayName: null };
        }

        return {
            slots: daySchedule.slots || [],
            isHoliday: daySchedule.is_holiday || false,
            holidayName: daySchedule.holiday_name || null,
            isWorkingDay: daySchedule.is_working_day
        };
    };

    // Transform slot data for display
    const transformSlotData = (slot) => ({
        id: slot.time_slot_id,
        time: `${formatTimeForDisplay(slot.start_time)} - ${formatTimeForDisplay(slot.end_time)}`,
        subject: slot.subject_name,
        teacher: slot.teacher_name,
        room: slot.classroom_name,
        mode: slot.entry_type,
        slot_name: slot.slot_name,
        module_name: slot.module_name,
        unit_name: slot.unit_name,
        notes: slot.notes,
        is_exception: slot.is_exception,
        exception_type: slot.exception_type,
        source: slot.source,
        start_time_raw: slot.start_time,
        end_time_raw: slot.end_time
    });

    // Filter handlers
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // You can add API call here to fetch timetable based on filters
        console.log('Filters changed:', newFilters);
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
        // Here you would fetch timetable data based on filters
        console.log('Applying filters:', filters);
        // loadTimetableData();
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedDate(today);
        if (viewMode === 'Month') {
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        } else if (viewMode === 'Week') {
            const { start } = getWeekRange(today);
            setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
        } else {
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        }
    };

    const getTodayButtonText = () => {
        switch (viewMode) {
            case 'Day':
                return 'Today';
            case 'Week':
                return 'Week';
            case 'Month':
                return 'Month';
            default:
                return 'Today';
        }
    };

    // Day view: Get selected date's schedule
    const dayScheduleData = useMemo(() => {
        const scheduleInfo = getScheduleForDate(selectedDate);
        return scheduleInfo.slots.map(transformSlotData).sort((a, b) => a.start_time_raw.localeCompare(b.start_time_raw));
    }, [selectedDate, timetableData]);

    // Day view: Check if selected date is a holiday
    const dayHolidayInfo = useMemo(() => {
        const scheduleInfo = getScheduleForDate(selectedDate);
        return {
            isHoliday: scheduleInfo.isHoliday,
            holidayName: scheduleInfo.holidayName
        };
    }, [selectedDate, timetableData]);

    // Week view: Get all unique time slots from static data
    const uniqueTimeSlots = useMemo(() => {
        if (!timetableData || viewMode !== 'Week') return [];

        const slotsSet = new Set();

        if (timetableData.daily_timetable) {
            timetableData.daily_timetable.forEach(daySchedule => {
                if (daySchedule.slots) {
                    daySchedule.slots.forEach(slot => {
                        const timeKey = `${slot.start_time}-${slot.end_time}`;
                        slotsSet.add(JSON.stringify({
                            start_time: slot.start_time,
                            end_time: slot.end_time,
                            display: `${formatTimeForDisplay(slot.start_time)} - ${formatTimeForDisplay(slot.end_time)}`
                        }));
                    });
                }
            });
        }

        return Array.from(slotsSet)
            .map(s => JSON.parse(s))
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }, [timetableData, viewMode]);

    // Week view: Get week data with schedule organized by time slots
    const weekData = useMemo(() => {
        if (!timetableData || viewMode !== 'Week') return [];

        const { start } = getWeekRange(selectedDate);
        const weekDays = [];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + i);
            const dateStr = formatDateToYMD(dayDate);

            const daySchedule = timetableData.daily_timetable.find(day => day.date === dateStr);
            const slots = daySchedule ? daySchedule.slots || [] : [];
            const isHoliday = daySchedule ? daySchedule.is_holiday || false : false;
            const holidayName = daySchedule ? daySchedule.holiday_name || null : null;

            const timeSlotMap = {};
            slots.forEach(slot => {
                const timeKey = `${slot.start_time}-${slot.end_time}`;
                timeSlotMap[timeKey] = transformSlotData(slot);
            });

            weekDays.push({
                date: dayDate,
                dateStr: dateStr,
                dayName: dayNames[dayDate.getDay()],
                shortDayName: calendarDays[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1],
                timeSlotMap: timeSlotMap,
                schedule: slots.map(transformSlotData),
                isHoliday: isHoliday,
                holidayName: holidayName
            });
        }

        return weekDays;
    }, [selectedDate, timetableData, viewMode]);

    // Month view: Get month data - Create a map of date to schedule for quick lookup
    const monthScheduleMap = useMemo(() => {
        if (!timetableData || !timetableData.daily_timetable) return {};

        const map = {};
        timetableData.daily_timetable.forEach(day => {
            map[day.date] = day.slots || [];
        });
        return map;
    }, [timetableData]);

    // Get all days for month grid
    const monthGridData = useMemo(() => {
        const { start: monthStart } = getMonthRange(selectedDate);
        const startOfMonth = new Date(monthStart);
        const startDay = startOfMonth.getDay();
        const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

        const prevMonthDays = [];
        for (let i = startDay - 1; i >= 0; i--) {
            const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -i);
            prevMonthDays.push(d);
        }

        const currentDays = [];
        for (let i = 1; i <= totalDays; i++) {
            currentDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
        }

        const nextMonthDays = [];
        const remaining = 42 - (prevMonthDays.length + currentDays.length);
        for (let i = 1; i <= remaining; i++) {
            nextMonthDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, i));
        }

        const allDays = [...prevMonthDays, ...currentDays, ...nextMonthDays];

        return allDays.map(dayDate => {
            const dateStr = formatDateToYMD(dayDate);
            const slots = monthScheduleMap[dateStr] || [];
            const transformedSlots = slots.map(transformSlotData);

            const daySchedule = timetableData?.daily_timetable?.find(day => day.date === dateStr);
            const isHoliday = daySchedule ? daySchedule.is_holiday || false : false;
            const holidayName = daySchedule ? daySchedule.holiday_name || null : null;

            return {
                date: dayDate,
                dateStr: dateStr,
                dayNumber: dayDate.getDate(),
                isCurrentMonth: dayDate.getMonth() === selectedDate.getMonth(),
                schedule: transformedSlots,
                totalSlots: slots.length,
                visibleSlots: transformedSlots.slice(0, 2),
                hiddenSlotsCount: Math.max(0, slots.length - 2),
                isHoliday: isHoliday,
                holidayName: holidayName
            };
        });
    }, [selectedDate, monthScheduleMap, timetableData]);

    // Calendar days for sidebar
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let firstDayOfWeek = firstDayOfMonth.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const days = [];

        // Add previous month's dates
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({
                day: prevDate.getDate(),
                fullDate: prevDate,
                isCurrentMonth: false
            });
        }

        // Add current month's dates
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({
                day: i,
                fullDate: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Add next month's dates to fill the grid
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({
                day: nextDate.getDate(),
                fullDate: nextDate,
                isCurrentMonth: false
            });
        }

        return days;
    }, [currentDate]);

    // Navigation handlers
    const handlePrevMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(newDate);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(newDate);
        setSelectedDate(newDate);
    };

    // Handle week slot click
    const handleWeekSlotClick = (slot) => {
        setSelectedWeekSlot(slot);
        setShowWeekSlotPopup(true);
    };

    // Handle month date click
    const handleMonthDateClick = (date, schedule, totalSlots) => {
        setPopupDate(date);
        setPopupData(schedule);
        setShowMonthPopup(true);
    };

    // Close popups
    const closeWeekSlotPopup = () => {
        setShowWeekSlotPopup(false);
        setSelectedWeekSlot(null);
    };

    const closeMonthPopup = () => {
        setShowMonthPopup(false);
        setPopupDate(null);
        setPopupData([]);
    };

    // Slot Detail Card Component
    const SlotDetailCard = ({ slot }) => (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left Column - Time and Type */}
                <div className="w-full md:w-28 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slot.mode === 'Practical' ? 'bg-emerald-100 text-emerald-600' : slot.mode === 'Tutorial' ? 'bg-purple-100 text-purple-600' : 'bg-primary-100 text-primary-600'}`}>
                        {slot.mode === 'Practical' ? <FlaskConical size={18} /> : <BookOpen size={18} />}
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Time</span>
                        <span className="text-sm font-bold text-slate-700">{slot.time}</span>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${slot.mode === 'Practical' ? 'bg-emerald-50 text-emerald-600' : slot.mode === 'Tutorial' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-600'}`}>
                            {slot.mode}
                        </span>
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-slate-800 mb-3">{slot.subject}</h3>

                    {/* Teacher and Room */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <User size={14} className="text-slate-500" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Teacher</span>
                                <p className="text-sm font-medium">{slot.teacher}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 size={14} className="text-slate-500" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Room</span>
                                <p className="text-sm font-medium">{slot.room}</p>
                            </div>
                        </div>

                        {/* Update Buttons */}
                        <div className="flex gap-2 md:ml-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/timetable/View-Upadate-Timetable')}
                                className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center gap-1 transition whitespace-nowrap"
                            >
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Module and Unit */}
                    {(slot.module_name || slot.unit_name) && (
                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                            {slot.module_name && (
                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                                    <Tag size={10} />
                                    Module: {slot.module_name}
                                </span>
                            )}

                            {slot.unit_name && (
                                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                                    <Tag size={10} />
                                    Unit: {slot.unit_name}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Compact Slot Card for Month View
    const CompactSlotCard = ({ slot }) => (
        <div className="px-2 py-1.5 rounded-md bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${slot.mode === 'Practical' ? 'bg-emerald-500' : slot.mode === 'Tutorial' ? 'bg-purple-500' : 'bg-primary-500'}`}></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary-700 truncate">{slot.subject}</span>
                        <span className="text-[10px] text-primary-500 ml-1 shrink-0">{slot.time.split(' - ')[0]}</span>
                    </div>
                    <div className="text-[10px] text-primary-600 mt-0.5 truncate">
                        {slot.teacher} • {slot.room}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-base md:text-lg font-bold text-slate-800">
                                {staticAcademicInfo?.name || "Period Timetable"}
                            </h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs text-slate-500">
                                    Period: {viewMode === 'Month' && `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}: `}
                                    {getPeriodDisplayText()}
                                </span>
                            </div>
                        </div>
                    </div>

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

            {/* Academic Filters Section */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
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

            {/* Mobile View Switcher */}
            {isMobile && (
                <div className="flex justify-center border-b border-slate-200 bg-white px-4">
                    <div className="flex w-full max-w-md">
                        <button
                            onClick={() => setMobileViewMode("calendar")}
                            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${mobileViewMode === "calendar" ? "border-primary-600 text-primary-600" : "border-transparent text-slate-400"}`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setMobileViewMode("schedule")}
                            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${mobileViewMode === "schedule" ? "border-primary-600 text-primary-600" : "border-transparent text-slate-400"}`}
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar - Calendar */}
                <aside className={`${isMobile ? (mobileViewMode === 'calendar' ? 'w-full block p-4' : 'hidden') : `w-[300px] xl:w-[360px] border-r border-slate-200 bg-white ${isSidebarOpen ? 'block' : 'hidden'}`}`}>
                    <div className="p-4 md:p-5 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
                            {!isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <CalendarIcon size={18} className="text-primary-600" />
                                    <span>Date Browser</span>
                                </h2>
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 text-center">
                                <span className="text-lg md:text-xl font-bold text-slate-800">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-3">
                                {calendarDays.map(day => (
                                    <div key={day} className="text-center text-xs font-bold text-slate-400">{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarData.map((item, idx) => {
                                    const isInSelectedWeek = viewMode === 'Week' && (() => {
                                        const { start, end } = getWeekRange(selectedDate);
                                        return item.fullDate >= start && item.fullDate <= end;
                                    })();

                                    return (
                                        <div key={idx} className="aspect-square flex items-center justify-center p-0.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedDate(item.fullDate);
                                                    if (isMobile) setMobileViewMode("schedule");
                                                }}
                                                className={`w-full h-full flex items-center justify-center rounded-lg text-sm transition-all
                                                    ${isSameDay(item.fullDate, selectedDate)
                                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 font-bold"
                                                        : isInSelectedWeek
                                                            ? "bg-primary-100 text-primary-700 font-semibold"
                                                            : item.isCurrentMonth
                                                                ? "bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600"
                                                                : "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                                                    }`}
                                            >
                                                {item.day}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col ${isMobile && mobileViewMode === "calendar" ? "hidden" : ""}`}>
                    {/* Toolbar */}
                    {!isMobile && (
                        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`p-2 rounded-lg ${isSidebarOpen ? 'text-primary-600 bg-primary-50' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <Layers size={18} />
                                </button>

                                <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>

                                <button
                                    onClick={handleTodayClick}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    {getTodayButtonText()}
                                </button>

                                <div className="flex items-center gap-1 ml-2">
                                    <button
                                        onClick={() => {
                                            if (viewMode === 'Day') {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1);
                                                setSelectedDate(newDate);
                                                if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
                                                    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                                                }
                                            } else if (viewMode === 'Week') {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7);
                                                setSelectedDate(newDate);
                                                if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
                                                    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                                                }
                                            } else {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
                                                setSelectedDate(newDate);
                                                setCurrentDate(newDate);
                                            }
                                        }}
                                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (viewMode === 'Day') {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
                                                setSelectedDate(newDate);
                                                if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
                                                    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                                                }
                                            } else if (viewMode === 'Week') {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7);
                                                setSelectedDate(newDate);
                                                if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
                                                    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                                                }
                                            } else {
                                                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
                                                setSelectedDate(newDate);
                                                setCurrentDate(newDate);
                                            }
                                        }}
                                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-200/50 p-1 rounded-xl">
                                    {['Day', 'Week', 'Month'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 lg:p-5 flex-1 overflow-auto relative">
                        {viewMode === 'Day' ? (
                            <div className="max-w-4xl mx-auto">
                                {/* Day Header */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0 ${dayScheduleData.length === 0 ? 'bg-slate-100 border-slate-200' : 'bg-primary-50 border-primary-100'}`}>
                                            <span className="text-xs font-bold text-slate-400">
                                                {monthNames[selectedDate.getMonth()].slice(0, 3)}
                                            </span>
                                            <span className="text-2xl font-bold leading-none mt-0.5">{selectedDate.getDate()}</span>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-800">
                                                {dayNames[selectedDate.getDay()]}
                                            </h1>
                                            <p className="text-slate-500 font-medium mt-1">
                                                {dayScheduleData.length === 0 ? "No classes scheduled" : `${dayScheduleData.length} sessions`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Holiday Banner */}
                                {dayHolidayInfo.isHoliday && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                <CalendarIcon className="text-orange-600" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-orange-900">Holiday</h3>
                                                <p className="text-orange-700 font-medium mt-1">{dayHolidayInfo.holidayName}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule List */}
                                <div className="space-y-4">
                                    {dayHolidayInfo.isHoliday ? (
                                        <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-orange-200 p-6">
                                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">🎉</div>
                                            <h2 className="text-xl font-bold text-orange-600">Holiday - No Classes</h2>
                                            <p className="text-orange-500 mt-1">
                                                Enjoy your {dayHolidayInfo.holidayName}!
                                            </p>
                                        </div>
                                    ) : dayScheduleData.length > 0 ? (
                                        dayScheduleData.map((slot) => (
                                            <SlotDetailCard key={slot.id} slot={slot} />
                                        ))
                                    ) : (
                                        <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">📚</div>
                                            <h2 className="text-xl font-bold text-slate-400">No Classes Scheduled</h2>
                                            <p className="text-slate-400 mt-1">
                                                No sessions for {dayNames[selectedDate.getDay()]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : viewMode === 'Week' ? (
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Week Header */}
                                <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] border-b border-slate-100 bg-blue-600">
                                    <div className="p-3 border-r border-blue-500 text-center">
                                        <div className="text-xs font-bold text-white">Time Slot</div>
                                    </div>
                                    {weekData.map((day, idx) => {
                                        const isToday = isSameDay(day.date, new Date());
                                        const isSelected = isSameDay(day.date, selectedDate);
                                        const formattedDate = `${String(day.date.getDate()).padStart(2, '0')}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${day.date.getFullYear()}`;

                                        return (
                                            <div
                                                key={idx}
                                                className={`p-3 text-center border-r border-blue-500 last:border-r-0 transition-all ${isSelected ? 'bg-blue-700 scale-105 shadow-lg z-10' : 'hover:bg-blue-500'
                                                    }`}
                                            >
                                                <div className="text-xs font-bold text-white mb-1">{day.shortDayName}</div>
                                                <button
                                                    onClick={() => setSelectedDate(day.date)}
                                                    className={`text-[10px] font-medium text-blue-100 mb-2 hover:text-white transition-colors ${isSelected ? 'text-white font-bold' : ''
                                                        }`}
                                                >
                                                    {formattedDate}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Week Grid */}
                                <div className="overflow-auto">
                                    <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] min-w-full">
                                        {/* Time Slot Column */}
                                        <div className="sticky left-0 z-10 border-r border-slate-100 bg-slate-50">
                                            {uniqueTimeSlots.map((timeSlot, idx) => (
                                                <div key={idx} className="h-24 border-b border-slate-100 px-3 py-2">
                                                    <div className="h-full flex flex-col items-end justify-center">
                                                        <span className="text-xs font-bold text-slate-400 text-right">
                                                            {timeSlot.display}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day Columns */}
                                        {weekData.map((day, dayIdx) => {
                                            const isSelected = isSameDay(day.date, selectedDate);

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={`border-r border-slate-100 last:border-r-0 transition-all ${isSelected ? 'bg-primary-50/20 scale-105 shadow-lg z-10' : ''
                                                        } ${day.isHoliday ? 'bg-orange-50/30' : ''}`}
                                                >
                                                    {day.isHoliday ? (
                                                        <div
                                                            className="relative flex items-center justify-center p-4 border-b border-slate-100"
                                                            style={{ height: `${uniqueTimeSlots.length * 96}px` }}
                                                        >
                                                            <div
                                                                className="text-center transform -rotate-90 whitespace-nowrap"
                                                                style={{
                                                                    transformOrigin: 'center',
                                                                    maxWidth: `${uniqueTimeSlots.length * 96}px`
                                                                }}
                                                            >
                                                                <div className="text-sm font-bold text-orange-700 tracking-wide">
                                                                    {day.holidayName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        uniqueTimeSlots.map((timeSlot, timeIdx) => {
                                                            const timeKey = `${timeSlot.start_time}-${timeSlot.end_time}`;
                                                            const slot = day.timeSlotMap[timeKey];

                                                            return (
                                                                <div key={timeIdx} className="h-24 border-b border-slate-100 p-1 relative">
                                                                    {slot ? (
                                                                        <div
                                                                            onClick={() => handleWeekSlotClick(slot)}
                                                                            className="absolute inset-1 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                                                                        >
                                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.mode === 'Practical' ? 'bg-emerald-500' : slot.mode === 'Tutorial' ? 'bg-purple-500' : 'bg-primary-500'}`}></div>
                                                                            <div className="p-2">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div>
                                                                                        <div className="text-xs font-bold text-slate-800 line-clamp-1">{slot.subject}</div>
                                                                                        <div className="text-[10px] text-slate-500 mt-0.5">{slot.time}</div>
                                                                                    </div>
                                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${slot.mode === 'Practical' ? 'bg-emerald-50 text-emerald-600' : slot.mode === 'Tutorial' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-600'}`}>
                                                                                        {slot.mode.charAt(0)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                                                                    {slot.teacher}
                                                                                </div>
                                                                                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                                                                    {slot.room}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="absolute inset-1 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Month Header */}
                                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-3 text-center text-xs font-bold text-slate-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Grid */}
                                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                                    {monthGridData.map((day, idx) => {
                                        const isToday = isSameDay(day.date, new Date());
                                        const isSelected = isSameDay(day.date, selectedDate);
                                        const isCurrentMonth = day.isCurrentMonth;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() =>
                                                    (day.totalSlots > 0 || day.isHoliday) &&
                                                    handleMonthDateClick(day.date, day.schedule, day.totalSlots)
                                                }
                                                className={`min-h-[140px] p-2 transition-all 
                                              ${!isCurrentMonth ? 'bg-slate-50/30' : ''}
                                              ${day.isHoliday ? 'bg-red-50' : ''}
                                              ${isSelected ? 'bg-primary-50' : day.isHoliday ? 'hover:bg-red-100' : 'hover:bg-slate-50'}
                                              ${(day.totalSlots > 0 || day.isHoliday) ? 'cursor-pointer' : 'cursor-default'}`}
                                            >
                                                {/* Top section */}
                                                <div className="flex justify-between items-center mb-1">
                                                    <span
                                                        className={`text-sm font-bold
                                                  ${isToday
                                                                ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                                                                : isSelected
                                                                    ? 'text-primary-700'
                                                                    : isCurrentMonth
                                                                        ? 'text-slate-700'
                                                                        : 'text-slate-400'}`}
                                                    >
                                                        {day.dayNumber}
                                                    </span>
                                                </div>

                                                {/* Holiday or Slots */}
                                                {day.isHoliday ? (
                                                    <div className="flex items-center justify-center h-[80px]">
                                                        <div className="text-center px-2">
                                                            <div className="text-[11px] font-semibold text-red-700 line-clamp-3">
                                                                {day.holidayName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Slots - Show only 1 */}
                                                        <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                                                            {day.schedule.slice(0, 1).map((slot, slotIdx) => (
                                                                <div key={slot.id || slotIdx}>
                                                                    <CompactSlotCard slot={slot} />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Bottom center - remaining classes count */}
                                                        {day.totalSlots > 1 && (
                                                            <div className="mt-2 text-center">
                                                                <button className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-2 py-0.5 rounded-full transition-colors ">
                                                                    + {day.totalSlots - 1} {day.totalSlots - 1 === 1 ? 'class' : 'classes'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Week Slot Popup */}
            {showWeekSlotPopup && selectedWeekSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Popup Header */}
                        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-primary-600" />
                                    Class Details
                                </h2>
                                <button
                                    onClick={closeWeekSlotPopup}
                                    className="p-2 rounded-full hover:bg-white/80 text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex items-center gap-1 text-slate-500 text-sm">
                                    <Clock size={14} />
                                    <span>{selectedWeekSlot.time}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedWeekSlot.mode === 'Practical' ? 'bg-emerald-50 text-emerald-600' : selectedWeekSlot.mode === 'Tutorial' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-600'}`}>
                                    {selectedWeekSlot.mode}
                                </span>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <SlotDetailCard slot={selectedWeekSlot} />
                        </div>

                        {/* Popup Footer */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedDate(popupDate || selectedDate);
                                        setViewMode('Day');
                                        closeWeekSlotPopup();
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                                >
                                    View Day Schedule
                                </button>
                                <button
                                    onClick={closeWeekSlotPopup}
                                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Month View Popup */}
            {showMonthPopup && popupDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Popup Header */}
                        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-primary-600" />
                                    Schedule for {formatDateToReadable(popupDate)}
                                </h2>
                                <button
                                    onClick={closeMonthPopup}
                                    className="p-2 rounded-full hover:bg-white/80 text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-slate-500">
                                    Total {popupData.length} {popupData.length === 1 ? 'session' : 'sessions'}
                                </span>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {popupData.length > 0 ? (
                                <div className="space-y-4">
                                    {popupData.map((slot, idx) => (
                                        <SlotDetailCard key={idx} slot={slot} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">
                                        📚
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-400">No Sessions</h3>
                                    <p className="text-slate-400 text-sm mt-1">No classes scheduled for this day</p>
                                </div>
                            )}
                        </div>

                        {/* Popup Footer */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedDate(popupDate);
                                        setViewMode('Day');
                                        closeMonthPopup();
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                                >
                                    View Day Schedule
                                </button>
                                <button
                                    onClick={closeMonthPopup}
                                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile FAB */}
            {isMobile && mobileViewMode === "calendar" && dayScheduleData.length > 0 && (
                <button
                    onClick={() => setMobileViewMode("schedule")}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center z-50"
                >
                    <span className="text-lg font-bold">{dayScheduleData.length}</span>
                </button>
            )}
        </div>
    );
};

// Function to generate static timetable data for demonstration
function generateStaticTimetableData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate data for current month
    const dailyTimetable = [];
    
    for (let i = 1; i <= 30; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayOfWeek = date.getDay();
        
        // Skip weekends for this example
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Mark 25th as a holiday
        const isHoliday = i === 25;
        
        const slots = [];
        
        if (!isHoliday && i % 2 === 0) {
            // Add some sample slots
            slots.push({
                time_slot_id: i * 100 + 1,
                start_time: "09:00:00",
                end_time: "10:30:00",
                subject_name: "Data Structures",
                teacher_name: "Dr. Smith",
                classroom_name: "Room 101",
                entry_type: "Lecture",
                slot_name: "DS-L1",
                module_name: "Algorithms",
                unit_name: "Trees",
                notes: "",
                is_exception: false,
                exception_type: null,
                source: "regular"
            });
            
            slots.push({
                time_slot_id: i * 100 + 2,
                start_time: "11:00:00",
                end_time: "12:30:00",
                subject_name: "Database Systems",
                teacher_name: "Prof. Johnson",
                classroom_name: "Lab 205",
                entry_type: "Practical",
                slot_name: "DB-P1",
                module_name: "SQL",
                unit_name: "Joins",
                notes: "",
                is_exception: false,
                exception_type: null,
                source: "regular"
            });
        }
        
        dailyTimetable.push({
            date: dateStr,
            slots: slots,
            is_holiday: isHoliday,
            holiday_name: isHoliday ? "Christmas" : null,
            is_working_day: !isHoliday
        });
    }
    
    return dailyTimetable;
}

export default TimetableView;