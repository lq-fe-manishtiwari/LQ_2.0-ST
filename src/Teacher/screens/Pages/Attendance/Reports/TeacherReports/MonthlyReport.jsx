import React, { useState, useEffect } from 'react';
// import { DepartmentService } from "../../../Academics/Services/Department.service";

const MonthlyReport = () => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [filterType, setFilterType] = useState('all'); // 'all', 'highest', 'lowest', 'below70'

    // Sample data for summary
    const summaryData = {
        totalDays: 22,
        presentDays: 18,
        absentDays: 4,
        attendancePercentage: 81.82,
    };

    // Sample attendance data for daily report
    const allStaffData = [
        {
            id: 1,
            date: "01 Sep 2025",
            attendanceStatus: "Present",
            inTime: "09:05 AM",
            outTime: "04:45 PM",
            totalWorkingHours: "7h 40m",
        },
        {
            id: 2,
            date: "02 Sep 2025",
            attendanceStatus: "Present",
            inTime: "08:55 AM",
            outTime: "05:10 PM",
            totalWorkingHours: "8h 15m",
        },
        {
            id: 3,
            date: "03 Sep 2025",
            attendanceStatus: "Absent",
            inTime: "-",
            outTime: "-",
            totalWorkingHours: "0h",
        },
        {
            id: 4,
            date: "04 Sep 2025",
            attendanceStatus: "Present",
            inTime: "09:15 AM",
            outTime: "04:30 PM",
            totalWorkingHours: "7h 15m",
        },
        {
            id: 5,
            date: "05 Sep 2025",
            attendanceStatus: "Present",
            inTime: "09:00 AM",
            outTime: "05:00 PM",
            totalWorkingHours: "8h",
        },
        {
            id: 6,
            date: "06 Sep 2025",
            attendanceStatus: "Absent",
            inTime: "-",
            outTime: "-",
            totalWorkingHours: "0h",
        },
    ];


    // Fetch departments from API
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const college = JSON.parse(localStorage.getItem("activeCollege"));
                if (!college?.id) return;

                const response = await DepartmentService.getDepartmentByCollegeId(college.id);
                if (response && Array.isArray(response)) {
                    setDepartments(response.map(dept => ({
                        id: dept.department_id,
                        name: dept.department_name
                    })));
                }
            } catch (err) {
                console.error("Error loading departments:", err);
            }
        };
        loadDepartments();
    }, []);

    const handleExport = () => {
        console.log('Exporting to Excel...');
    };

    const handleCardClick = (type) => {
        setFilterType(type);
    };

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getFilteredData = () => {
        let filtered = [...allStaffData];

        // Department filter
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(s => s.department === selectedDepartment);
        }

        // Card filter/sort
        switch (filterType) {
            case 'highest':
                return filtered.sort((a, b) => b.percentage - a.percentage);
            case 'lowest':
                return filtered.sort((a, b) => a.percentage - b.percentage);
            case 'below70':
                return filtered.filter(s => s.percentage < 70);
            case 'all':
            default:
                return filtered;
        }
    };

    const staffList = getFilteredData();

    const getTableTitle = () => {
        const dateRange = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
        switch (filterType) {
            case 'highest': return `Highest Attendance (${dateRange})`;
            case 'lowest': return `Lowest Attendance (${dateRange})`;
            case 'below70': return `Below 70% Attendance (${dateRange})`;
            default: return `Attendance Summary (${dateRange})`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                    </label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleExport}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                        </svg>
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Days */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">
                                Total Days
                            </p>
                            <p className="text-3xl font-bold text-blue-900">
                                {summaryData.totalDays}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Present Days */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">
                                Present Days
                            </p>
                            <p className="text-3xl font-bold text-green-900">
                                {summaryData.presentDays}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>

                        </div>
                    </div>
                </div>

                {/* Absent Days */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">
                                Absent Days
                            </p>
                            <p className="text-3xl font-bold text-red-900">
                                {summaryData.absentDays}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Attendance Percentage */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 mb-1">
                                Attendance %
                            </p>
                            <p className="text-3xl font-bold text-purple-900">
                                {summaryData.attendancePercentage}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

            </div>



            {/* Monthly Report Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">{getTableTitle()}</h3>
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-bold text-blue-600">{staffList.length}</span> records
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="px-6 py-4 text-center text-xs font-medium">Date</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">Attendance Status</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">In Time</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">Out Time</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">Total Working Hours</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                staffList.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {row.date}
                                        </td>

                                        <td
                                            className={`px-6 py-4 text-sm font-semibold ${row.attendanceStatus === "Present"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {row.attendanceStatus}
                                        </td>

                                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                                            {row.inTime}
                                        </td>

                                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                                            {row.outTime}
                                        </td>

                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                            {row.totalWorkingHours}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
