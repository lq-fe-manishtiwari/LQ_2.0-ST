// src/Reports/StudentAttendanceReport.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
// import { examReportService } from "../Services/ExamReports.Service";

const StudentAttendanceReport = ({ examScheduleId }) => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
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

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (examScheduleId) {
      fetchResults();
    } else {
      setRows([]);
      setMeta(null);
    }
  }, [examScheduleId]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await examReportService.getStudentAttendanceReport(examScheduleId);

      /* ===== META DATA ===== */
      setMeta({
        examScheduleName: res.exam_schedule_name,
        programName: res.program_name,
        semesterName: res.semester_name,
        divisionName: res.division_name,
        subjectName: res.subject_attendance?.[0]?.subject_name,
        examDate: res.subject_attendance?.[0]?.exam_date,
        startTime: res.subject_attendance?.[0]?.start_exam_time,
        endTime: res.subject_attendance?.[0]?.end_exam_time,
      });

      /* ===== FLATTEN SUBJECT → STUDENTS ===== */
      const flattened = [];

      res?.subject_attendance?.forEach((subject) => {
        subject?.students?.forEach((student) => {
          flattened.push({
            rollNo: student.roll_number,
            studentName: `${student.firstname} ${student.middlename || ""} ${student.lastname}`.trim(),
            subjectName: subject.subject_name,
            examDate: subject.exam_date,
            startTime: subject.start_exam_time,
            endTime: subject.end_exam_time,
            attendance: "PRESENT", // currently all are present – adjust logic if absent data exists
          });
        });
      });

      setRows(flattened);
    } catch (error) {
      console.error("Failed to fetch attendance report", error);
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXCEL DOWNLOAD (ExcelJS) ================= */
  const downloadExcel = async () => {
    if (!rows.length || !meta) return;
  
    const workbook = new ExcelJS.Workbook();
  
    // Group rows by subjectName
    const grouped = rows.reduce((acc, row) => {
      const subj = row.subjectName || "Unknown Subject";
      if (!acc[subj]) acc[subj] = [];
      acc[subj].push(row);
      return acc;
    }, {});
  
    Object.entries(grouped).forEach(([subjectName, students]) => {
      // Sheet name - Excel limits ~31 chars, remove invalid chars
      const safeName = subjectName
        .replace(/[^a-zA-Z0-9 -]/g, "")
        .substring(0, 28)
        .trim() || "Subject";
  
      const ws = workbook.addWorksheet(safeName);
  
      // ─── Logo / College Header Area ───
      // (If you have base64Logo, add it here like in your earlier example)
      ws.getRow(1).height = 50; // space for logo if added
  
      // College name
      ws.mergeCells("B1:F1");
      const college = ws.getCell("B1");
      college.value = "WCCBM - DG"; // ← change to your actual college variable
      college.font = { size: 14, bold: true };
      college.alignment = { horizontal: "center", vertical: "middle" };
  
      // Title
      ws.mergeCells("B2:F2");
      const title = ws.getCell("B2");
      title.value = "ATTENDANCE SHEET";
      title.font = { size: 16, bold: true, underline: true };
      title.alignment = { horizontal: "center", vertical: "middle" };
  
      ws.addRow([]); // spacer
      ws.addRow([]); // spacer
  
      // ─── Exam Info ───
      const examInfo = [
        ["EXAMINATION:", meta.examScheduleName || "Internal Exam FYBCOM", "YEAR:", "September 2025"],
        ["MONTH:", "September 2025", "SEMESTER:", meta.semesterName || "S1"],
        ["CLASS:", meta.divisionName || "B", "PAPER:", subjectName],
        ["DATE:", students[0]?.examDate || meta.examDate || "-", "TIME:", `${students[0]?.startTime || "-"} - ${students[0]?.endTime || "-"}`],
      ];
  
      examInfo.forEach((data) => {
        const r = ws.addRow(data);
        r.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col % 2 === 1) cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: col % 2 === 1 ? "left" : "left" };
        });
      });
  
      ws.addRow([]); // spacer
      ws.addRow([]); // spacer
  
      // ─── Table Header ───
      const header = ws.addRow(["Sr. No.", "Roll No.", "Student Name", "Signature"]);
      header.font = { bold: true };
      header.alignment = { horizontal: "center", vertical: "middle" };
      header.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F0FA" } };
      });
  
      // ─── Student Rows ───
      students.forEach((student, i) => {
        const row = ws.addRow([
          i + 1,
          student.rollNo || "-",
          student.studentName || "-",
          "", // empty for manual signature
        ]);
  
        row.height = 35; // space for handwritten signature
  
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      });
  
      ws.addRow([]); // spacer
      ws.addRow([]); // spacer
  
      // ─── Footer ───
      ws.addRow(["TOTAL NUMBER OF STUDENTS:", students.length]);
      ws.addRow(["PRESENT:", ""]);
      ws.addRow(["ABSENT:", ""]);
      ws.addRow([]);
      ws.addRow(["SIGN OF SUPERVISOR:", "_________________________"]);
      ws.addRow(["NAME OF SUPERVISOR:", "-"]);
  
      // ─── Column Widths ───
      ws.columns = [
        { width: 10 },  // Sr. No.
        { width: 14 },  // Roll No.
        { width: 40 },  // Student Name
        { width: 30 },  // Signature (wide)
      ];
    });
  
    // Generate & Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${meta.examScheduleName?.replace(/[^a-z0-9]/gi, "_") || "Report"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* ===== ACTION BAR ===== */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {rows.length > 0 && (
            <>
              Showing <strong>{indexOfFirst + 1}</strong>–
              <strong>{indexOfLast}</strong> of{" "}
              <strong>{totalEntries}</strong> students
            </>
          )}
        </span>

        <button
          onClick={downloadExcel}
          disabled={!rows.length || loading || !meta}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* ===== REPORT HEADER ===== */}
      {meta && (
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><strong>Exam:</strong> {meta.examScheduleName}</div>
          <div><strong>Program:</strong> {meta.programName}</div>
          <div><strong>Semester:</strong> {meta.semesterName}</div>
          <div><strong>Division:</strong> {meta.divisionName}</div>
          <div><strong>Paper:</strong> {meta.subjectName}</div>
          <div>
            <strong>Exam Time:</strong> {meta.startTime} – {meta.endTime}
          </div>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">
            Loading attendance report...
          </p>
        ) : rows.length ? (
          <>
            <table className="min-w-full border-collapse">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Exam Date</th>
                  <th className="px-4 py-3 text-left">Start Time</th>
                  <th className="px-4 py-3 text-left">End Time</th>
                  <th className="px-4 py-3 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{row.rollNo}</td>
                    <td className="px-4 py-2">{row.studentName}</td>
                    <td className="px-4 py-2">{row.subjectName}</td>
                    <td className="px-4 py-2">{row.examDate}</td>
                    <td className="px-4 py-2">{row.startTime}</td>
                    <td className="px-4 py-2">{row.endTime}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                        {row.attendance}
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
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                  disabled={displayPage === 1}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-200"
                >
                  Previous
                </button>

                <span className="text-sm font-medium">
                  Page {displayPage} of {totalPages}
                </span>

                <button
                  onClick={() => displayPage < totalPages && setCurrentPage(p => p + 1)}
                  disabled={displayPage >= totalPages}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-6 text-center text-gray-500">
            Select exam schedule to view student attendance
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceReport;