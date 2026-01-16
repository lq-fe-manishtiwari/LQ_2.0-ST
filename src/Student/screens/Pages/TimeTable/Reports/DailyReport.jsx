import React, { useState, useEffect } from 'react';
// import { DepartmentService } from "../../../Academics/Services/Department.service";

const DailyReport = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [filterType, setFilterType] = useState('all'); // 'all', 'present', 'absent'

    // Sample data for summary
    const summaryData = {
        total: 45,
        present: 42,
        absent: 3,
        percentage: 93.33
    };

    // Sample teachers data
    const allTeachers = [
        { id: 1, staffId: 'T1001', name: 'Prof. Aarav Sharma', department: 'Computer Science', status: 'P', checkIn: '09:05 AM', checkOut: '04:30 PM' },
        { id: 2, staffId: 'T1002', name: 'Dr. Sarah Wilson', department: 'Management', status: 'P', checkIn: '08:55 AM', checkOut: '05:00 PM' },
        { id: 3, staffId: 'T1003', name: 'Mr. Rajesh Verma', department: 'Engineering', status: 'A', checkIn: '-', checkOut: '-', reason: 'Medical Leave' },
        { id: 4, staffId: 'T1004', name: 'Ms. Priya Patel', department: 'Arts', status: 'P', checkIn: '09:15 AM', checkOut: '04:45 PM' },
        { id: 5, staffId: 'T1005', name: 'Dr. Ankit Singh', department: 'Science', status: 'P', checkIn: '09:00 AM', checkOut: '05:15 PM' },
        { id: 6, staffId: 'T1006', name: 'Mrs. Kavita Reddy', department: 'Commerce', status: 'A', checkIn: '-', checkOut: '-', reason: 'Personal' },
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

    // Filter data based on filterType and selectedDepartment
    const getFilteredData = () => {
        let filtered = [...allTeachers];

        // Department filter
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(t => t.department === selectedDepartment);
        }

        // Card filter
        if (filterType === 'present') {
            filtered = filtered.filter(t => t.status === 'P');
        } else if (filterType === 'absent') {
            filtered = filtered.filter(t => t.status === 'A');
        }

        return filtered;
    };

    const teachersList = getFilteredData();

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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
                {/* <div className="flex-1">
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
                </div> */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Attendance Status */}
                <button
                    onClick={() =>
                        setFilterType(filterType === "present" ? "absent" : "present")
                    }
                    className={`bg-gradient-to-br p-6 rounded-xl border-2 transition-all transform hover:scale-105
      ${filterType === "absent"
                            ? "from-red-50 to-red-100 border-red-200"
                            : "from-green-50 to-green-100 border-green-200"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className={`text-sm font-medium ${filterType === "absent" ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                Attendance Status
                            </p>
                            <p
                                className={`text-2xl font-bold ${filterType === "absent" ? "text-red-900" : "text-green-900"
                                    }`}
                            >
                                {filterType === "absent" ? "Absent" : "Present"}
                            </p>
                        </div>

                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center
          ${filterType === "absent" ? "bg-red-200" : "bg-green-200"
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d={
                                        filterType === "absent"
                                            ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                                            : "M9 12l2 2 4-4"
                                    }
                                />
                            </svg>
                        </div>
                    </div>
                </button>

                {/* In Time (BLUE) */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">In Time</p>
                            <p className="text-2xl font-bold text-blue-900">09:00 AM</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4l3 3"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Out Time */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-600">Out Time</p>
                            <p className="text-2xl font-bold text-orange-900">05:00 PM</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4l3 3"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Working Time */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600">
                                Total Working Time
                            </p>
                            <p className="text-2xl font-bold text-purple-900">8 Hours</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
};

export default DailyReport;
