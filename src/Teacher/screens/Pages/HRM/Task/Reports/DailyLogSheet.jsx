import React, { useState, useEffect } from 'react';
import { Download, Search, Calendar, Clock } from 'lucide-react';
// import { AttendanceServices } from '../../../Attendance/Services/attendance.service';
import { TaskManagement } from '../../Services/TaskManagement.service';

export default function AdminStaffLogsheet() {
    const [filters, setFilters] = useState({
        department: '',
        employee: '',
        fromDate: '',
        toDate: '',
        searchTerm: ''
    });

    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

    const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
    const collegeId = activeCollege?.id;

    // Hardcoded sample data for demonstration (remove when API is ready)
    const [logsheetData, setLogsheetData] = useState([
        {
            date: '2026-01-09',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            approvedTime: '8h 0m',
            mergeTime: '8h 0m',
            tasks: 'Document Processing, Email Management',
            description: 'Processed incoming documents and managed email correspondence',
            status: 'Approved',
            remark: 'Good work'
        },
        {
            date: '2026-01-08',
            startTime: '09:30 AM',
            endTime: '06:00 PM',
            approvedTime: '8h 30m',
            mergeTime: '8h 30m',
            tasks: 'Meeting Coordination, Report Preparation',
            description: 'Coordinated team meetings and prepared monthly reports',
            status: 'Approved',
            remark: 'Excellent'
        },
        {
            date: '2026-01-07',
            startTime: '10:00 AM',
            endTime: '04:00 PM',
            approvedTime: '6h 0m',
            mergeTime: '6h 0m',
            tasks: 'Data Entry, File Organization',
            description: 'Entered data into system and organized files',
            status: 'Pending',
            remark: '-'
        },
        {
            date: '2026-01-06',
            startTime: '08:30 AM',
            endTime: '05:30 PM',
            approvedTime: '9h 0m',
            mergeTime: '9h 0m',
            tasks: 'Client Communication, Documentation',
            description: 'Communicated with clients and updated documentation',
            status: 'Approved',
            remark: 'Very good'
        },
        {
            date: '2026-01-05',
            startTime: '09:00 AM',
            endTime: '03:00 PM',
            approvedTime: '6h 0m',
            mergeTime: '6h 0m',
            tasks: 'System Updates, Training',
            description: 'Updated system software and attended training session',
            status: 'Rejected',
            remark: 'Incomplete tasks'
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

                // Auto-select first department
                if (deptList.length > 0) {
                    setFilters(prev => ({ ...prev, department: deptList[0].id }));
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                setDepartments([]);
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [collegeId]);

    // Fetch Employees when department changes
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!filters.department) {
                setEmployees([]);
                setFilters(prev => ({ ...prev, employee: '' }));
                setSelectedEmployeeDetails(null);
                return;
            }

            try {
                setLoadingEmployees(true);
                const response = await TaskManagement.getDepartmentStaff(filters.department);
                const empList = Array.isArray(response.data || response)
                    ? (response.data || response).map(emp => {
                        const firstName = emp.first_name || emp.firstname || '';
                        const lastName = emp.last_name || emp.lastname || '';
                        const fullName = `${firstName} ${lastName}`.trim() || emp.name || emp.fullname || 'Unknown';

                        return {
                            id: emp.user_id || emp.staff_id || emp.id,
                            name: fullName,
                            email: emp.email || '',
                            department: emp.department_name || ''
                        };
                    })
                    : [];

                setEmployees(empList);

                // Auto-select first employee
                if (empList.length > 0) {
                    setFilters(prev => ({ ...prev, employee: empList[0].id }));
                    setSelectedEmployeeDetails(empList[0]);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, [filters.department]);

    // Update selected employee details when employee changes
    useEffect(() => {
        if (filters.employee) {
            const emp = employees.find(e => e.id === filters.employee);
            setSelectedEmployeeDetails(emp || null);
        }
    }, [filters.employee, employees]);

    const handleDownload = () => {
        // Implement download logic (PDF/Excel)
        console.log('Downloading Admin Staff Logsheet...');
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Admin Staff Logsheet</h3>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Department Filter */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Department</label>
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingDepartments}
                    >
                        <option value="">{loadingDepartments ? 'Loading...' : 'Select Department'}</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                {/* Employee Filter */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Employee</label>
                    <select
                        value={filters.employee}
                        onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!filters.department || loadingEmployees}
                    >
                        <option value="">
                            {!filters.department ? 'Select department first' : loadingEmployees ? 'Loading...' : 'Select Employee'}
                        </option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                {/* From Date */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">From Date</label>
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* To Date */}
                <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">To Date</label>
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Employee Details Card */}
            {selectedEmployeeDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                            {selectedEmployeeDetails.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800">{selectedEmployeeDetails.name}</h4>
                            <p className="text-sm text-gray-600">{selectedEmployeeDetails.email}</p>
                            <p className="text-sm text-blue-600 font-medium">{selectedEmployeeDetails.department}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by task, description, or remark..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Time Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Total Merge Time */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-600 font-medium mb-1">Total Merge Time</p>
                            <p className="text-3xl font-bold text-indigo-700">37h 30m</p>
                            <p className="text-xs text-indigo-500 mt-1">Sum of all approved times</p>
                        </div>
                        <Clock className="w-12 h-12 text-indigo-400" />
                    </div>
                </div>

                {/* Average Daily Time */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium mb-1">Average Daily Time</p>
                            <p className="text-3xl font-bold text-blue-700">7h 30m</p>
                            <p className="text-xs text-blue-500 mt-1">Based on approved time</p>
                        </div>
                        <Clock className="w-12 h-12 text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th text-center" style={{ width: '90px' }}>Date</th>
                                <th className="table-th text-center" style={{ width: '80px' }}>Start</th>
                                <th className="table-th text-center" style={{ width: '80px' }}>End</th>
                                <th className="table-th text-center" style={{ width: '100px' }}>Approved</th>
                                <th className="table-th text-left" style={{ width: '200px' }}>Tasks</th>
                                <th className="table-th text-left" style={{ width: '200px' }}>Description</th>
                                <th className="table-th text-center" style={{ width: '90px' }}>Status</th>
                                <th className="table-th text-center" style={{ width: '110px' }}>Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logsheetData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                        <div>
                                            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium mb-1">No Data Available</p>
                                            <p className="text-sm">Select employee and date range to view logsheet data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logsheetData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-2.5 text-xs text-gray-700 text-center font-medium whitespace-nowrap">{row.date}</td>
                                        <td className="px-2 py-2.5 text-xs text-gray-700 text-center whitespace-nowrap">{row.startTime}</td>
                                        <td className="px-2 py-2.5 text-xs text-gray-700 text-center whitespace-nowrap">{row.endTime}</td>
                                        <td className="px-2 py-2.5 text-xs text-blue-600 text-center font-medium whitespace-nowrap">{row.approvedTime}</td>
                                        <td className="px-2 py-2.5 text-xs text-gray-700 text-left">
                                            <div className="max-w-[180px] truncate" title={row.tasks}>
                                                {row.tasks}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-gray-700 text-left">
                                            <div className="max-w-[180px] truncate" title={row.description}>
                                                {row.description}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${row.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-xs text-gray-600 text-center italic">
                                            <div className="max-w-[100px] truncate" title={row.remark}>
                                                {row.remark}
                                            </div>
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
