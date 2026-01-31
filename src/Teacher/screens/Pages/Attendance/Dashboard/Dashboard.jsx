import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { Clock, CalendarDays, Calendar } from "lucide-react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import { TeacherAttendanceManagement } from "../Services/attendance.service";

// --- Reusable Components ---
const StatCard = ({ title, value, subtext, icon, color, delay }) => (
    <div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
        style={{ animation: `fadeIn 0.5s ease-out ${delay}ms backwards` }}
    >
        <div className={`p-4 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

const CircularProgress = ({ value, label, subLabel, color, delay }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300"
            style={{ animation: `scaleUp 0.4s ease-out ${delay}ms backwards` }}
        >
            <div className="relative w-24 h-24 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700">{value}%</span>
                </div>
            </div>
            <h4 className="font-bold text-gray-800">{label}</h4>
            <div className="flex justify-between w-full mt-2 text-xs px-2">
                <span className="text-green-600 font-semibold">● 87 Present</span>
                <span className="text-red-500 font-semibold">● 4 Absent</span>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
);

// --- Mock Data ---
const classData = [
    { name: "1st Year", present: 86, total: 90 },
    { name: "2nd Year", present: 20, total: 60 }, // Low
    { name: "3rd Year", present: 70, total: 84 }, // Med
    { name: "4th Year", present: 86, total: 90 }, // High
];

const absenceData = [
    { name: "With Permission", value: 40, color: "#22c55e" },
    { name: "Without Permission", value: 25, color: "#ef4444" },
    { name: "On Duty (OD)", value: 20, color: "#22c55e" },
    { name: "Medical Leave", value: 15, color: "#f97316" },
];

const facultyAttendance = [
    { name: "Present", value: 65, color: "#22c55e" },
    { name: "Absent", value: 15, color: "#ef4444" },
];

// --- Sub-Component for Class Card ---
const ClassAttendanceCard = ({ data, delay }) => {
    const percentage = Math.round((data.present / data.total) * 100);

    // Color Logic: >= 75% Green, 60-74% Orange, < 60% Red
    let colorClass = "bg-green-500";
    let textClass = "text-green-600";

    if (percentage < 60) {
        colorClass = "bg-red-500";
        textClass = "text-red-500";
    } else if (percentage < 75) {
        colorClass = "bg-orange-500";
        textClass = "text-orange-500";
    }

    return (
        <div
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group"
            style={{ animation: `slideInRight 0.5s ease-out ${delay}ms backwards` }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-700">{data.name}</h3>
                <span className={`font-bold ${textClass}`}>{percentage}%</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
                <span className={`text-2xl font-bold ${textClass}`}>
                    {data.present}
                </span>
                <span className="text-sm text-gray-400 mb-1">Present</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <span className="text-red-500">●</span>
                {data.total - data.present} Absent
            </div>
        </div>
    );
};

// --- Constant Icons ---
const Icons = {
    Summary: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    ),
    Book: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    UserCheck: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 19 13 23 9" />
        </svg>
    ),
    Bell: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
};

// --- Main Component ---
const Attendencedashboard = () => {
    const { getApiIds, isLoaded } = useUserProfile();
    const [animated, setAnimated] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCustomDate, setIsCustomDate] = useState(false);

    // New State for Timetable Data
    const [timetableStats, setTimetableStats] = useState({
        ongoingClasses: [],
        recentClasses: [],
        upcomingClasses: [],
        upcomingHolidays: []
    });

    useEffect(() => {
        setAnimated(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const { collegeId, teacherId } = getApiIds();
        if (!collegeId || !teacherId) return;

        fetchDashboardData(collegeId, teacherId);
        fetchTimetableData(collegeId, teacherId);
    }, [isLoaded, selectedDate, isCustomDate]);

    const fetchTimetableData = async (collegeId, teacherId) => {
        try {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

            console.log('[Dashboard] fetchTimetableData called with:', collegeId, teacherId);
            const [dashboardRes, holidaysRes] = await Promise.all([
                TeacherAttendanceManagement.getTimetableDashboardDetails(collegeId, formattedDate),
                TeacherAttendanceManagement.getDashboardHolidays(teacherId, collegeId, formattedDate)
            ]);
            console.log('[Dashboard] Holidays API Response:', holidaysRes);

            const newStats = {
                ongoingClasses: [],
                recentClasses: [],
                upcomingClasses: [],
                upcomingHolidays: []
            };

            if (dashboardRes.success && dashboardRes.data) {
                newStats.ongoingClasses = dashboardRes.data.ongoing_classes || [];
                newStats.recentClasses = dashboardRes.data.recently_completed_classes || [];
                newStats.upcomingClasses = dashboardRes.data.upcoming_classes || [];
            }


            if (holidaysRes.success && holidaysRes.data && holidaysRes.data.holidays) {
                newStats.upcomingHolidays = holidaysRes.data.holidays;
            }

            setTimetableStats(newStats);
        } catch (err) {
            console.error("Timetable dashboard fetch failed:", err);
        }
    };

    const fetchDashboardData = async (collegeId, teacherId) => {
        setLoading(true);
        try {
            let startDate, endDate;

            if (isCustomDate) {
                // Specific date selected by user
                const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
                startDate = formattedDate;
                endDate = formattedDate;
            } else {
                // Default: First day of current month to today
                const now = new Date();
                startDate = moment(new Date(now.getFullYear(), now.getMonth(), 1)).format('YYYY-MM-DD');
                endDate = moment(now).format('YYYY-MM-DD');
            }

            const response = await TeacherAttendanceManagement.getTeacherAttendanceSummaryReports(
                collegeId,
                teacherId,
                startDate,
                endDate
            );

            if (response.success && response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Dashboard fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalAbsences = absenceData.reduce((sum, item) => sum + item.value, 0);
    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6 pb-20">
            {/* Custom Animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Attendance Summary
                </h1>

                <div className="relative">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-blue-400 transition-colors cursor-pointer group">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2 group-hover:text-blue-500" />
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                setIsCustomDate(true);
                            }}
                            dateFormat="dd-MM-yyyy"
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-24 cursor-pointer"
                            placeholderText="Select Date"
                        />
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Working Days"
                    value={loading ? "..." : (dashboardData?.total_days || "0")}
                    icon={<div className="text-blue-600 font-bold">{dashboardData?.total_days || "0"}</div>}
                    color="bg-blue-50 text-blue-600"
                    delay={0}
                />
                <StatCard
                    title="Days Present"
                    value={loading ? "..." : (dashboardData?.total_present_days || "0")}
                    icon={<div className="text-green-600 font-bold">{dashboardData?.total_present_days || "0"}</div>}
                    color="bg-green-50 text-green-600"
                    delay={100}
                />
                <StatCard
                    title="Days Absent"
                    value={loading ? "..." : (dashboardData?.total_absent_days || "0")}
                    icon={<div className="text-red-500 font-bold">{dashboardData?.total_absent_days || "0"}</div>}
                    color="bg-red-50 text-red-500"
                    delay={200}
                />
                <StatCard
                    title="Attendance Percentage"
                    value={loading ? "..." : `${dashboardData?.attendance_percentage || "0"}%`}
                    icon={<div className="text-green-600 font-bold">{dashboardData?.attendance_percentage || "0"}%</div>}
                    color="bg-green-50 text-green-600"
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Class-Wise Attendance */}
                    <div>
                        <SectionHeader
                            title="Class-Wise Attendance"
                            icon={<span className="text-blue-600">{Icons.Summary}</span>}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classData.map((cls, idx) => (
                                <ClassAttendanceCard key={idx} data={cls} delay={idx * 150} />
                            ))}
                        </div>
                    </div>

                    {/* Faculty-Wise Attendance (Pie Chart - Single Faculty) */}
                    {/* Follow-up Section */}
                    {/* <div>
                        <SectionHeader
                            title="Follow-up:"
                            icon={<span className="text-red-500">{Icons.Bell}</span>}
                        />
                        <div className="space-y-4">
                            <div
                                className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center border-l-4 border-l-red-500"
                                style={{ animationDelay: "700ms" }}
                            >
                                <span className="font-semibold text-gray-700">
                                    Chronic absentee list
                                </span>
                                <button className="text-blue-500 text-sm font-bold hover:underline">
                                    View
                                </button>
                            </div>
                            <div
                                className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center border-l-4 border-l-red-500"
                                style={{ animationDelay: "800ms" }}
                            >
                                <span className="font-semibold text-gray-700">
                                    Parent / mentor communication
                                </span>
                                <button className="text-blue-500 text-sm font-bold hover:underline">
                                    View
                                </button>
                            </div>
                        </div>
                    </div> */}

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Subject-Wise Attendance */}
                    <div>
                        <SectionHeader
                            title="Subject-Wise Attendance"
                            icon={<span className="text-orange-500">{Icons.Book}</span>}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CircularProgress
                                label="Biology"
                                value={58}
                                color="#ef4444"
                                delay={100}
                            />
                            <CircularProgress
                                label="Physics"
                                value={20}
                                color="#ef4444"
                                delay={200}
                            />
                            <CircularProgress
                                label="Chemistry"
                                value={45}
                                color="#ef4444"
                                delay={300}
                            />
                            {/* <CircularProgress
                label="Math"
                value={80}
                color="#22c55e"
                delay={400}
              />
              <CircularProgress
                label="English"
                value={70}
                color="#f97316"
                delay={500}
              />
              <CircularProgress
                label="Geography"
                value={94}
                color="#22c55e"
                delay={600}
              /> */}
                        </div>
                    </div>

                    {/* Absence Classification - Pie Chart Removed, Simple Clean List */}
                    {/* <div>
                        <SectionHeader
                            title="Absence Classification"
                            icon={<span className="text-red-500">{Icons.Bell}</span>}
                        />
                        <div
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            style={{ animation: "fadeIn 0.5s ease-out 600ms backwards" }}
                        >
                            {absenceData.map((item) => {
                                const percentage = Math.round(
                                    (item.value / totalAbsences) * 100
                                );
                                return (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="font-medium text-gray-700">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">
                                                {item.value}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                                <span className="font-semibold text-gray-700">
                                    Total Absences
                                </span>
                                <span className="font-bold text-gray-800">{totalAbsences}</span>
                            </div>
                        </div>
                    </div> */}


                </div>
            </div>

            {/* Ongoing Classes Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 mb-8 sm:mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <Clock className="h-6 w-6 text-indigo-600" />
                        Ongoing Classes ({timetableStats.ongoingClasses.length})
                    </h2>
                    <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 tracking-wider">
                        Live Now
                    </span>
                </div>

                {timetableStats.ongoingClasses.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No classes ongoing at the moment.</p>
                ) : (
                    <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                        {timetableStats.ongoingClasses.map((cls, i) => (
                            <div
                                key={i}
                                className="min-w-[280px] bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200/50 rounded-xl p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-indigo-900 text-lg">{cls.subject_name}</h3>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p><span className="font-medium">Teacher:</span> {cls.teacher_name}</p>
                                    <p><span className="font-medium">Room:</span> {cls.classroom}</p>
                                    <p className="flex items-center gap-2 text-indigo-700 font-medium">
                                        <Clock className="h-4 w-4" />
                                        {cls.start_time} - {cls.end_time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent & Upcoming Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Recent Classes
                    </h2>
                    <div className="space-y-4">
                        {timetableStats.recentClasses.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 text-sm">No recent classes.</p>
                        ) : (
                            timetableStats.recentClasses.slice(0, 3).map((cls, i) => (
                                <div key={i} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{cls.subject_name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">Teacher: {cls.teacher_name}</p>
                                            <p className="text-sm text-gray-600">Room: {cls.classroom} • {cls.start_time} - {cls.end_time}</p>
                                        </div>
                                        <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Upcoming Classes
                    </h2>
                    <div className="space-y-4">
                        {timetableStats.upcomingClasses.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 text-sm">No upcoming classes.</p>
                        ) : (
                            timetableStats.upcomingClasses.slice(0, 3).map((cls, i) => (
                                <div key={i} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{cls.subject_name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">Time: {cls.start_time} - {cls.end_time} • Room: {cls.classroom}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-indigo-500 opacity-70" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Upcoming Holidays Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 sm:mb-10">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-10 tracking-tight">
                    Upcoming Holidays
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {timetableStats.upcomingHolidays.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 py-4">No upcoming holidays.</p>
                    ) : (
                        timetableStats.upcomingHolidays.map((holiday, i) => (
                            <div key={i} className="text-center p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-indigo-100/50">
                                <h3 className="text-xl font-bold text-purple-800 mb-3 truncate px-2" title={holiday.name}>
                                    {holiday.name}
                                </h3>
                                <p className="text-gray-700 font-bold text-sm mb-4">
                                    {holiday.start_date} → {holiday.end_date}
                                </p>
                                <div className="px-6 py-1.5 bg-white text-red-600 rounded-full inline-block text-[10px] font-bold tracking-widest border border-red-50 shadow-sm">
                                    No Classes
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Attendencedashboard;
