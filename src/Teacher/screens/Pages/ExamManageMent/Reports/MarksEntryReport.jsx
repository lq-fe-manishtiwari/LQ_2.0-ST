import React, { useEffect, useState, useMemo } from "react";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
// import { examReportService } from "../Services/ExamReports.Service";

const MarksEntryReport = ({ examScheduleId, subjectId,examScheduleName, subjectName }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(0);
  const entriesPerPage = 10;

  const totalEntries = rows.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const displayPage = currentPage + 1;

  const indexOfFirst = currentPage * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, totalEntries);

  const paginatedRows = useMemo(() => {
    const start = currentPage * entriesPerPage;
    return rows.slice(start, start + entriesPerPage);
  }, [rows, currentPage]);

  const handlePrev = () => displayPage > 1 && setCurrentPage(displayPage - 2);
  const handleNext = () =>
    displayPage < totalPages && setCurrentPage(displayPage);

  const isNextDisabled =
    totalEntries <= entriesPerPage || displayPage >= totalPages;

  /* Reset pagination when data changes */
  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (examScheduleId && subjectId) {
      fetchResults();
    } else {
      setRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examScheduleId, subjectId]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await examReportService.getMarksEntryReport(
        examScheduleId,
        subjectId
      );

      const mappedRows = res?.map(student => ({
        rollNo: student.roll_number,
        prn: student.permanent_registration_number,
        studentName: `${student.firstname} ${student.middlename} ${student.lastname}`,
        marks: student.marks_obtained,
        totalMarks: student.maximum_marks,
        status:
          student.marks_obtained !== null ? "PRESENT" : "ABSENT",
      })) || [];

      setRows(mappedRows);
    } catch (error) {
      console.error("Failed to fetch marks entry report", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXCEL DOWNLOAD ================= */
  const downloadExcel = async () => {
    if (!rows.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Marks Entry - Student Wise");

    /* ===== TITLE ===== */
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Marks Entry Report`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    /* ===== SUBTITLE ===== */
    worksheet.mergeCells("A2:E2");
    const subtitleCell = worksheet.getCell("A2");
   subtitleCell.value = `Exam: ${examScheduleName || examScheduleId} | Paper: ${subjectName || subjectId}`;
    subtitleCell.font = { size: 12, italic: true };
    subtitleCell.alignment = { horizontal: "center" };

    worksheet.addRow([]); // Spacer

    /* ===== HEADERS ===== */
    const headerRow = worksheet.addRow([
      "Roll No",
      "Student Name",
      "PRN / ERN",
      "Marks Obtained",
      "Max Marks",
    ]);

    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    headerRow.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9EAD3" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /* ===== SORT BY PRN ===== */
    const sortedRows = [...rows].sort((a, b) =>
      (a.prn || "").localeCompare(b.prn || "", undefined, { numeric: true })
    );

    /* ===== DATA ROWS ===== */
    sortedRows.forEach(item => {
      const row = worksheet.addRow([
        item.rollNo || "-",
        item.studentName || "-",
        item.prn || "-",
        item.marks ?? "Not Entered",
        item.totalMarks || "-",
      ]);

      // Highlight marks
      if (item.marks == null) {
        row.getCell(4).font = { color: { argb: "FFCC0000" }, bold: true };
      } else {
        row.getCell(4).font = { color: { argb: "FF008000" }, bold: true };
      }

      row.eachCell(cell => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center" };
      });
    });

    /* ===== COLUMN WIDTHS ===== */
    worksheet.columns.forEach(col => {
      col.width = 20;
    });
    worksheet.getColumn(2).width = 35; // Student Name

    /* ===== DOWNLOAD ===== */
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Marks_Entry_Report_Schedule_${examScheduleId}_Subject_${subjectId}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* ===== ACTION BAR ===== */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {rows.length > 0 && (
            <>
              Showing <strong>{indexOfFirst + 1}</strong>–
              <strong>{indexOfLast}</strong> of{" "}
              <strong>{totalEntries}</strong> entries
            </>
          )}
        </span>

        <button
          onClick={downloadExcel}
          disabled={!rows.length}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg
            disabled:opacity-50 hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">
            Loading marks entry report...
          </p>
        ) : rows.length ? (
          <>
            <table className="min-w-full border-collapse">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">PRN</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3 text-left">Marks</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{row.rollNo}</td>
                    <td className="px-4 py-2">{row.prn}</td>
                    <td className="px-4 py-2">{row.studentName}</td>
                    <td className="px-4 py-2">{row.marks}</td>
                    <td className="px-4 py-2">{row.totalMarks}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          row.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
            {rows.length > entriesPerPage && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-white">
                <button
                  onClick={handlePrev}
                  disabled={displayPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    displayPage === 1
                      ? "bg-blue-200 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm font-medium text-gray-700">
                  Page <strong>{displayPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    isNextDisabled
                      ? "bg-blue-200 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-6 text-center text-gray-500">
            Select <strong>Exam Schedule</strong> and{" "}
            <strong>Subject</strong> to view marks entry report
          </p>
        )}
      </div>
    </div>
  );
};

export default MarksEntryReport;
