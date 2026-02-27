import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserX, Loader2, Download, ChevronDown } from "lucide-react";
import { leaveService } from "../../TeacherLeaves/Services/Leave.Service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

const Leaves = () => {
    const { filters } = useOutletContext();
    const userProfile = useUserProfile();

    // Initialize as empty object
    const [leaveData, setLeaveData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const exportMenuRef = React.useRef(null);

    // Get teacher ID from filters or current user profile
    const teacherId = filters?.teacher?.user_id || filters?.teacherId || (userProfile?.getUserId ? userProfile.getUserId() : null);

    const loadLeaves = async () => {
        if (!teacherId) return;

        try {
            setLoading(true);
            const response = await leaveService.getLeavesByUserId(teacherId);

            const groupedLeaves = {};

            if (Array.isArray(response)) {
                response.forEach((item) => {
                    const typeName = item.leave_type_name || "Other Leave";

                    if (!groupedLeaves[typeName]) {
                        groupedLeaves[typeName] = [];
                    }
                    groupedLeaves[typeName].push(item);
                });
            }

            setLeaveData(groupedLeaves);
        } catch (err) {
            console.error("Failed to load leaves:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();

        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [teacherId]);

    /* ================= EXPORT HANDLERS ================= */

    const getCollegeName = () => {
        try {
            const activeCollegeStr = localStorage.getItem("activeCollege");
            if (!activeCollegeStr) return "";
            const activeCollege = JSON.parse(activeCollegeStr);
            return activeCollege?.name || activeCollege?.college_name || "";
        } catch (error) {
            console.error("Error parsing activeCollege:", error);
            return "";
        }
    };

    const getExportData = () => {
        const exportData = [];
        Object.entries(leaveData).forEach(([leaveTypeName, rows]) => {
            rows.forEach((row, index) => {
                exportData.push({
                    'Sr. No': index + 1,
                    'Leave Type': leaveTypeName,
                    'Date': `${row.start_date}${row.end_date && row.end_date !== row.start_date ? ` – ${row.end_date}` : ''}`,
                    'No. of Days': row.no_of_days,
                    'Signature of Authority': '—'
                });
            });
        });
        return exportData;
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const collegeName = getCollegeName();
        const pageWidth = doc.internal.pageSize.width;

        doc.setFontSize(16);
        doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Leave Record Report', pageWidth / 2, 22, { align: 'center' });

        const data = getExportData();
        if (data.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = [['Sr. No', 'Leave Type', 'Date', 'No. of Days', 'Signature of Authority']];
        const body = data.map(item => [
            item['Sr. No'],
            item['Leave Type'],
            item['Date'],
            item['No. of Days'],
            item['Signature of Authority']
        ]);

        autoTable(doc, {
            head: headers,
            body: body,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.save(`Leave_Record_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportDropdown(false);
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Leave Record');
            const collegeName = getCollegeName();

            const titleRow0 = worksheet.addRow([collegeName]);
            worksheet.mergeCells('A1:E1');
            titleRow0.getCell(1).font = { size: 16, bold: true };
            titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            const titleRow = worksheet.addRow(['Leave Record Report']);
            worksheet.mergeCells('A2:E2');
            titleRow.getCell(1).font = { size: 14, bold: true };
            titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.addRow([]);

            const headers = ['Sr. No', 'Leave Type', 'Date', 'No. of Days', 'Signature of Authority'];
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            const data = getExportData();
            data.forEach(item => {
                worksheet.addRow([
                    item['Sr. No'],
                    item['Leave Type'],
                    item['Date'],
                    item['No. of Days'],
                    item['Signature of Authority']
                ]);
            });

            worksheet.columns.forEach(col => { col.width = 25; });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Leave_Record_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            setShowExportDropdown(false);
        } catch (err) {
            console.error('Export Excel failed:', err);
        }
    };

    const handleExportCSV = () => {
        const data = getExportData();
        const headers = ['Sr. No', 'Leave Type', 'Date', 'No. of Days', 'Signature of Authority'];
        const collegeName = getCollegeName();

        let csvContent = `"${collegeName}"\n`;
        csvContent += `"Leave Record Report"\n\n`;
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

        data.forEach(item => {
            csvContent += [
                item['Sr. No'],
                item['Leave Type'],
                item['Date'],
                item['No. of Days'],
                item['Signature of Authority']
            ].map(val => `"${val}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Leave_Record_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setShowExportDropdown(false);
    };

    /* ===== Validation ===== */
    if (!teacherId) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <UserX className="w-20 h-20 mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No Teacher Selected</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-blue-500">
                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                <p className="text-lg font-semibold">Loading Leave Records...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold">
                        Academic Diary – Leave Record
                    </h1>
                    <p className="text-sm text-gray-600">
                        Information of Leave (To be verified by the Authority)
                    </p>
                </div>

                {Object.keys(leaveData).length > 0 && (
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportDropdown(!showExportDropdown)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm shadow-sm hover:bg-green-700 transition-colors"
                        >
                            <Download size={16} />
                            Export
                            <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showExportDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg transition-colors border-b border-gray-100">
                                    <Download size={14} className="text-red-500" />
                                    Export as PDF
                                </button>
                                <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                                    <Download size={14} className="text-green-600" />
                                    Export as Excel
                                </button>
                                <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg transition-colors">
                                    <Download size={14} className="text-gray-500" />
                                    Export as CSV
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {Object.keys(leaveData).length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No leave records available
                </div>
            )}

            {Object.entries(leaveData).map(([leaveTypeName, rows]) => (
                <div
                    key={leaveTypeName}
                    className="bg-white rounded-xl shadow-sm border mb-8"
                >
                    <div className="px-5 py-4 border-b bg-gray-100">
                        <h3 className="text-lg font-semibold">{leaveTypeName}</h3>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="table-header">
                                <tr>
                                    <th className="border px-4 py-3 text-center w-20">
                                        Sr. No
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        Date
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        No. of Days
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        Signature of Authority
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.apply_leave_id}>
                                        <td className="border px-4 py-3 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {row.start_date}
                                            {row.end_date &&
                                                row.end_date !== row.start_date && (
                                                    <> – {row.end_date}</>
                                                )}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {row.no_of_days}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            —
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden p-4 space-y-4">
                        {rows.map((row, index) => (
                            <div
                                key={row.apply_leave_id}
                                className="border rounded-lg p-4 bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-gray-900">
                                        {row.start_date}
                                        {row.end_date &&
                                            row.end_date !== row.start_date && (
                                                <> – {row.end_date}</>
                                            )}
                                    </div>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        #{index + 1}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                    <span>Duration:</span>
                                    <span className="font-semibold text-gray-900">
                                        {row.no_of_days} Day{row.no_of_days > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="pt-2 border-t mt-2 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Authority Signature:</span>
                                    <span className="text-gray-400 italic">—</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Leaves;
