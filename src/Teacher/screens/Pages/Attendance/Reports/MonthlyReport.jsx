import React, { useState, useEffect } from 'react';
// import HeaderFilters from "../../Timetable/Dashboard/HeaderFilters";
import { timetableService } from '../../Timetable/Services/timetable.service';

const MonthlyReport = () => {
    // Date range state instead of single month
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [selectedSubject, setSelectedSubject] = useState('all');
    const [filterType, setFilterType] = useState('all'); // 'all', 'highest', 'lowest', 'below35'

    // Header filters state
    const [filters, setFilters] = useState({
        program: "",
        programName: "",
        batch: "",
        batchName: "",
        academicYear: "",
        yearName: "",
        semester: "",
        semesterName: "",
        division: "",
        divisionName: "",
    });

    const [apiIds, setApiIds] = useState({
        academicYearId: null,
        semesterId: null,
        divisionId: null,
        collegeId: null
    });

    // Subject/Paper options
    const [paperOptions, setPaperOptions] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(false);

    // Sample data
    const monthlyData = {
        totalWorkingDays: 22,
        averageAttendance: 93.5,
        highestAttendance: 100,
        lowestAttendance: 81.82,
        below35Count: 0
    };

    const allPersonWiseData = [
        { id: 1, rollNo: '1001', name: 'Rajesh Kumar', present: 20, absent: 2, percentage: 90.91 },
        { id: 2, rollNo: '1002', name: 'Priya Sharma', present: 22, absent: 0, percentage: 100 },
        { id: 3, rollNo: '1003', name: 'Amit Patel', present: 19, absent: 3, percentage: 86.36 },
        { id: 4, rollNo: '1004', name: 'Sneha Reddy', present: 21, absent: 1, percentage: 95.45 },
        { id: 5, rollNo: '1005', name: 'Vikram Singh', present: 18, absent: 4, percentage: 81.82 },
        { id: 6, rollNo: '1006', name: 'Anita Desai', present: 22, absent: 0, percentage: 100 },
        { id: 7, rollNo: '1007', name: 'Rahul Verma', present: 20, absent: 2, percentage: 90.91 },
        { id: 8, rollNo: '1008', name: 'Kavita Nair', present: 21, absent: 1, percentage: 95.45 },
    ];

    // Extract numeric IDs from filters
    useEffect(() => {
        const extractNumericId = (str) => {
            if (!str) return null;
            const match = str.toString().match(/\d+/);
            return match ? Number(match[0]) : Number(str);
        };

        setApiIds(prev => ({
            ...prev,
            academicYearId: extractNumericId(filters.academicYear),
            semesterId: extractNumericId(filters.semester),
            divisionId: extractNumericId(filters.division)
        }));
    }, [filters.academicYear, filters.semester, filters.division]);

    // Initialize collegeId
    useEffect(() => {
        const college = JSON.parse(localStorage.getItem("activeCollege"));
        if (college?.id) {
            setApiIds(prev => ({
                ...prev,
                collegeId: Number(college.id)
            }));
        }
    }, []);

    // Fetch papers/subjects
    useEffect(() => {
        const fetchPapers = async () => {
            if (!apiIds.academicYearId || !apiIds.semesterId) {
                setPaperOptions([]);
                setSelectedSubject('all');
                return;
            }

            try {
                setLoadingPapers(true);
                const papers = await timetableService.getPaperAllocationsByAcademicYearAndSemester(
                    apiIds.academicYearId,
                    apiIds.semesterId
                );

                const formattedPapers = papers.map(paper => ({
                    value: paper.allocation_id.toString(),
                    label: `${paper.subject?.name || 'Unnamed Paper'}`,
                    id: paper.allocation_id,
                    name: paper.subject?.name || 'Unnamed Paper',
                    code: paper.subject?.subject_code || ''
                }));

                setPaperOptions(formattedPapers);
            } catch (error) {
                console.error('Error loading papers:', error);
                setPaperOptions([]);
            } finally {
                setLoadingPapers(false);
            }
        };

        fetchPapers();
    }, [apiIds.academicYearId, apiIds.semesterId]);

    // Filter and sort data based on filterType
    const getFilteredData = () => {
        let filtered = [...allPersonWiseData];

        switch (filterType) {
            case 'highest':
                // Sort descending by percentage
                return filtered.sort((a, b) => b.percentage - a.percentage);
            case 'lowest':
                // Sort ascending by percentage
                return filtered.sort((a, b) => a.percentage - b.percentage);
            case 'below35':
                // Filter only below 35%
                return filtered.filter(person => person.percentage < 35);
            case 'all':
            default:
                return filtered;
        }
    };

    const personWiseData = getFilteredData();

    const handleExport = () => {
        console.log('Exporting monthly report to Excel');
    };

    const handleCardClick = (type) => {
        setFilterType(type);
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getCardTitle = () => {
        const dateRange = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;

        switch (filterType) {
            case 'highest':
                return `Highest Attendance (${dateRange})`;
            case 'lowest':
                return `Lowest Attendance (${dateRange})`;
            case 'below35':
                return `Below 35% Attendance (${dateRange})`;
            case 'all':
            default:
                return `Period Report (${dateRange})`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Filters */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Academic Filters</h3>
                {/* <HeaderFilters
                    filters={filters}
                    setFilters={setFilters}
                /> */}
            </div>

            {/* Additional Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* From Date */}
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

                {/* To Date */}
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

                {/* Subject/Paper */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject / Paper
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!apiIds.academicYearId || !apiIds.semesterId || loadingPapers}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="all">All Subjects</option>
                        {loadingPapers ? (
                            <option value="" disabled>Loading subjects...</option>
                        ) : (
                            paperOptions.map(paper => (
                                <option key={paper.id} value={paper.value}>
                                    {paper.label}
                                </option>
                            ))
                        )}
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

            {/* Summary Cards - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. All Students - Average Attendance */}
                <button
                    onClick={() => handleCardClick('all')}
                    className={`bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'all' ? 'border-green-500 shadow-lg' : 'border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-green-600 mb-1">Avg Attendance</p>
                            <p className="text-3xl font-bold text-green-900">{monthlyData.averageAttendance}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 2. Highest Attendance */}
                <button
                    onClick={() => handleCardClick('highest')}
                    className={`bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'highest' ? 'border-blue-500 shadow-lg' : 'border-blue-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-600 mb-1">Highest Attendance</p>
                            <p className="text-3xl font-bold text-blue-900">{monthlyData.highestAttendance}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 3. Lowest Attendance */}
                <button
                    onClick={() => handleCardClick('lowest')}
                    className={`bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'lowest' ? 'border-orange-500 shadow-lg' : 'border-orange-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-orange-600 mb-1">Lowest Attendance</p>
                            <p className="text-3xl font-bold text-orange-900">{monthlyData.lowestAttendance}%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            </svg>
                        </div>
                    </div>
                </button>

                {/* 4. Below 35% */}
                <button
                    onClick={() => handleCardClick('below35')}
                    className={`bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${filterType === 'below35' ? 'border-red-500 shadow-lg' : 'border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm font-medium text-red-600 mb-1">Below 35%</p>
                            <p className="text-3xl font-bold text-red-900">{monthlyData.below35Count}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                    </div>
                </button>
            </div>

            {/* Monthly Report Table - TimeTableList Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">{getCardTitle()}</h3>
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-bold text-blue-600">{personWiseData.length}</span> records
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">ID / Roll No</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Name</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Present</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Absent</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Percentage</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-medium tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {personWiseData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                            </svg>
                                            <p className="text-lg font-medium">No records found</p>
                                            <p className="text-sm mt-1">No students found matching the selected criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                personWiseData.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-700">{person.rollNo}</td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium text-gray-900">{person.name}</td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                {person.present}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                {person.absent}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-sm font-bold text-gray-900">
                                            {person.percentage}%
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${person.percentage >= 95 ? 'bg-green-100 text-green-700' :
                                                person.percentage >= 85 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {person.percentage >= 95 ? 'Excellent' :
                                                    person.percentage >= 85 ? 'Good' : 'Poor'}
                                            </span>
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
