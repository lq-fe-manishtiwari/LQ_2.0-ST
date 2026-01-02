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
    MoreVertical,
    X,
    Menu,
    Tag,
    Layers,
    AlertCircle
} from "lucide-react";

/**
 * Advanced ViewTimetable Component
 * Modern UI with dynamic calendar and schedule views
 * No API calls, no hardcoded data
 */
const MyViewDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [academicInfo, setAcademicInfo] = useState(null);
    const [timetableData, setTimetableData] = useState(null);

    // Mobile State
    const [isMobile, setIsMobile] = useState(false);
    const [mobileViewMode, setMobileViewMode] = useState("calendar");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState("Day");

    // Week view slot popup state
    const [showWeekSlotPopup, setShowWeekSlotPopup] = useState(false);
    const [selectedWeekSlot, setSelectedWeekSlot] = useState(null);

    // Month view popup state
    const [showMonthPopup, setShowMonthPopup] = useState(false);
    const [popupDate, setPopupDate] = useState(null);
    const [popupData, setPopupData] = useState([]);

    // Check mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Helper functions for date ranges
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

    const isSameDay = (d1, d2) => {
        return d1 && d2 &&
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Format date to YYYY-MM-DD format
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

    // Format time for display
    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return "";
        return timeString.split(':').slice(0, 2).join(':');
    };

    // Convert time format to 12hr format
    const formatTimeForDisplay12hr = (timeString) => {
        if (!timeString) return null;
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Navigation handlers
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

    // Calendar days for sidebar
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

    // Demo data states (empty arrays since no data)
    const dayScheduleData = useMemo(() => [], []);
    const uniqueTimeSlots = useMemo(() => [], []);
    const weekData = useMemo(() => [], []);
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

        return allDays.map(dayDate => ({
            date: dayDate,
            dateStr: formatDateToYMD(dayDate),
            dayNumber: dayDate.getDate(),
            isCurrentMonth: dayDate.getMonth() === selectedDate.getMonth(),
            schedule: [],
            totalSlots: 0,
            visibleSlots: [],
            hiddenSlotsCount: 0
        }));
    }, [selectedDate]);

    // Placeholder Slot Detail Card Component
    const SlotDetailCard = ({ slot }) => (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left Column - Time and Type */}
                <div className="w-full md:w-28 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-100 text-primary-600">
                        <BookOpen size={18} />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Time</span>
                        <span className="text-sm font-bold text-slate-700">09:00 AM - 10:00 AM</span>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                            Lecture
                        </span>
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-slate-800 mb-3">Subject Name</h3>

                    {/* Teacher and Room */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <User size={14} className="text-slate-500" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Teacher</span>
                                <p className="text-sm font-medium">Teacher Name</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 size={14} className="text-slate-500" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Room</span>
                                <p className="text-sm font-medium">Classroom</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Placeholder Compact Slot Card for Month View
    const CompactSlotCard = ({ slot }) => (
        <div className="px-2 py-1.5 rounded-md bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary-700 truncate">Subject</span>
                        <span className="text-[10px] text-primary-500 ml-1 shrink-0">09:00</span>
                    </div>
                    <div className="text-[10px] text-primary-600 mt-0.5 truncate">
                        Teacher • Room
                    </div>
                </div>
            </div>
        </div>
    );

    // Empty State Components
    const EmptyDayState = () => (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">
                <BookOpen size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No Classes Scheduled</h2>
            <p className="text-slate-400 mt-1 text-center">
                No sessions for {dayNames[selectedDate.getDay()]}<br />
                <span className="text-sm">Connect API to load timetable data</span>
            </p>
        </div>
    );

    const EmptyWeekState = () => (
        <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">
                <CalendarIcon size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No Weekly Data</h2>
            <p className="text-slate-400 mt-1 text-center">
                Connect to API to view weekly schedule
            </p>
        </div>
    );

    const EmptyMonthState = () => (
        <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">
                <Layers size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No Monthly Data</h2>
            <p className="text-slate-400 mt-1 text-center">
                Connect to API to view monthly calendar
            </p>
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
                                {academicInfo?.name || "Timetable Viewer"}
                            </h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs text-slate-500">
                                    Connect API to load timetable data
                                </span>
                            </div>
                        </div>
                    </div>

                    {isMobile && (
                        <button
                            onClick={() => setMobileViewMode(mobileViewMode === "calendar" ? "schedule" : "calendar")}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-primary-50 text-slate-600"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                </div>
            </header>

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
                                {calendarData.map((item, idx) => (
                                    <div key={idx} className="aspect-square flex items-center justify-center p-0.5">
                                        {item.day ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedDate(item.fullDate);
                                                    if (isMobile) setMobileViewMode("schedule");
                                                }}
                                                className={`w-full h-full flex items-center justify-center rounded-lg text-sm transition-all
                                                    ${isSameDay(item.fullDate, selectedDate)
                                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 font-bold"
                                                        : "bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600"
                                                    }`}
                                            >
                                                {item.day}
                                            </button>
                                        ) : (
                                            <div className="w-full h-full"></div>
                                        )}
                                    </div>
                                ))}
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
                                    onClick={() => {
                                        const today = new Date();
                                        setSelectedDate(today);
                                        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Today
                                </button>

                                <div className="flex items-center gap-1 ml-2">
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
                                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
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

                    <div className="p-4 lg:p-5 flex-1 overflow-auto">
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
                                                {dayScheduleData.length === 0 ? "No data available" : `${dayScheduleData.length} sessions`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule List */}
                                <div className="space-y-4">
                                    {dayScheduleData.length > 0 ? (
                                        dayScheduleData.map((slot) => (
                                            <SlotDetailCard key={slot.id} slot={slot} />
                                        ))
                                    ) : (
                                        <EmptyDayState />
                                    )}
                                </div>
                            </div>
                        ) : viewMode === 'Week' ? (
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Week Header */}
                                <div className="grid grid-cols-[140px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50">
                                    <div className="p-3 border-r border-slate-100 text-center">
                                        <div className="text-xs font-bold text-slate-400">Time Slot</div>
                                    </div>
                                    {Array.from({ length: 7 }).map((_, idx) => {
                                        const date = new Date(selectedDate);
                                        date.setDate(selectedDate.getDate() + idx);
                                        const isToday = isSameDay(date, new Date());
                                        const isSelected = isSameDay(date, selectedDate);
                                        return (
                                            <div key={idx} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isSelected ? 'bg-primary-50' : ''}`}>
                                                <div className="text-xs font-bold text-slate-400 mb-1">
                                                    {calendarDays[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-primary-600 text-white' : isSelected ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-slate-100'}`}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Week Grid - Empty State */}
                                <EmptyWeekState />
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

                                {/* Month Grid - Empty State */}
                                <EmptyMonthState />
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
                                    <span>09:00 AM - 10:00 AM</span>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                                    Lecture
                                </span>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <SlotDetailCard slot={{}} />
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
                                    Connect API to view schedule
                                </span>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <EmptyDayState />
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

export default MyViewDashboard;