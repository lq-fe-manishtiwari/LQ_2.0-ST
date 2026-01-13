import React, { useState, useEffect } from 'react';
import AttendanceFilters from '../Components/AttendanceFilters';
import { api } from '../../../../../_services/api';

export default function CardView() {
    // State for selected year and month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
    // State for filters
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: ''
    });
    
    const [showFilters, setShowFilters] = useState(true);
    
    // State for allocations
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    
    // State for student attendance data
    const [students, setStudents] = useState([]);
    
    // State for tracking which cell is being edited
    const [editingCell, setEditingCell] = useState(null);
    
    // State to track if changes have been made
    const [hasChanges, setHasChanges] = useState(false);

    // Years array (last 5 years and next 2 years)
    const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 5 + i);
    
    // Months array
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    // Attendance status options
    const attendanceOptions = [
        { value: 'P', textColor: 'text-green-600', label: 'Present' },
        { value: 'A', textColor: 'text-red-600', label: 'Absent' },
        { value: 'OL', textColor: 'text-yellow-600', label: 'On Leave' },
        { value: 'ML', textColor: 'text-blue-600', label: 'Medical Leave' }
    ];

    // Fetch teacher ID
    useEffect(() => {
        const getTeacherIdFromStorage = () => {
            let teacherId = null;
            const userProfileStr = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
            if (userProfileStr) {
                try {
                    const userProfile = JSON.parse(userProfileStr);
                    if (userProfile?.teacher_id) {
                        teacherId = userProfile.teacher_id;
                    }
                } catch (e) {
                    console.error("Error parsing userProfile:", e);
                }
            }
            return teacherId ? parseInt(teacherId, 10) : null;
        };

        const teacherId = getTeacherIdFromStorage();
        if (teacherId && !isNaN(teacherId)) {
            setCurrentTeacherId(teacherId);
        }
    }, []);

    // Fetch allocations
    useEffect(() => {
        const fetchAllocations = async () => {
            if (!currentTeacherId) return;
            setLoadingAllocations(true);
            try {
                const response = await api.getTeacherAllocatedPrograms(currentTeacherId);
                if (response.success) {
                    const data = response.data;
                    const allAllocations = [
                        ...(data.class_teacher_allocation || []),
                        ...(data.normal_allocation || [])
                    ];
                    setAllocations(allAllocations);
                }
            } catch (error) {
                console.error("Error fetching allocations:", error);
            } finally {
                setLoadingAllocations(false);
            }
        };

        if (currentTeacherId) {
            fetchAllocations();
        }
    }, [currentTeacherId]);

    // Filter handlers
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Reset changes when filters change
        setHasChanges(false);
        setEditingCell(null);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setFilters({
            program: '',
            batch: '',
            academicYear: '',
            semester: '',
            division: '',
            paper: ''
        });
    };

    const applyFilters = () => {
        setShowFilters(false);
        // Refresh data based on new filters
        loadStudentsData();
    };

    // Get days in selected month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    // Update days when month/year changes
    const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

    // Load students data based on filters
    const loadStudentsData = () => {
        // In real app, you would fetch from API with filters
        // For demo, we create dummy data based on filters
        
        const totalStudents = 15;
        const initialStudents = Array(totalStudents).fill().map((_, i) => {
            // Add filter-based data
            let programName = 'B.Tech';
            let batchName = 'CS-A';
            let divisionName = 'A';
            let paperName = 'Data Structures';
            let semester = '3';
            let academicYear = '2023-24';
            
            // If filters are selected, use them
            if (filters.program && allocations.length > 0) {
                const program = allocations.find(a => a.program?.program_id == filters.program);
                if (program) programName = program.program?.program_name || programName;
            }
            
            if (filters.batch && allocations.length > 0) {
                const batch = allocations.find(a => a.batch?.batch_id == filters.batch);
                if (batch) batchName = batch.batch?.batch_name || batchName;
            }
            
            if (filters.division && allocations.length > 0) {
                const division = allocations.find(a => a.division_id == filters.division);
                if (division) divisionName = division.division?.division_name || divisionName;
            }
            
            if (filters.paper && allocations.length > 0) {
                const allocation = allocations.find(a => 
                    a.subjects?.some(s => s.subject_id == filters.paper)
                );
                if (allocation) {
                    const subject = allocation.subjects.find(s => s.subject_id == filters.paper);
                    if (subject) paperName = subject.name || paperName;
                }
            }

            const attendance = {};
            days.forEach(day => {
                attendance[day] = 'A'; // Default to Absent
            });
            
            // Calculate total presents
            const total = Object.values(attendance).filter(status => status === 'P').length;
            
            return {
                id: i,
                srNo: String(i + 1).padStart(2, '0'),
                rollNo: String(10000 + i),
                name: `Student ${i + 1}`,
                program: programName,
                batch: batchName,
                division: divisionName,
                paper: paperName,
                semester,
                academicYear,
                attendance,
                total
            };
        });
        
        setStudents(initialStudents);
    };

    // Initialize student data when month/year changes or filters change
    useEffect(() => {
        loadStudentsData();
    }, [selectedYear, selectedMonth, filters, allocations]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.attendance-cell') && !event.target.closest('.attendance-dropdown')) {
                setEditingCell(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'P': return 'text-green-600';
            case 'A': return 'text-red-600';
            case 'OL': return 'text-yellow-600';
            case 'ML': return 'text-blue-600';
            default: return 'text-gray-400';
        }
    };

    // Function to get month name
    const getMonthName = (monthNumber) => {
        return months.find(m => m.value === monthNumber)?.label || '';
    };

    // Handle attendance change
    const handleAttendanceChange = (studentId, day, newStatus) => {
        setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(student => {
                if (student.id === studentId) {
                    const updatedAttendance = {
                        ...student.attendance,
                        [day]: newStatus
                    };
                    
                    // Calculate total presents
                    const total = Object.values(updatedAttendance).filter(status => status === 'P').length;
                    
                    return {
                        ...student,
                        attendance: updatedAttendance,
                        total
                    };
                }
                return student;
            });
            
            return updatedStudents;
        });
        
        setHasChanges(true);
        setEditingCell(null);
    };

    // Handle cell click
    const handleCellClick = (studentId, day, event) => {
        if (editingCell && editingCell.studentId === studentId && editingCell.day === day) {
            setEditingCell(null);
        } else {
            setEditingCell({ studentId, day });
        }
    };

    // Handle submit
    const handleSubmit = () => {
        console.log('Submitting attendance data:', students);
        // Here you would typically send data to API
        alert('Attendance submitted successfully!');
        setHasChanges(false);
    };

    // Effect to refetch data when filter changes
    useEffect(() => {
        loadStudentsData();
    }, [selectedYear, selectedMonth]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Main Header */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="space-y-1 mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                        Student Attendance - {getMonthName(selectedMonth)} {selectedYear}
                    </h3>
                    <p className="text-sm text-gray-600">Click on any attendance cell to update status</p>
                </div>
                
                {/* Academic Filters */}
                <AttendanceFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    showFilters={showFilters}
                    onToggleFilters={toggleFilters}
                    onResetFilters={resetFilters}
                    onApplyFilters={applyFilters}
                    allocations={allocations}
                    loadingAllocations={loadingAllocations}
                    compact={true}
                />

                {/* Month/Year Selector and Submit Button */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Month Selector */}
                        <div className="w-full sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Selector */}
                        <div className="w-full sm:w-40">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="mt-2 lg:mt-0">
                        <button
                            onClick={handleSubmit}
                            disabled={!hasChanges}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                hasChanges 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg' 
                                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Submit Attendance
                        </button>
                        {hasChanges && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                ⚠ You have unsaved changes
                            </p>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Present</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-700">Absent</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-yellow-700">On Leave</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Medical Leave</span>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header showing active filters */}
                {(filters.program || filters.batch || filters.academicYear || filters.semester || filters.division || filters.paper) && (
                    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                            {filters.program && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    Program: {allocations.find(a => a.program?.program_id == filters.program)?.program?.program_name || filters.program}
                                </span>
                            )}
                            {filters.batch && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Batch: {allocations.find(a => a.batch?.batch_id == filters.batch)?.batch?.batch_name || filters.batch}
                                </span>
                            )}
                            {filters.academicYear && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                    Academic Year: {allocations.find(a => a.academic_year_id == filters.academicYear)?.academic_year?.name || filters.academicYear}
                                </span>
                            )}
                            {filters.semester && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                    Semester: {allocations.find(a => a.semester_id == filters.semester)?.semester?.name || filters.semester}
                                </span>
                            )}
                            {filters.division && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    Division: {allocations.find(a => a.division_id == filters.division)?.division?.division_name || filters.division}
                                </span>
                            )}
                            {filters.paper && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                    Paper: {(() => {
                                        const allocation = allocations.find(a => 
                                            a.subjects?.some(s => s.subject_id == filters.paper)
                                        );
                                        if (allocation) {
                                            const subject = allocation.subjects.find(s => s.subject_id == filters.paper);
                                            return subject?.name || filters.paper;
                                        }
                                        return filters.paper;
                                    })()}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Horizontal scroll container */}
                <div className="overflow-x-auto relative">
                    <div className="min-w-[800px] sm:min-w-[1000px] lg:min-w-[1200px] xl:min-w-[1400px]">
                        <table className="w-full">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-th text-center">
                                        Sr No
                                    </th>
                                    <th className="table-th text-center">
                                        Roll No.
                                    </th>
                                    <th className="table-th text-center">
                                        Student Name
                                    </th>
                                    {filters.program && (
                                        <th className="table-th text-center">
                                            Program
                                        </th>
                                    )}
                                    {filters.batch && (
                                        <th className="table-th text-center">
                                            Batch
                                        </th>
                                    )}
                                    {filters.division && (
                                        <th className="table-th text-center">
                                            Div
                                        </th>
                                    )}
                                    {filters.paper && (
                                        <th className="table-th text-center">
                                            Paper
                                        </th>
                                    )}
                                    {days.map(day => (
                                        <th key={day} className="table-th text-center">
                                            {day}
                                        </th>
                                    ))}
                                    <th className="table-th text-center">
                                        <div className="flex flex-col items-center">
                                            <span>Total</span>
                                            <span className="text-xs opacity-90">Present</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 border-r border-gray-200 text-gray-600 font-medium sticky left-0 bg-white z-20 hover:bg-gray-50">
                                            <div className="flex items-center justify-center">
                                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm">
                                                    {student.srNo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 border-r border-gray-200 text-gray-700 font-medium sticky left-[60px] bg-white z-20 hover:bg-gray-50">
                                            {student.rollNo}
                                        </td>
                                        <td className="py-3 px-4 border-r border-gray-200 text-left font-semibold text-gray-800 sticky left-[140px] lg:left-[180px] bg-white z-20 hover:bg-gray-50 truncate max-w-[150px] lg:max-w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <span>{student.name}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Conditional columns based on filters */}
                                        {filters.program && (
                                            <td className="py-3 px-2 border-r border-gray-200 text-gray-600 text-left truncate max-w-[100px]">
                                                {student.program}
                                            </td>
                                        )}
                                        {filters.batch && (
                                            <td className="py-3 border-r border-gray-200 text-gray-600">
                                                {student.batch}
                                            </td>
                                        )}
                                        {filters.division && (
                                            <td className="py-3 border-r border-gray-200 text-gray-600">
                                                {student.division}
                                            </td>
                                        )}
                                        {filters.paper && (
                                            <td className="py-3 px-2 border-r border-gray-200 text-gray-600 text-left truncate max-w-[120px]">
                                                {student.paper}
                                            </td>
                                        )}
                                        
                                        {/* Attendance days */}
                                        {days.map(day => (
                                            <td key={day} className="py-2 border-r border-gray-100 p-1 relative">
                                                <div 
                                                    onClick={(e) => handleCellClick(student.id, day, e)}
                                                    className={`attendance-cell flex items-center justify-center w-8 h-8 md:w-9 md:h-9 mx-auto cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                        getStatusStyle(student.attendance[day])
                                                    } ${
                                                        editingCell && editingCell.studentId === student.id && editingCell.day === day
                                                            ? 'ring-1 ring-blue-500 ring-offset-1 z-30'
                                                            : ''
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">
                                                        {student.attendance[day] || ''}
                                                    </span>
                                                </div>
                                                
                                                {/* Dropdown directly in the cell */}
                                                {editingCell && editingCell.studentId === student.id && editingCell.day === day && (
                                                    <div 
                                                        className="attendance-dropdown absolute left-1/2 transform -translate-x-1/2 mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[180px]"
                                                        style={{ top: '100%' }}
                                                    >
                                                        <div className="space-y-2">
                                                            {attendanceOptions.map(option => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => handleAttendanceChange(student.id, day, option.value)}
                                                                    className={`w-full ${option.textColor} px-4 py-3 rounded-lg cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-sm flex items-center justify-between group border`}
                                                                >
                                                                    <span className={`font-bold text-base ${option.textColor}`}>
                                                                        {option.value}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">{option.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        
                                        <td className="py-3">
                                            <div className="flex items-center justify-center">
                                                <span className="font-bold text-gray-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                    {student.total}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600">
                        <div>
                            Showing <span className="font-semibold">{students.length}</span> students
                            {(filters.program || filters.batch || filters.division) && (
                                <span className="ml-2 text-blue-600">
                                    • Filtered
                                </span>
                            )}
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <span>Click cell to edit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                    <span>Editing mode</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}