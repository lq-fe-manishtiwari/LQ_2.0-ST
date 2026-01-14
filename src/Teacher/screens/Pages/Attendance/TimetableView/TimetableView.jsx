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
import { timetableService } from '../../TimeTable/Services/timetable.service';

const TimetableView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [academicInfo, setAcademicInfo] = useState(null);
    const [timetableData, setTimetableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [collegeId, setCollegeId] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [collegeName, setCollegeName] = useState("");

    const [isMobile, setIsMobile] = useState(false);
    const [mobileViewMode, setMobileViewMode] = useState("calendar");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState("Day");

    const [showWeekSlotPopup, setShowWeekSlotPopup] = useState(false);
    const [selectedWeekSlot, setSelectedWeekSlot] = useState(null);

    const [showMonthPopup, setShowMonthPopup] = useState(false);
    const [popupDate, setPopupDate] = useState(null);
    const [popupData, setPopupData] = useState([]);

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const isSelectedDateToday = useMemo(() => {
        const today = new Date();
        return isSameDay(today, selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        try {
            const activeCollegeStr = localStorage.getItem('activeCollege');
            if (activeCollegeStr) {
                const activeCollege = JSON.parse(activeCollegeStr);
                setCollegeId(activeCollege.id);
                setCollegeName(activeCollege.name);
                console.log("Active College:", activeCollege);
            }

            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                setTeacherId(currentUser.jti); 
                console.log("Current User:", currentUser);
            }

            if (id) {
                setTeacherId(id);
            }
        } catch (err) {
            console.error("Error parsing localStorage data:", err);
            setError("Failed to load user information from localStorage");
        }
    }, [id]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const formatDateToYMD = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateToReadable = (date) => {
        if (!date) return "";
        return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return "";
        return timeString.split(':').slice(0, 2).join(':');
    };

    const formatTimeForDisplay12hr = (timeString) => {
        if (!timeString) return "N/A";
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
        } catch (e) {
            console.warn("Invalid time string:", timeString, e);
            return timeString;
        }
    };

    const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Navigation handlers
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

      const handleViewModeChange = (mode) => {
        setViewMode(mode);
        
        if (mode === "Week") {
            const weekRange = getWeekRange(selectedDate);
            setSelectedDate(weekRange.start);
        }
     
        else if (mode === "Month") {
            const monthRange = getMonthRange(selectedDate);
            setSelectedDate(monthRange.start);
            setCurrentDate(monthRange.start);
        }
      
        else if (mode === "Day") {
            
        }
    };

    // Handle date selection from calendar sidebar
    const handleDateSelectFromSidebar = (date) => {
        setSelectedDate(date);
        setViewMode("Day"); 
        if (isMobile) {
            setMobileViewMode("schedule");
        }
    };

    // Handle week slot click
    const handleWeekSlotClick = (slot) => {
        setSelectedWeekSlot(slot);
        setShowWeekSlotPopup(true);
    };

    // Handle month date click - Switch to Day view
    const handleMonthDateClick = (date, schedule) => {
        setSelectedDate(date);
        setViewMode("Day"); 
    };

    // Handle week day click - Switch to Day view
    const handleWeekDayClick = (date) => {
        setSelectedDate(date);
        setViewMode("Day");
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

    // Fetch timetable data when dependencies change
    useEffect(() => {
        const fetchTimetableData = async () => {
            if (!teacherId || !collegeId) {
                console.log("Waiting for teacherId and collegeId...", { teacherId, collegeId });
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                // Calculate date range based on view mode
                let startDate, endDate;
                
                if (viewMode === "Day") {
                    startDate = formatDateToYMD(selectedDate);
                    endDate = formatDateToYMD(selectedDate);
                } else if (viewMode === "Week") {
                    const weekRange = getWeekRange(selectedDate);
                    startDate = formatDateToYMD(weekRange.start);
                    endDate = formatDateToYMD(weekRange.end);
                } else {
                    const monthRange = getMonthRange(selectedDate);
                    startDate = formatDateToYMD(monthRange.start);
                    endDate = formatDateToYMD(monthRange.end);
                }
                
                console.log("Fetching timetable with params:", {
                    teacher_id: teacherId,
                    college_id: collegeId,
                    start_date: startDate,
                    end_date: endDate
                });
                
                const response = await timetableService.getTeacherTimetable({
                    teacher_id: teacherId,
                    college_id: collegeId,
                    start_date: startDate,
                    end_date: endDate
                });
                
                console.log("Timetable response received:", response);
                
                let timetableArray = [];
                
                if (response && response.daily_schedules && Array.isArray(response.daily_schedules)) {
                    // Map the API response to our component format
                    timetableArray = response.daily_schedules.flatMap(dailySchedule => {
                        const date = dailySchedule.date;
                        
                        // If no slots for this day, return empty array
                        if (!dailySchedule.slots || !Array.isArray(dailySchedule.slots)) {
                            return [];
                        }
                        
                        // Map each slot to our format
                        return dailySchedule.slots.map(slot => ({
                            // Basic information
                            id: slot.time_slot_id || `${date}_${slot.start_time}`,
                            date: date,
                            day_of_week: dailySchedule.day_of_week,
                            
                            // Time information
                            start_time: slot.start_time,
                            end_time: slot.end_time,
                            slot_name: slot.slot_name,
                            
                            // Subject information
                            subject_id: slot.subject_id,
                            subject_name: slot.subject_name,
                            subject_code: slot.subject_id ? `SUB-${slot.subject_id}` : "",
                            
                            // Teacher information
                            teacher_id: slot.teacher_id,
                            teacher_name: slot.teacher_name,
                            
                            // Academic information
                            academic_year_id: slot.academic_year_id,
                            academic_year_name: slot.academic_year_name,
                            program_id: slot.program_id,
                            program_name: slot.program_name,
                            batch_id: slot.batch_id,
                            batch_name: slot.batch_name,
                            semester_id: slot.semester_id,
                            semester_name: slot.semester_name,
                            division_id: slot.division_id,
                            division_name: slot.division_name,
                            
                            // Location
                            classroom_id: slot.classroom_id,
                            classroom_name: slot.classroom_name,
                            room_number: slot.classroom_name || "Not Assigned",
                            
                            // Type and notes
                            class_type: slot.slot_name || "Lecture",
                            type: slot.entry_type || "REGULAR",
                            notes: slot.notes,
                            
                            // Source and exception handling
                            source: slot.source,
                            is_exception: slot.is_exception || false,
                            exception_type: slot.exception_type,
                            original_teacher_id: slot.original_teacher_id,
                            original_teacher_name: slot.original_teacher_name,
                            
                            // Department (from program_name)
                            department: slot.program_name || "",
                            
                            // College (from state)
                            college: collegeName,
                            
                            // Holiday information
                            is_holiday: dailySchedule.is_holiday || slot.is_holiday,
                            holiday_name: dailySchedule.holiday_name || slot.holiday_name
                        }));
                    });
                    
                    console.log("Mapped timetable array:", timetableArray);
                }
                else if (Array.isArray(response)) {

                    timetableArray = response;
                } else if (response && Array.isArray(response.data)) {

                    timetableArray = response.data;
                } else if (response && response.timetable && Array.isArray(response.timetable)) {

                    timetableArray = response.timetable;
                } else if (response && response.schedule && Array.isArray(response.schedule)) {
                    timetableArray = response.schedule;
                } else if (response && typeof response === 'object') {
                    const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
                    if (arrayKey) {
                        timetableArray = response[arrayKey];
                    } else {
                        timetableArray = Object.values(response).filter(val => 
                            val && typeof val === 'object' && (val.date || val.start_time)
                        );
                    }
                }
                
                if (!Array.isArray(timetableArray)) {
                    console.warn("Processed timetable is not an array, defaulting to empty array:", timetableArray);
                    timetableArray = [];
                }
                
                console.log("Processed timetable array:", timetableArray);
                setTimetableData(timetableArray);
                filterTimetableData(timetableArray, selectedDate, viewMode);
                
                if (timetableArray.length > 0 && timetableArray[0]) {
                    const firstSlot = timetableArray[0];
                    setAcademicInfo({
                        name: firstSlot.teacher_name || "Timetable",
                        department: firstSlot.department || firstSlot.program_name || "",
                        semester: firstSlot.semester_name || firstSlot.semester || "",
                        college: firstSlot.college || collegeName
                    });
                } else {
                    setAcademicInfo({
                        name: "Your Timetable",
                        college: collegeName
                    });
                }
            } catch (err) {
                console.error("Full error details:", err);
                console.error("Error response:", err.response);
                console.error("Error data:", err.data);
                
                const errorMsg = err.response?.data?.message || 
                                 err.message || 
                                 "Failed to load timetable data. Please try again.";
                setError(errorMsg);
                
                setTimetableData([]);
                setFilteredData([]);
                
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Authentication required. Please log in again.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchTimetableData();
    }, [selectedDate, viewMode, teacherId, collegeId, collegeName]);

    const filterTimetableData = (data, date, mode) => {

        if (!data || !Array.isArray(data)) {
            console.error("filterTimetableData: data is not an array", data);
            setFilteredData([]);
            return;
        }

        if (data.length === 0) {
            setFilteredData([]);
            return;
        }

        try {
            if (mode === "Day") {
                const dateStr = formatDateToYMD(date);
                const dayData = data.filter(item => item && item.date === dateStr);
                setFilteredData(dayData);
            } else if (mode === "Week") {
                const weekRange = getWeekRange(date);
                const weekData = data.filter(item => {
                    if (!item || !item.date) return false;
                    try {
                        const itemDate = new Date(item.date);
                        return itemDate >= weekRange.start && itemDate <= weekRange.end;
                    } catch (e) {
                        console.warn("Invalid date in item:", item.date, e);
                        return false;
                    }
                });
                setFilteredData(weekData);
            } else {
                const monthRange = getMonthRange(date);
                const monthData = data.filter(item => {
                    if (!item || !item.date) return false;
                    try {
                        const itemDate = new Date(item.date);
                        return itemDate >= monthRange.start && itemDate <= monthRange.end;
                    } catch (e) {
                        console.warn("Invalid date in item:", item.date, e);
                        return false;
                    }
                });
                setFilteredData(monthData);
            }
        } catch (error) {
            console.error("Error filtering timetable data:", error);
            setFilteredData([]);
        }
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

    const dayScheduleData = useMemo(() => {
        if (!Array.isArray(filteredData)) return [];
        
        return filteredData.filter(item => {
            if (!item || !item.date) return false;
            try {
                const itemDate = new Date(item.date);
                return isSameDay(itemDate, selectedDate);
            } catch (e) {
                console.warn("Invalid date in filteredData:", item.date, e);
                return false;
            }
        }).sort((a, b) => {

            const timeA = a.start_time || "00:00";
            const timeB = b.start_time || "00:00";
            return timeA.localeCompare(timeB);
        });
    }, [filteredData, selectedDate]);

    const weekData = useMemo(() => {
        if (!Array.isArray(filteredData)) {
            return Array(7).fill().map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return { date, schedule: [] };
            });
        }
        
        const weekRange = getWeekRange(selectedDate);
        const days = [];
        
        // Create array for 7 days of the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekRange.start);
            date.setDate(weekRange.start.getDate() + i);
            
            const daySchedule = filteredData.filter(item => {
                if (!item || !item.date) return false;
                try {
                    const itemDate = new Date(item.date);
                    return isSameDay(itemDate, date);
                } catch (e) {
                    console.warn("Invalid date in filteredData:", item.date, e);
                    return false;
                }
            }).sort((a, b) => {
                const timeA = a.start_time || "00:00";
                const timeB = b.start_time || "00:00";
                return timeA.localeCompare(timeB);
            });
            
            days.push({
                date,
                schedule: daySchedule
            });
        }
        
        return days;
    }, [filteredData, selectedDate]);

    const monthGridData = useMemo(() => {
        if (!Array.isArray(filteredData)) {
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
        }
        
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
            const schedule = filteredData.filter(item => {
                if (!item || !item.date) return false;
                try {
                    const itemDate = new Date(item.date);
                    return isSameDay(itemDate, dayDate);
                } catch (e) {
                    console.warn("Invalid date in filteredData:", item.date, e);
                    return false;
                }
            });
            
            return {
                date: dayDate,
                dateStr: formatDateToYMD(dayDate),
                dayNumber: dayDate.getDate(),
                isCurrentMonth: dayDate.getMonth() === selectedDate.getMonth(),
                schedule: schedule,
                totalSlots: schedule.length,
                visibleSlots: schedule.slice(0, 2), 
                hiddenSlotsCount: Math.max(0, schedule.length - 2)
            };
        });
    }, [filteredData, selectedDate]);

    // Get unique time slots for week view
    const uniqueTimeSlots = useMemo(() => {
        if (!Array.isArray(filteredData)) return [];
        
        const slots = new Set();
        filteredData.forEach(item => {
            if (item && item.start_time) {
                slots.add(item.start_time);
            }
        });
        return Array.from(slots).sort();
    }, [filteredData]);

    // Slot Detail Card Component
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
                        <span className="text-sm font-bold text-slate-700">
                            {formatTimeForDisplay12hr(slot.start_time)} - {formatTimeForDisplay12hr(slot.end_time)}
                        </span>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                            {slot.class_type || slot.type || "Lecture"}
                        </span>
                        {slot.subject_code && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                {slot.subject_code}
                            </span>
                        )}
                        {slot.is_exception && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                                {slot.exception_type === "SUBSTITUTED" ? "Substitution" : "Exception"}
                            </span>
                        )}
                        {slot.day_of_week && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                {slot.day_of_week}
                            </span>
                        )}
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-slate-800 mb-3">
                        {slot.subject_name || slot.subject || "Subject Name"}
                    </h3>

                    {/* Additional Info */}
                    {(slot.program_name || slot.semester_name || slot.batch_name || slot.division_name) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {slot.program_name && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {slot.program_name}
                                </span>
                            )}
                            {slot.semester_name && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {slot.semester_name}
                                </span>
                            )}
                            {slot.batch_name && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {slot.batch_name}
                                </span>
                            )}
                            {slot.division_name && (
                                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    Div: {slot.division_name}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Teacher and Room */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <User size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500">Teacher</span>
                                    <p className="text-sm font-medium">
                                        {slot.teacher_name || slot.teacher || "Teacher Name"}
                                        {slot.original_teacher_name && slot.is_exception && (
                                            <span className="text-xs text-orange-600 ml-1">
                                                (Sub for: {slot.original_teacher_name})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Building2 size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500">Room</span>
                                    <p className="text-sm font-medium">
                                        {slot.room_number || slot.room || slot.classroom || "Classroom"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/timetable/View-Upadate-Timetable', { state: { slot } })}
                            className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center gap-1 transition whitespace-nowrap self-start md:self-center"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const CompactSlotCard = ({ slot }) => (
        <div 
            className="px-2 py-1.5 rounded-md bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer"
            onClick={(e) => {
                e.stopPropagation(); 
                handleWeekSlotClick(slot);
            }}
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary-700 truncate">
                            {slot.subject_name || slot.subject || "Subject"}
                        </span>
                        <span className="text-[10px] text-primary-500 ml-1 shrink-0">
                            {formatTimeForDisplay(slot.start_time)}
                        </span>
                    </div>
                    <div className="text-[10px] text-primary-600 mt-0.5 truncate">
                        {slot.teacher_name?.split(' ')[0] || "Teacher"} • {slot.room_number || "Room"}
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
                <span className="text-sm">Enjoy your free time!</span>
            </p>
        </div>
    );

    const EmptyWeekState = () => (
        <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">
                <CalendarIcon size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No Classes This Week</h2>
            <p className="text-slate-400 mt-1 text-center">
                No scheduled classes for this week
            </p>
        </div>
    );

    const EmptyMonthState = () => (
        <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">
                <Layers size={32} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No Monthly Schedule</h2>
            <p className="text-slate-400 mt-1 text-center">
                No timetable data for this month
            </p>
        </div>
    );

    const getDynamicButtonLabel = () => {
        const today = new Date();
        
        if (viewMode === "Day") {
            if (isSameDay(selectedDate, today)) {
                return "Today";
            } 
        } else if (viewMode === "Week") {
            const weekRange = getWeekRange(selectedDate);
           
            
            if (weekRange.start.getMonth() === weekRange.end.getMonth()) {
                return `Week`;
            } 
        } else if (viewMode === "Month") {
            return `Month`;
        }
        
        return "Today";
    };

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
                                {academicInfo?.name || "Teacher Timetable"}
                            </h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                {collegeName && (
                                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                        {collegeName}
                                    </span>
                                )}
                                {academicInfo?.department && (
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {academicInfo.department}
                                    </span>
                                )}
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

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-slate-600">Loading timetable data...</span>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={18} />
                        <span className="font-bold">Error loading timetable</span>
                    </div>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Mobile View Switcher */}
            {isMobile && !loading && !error && (
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

            {!loading && !error && (
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
                                        const hasClasses = Array.isArray(timetableData) && timetableData.some(slot => {
                                            if (!slot || !slot.date) return false;
                                            try {
                                                const slotDate = new Date(slot.date);
                                                return isSameDay(slotDate, item.fullDate);
                                            } catch (e) {
                                                return false;
                                            }
                                        });
                                        const isToday = item.fullDate && isSameDay(item.fullDate, new Date());
                                        
                                        return (
                                            <div key={idx} className="aspect-square flex items-center justify-center p-0.5">
                                                {item.day ? (
                                                    <button
                                                        onClick={() => handleDateSelectFromSidebar(item.fullDate)}
                                                        className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-sm transition-all relative
                                                            ${isSameDay(item.fullDate, selectedDate)
                                                                ? "bg-primary-600 text-white shadow-lg shadow-primary-200 font-bold"
                                                                : isToday
                                                                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                : "bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600"
                                                            }`}
                                                    >
                                                        <span>{item.day}</span>
                                                        {isToday && (
                                                            <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSameDay(item.fullDate, selectedDate) ? 'bg-white' : 'bg-blue-500'}`}></div>
                                                        )}
                                                        {hasClasses && !isToday && (
                                                            <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSameDay(item.fullDate, selectedDate) ? 'bg-white' : 'bg-primary-500'}`}></div>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="w-full h-full"></div>
                                                )}
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
                                       
                                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        {getDynamicButtonLabel()}
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
                                        {[
                                            { key: 'Day', label: 'Day' },
                                            { key: 'Week', label: 'Week' },
                                            { key: 'Month', label: 'Month' }
                                        ].map((mode) => (
                                            <button
                                                key={mode.key}
                                                onClick={() => handleViewModeChange(mode.key)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === mode.key ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Button for Mobile */}
                        {isMobile && (
                            <div className="p-4 border-b border-slate-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <button
                                      
                                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        {getDynamicButtonLabel()}
                                    </button>
                                    <div className="flex items-center gap-1">
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
                            </div>
                        )}

                        <div className="p-4 lg:p-5 flex-1 overflow-auto">
                            {viewMode === 'Day' ? (
                                <div className="max-w-4xl mx-auto">
                                    {/* Day Header */}
                                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0 ${dayScheduleData.length === 0 ? 'bg-slate-100 border-slate-200' : isSelectedDateToday ? 'bg-blue-50 border-blue-200' : 'bg-primary-50 border-primary-100'}`}>
                                                <span className="text-xs font-bold text-slate-400">
                                                    {monthNames[selectedDate.getMonth()].slice(0, 3)}
                                                </span>
                                                <span className="text-2xl font-bold leading-none mt-0.5">{selectedDate.getDate()}</span>
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-slate-800">
                                                    {isSelectedDateToday ? "Today" : dayNames[selectedDate.getDay()]}
                                                    {isSelectedDateToday && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                            Today
                                                        </span>
                                                    )}
                                                </h1>
                                                <p className="text-slate-500 font-medium mt-1">
                                                    {dayScheduleData.length === 0 ? "No classes scheduled" : `${dayScheduleData.length} session${dayScheduleData.length > 1 ? 's' : ''}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule List */}
                                    <div className="space-y-4">
                                        {dayScheduleData.length > 0 ? (
                                            dayScheduleData.map((slot, index) => (
                                                <SlotDetailCard key={slot.id || `${slot.date}_${slot.start_time}_${index}`} slot={slot} />
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
                                        {weekData.map((day, idx) => {
                                            const isToday = isSameDay(day.date, new Date());
                                            const isSelected = isSameDay(day.date, selectedDate);
                                            return (
                                                <div key={idx} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isSelected ? 'bg-primary-50' : ''}`}>
                                                    <div className="text-xs font-bold text-slate-400 mb-1">
                                                        {calendarDays[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
                                                        {isToday && (
                                                            <span className="ml-1 text-[10px] text-blue-600">•</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleWeekDayClick(day.date)}
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-slate-100'}`}
                                                    >
                                                        {day.date.getDate()}
                                                    </button>
                                                    {day.schedule.length > 0 && (
                                                        <div className="text-[10px] text-primary-500 mt-1">
                                                            {day.schedule.length} class{day.schedule.length > 1 ? 'es' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Week Grid */}
                                    {weekData.some(day => day.schedule.length > 0) ? (
                                        <div className="overflow-x-auto">
                                            <div className="min-w-full">
                                                {uniqueTimeSlots.map((time, timeIndex) => (
                                                    <div key={timeIndex} className="grid grid-cols-[140px_repeat(7,1fr)] border-b border-slate-100">
                                                        <div className="p-3 border-r border-slate-100 bg-slate-50/50">
                                                            <div className="text-xs font-bold text-slate-600">
                                                                {formatTimeForDisplay12hr(time)}
                                                            </div>
                                                        </div>
                                                        {weekData.map((day, dayIndex) => {
                                                            const slot = day.schedule.find(s => s && s.start_time === time);
                                                            return (
                                                                <div key={dayIndex} className="p-2 border-r border-slate-100 last:border-r-0 min-h-[60px]">
                                                                    {slot ? (
                                                                        <div 
                                                                            className="h-full p-2 rounded-md bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleWeekSlotClick(slot);
                                                                            }}
                                                                        >
                                                                            <div className="text-xs font-bold text-primary-700 truncate">
                                                                                {slot.subject_name || "Subject"}
                                                                            </div>
                                                                            <div className="text-[10px] text-primary-600 mt-0.5">
                                                                                {slot.room_number || "Room"}
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyWeekState />
                                    )}
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
                                    <div className="grid grid-cols-7">
                                        {monthGridData.map((dayData, index) => {
                                            const isToday = isSameDay(dayData.date, new Date());
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`min-h-[120px] border-r border-b border-slate-100 p-2 ${!dayData.isCurrentMonth ? 'bg-slate-50/50' : ''} ${isToday ? 'bg-blue-50' : ''} ${isSameDay(dayData.date, selectedDate) ? 'bg-primary-100' : ''}`}
                                                    onClick={() => handleMonthDateClick(dayData.date, dayData.schedule)}
                                                >
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-sm font-bold ${dayData.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'} ${isSameDay(dayData.date, selectedDate) ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''} ${isToday && !isSameDay(dayData.date, selectedDate) ? 'text-blue-600' : ''}`}>
                                                                {dayData.dayNumber}
                                                                {isToday && (
                                                                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                )}
                                                            </span>
                                                            {dayData.schedule.length > 0 && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600 font-bold">
                                                                    {dayData.schedule.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 space-y-1" onClick={(e) => e.stopPropagation()}>
                                                            {dayData.visibleSlots.map((slot, slotIndex) => (
                                                                <CompactSlotCard key={slotIndex} slot={slot} />
                                                            ))}
                                                            {dayData.hiddenSlotsCount > 0 && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPopupDate(dayData.date);
                                                                        setPopupData(dayData.schedule);
                                                                        setShowMonthPopup(true);
                                                                    }}
                                                                    className="text-[10px] text-slate-500 px-2 py-1 bg-slate-100 rounded-md w-full text-left"
                                                                >
                                                                    +{dayData.hiddenSlotsCount} more
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            )}

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
                                    <span>{formatTimeForDisplay12hr(selectedWeekSlot.start_time)} - {formatTimeForDisplay12hr(selectedWeekSlot.end_time)}</span>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                                    {selectedWeekSlot.class_type || "Lecture"}
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
                                        if (selectedWeekSlot.date) {
                                            setSelectedDate(new Date(selectedWeekSlot.date));
                                        }
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
                                    {popupData.length} session{popupData.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Popup Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {popupData.length > 0 ? (
                                <div className="space-y-4">
                                    {popupData.map((slot, index) => (
                                        <SlotDetailCard key={index} slot={slot} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyDayState />
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
                    onClick={() => {
                        setMobileViewMode("schedule");
                        setViewMode("Day");
                    }}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center z-50"
                >
                    <span className="text-lg font-bold">{dayScheduleData.length}</span>
                </button>
            )}
        </div>
    );
};

export default TimetableView;