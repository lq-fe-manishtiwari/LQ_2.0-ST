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

import { Users, UserCheck, UserX, Layers, CalendarDays, Clock, BookOpen, School, Building2 } from "lucide-react";

import { PartyPopper, Flag, CalendarHeart } from "lucide-react";

const getHolidayIcon = (name) => {
    if (name.toLowerCase().includes("holi")) return PartyPopper;
    if (
        name.toLowerCase().includes("independence") ||
        name.toLowerCase().includes("republic")
    )
        return Flag;
    return CalendarHeart;
};

// Hardcoded data
const classStatus = [
    { name: "Active", value: 24 },
    { name: "Cancelled", value: 3 },
    { name: "Substitute", value: 5 },
];

const teacherStatus = [
    { name: "Free", count: 12 },
    { name: "Busy", count: 18 },
];

const roomStatus = [
    { name: "Occupied", value: 18 },
    { name: "Available", value: 7 },
];

const STATUS_COLORS = ["#10b981", "#ef4444", "#f59e0b"];
const ROOM_COLORS = ["#8b5cf6", "#14b8a6"];

// Multiple ongoing classes example (as of afternoon Jan 06, 2026)
const ongoingClasses = [
    { subject: "Operating Systems", teacher: "Prof. Rajesh Kumar", room: "R-301", time: "2:00 PM - 3:00 PM" },
    { subject: "Machine Learning", teacher: "Dr. Priya Mehta", room: "Lab-3", time: "2:00 PM - 4:00 PM" },
    { subject: "Digital Electronics", teacher: "Prof. Arun Sharma", room: "R-105", time: "1:00 PM - 3:00 PM" },
    // Add more if needed
];

const lastThreeClasses = [
    { subject: "Data Structures", teacher: "Mr. Sharma", time: "9:00 AM - 10:00 AM", room: "Lab-2", status: "Completed" },
    { subject: "DBMS", teacher: "Dr. Anita Singh", time: "10:00 AM - 11:00 AM", room: "R-204", status: "Completed" },
    { subject: "Computer Networks", teacher: "Prof. Verma", time: "11:00 AM - 12:00 PM", room: "R-101", status: "Completed" },
];

const upcomingThreeClasses = [
    { subject: "Java Programming", time: "3:00 PM", room: "Lab-1" },
    { subject: "Software Engineering", time: "4:00 PM", room: "R-205" },
    { subject: "Artificial Intelligence", time: "5:00 PM", room: "R-302" },
];

const upcomingHolidays = [
    { name: "🇮🇳 Republic Day", date: "26 January 2026" },
    { name: "🕉️ Maha Shivratri", date: "15 February 2026" },
    { name: "🌈 Holi", date: "04 March 2026" },
];


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


    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        setAnimated(true);
    }, []);
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

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Attendance Summary
            </h1>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Students Enrolled"
                    value="450"
                    icon={<div className="text-blue-600 font-bold">450</div>}
                    color="bg-blue-50 text-blue-600"
                    delay={0}
                />
                <StatCard
                    title="Students Present"
                    value="400"
                    icon={<div className="text-green-600 font-bold">400</div>}
                    color="bg-green-50 text-green-600"
                    delay={100}
                />
                <StatCard
                    title="Students Absent"
                    value="50"
                    icon={<div className="text-red-500 font-bold">50</div>}
                    color="bg-red-50 text-red-500"
                    delay={200}
                />
                <StatCard
                    title="Attendance Percentage"
                    value="80%"
                    icon={<div className="text-green-600 font-bold">80%</div>}
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
                    <div>
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
                    </div>

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
                    <div>
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
                    </div>
                </div>
            </div>

            {/* ===== Current Ongoing Classes ===== */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="h-6 w-6 text-indigo-600" />
                        Ongoing Classes
                    </h2>
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        {ongoingClasses.length} Live
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {ongoingClasses.map((cls, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            {/* Accent Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />

                            <div className="p-6 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-indigo-900">
                                        {cls.subject}
                                    </h3>
                                    <span className="flex items-center gap-2 text-xs font-semibold text-green-600">
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                        Live
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Teacher:</span> {cls.teacher}
                                </p>

                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Room:</span> {cls.room}
                                </p>

                                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                                    <Clock className="h-4 w-4" />
                                    {cls.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Recent & Upcoming Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* ===== Recent Classes ===== */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Recent Classes
                    </h2>

                    <div className="space-y-5">
                        {lastThreeClasses.map((cls, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50"
                            >
                                <div className="w-3 h-3 mt-2 bg-green-500 rounded-full" />

                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{cls.subject}</h4>
                                    <p className="text-sm text-gray-600">
                                        {cls.teacher}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>
                                            {cls.room.toLowerCase().includes("lab") ? "Laboratory:" : "Room:"}
                                        </strong>{" "}
                                        {cls.room}
                                    </p>
                                    <p className="text-sm text-gray-500">{cls.time}</p>
                                </div>

                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    Completed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* ===== Upcoming Classes ===== */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Upcoming Classes
                    </h2>

                    <div className="space-y-4">
                        {upcomingThreeClasses.map((cls, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100"
                            >
                                <div>
                                    <h4 className="font-semibold text-indigo-900">{cls.subject}</h4>
                                    <p className="text-sm text-gray-700">
                                        {cls.time}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>
                                            {cls.room.toLowerCase().includes("lab") ? "Laboratory:" : "Room:"}
                                        </strong>{" "}
                                        {cls.room}
                                    </p>
                                </div>

                                <Clock className="h-6 w-6 text-indigo-500" />
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            {/* ===== Upcoming Holidays ===== */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    Upcoming Holidays
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {upcomingHolidays.map((holiday, i) => {
                        const Icon = getHolidayIcon(holiday.name);

                        return (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-purple-200 shadow-sm hover:shadow-xl transition-all p-8 text-center"
                            >
                                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-purple-100 mb-4">
                                    <Icon className="h-7 w-7 text-purple-700" />
                                </div>

                                <h3 className="text-lg font-bold text-purple-800 mb-1">
                                    {holiday.name}
                                </h3>

                                <p className="text-gray-600 font-medium mb-4">
                                    {holiday.date}
                                </p>

                                <span className="inline-block px-5 py-2 bg-red-100 text-red-700 font-semibold rounded-full text-sm">
                                    No Classes
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Attendencedashboard;
