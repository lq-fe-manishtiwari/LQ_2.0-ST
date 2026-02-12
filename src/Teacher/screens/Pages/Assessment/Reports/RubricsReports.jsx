import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Loader2, FileSpreadsheet, FileText, FileJson, ChevronDown, Search, Filter, ChevronUp, Target, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReportsService } from '../Services/reports.service';
import AssessmentMultiSelectFilter from './AssessmentMultiSelectFilter';

const RubricsReports = () => {
    const [rubrics, setRubrics] = useState([]);
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

    const fetchRubrics = async () => {
        if (!collegeId) return;

        // Only fetch if academicYear is selected -> REMOVED
        // if (!filters.academicYear || filters.academicYear.length === 0) {
        //     setRubrics([]);
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
                subject_ids: filters.subject,
                status: filters.status.length > 0 ? filters.status.includes('Active') : null
            };

            const res = await ReportsService.getRubricReport(payload);
            const data = Array.isArray(res) ? res : (res?.data || []);
            setRubrics(data);
        } catch (error) {
            console.error("Error fetching rubrics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRubrics();
    }, [collegeId, filters.program, filters.batch, filters.academicYear, filters.semester, filters.subject, filters.status]);

    const filteredRubrics = useMemo(() => {
        return rubrics.filter(rubric => {
            // Filter by Status
            if (filters.status.length > 0) {
                const statusMatch = filters.status.some(status => {
                    if (status === 'Active') return rubric.active === true;
                    if (status === 'Inactive') return rubric.active === false;
                    return false;
                });
                if (!statusMatch) return false;
            }

            // Filter by Subject
            if (filters.subject.length > 0 && !filters.subject.map(String).includes(String(rubric.subject_id))) {
                return false;
            }

            // Filter by Search
            const searchTerm = filters.search.toLowerCase();
            if (searchTerm) {
                const matchesCode = (rubric.code || '').toLowerCase().includes(searchTerm);
                const matchesName = (rubric.name || '').toLowerCase().includes(searchTerm);
                const matchesDescription = (rubric.description || '').toLowerCase().includes(searchTerm);
                return matchesCode || matchesName || matchesDescription;
            }

            return true;
        });
    }, [filters, rubrics]);

    // Paginated Data
    const paginatedData = useMemo(() => {
        const totalEntries = filteredRubrics.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
        const start = (safePage - 1) * entriesPerPage;
        const end = Math.min(start + entriesPerPage, totalEntries);
        const currentEntries = filteredRubrics.slice(start, end);

        return { currentEntries, totalEntries, totalPages, start, end };
    }, [filteredRubrics, currentPage]);

    const { currentEntries, totalEntries, totalPages, start, end } = paginatedData;

    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

    useEffect(() => {
        const totalPages = Math.ceil(filteredRubrics.length / entriesPerPage);
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredRubrics.length]);

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
        doc.text('Rubrics Report - LearnQoch', 140, 15, { align: 'center' });

        const tableData = filteredRubrics.map((rubric, index) => [
            index + 1,
            rubric.code || '-',
            rubric.name || '-',
            rubric.subject_name || '-',
            rubric.course_outcome || '-',
            rubric.blooms_level || '-',
            rubric.total_marks || '-',
            rubric.weightage ? `${rubric.weightage}%` : '-',
            rubric.criteria_count || '-',
            rubric.active ? 'Active' : 'Inactive'
        ]);

        autoTable(doc, {
            head: [['S.No', 'Code', 'Rubric Name', 'Subject', 'Course Outcome', "Bloom's Level", 'Total Marks', 'Weightage', 'Criteria', 'Status']],
            body: tableData,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8 }
        });
        doc.save('Rubrics_Report.pdf');
        setShowExportMenu(false);
    };

    const downloadExcel = () => {
        const excelData = filteredRubrics.map((rubric, index) => ({
            "S.No": index + 1,
            "Code": rubric.code || '-',
            "Rubric Name": rubric.name || '-',
            "Description": rubric.description || '-',
            "Program": rubric.program_name || '-',
            "Subject": rubric.subject_name || '-',
            "Semester": rubric.semester_name || '-',
            "Course Outcome": rubric.course_outcome || '-',
            "Bloom's Level": rubric.blooms_level || '-',
            "Total Marks": rubric.total_marks || '-',
            "Weightage (%)": rubric.weightage || '-',
            "Criteria Count": rubric.criteria_count || '-',
            "Status": rubric.active ? 'Active' : 'Inactive',
            "Created Date": formatDate(rubric.created_date)
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rubrics');
        XLSX.writeFile(wb, 'Rubrics_Report.xlsx');
        setShowExportMenu(false);
    };

    const downloadCSV = () => {
        if (!filteredRubrics.length) return;

        const headers = ["S.No,Code,Rubric Name,Description,Subject,Course Outcome,Bloom's Level,Total Marks,Weightage (%),Criteria Count,Status"];
        const rows = filteredRubrics.map((rubric, index) => {
            const rowData = [
                index + 1,
                rubric.code || '-',
                (rubric.name || '-').replace(/"/g, '""'),
                (rubric.description || '-').replace(/"/g, '""'),
                rubric.subject_name || '-',
                rubric.course_outcome || '-',
                rubric.blooms_level || '-',
                rubric.total_marks || '-',
                rubric.weightage || '-',
                rubric.criteria_count || '-',
                rubric.active ? 'Active' : 'Inactive'
            ];
            return `"${rowData.join('","')}"`;
        });

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Rubrics_Report.csv");
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
                    Rubrics Report <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">({filteredRubrics.length})</span>
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
                            disabled={!filteredRubrics.length || loading}
                            className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium bg-green-600 border border-green-700 rounded-lg text-white hover:bg-green-700 shadow-md transition-all ${(!filteredRubrics.length || loading) ? 'opacity-50 cursor-not-allowed' : ''
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                        {/* Search */}
                        <div className="relative">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block ml-0.5">Search</label>
                            <input
                                type="text"
                                placeholder="Search by code, name or description..."
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
                                size="2"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
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
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Rubric Name</th>
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-left">Course Outcome</th>
                            <th className="px-4 py-3 text-left">Bloom's Level</th>
                            <th className="px-4 py-3 text-center">Total Marks</th>
                            <th className="px-4 py-3 text-center">Weightage</th>
                            <th className="px-4 py-3 text-center">Criteria</th>
                            <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                        <p>Loading rubrics records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : currentEntries.length > 0 ? (
                            currentEntries.map((rubric, index) => (
                                <tr key={rubric.rubric_id || index} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className="px-4 py-3">{start + index + 1}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{rubric.code || '-'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{rubric.name || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{rubric.subject_name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                                            <Target size={12} />
                                            {rubric.course_outcome || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                                            <Award size={12} />
                                            {rubric.blooms_level || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{rubric.total_marks || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-semibold">
                                            {rubric.weightage ? `${rubric.weightage}%` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">{rubric.criteria_count || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rubric.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {rubric.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="p-12 text-center text-gray-500 bg-gray-50">
                                    {filters?.academicYear?.length ? "No rubrics records found." : "Please select filters to view rubrics."}
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
                        <p>Loading rubrics records...</p>
                    </div>
                ) : currentEntries.length > 0 ? (
                    currentEntries.map((rubric, index) => (
                        <div key={rubric.rubric_id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <p className="text-xs font-mono text-blue-600 font-semibold mb-1">{rubric.code || '-'}</p>
                                    <h3 className="font-bold text-gray-800 leading-snug">{rubric.name || '-'}</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">{rubric.subject_name || 'No Subject'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rubric.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {rubric.active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 mt-4 text-xs">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Course Outcome</p>
                                    <p className="text-gray-700 font-medium inline-flex items-center gap-1">
                                        <Target size={12} className="text-purple-600" />
                                        {rubric.course_outcome || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Bloom's Level</p>
                                    <p className="text-gray-700 font-medium inline-flex items-center gap-1">
                                        <Award size={12} className="text-indigo-600" />
                                        {rubric.blooms_level || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total Marks</p>
                                    <p className="text-gray-700 font-semibold">{rubric.total_marks || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Weightage</p>
                                    <p className="text-orange-600 font-semibold">{rubric.weightage ? `${rubric.weightage}%` : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Criteria Count</p>
                                    <p className="text-gray-700 font-medium">{rubric.criteria_count || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Semester</p>
                                    <p className="text-gray-700 font-medium truncate">{rubric.semester_name || '—'}</p>
                                </div>
                            </div>
                            {rubric.description && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-600 line-clamp-2">{rubric.description}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        {filters?.academicYear?.length ? "No rubrics records found." : "Please select filters to view rubrics."}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredRubrics.length > 0 && (
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

export default RubricsReports;
