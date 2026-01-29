import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

const TaskDashboard = () => {
    // --- Data for Assigned Vs Completed (Bar Chart) ---
    const assignedVsCompletedData = [
        { name: "Assigned", value: 94, color: "#1e60aa" }, // Darker Blue
        { name: "Completed", value: 70, color: "#008000" }, // Green
        { name: "Pending", value: 28, color: "#ff8c00" }, // Orange
    ];

    // --- Data for Task Aging Chart ---
    const agingData = {
        col1: Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            label: "Registration of Stud...",
            status: "on-time",
        })),
        col2: Array.from({ length: 4 }).map((_, i) => ({
            id: i,
            label: "Registration of Stud...",
            status: "delay",
        })),
        col3: Array.from({ length: 3 }).map((_, i) => ({
            id: i,
            label: "Registration of Stud...",
            status: "late",
        })),
    };

    // --- Data for Follow-up ---
    const bottlenecks = [
        { dept: "Students Homework Check", tasks: 12 },
        { dept: "Attendance need to be check", tasks: 12 },
        { dept: "SSR report generation", tasks: 12 },
    ];

    const workloadImbalance = [
        {
            name: "SSR report generation",
            dept: "Department : Mathematics",
            tasks: 12,
        },
        {
            name: "Attendance need to be check",
            dept: "Department : Accounts",
            tasks: 12,
        },
    ];

    // --- Data for Section-wise Work ---
    const sectionWorkData = [
        {
            name: "Accounts",
            total: 123,
            completed: 100,
            pending: 20,
            overdue: 3,
            percent: 88,
            color: "#4caf50",
        },
        {
            name: "Library",
            total: 123,
            completed: 100,
            pending: 20,
            overdue: 3,
            percent: 88,
            color: "#ef4444",
        },
        {
            name: "Administration",
            total: 123,
            completed: 100,
            pending: 20,
            overdue: 3,
            percent: 88,
            color: "#4caf50",
        },
        {
            name: "Examination Cell",
            total: 123,
            completed: 100,
            pending: 20,
            overdue: 3,
            percent: 88,
            color: "#4caf50",
        },
        {
            name: "IT / ERP Support",
            total: 123,
            completed: 100,
            pending: 20,
            overdue: 3,
            percent: 88,
            color: "#4caf50",
        },
    ];

    // Custom label for the bar chart
    const CustomBarLabel = (props) => {
        const { x, y, width, height, value } = props;
        return (
            <text
                x={x + width + 5}
                y={y + height / 2 + 5}
                fill="#333"
                fontSize="14"
                fontWeight="bold"
            >
                {value}
                <tspan fontSize="12" fontWeight="normal">
                    Task
                </tspan>
            </text>
        );
    };

    return (
        <div className="min-h-screen  font-sans bg-gray-50">
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Assigned Vs Completed Task */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-orange-400 font-bold flex items-center gap-2 text-lg">
                        <span className="text-2xl">⚡</span>Task Status
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={assignedVsCompletedData}
                                margin={{ top: 5, right: 60, left: 20, bottom: 20 }}
                                barSize={40}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 14, fontWeight: 600, fill: "#333" }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} label={<CustomBarLabel />}>
                                    {assignedVsCompletedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Aging Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-orange-400 font-bold flex items-center gap-2 text-lg">
                            <span className="text-2xl">⏱️</span> Task Aging Chart
                        </h2>
                        <div className="flex gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-600"></div> On-Time
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-orange-400"></div> Sight Delay
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-600"></div> Too Late
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 h-64">
                        {/* 0-24 Hrs */}
                        <div className="flex flex-col h-full">
                            <div className="text-blue-500 font-bold text-xs text-center mb-2">
                                Tasks : {agingData.col1.length}
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                {agingData.col1.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded flex items-center"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2"></div>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-xs font-semibold text-gray-500 mt-2 border-t pt-1">
                                0-24 Hrs
                            </div>
                        </div>

                        {/* 24-48 Hrs */}
                        <div className="flex flex-col h-full border-l border-gray-200 pl-2">
                            <div className="text-blue-500 font-bold text-xs text-center mb-2">
                                Tasks : {agingData.col2.length}
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                {agingData.col2.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-orange-100 text-orange-800 text-xs py-1 px-2 rounded flex items-center"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></div>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-xs font-semibold text-gray-500 mt-2 border-t pt-1">
                                24-48 Hrs <br />
                                <span className="text-[10px]">(Time)</span>
                            </div>
                        </div>

                        {/* >48 Hrs */}
                        <div className="flex flex-col h-full border-l border-gray-200 pl-2">
                            <div className="text-blue-500 font-bold text-xs text-center mb-2">
                                Tasks : {agingData.col3.length}
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                {agingData.col3.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded flex items-center"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></div>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-xs font-semibold text-gray-500 mt-2 border-t pt-1">
                                &gt;48 Hrs
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Daily Tasks */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-gray-800 font-bold mb-4 text-lg">Daily Tasks</h2>
                    <div className="space-y-4">
                        <div className="bg-blue-100 rounded-lg p-4 flex justify-between items-center">
                            <span className="text-blue-600 font-semibold text-sm">
                                Tasks Assigned (Today):
                            </span>
                            <span className="text-blue-600 font-bold text-2xl">50</span>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">
                                    ♣
                                </div>
                                <span className="text-green-700 font-semibold">Tasks Completed</span>
                            </div>
                            <span className="text-green-600 font-bold text-2xl">40</span>
                        </div>

                        <div className="bg-red-50 rounded-lg p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                                    👤
                                </div>
                                <span className="text-red-700 font-semibold">Tasks Overdue</span>
                            </div>
                            <span className="text-red-600 font-bold text-2xl">2</span>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                                    🕒
                                </div>
                                <span className="text-orange-700 font-semibold">Tasks Pending</span>
                            </div>
                            <span className="text-orange-600 font-bold text-2xl">8</span>
                        </div>
                    </div>
                </div>

                {/* Follow-up */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-gray-800 font-bold mb-4 flex items-center gap-2 text-lg">
                        <span className="text-red-500 text-xl">🔔</span> Follow-up:
                    </h2>

                    {/* Bottleneck Sections */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center bg-orange-50 p-2 rounded-t-lg border-b border-orange-100">
                            <span className="text-orange-400 font-bold text-sm">
                                Task Pending
                            </span>
                            <span className="text-orange-400 font-bold">3</span>
                        </div>
                        <div className="border border-orange-100 rounded-b-lg border-t-0 p-2 space-y-2">
                            {bottlenecks.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-1 last:pb-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <span className="font-semibold text-gray-700">{item.dept}</span>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Staff Workload Imbalance */}
                    <div>
                        <div className="flex justify-between items-center bg-red-50 p-2 rounded-t-lg border-b border-red-100">
                            <span className="text-red-400 font-bold text-sm">Task Overdure</span>
                            <span className="text-red-400 font-bold">2</span>
                        </div>
                        <div className="border border-red-100 rounded-b-lg border-t-0 p-2 space-y-2">
                            {workloadImbalance.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-1 last:pb-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <div>
                                            <span className="font-semibold text-gray-800">{item.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section-wise Work */}
            {/* <div>
                <h2 className="text-gray-800 font-bold mb-4 text-lg">Section-wise Work:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {sectionWorkData.map((section, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-4 rounded border border-blue-200 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 text-sm">{section.name}</h3>
                                <span className="text-blue-500 text-xs font-semibold">
                                    Total Tasks : {section.total}
                                </span>
                            </div>
                            <div className="space-y-1 mb-2">
                                <div className="flex items-center text-[10px] font-semibold">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                    <span className="text-gray-600">Completed Task : {section.completed}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-semibold">
                                    <div className="w-2 h-2 rounded-full bg-orange-400 mr-1"></div>
                                    <span className="text-orange-400">Pending Task : {section.pending}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-semibold">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                    <span className="text-red-500">Overdue Task : {section.overdue}</span>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 text-green-600 font-bold text-2xl">
                                {section.percent}%
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
};

export default TaskDashboard;