import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
// import { AttendanceServices } from '../../../Attendance/Services/attendance.service';
import { TaskManagement } from '../../Services/TaskManagement.service';

export default function SummaryAdminLogsheet() {
    const [filters, setFilters] = useState({
        department: '',
        month: '',
        year: new Date().getFullYear().toString()
    });

    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
    const collegeId = activeCollege?.id;

    // Sample summary stats - replace with actual API data
    const summaryStats = {
        totalEmployees: 25,
        totalLogsheets: 500,
        pendingLogsheets: 15,
        lateComings: 8,
        earlyGoings: 5,
        leaves: 12
    };

    // Sample employee summary data - replace with actual API data
    const [employeeSummary, setEmployeeSummary] = useState([
        {
            name: 'Rahul Dhingra',
            department: 'Administration',
            logsheetNotFilled: 2,
            absentOn: 1,
            lessThan40hrs: 0,
            moreThan40hrs: 1,
            lateComings: 3,
            earlyGoings: 1,
            lateMark: 2,
            leaves: 1
        },
        {
            name: 'Ajay Panchal',
            department: 'Human Resources',
            logsheetNotFilled: 0,
            absentOn: 0,
            lessThan40hrs: 1,
            moreThan40hrs: 0,
            lateComings: 2,
            earlyGoings: 0,
            lateMark: 1,
            leaves: 2
        },
        {
            name: 'Shivam Verma',
            department: 'IT',
            logsheetNotFilled: 1,
            absentOn: 0,
            lessThan40hrs: 0,
            moreThan40hrs: 2,
            lateComings: 0,
            earlyGoings: 1,
            lateMark: 0,
            leaves: 0
        },
        {
            name: 'Utkarsh Garg',
            department: 'Administration',
            logsheetNotFilled: 3,
            absentOn: 2,
            lessThan40hrs: 1,
            moreThan40hrs: 0,
            lateComings: 4,
            earlyGoings: 2,
            lateMark: 3,
            leaves: 3
        },
        {
            name: 'Mayur Korwate',
            department: 'IT',
            logsheetNotFilled: 0,
            absentOn: 1,
            lessThan40hrs: 0,
            moreThan40hrs: 1,
            lateComings: 1,
            earlyGoings: 0,
            lateMark: 1,
            leaves: 1
        }
    ]);

    // Fetch Departments on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!collegeId) {
                setLoadingDepartments(false);
                return;
            }

            try {
                setLoadingDepartments(true);
                const response = await DepartmentService.getDepartmentByCollegeId(collegeId);
                const deptList = Array.isArray(response)
                    ? response.map(d => ({
                        id: d.department_id,
                        name: d.department_name || d.name
                    }))
                    : [];

                setDepartments(deptList);
            } catch (error) {
                console.error('Error fetching departments:', error);
                setDepartments([]);
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [collegeId]);

    const handleDownload = () => {
        // Implement download logic (PDF/Excel)
        console.log('Downloading Summary Report...');
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Summary of Admin Logsheet</h3>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Summary</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Department Filter */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Department</label>
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingDepartments}
                    >
                        <option value="">{loadingDepartments ? 'Loading...' : 'All Departments'}</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                {/* Month Filter */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Month</label>
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Months</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Year</label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {/* Total Employees */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">Total Employees</p>
                        <p className="text-2xl font-bold text-blue-700">{summaryStats.totalEmployees}</p>
                    </div>
                </div>

                {/* Total Logsheets */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-green-600 font-medium mb-1">Total Logsheets</p>
                        <p className="text-2xl font-bold text-green-700">{summaryStats.totalLogsheets}</p>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">{summaryStats.pendingLogsheets}</p>
                    </div>
                </div>

                {/* Late Comings */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-red-600 font-medium mb-1">Late Comings</p>
                        <p className="text-2xl font-bold text-red-700">{summaryStats.lateComings}</p>
                    </div>
                </div>

                {/* Early Goings */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-purple-600 font-medium mb-1">Early Goings</p>
                        <p className="text-2xl font-bold text-purple-700">{summaryStats.earlyGoings}</p>
                    </div>
                </div>

                {/* Leaves */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-3 shadow-sm">
                    <div className="text-center">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Leaves</p>
                        <p className="text-2xl font-bold text-indigo-700">{summaryStats.leaves}</p>
                    </div>
                </div>
            </div>

            {/* Employee Summary Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">Employee-wise Summary</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th text-left" style={{ width: '150px' }}>Name of Employee</th>
                                <th className="table-th text-center" style={{ width: '100px' }}>Logsheet Not Filled</th>
                                <th className="table-th text-center" style={{ width: '80px' }}>Absent On</th>
                                <th className="table-th text-center" style={{ width: '100px' }}>&lt;40hrs Weekly</th>
                                <th className="table-th text-center" style={{ width: '100px' }}>&gt;40hrs Weekly</th>
                                <th className="table-th text-center" style={{ width: '90px' }}>Late Coming</th>
                                <th className="table-th text-center" style={{ width: '90px' }}>Early Going</th>
                                <th className="table-th text-center" style={{ width: '80px' }}>Late Mark</th>
                                <th className="table-th text-center" style={{ width: '70px' }}>Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employeeSummary.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                        <div>
                                            <p className="text-lg font-medium mb-1">No Summary Data</p>
                                            <p className="text-sm">Select filters to view employee summary</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employeeSummary.map((emp, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-xs font-medium text-gray-700">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{emp.name}</span>
                                                <span className="text-[10px] text-gray-500">{emp.department}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.logsheetNotFilled}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.absentOn}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.lessThan40hrs}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.moreThan40hrs}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.lateComings}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.earlyGoings}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.lateMark}
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center text-gray-700">
                                            {emp.leaves}
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
}
