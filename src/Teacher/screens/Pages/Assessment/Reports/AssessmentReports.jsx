import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Calendar, Loader2, FileSpreadsheet, FileText, FileJson, ChevronDown, Search, Filter, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { ReportsService } from '../Services/reports.service';
import AssessmentMultiSelectFilter from './AssessmentMultiSelectFilter';

const AssessmentReports = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        program: [],
        batch: [],
        academicYear: [],
        semester: [],
        subject: [],
        status: []
    });

    // Pagination State
    const entriesPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
    const collegeId = activeCollege?.id;

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

    const isAnyFilterActive = () => {
        return filters.program.length > 0 || filters.batch.length > 0 || filters.academicYear.length > 0 ||
            filters.semester.length > 0 || filters.subject.length > 0 || filters.status.length > 0;
    };

    const fetchAssessments = async () => {
        if (!collegeId) return;

        // Only fetch if academicYear is selected -> REMOVED to allow fetching all
        // if (!filters.academicYear || filters.academicYear.length === 0) {
        //     setAssessments([]);
        //     return;
        // }

        try {
            setLoading(true);
            setCurrentPage(1);

            const payload = {
                college_id: collegeId,
                program_ids: filters.program,
                batch_ids: filters.batch,
                academicYear_ids: filters.academicYear,
                semester_ids: filters.semester,
                subject_ids: filters.subject
            };


            const res = await ReportsService.getAssessmentReport(payload);

            const data = Array.isArray(res) ? res : (res?.data || []);
            setAssessments(data);
        } catch (error) {
            console.error("Error fetching assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, [collegeId, filters.program, filters.batch, filters.academicYear, filters.semester, filters.subject, filters.status]);

    const filteredAssessments = useMemo(() => {
        return assessments.filter(assessment => {
            // Filter by Status (if selected)
            if (filters.status.length > 0 && !filters.status.includes(assessment.status)) {
                return false;
            }
            // Filter by Subject (if selected)
            if (filters.subject.length > 0 && !filters.subject.map(String).includes(String(assessment.subject_id))) {
                return false;
            }
            // Filter by Search
            const title = assessment.title || '';
            const matchesSearch = !filters.search || title.toLowerCase().includes(filters.search.toLowerCase());
            return matchesSearch;
        });
    }, [filters, assessments]);

    // Paginated Data
    const paginatedData = useMemo(() => {
        const totalEntries = filteredAssessments.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
        const start = (safePage - 1) * entriesPerPage;
        const end = Math.min(start + entriesPerPage, totalEntries);
        const currentEntries = filteredAssessments.slice(start, end);

        return { currentEntries, totalEntries, totalPages, start, end };
    }, [filteredAssessments, currentPage]);

    const { currentEntries, totalEntries, totalPages, start, end } = paginatedData;

    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

    useEffect(() => {
        const totalPages = Math.ceil(filteredAssessments.length / entriesPerPage);
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredAssessments.length]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    /* ==================== EXPORTS ==================== */
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text('Assessment Report - LearnQoch', 140, 15, { align: 'center' });

        const tableData = filteredAssessments.map((assessment, index) => [
            index + 1,
            assessment.title || '-',
            assessment.subject_name || '-',
            assessment.type === 'STANDARD' ? 'Standard' : assessment.type === 'RUBRIC' ? 'Rubric' : assessment.type || '-',
            assessment.mode || '-',
            formatDate(assessment.test_start_datetime),
            formatDate(assessment.test_end_datetime),
            assessment.status || '-',
            assessment.questions ? assessment.questions.length : 0
        ]);

        autoTable(doc, {
            head: [['S.No', 'Assessment Title', 'Subject', 'Type', 'Mode', 'Start Date', 'End Date', 'Status', 'Questions']],
            body: tableData,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        doc.save('Assessment_Report.pdf');
        setShowExportMenu(false);
    };

    const downloadExcel = () => {
        const excelData = filteredAssessments.map((assessment, index) => ({
            "S.No": index + 1,
            "Assessment Title": assessment.title || '-',
            "Subject": assessment.subject_name || '-',
            "Type": assessment.type === 'STANDARD' ? 'Standard' : assessment.type === 'RUBRIC' ? 'Rubric' : assessment.type || '-',
            "Mode": assessment.mode || '-',
            "Start Date": formatDate(assessment.test_start_datetime),
            "End Date": formatDate(assessment.test_end_datetime),
            "Status": assessment.status || '-',
            "Total Questions": assessment.questions ? assessment.questions.length : 0
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Assessments');
        XLSX.writeFile(wb, 'Assessment_Report.xlsx');
        setShowExportMenu(false);
    };

    const downloadCSV = () => {
        if (!filteredAssessments.length) return;

        const headers = ["S.No,Assessment Title,Subject,Type,Mode,Start Date,End Date,Status,Total Questions"];
        const rows = filteredAssessments.map((assessment, index) => {
            const rowData = [
                index + 1,
                assessment.title || '-',
                assessment.subject_name || '-',
                assessment.type === 'STANDARD' ? 'Standard' : assessment.type === 'RUBRIC' ? 'Rubric' : assessment.type || '-',
                assessment.mode || '-',
                formatDate(assessment.test_start_datetime),
                formatDate(assessment.test_end_datetime),
                assessment.status || '-',
                assessment.questions ? assessment.questions.length : 0
            ];
            return `"${rowData.join('","')}"`;
        });

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Assessment_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const clearFilters = () => {
        setFilters({ search: '', program: [], batch: [], academicYear: [], semester: [], subject: [], status: [] });
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Assessment Report <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">({filteredAssessments.length})</span>
                </h2>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        <span className="truncate">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        {showFilters ? (
                            <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" />
                        ) : (
                            <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        )}
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative flex-1 sm:flex-none w-full sm:w-auto" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={!filteredAssessments.length || loading}
                            className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium bg-green-600 border border-green-700 rounded-lg text-white hover:bg-green-700 shadow-md transition-all ${(!filteredAssessments.length || loading) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span>Export</span>
                            <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showExportMenu ? 'rotate-180' : ''}`} />
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
            </div>

            {showFilters && (
                <div className="mb-6 p-5 bg-white rounded-2xl shadow-md border border-gray-200/60">
                    <AssessmentMultiSelectFilter filters={filters} setFilters={setFilters} includeSubject={true} />

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                        {/* Search */}
                        <div className="relative">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block ml-0.5">Search</label>
                            <input
                                type="text"
                                placeholder="Search assessments..."
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm transition-all"
                            />
                        </div>

                        {/* Status Multi-Select */}
                        <div className="relative">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block ml-0.5">Status</label>
                            <select
                                multiple
                                value={filters.status}
                                onChange={e => setFilters({ ...filters, status: Array.from(e.target.selectedOptions, option => option.value) })}
                                className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm transition-all"
                                size="3"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-start mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-md border border-gray-200/60 overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead className="table-header">
                        <tr>
                            <th className="px-4 py-3 text-left">S.No</th>
                            <th className="px-4 py-3 text-left">Assessment Title</th>
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Mode</th>
                            <th className="px-4 py-3 text-left">Start Date</th>
                            <th className="px-4 py-3 text-left">End Date</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Questions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                        <p>Loading assessment records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : currentEntries.length > 0 ? (
                            currentEntries.map((assessment, index) => (
                                <tr key={assessment.assessment_id || index} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className="px-4 py-3">{start + index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {assessment.title || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{assessment.subject_name || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {assessment.type === 'STANDARD' ? 'Standard' : assessment.type === 'RUBRIC' ? 'Rubric' : assessment.type || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{assessment.mode || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(assessment.test_start_datetime)}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(assessment.test_end_datetime)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assessment.status === 'Published' ? 'bg-green-100 text-green-800' :
                                            assessment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {assessment.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{assessment.questions ? assessment.questions.length : 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="p-12 text-center text-gray-500 bg-gray-50">
                                    {filters?.academicYear?.length ? "No assessment records found." : "Please select filters to view assessments."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mb-6">
                {loading ? (
                    <div className="px-4 py-12 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p>Loading assessment records...</p>
                    </div>
                ) : currentEntries.length > 0 ? (
                    currentEntries.map((assessment, index) => (
                        <div key={assessment.assessment_id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 leading-snug">{assessment.title || '-'}</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">{assessment.subject_name || 'No Subject'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${assessment.status === 'Published' ? 'bg-green-100 text-green-700' :
                                    assessment.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {assessment.status || 'DRAFT'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 mt-4 text-xs">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Type</p>
                                    <p className="text-gray-700 font-medium truncate">
                                        {assessment.type === 'STANDARD' ? 'Standard' : assessment.type === 'RUBRIC' ? 'Rubric' : assessment.type || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Mode</p>
                                    <p className="text-gray-700 font-medium">{assessment.mode || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Start Date</p>
                                    <p className="text-gray-700 font-medium text-xs">{formatDate(assessment.test_start_datetime)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">End Date</p>
                                    <p className="text-gray-700 font-medium text-xs">{formatDate(assessment.test_end_datetime)}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                                <div className="flex items-center text-gray-500 text-[10px]">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>Questions: {assessment.questions ? assessment.questions.length : 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        {filters?.academicYear?.length ? "No assessment records found." : "Please select filters to view assessments."}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredAssessments.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white rounded-2xl shadow-md border border-gray-200/60 text-sm text-gray-600 gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                        >
                            Previous
                        </button>

                        <span className="text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 sm:hidden">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                        >
                            Next
                        </button>
                    </div>

                    <span className="text-gray-700 font-medium bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hidden sm:inline-block">
                        Showing <strong className="text-blue-600">{start + 1}</strong>–<strong className="text-blue-600">{Math.min(end, totalEntries)}</strong> of <strong className="text-blue-600">{totalEntries}</strong> entries
                    </span>
                </div>
            )}
        </div>
    );
};

export default AssessmentReports;
