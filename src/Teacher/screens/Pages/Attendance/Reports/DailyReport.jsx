import React, { useState } from 'react';

const DailyReport = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDivision, setSelectedDivision] = useState('all');

    // Sample data
    const reportData = {
        total: 150,
        present: 142,
        absent: 8,
        percentage: 94.67
    };

    const absenteeList = [
        { id: 1, rollNo: '1001', name: 'Rajesh Kumar', reason: 'Sick Leave', status: 'ML' },
        { id: 2, rollNo: '1015', name: 'Priya Sharma', reason: 'Not Specified', status: 'A' },
        { id: 3, rollNo: '1023', name: 'Amit Patel', reason: 'Family Function', status: 'OL' },
        { id: 4, rollNo: '1034', name: 'Sneha Reddy', reason: 'Not Specified', status: 'A' },
        { id: 5, rollNo: '1045', name: 'Vikram Singh', reason: 'Medical Emergency', status: 'ML' },
    ];

    const handleExport = () => {
        console.log('Exporting to Excel...');
        // Implement Excel export logic
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Division / Department
                    </label>
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="A">Division A / CS Department</option>
                        <option value="B">Division B / IT Department</option>
                        <option value="C">Division C / Mechanical</option>
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
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Total</p>
                            <p className="text-3xl font-bold text-blue-900">{reportData.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Present</p>
                            <p className="text-3xl font-bold text-green-900">{reportData.present}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Absent</p>
                            <p className="text-3xl font-bold text-red-900">{reportData.absent}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 mb-1">Attendance %</p>
                            <p className="text-3xl font-bold text-purple-900">{reportData.percentage}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absentee List - TimeTableList Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Absentee List</h3>
                    <div className="text-sm text-gray-600">
                        Total <span className="font-bold text-blue-600">{absenteeList.length}</span> absent
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium tracking-wider">ID / Roll No</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium tracking-wider">Name</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Status</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium tracking-wider">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {absenteeList.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-700">{person.rollNo}</td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium text-gray-900">{person.name}</td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${person.status === 'ML' ? 'bg-blue-100 text-blue-700' :
                                                person.status === 'OL' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {person.status === 'ML' ? 'Medical Leave' :
                                                person.status === 'OL' ? 'On Leave' : 'Absent'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-600">{person.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyReport;
