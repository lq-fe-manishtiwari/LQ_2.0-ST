import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { Download, Search, Loader2, FileSpreadsheet, FileText, FileJson, ChevronDown, Filter, ChevronUp, Calendar } from 'lucide-react';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
import { TeacherAttendanceManagement } from '../../Services/attendance.service';

const MonthlyReport = () => {
    const { getApiIds, isLoaded } = useUserProfile();

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });

    const [endDate, setEndDate] = useState(new Date());

    const [summaryData, setSummaryData] = useState(null);
    const [allStaffData, setAllStaffData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    // Export Dropdown State
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const { collegeId, teacherId } = getApiIds();
        if (!collegeId || !teacherId) return;

        fetchAttendanceReport(collegeId, teacherId);
    }, [isLoaded, startDate, endDate]);

    const fetchAttendanceReport = async (collegeId, teacherId) => {
        setLoading(true);
        const formattedStart = moment(startDate).format('YYYY-MM-DD');
        const formattedEnd = moment(endDate).format('YYYY-MM-DD');
        try {
            const response = await TeacherAttendanceManagement.getTeacherAttendanceSummaryReports(
                collegeId,
                teacherId,
                formattedStart,
                formattedEnd
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
            month: '2-digit',
            year: 'numeric',
        }).replace(/\//g, '-');
    };

    const filteredData = allStaffData.filter(row => {
        if (!searchTerm) return true;
        const lower = searchTerm.toLowerCase();
        return (
            row.date?.toLowerCase().includes(lower) ||
            row.attendance_status?.toLowerCase().includes(lower) ||
            formatDateForDisplay(row.date).toLowerCase().includes(lower)
        );
    });

    const formattedRange = `${moment(startDate).format('DD-MM-YYYY')} - ${moment(endDate).format('DD-MM-YYYY')}`;

    // Exports
    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text('Teacher Monthly Attendance Report', 140, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Period: ${formattedRange}`, 14, 22);

        autoTable(doc, {
            head: [['Date', 'Status', 'Marked', 'Unmarked', 'Scheduled']],
            body: filteredData.map(row => [
                formatDateForDisplay(row.date),
                row.attendance_status,
                row.daily_marked_attendance_count,
                row.daily_unmarked_attendance_count,
                row.daily_lecture_scheduled_count
            ]),
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`Teacher_Attendance_${formattedRange}.pdf`);
        setShowExportMenu(false);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => ({
            'Date': formatDateForDisplay(row.date),
            'Status': row.attendance_status,
            'Marked': row.daily_marked_attendance_count,
            'Unmarked': row.daily_unmarked_attendance_count,
            'Scheduled': row.daily_lecture_scheduled_count
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Teacher_Attendance_${formattedRange}.xlsx`);
        setShowExportMenu(false);
    };

    const downloadCSV = () => {
        const headers = ["Date,Status,Marked,Unmarked,Scheduled"];
        const rows = filteredData.map(row => `"${formatDateForDisplay(row.date)}","${row.attendance_status}","${row.daily_marked_attendance_count}","${row.daily_unmarked_attendance_count}","${row.daily_lecture_scheduled_count}"`);
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Teacher_Attendance_${formattedRange}.csv`;
        link.click();
        setShowExportMenu(false);
    };

    // Mobile View Card
    const MobileAttendanceCard = ({ row }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-gray-800">{formatDateForDisplay(row.date)}</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-2 tracking-wide ${row.status_code === 'P' ? 'bg-green-100 text-green-700' :
                        row.status_code === 'A' ? 'bg-red-100 text-red-700' :
                            row.status_code === 'M' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {row.attendance_status}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Scheduled</p>
                    <p className="text-lg font-bold text-blue-600 leading-none">{row.daily_lecture_scheduled_count}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                <div className="bg-green-50/50 p-2 rounded-lg">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Marked</p>
                    <p className="text-sm font-bold text-green-700">{row.daily_marked_attendance_count}</p>
                </div>
                <div className="bg-orange-50/50 p-2 rounded-lg">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-0.5">Unmarked</p>
                    <p className="text-sm font-bold text-orange-700">{row.daily_unmarked_attendance_count}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-end gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <div className="relative">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full lg:flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <div className="relative">
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd-MM-yyyy"
                            minDate={startDate}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full lg:flex-1 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search date or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Export Dropdown */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={loading || filteredData.length === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-green-600 border border-green-700 rounded-lg text-white hover:bg-green-700 shadow-md transition-all ${(loading || filteredData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-1">
                                <button onClick={downloadExcel} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <span>Excel (.xlsx)</span>
                                </button>
                                <button onClick={downloadCSV} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span>CSV (.csv)</span>
                                </button>
                                <button onClick={downloadPDF} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors">
                                    <FileJson className="w-4 h-4 text-red-600" />
                                    <span>PDF (.pdf)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            )}

            {/* Summary Cards */}
            {summaryData && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Days</p>
                        <p className="text-3xl font-bold text-blue-900">{summaryData.totalDays}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                        <p className="text-sm font-medium text-green-600 mb-1">Present Days</p>
                        <p className="text-3xl font-bold text-green-900">{summaryData.presentDays}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                        <p className="text-sm font-medium text-red-600 mb-1">Absent Days</p>
                        <p className="text-3xl font-bold text-red-900">{summaryData.absentDays}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                        <p className="text-sm font-medium text-purple-600 mb-1">Attendance %</p>
                        <p className="text-3xl font-bold text-purple-900">{summaryData.attendancePercentage}%</p>
                    </div>
                </div>
            )}

            {/* Records List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Attendance Details</h3>
                    <p className="text-sm text-gray-500">Showing {filteredData.length} entries</p>
                </div>

                {isMobileView ? (
                    <div className="p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                        {!loading && filteredData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                No records found.
                            </div>
                        ) : (
                            filteredData.map((row, index) => (
                                <MobileAttendanceCard key={index} row={row} />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="max-h-[500px] overflow-y-auto blue-scrollbar">
                            <table className="w-full min-w-max">
                                <thead className="bg-blue-800 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-xs font-bold  tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold  tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold  tracking-wider">Marked</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold  tracking-wider">Unmarked</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold  tracking-wider">Lectures</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 font-medium">
                                    {!loading && filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-white">
                                                No records found matching the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((row, index) => (
                                            <tr key={index} className="hover:bg-blue-50 transition-all duration-150 bg-white">
                                                <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                    {formatDateForDisplay(row.date)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-4 py-1 rounded-full text-[11px] font-bold  tracking-wide ${row.status_code === 'P' ? 'bg-green-100 text-green-700' :
                                                        row.status_code === 'A' ? 'bg-red-100 text-red-700' :
                                                            row.status_code === 'M' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {row.attendance_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-green-600 font-bold">
                                                    {row.daily_marked_attendance_count}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-orange-600 font-bold">
                                                    {row.daily_unmarked_attendance_count}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-blue-600 font-bold">
                                                    {row.daily_lecture_scheduled_count}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
