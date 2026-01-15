import React, { useState, useEffect } from 'react';
// import HeaderFilters from "../../../Timetable/Dashboard/HeaderFilters";
// import { timetableService } from '../../../Timetable/Services/timetable.service';

const StudentDailyReport = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [filterType, setFilterType] = useState('all'); // 'all', 'present', 'absent'

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

    // Student data
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // Mock student data (replace with actual API call)
    useEffect(() => {
        // Simulate API call
        const mockStudents = Array(50).fill().map((_, i) => ({
            id: i + 1,
            rollNo: `2024${String(i + 1).padStart(3, '0')}`,
            name: `Student ${i + 1}`,
            status: i % 3 === 0 ? 'A' : i % 5 === 0 ? 'OL' : i % 7 === 0 ? 'ML' : 'P',
            reason: i % 3 === 0 ? 'Not Specified' : i % 5 === 0 ? 'Family Function' : i % 7 === 0 ? 'Sick Leave' : '-'
        }));

        setAllStudents(mockStudents);
    }, [selectedDate, selectedSubject, filters]);

    // Calculate statistics
    const stats = {
        total: allStudents.length,
        present: allStudents.filter(s => s.status === 'P').length,
        absent: allStudents.filter(s => s.status === 'A').length,
        onLeave: allStudents.filter(s => s.status === 'OL' || s.status === 'ML').length,
    };
    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    // Filter students based on filterType
    const filteredStudents = allStudents.filter(student => {
        if (filterType === 'all') return true;
        if (filterType === 'present') return student.status === 'P';
        if (filterType === 'absent') return student.status === 'A' || student.status === 'OL' || student.status === 'ML';
        return true;
    });

    const handleExport = () => {
        console.log('Exporting to Excel...');
        // Implement Excel export logic
    };

    const handleCardClick = (type) => {
        setFilterType(type);
    };

    return (
        <div className="space-y-6">
            {/* Academic Filters */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Academic Filters</h3>
                {/* <HeaderFilters
                    filters={filters}
                    setFilters={setFilters}
                /> */}
            </div>

            {/* Date, Subject and Export */}
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
                        Paper
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!apiIds.academicYearId || !apiIds.semesterId || loadingPapers}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                        <option value="all">Select Paper</option>
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
                <div
                    onClick={() => handleCardClick('all')}
                    className={`cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'all' ? 'border-blue-600 shadow-md' : 'border-blue-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Total Students</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleCardClick('present')}
                    className={`cursor-pointer bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'present' ? 'border-green-600 shadow-md' : 'border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Present</p>
                            <p className="text-3xl font-bold text-green-900">{stats.present}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleCardClick('absent')}
                    className={`cursor-pointer bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 transition-all hover:shadow-lg ${filterType === 'absent' ? 'border-red-600 shadow-md' : 'border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Absent</p>
                            <p className="text-3xl font-bold text-red-900">{stats.absent}</p>
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
                            <p className="text-3xl font-bold text-purple-900">{stats.percentage}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Info */}
            {filterType !== 'all' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-800">
                            Showing {filteredStudents.length} {filterType === 'present' ? 'present' : 'absent'} students
                        </p>
                        <button
                            onClick={() => setFilterType('all')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Show All
                        </button>
                    </div>
                </div>
            )}

            {/* Student List Table - TimeTableList.jsx Style */}
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">
                        {filterType === 'all' ? 'All Students' : filterType === 'present' ? 'Present Students' : 'Absent Students'}
                    </h3>
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-bold text-blue-600">{filteredStudents.length}</span> {filterType === 'all' ? 'students' : filterType === 'present' ? 'present' : 'absent'}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="px-4 py-3 sm:px-6 sm:py-4  text-xs font-medium tracking-wider">Roll No</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4  text-xs font-medium tracking-wider">Student Name</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4  text-xs font-medium tracking-wider">Status</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4  text-xs font-medium tracking-wider">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div>No students found</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-700">{student.rollNo}</td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status === 'P' ? 'bg-green-100 text-green-700' :
                                                student.status === 'ML' ? 'bg-blue-100 text-blue-700' :
                                                    student.status === 'OL' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {student.status === 'P' ? 'Present' :
                                                    student.status === 'ML' ? 'Medical Leave' :
                                                        student.status === 'OL' ? 'On Leave' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-600">{student.reason}</td>
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

export default StudentDailyReport;
