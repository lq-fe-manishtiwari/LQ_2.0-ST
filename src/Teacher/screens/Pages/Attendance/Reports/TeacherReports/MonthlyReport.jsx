import React, { useEffect, useState } from 'react';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
import { TeacherAttendanceManagement } from '../../Services/attendance.service';

const MonthlyReport = () => {

    const { getApiIds, isLoaded } = useUserProfile();

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1)
            .toISOString()
            .split('T')[0];
    });

    const [endDate, setEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [summaryData, setSummaryData] = useState(null);
    const [allStaffData, setAllStaffData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;

        const { collegeId, teacherId } = getApiIds();
        if (!collegeId || !teacherId) return;

        fetchAttendanceReport(collegeId, teacherId);
    }, [isLoaded, startDate, endDate]);

    const fetchAttendanceReport = async (collegeId, teacherId) => {
        setLoading(true);
        try {
            const response = await TeacherAttendanceManagement.getTeacherAttendanceSummaryReports(
                collegeId,
                teacherId,
                startDate,
                endDate
            );

            if (response.success && response.data) {
                const data = response.data;
                setSummaryData({
                    totalDays: data.total_days,
                    presentDays: data.total_present_days,
                    absentDays: data.total_absent_days,
                    attendancePercentage: data.attendance_percentage
                });
                setAllStaffData(data.daily_details || []);
            }
        } catch (error) {
            console.error('Attendance fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex-1">
                    <label className="block text-sm mb-2">From Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm mb-2">To Date</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg"
                    />
                </div>
            </div>

            {loading && (
                <p className="text-center text-gray-500">Loading attendance...</p>
            )}

            {/* Summary */}
            {summaryData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-100 p-6 rounded-xl">
                        <p>Total Days</p>
                        <p className="text-3xl font-bold">{summaryData.totalDays}</p>
                    </div>

                    <div className="bg-green-100 p-6 rounded-xl">
                        <p>Present Days</p>
                        <p className="text-3xl font-bold">{summaryData.presentDays}</p>
                    </div>

                    <div className="bg-red-100 p-6 rounded-xl">
                        <p>Absent Days</p>
                        <p className="text-3xl font-bold">{summaryData.absentDays}</p>
                    </div>

                    <div className="bg-purple-100 p-6 rounded-xl">
                        <p>Attendance %</p>
                        <p className="text-3xl font-bold">
                            {summaryData.attendancePercentage}%
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-blue-800 text-white">
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Lectures</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!loading && allStaffData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-6">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            allStaffData.map((row, index) => (
                                <tr key={index} className="border-b">
                                    <td className="text-center py-3">
                                        {formatDateForDisplay(row.date)}
                                    </td>
                                    <td className="text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs ${row.attendanceStatus === 'Present'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {row.attendanceStatus}
                                        </span>
                                    </td>
                                    <td className="text-center">{row.daily_lecture_scheduled_count}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default MonthlyReport;
