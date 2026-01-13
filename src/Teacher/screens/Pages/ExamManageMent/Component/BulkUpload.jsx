import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

export default function BulkUpload({
  examSchedule,
  subjectId,        // Add this prop if available
  subjectName,      // Optional: for display
  dutyId,
  onClose,
  onSuccess = () => {},
}) {
  const [parsedData, setParsedData] = useState([]);
  const [students, setStudents] = useState([]); // For template download
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const templateHeaders = [
    "Roll No",
    "Student Name",
    "Marks Obtained",
    "Attendance Status",
    "Total Marks",
  ];

  // Load students once for template (optional optimization)
  useEffect(() => {
    if (!examSchedule?.examScheduleId || !subjectId) return;

    const fetchStudents = async () => {
      try {
        const res = await examMarksEntryService.getMarksBySchedule(
          examSchedule.examScheduleId,
          subjectId
        );
        const studentsList = res.data?.students || res.data || [];
        studentsList.sort((a, b) => parseInt(a.roll_number || 0) - parseInt(b.roll_number || 0));
        setStudents(studentsList);
      } catch (err) {
        console.error("Failed to load students for template", err);
      }
    };

    fetchStudents();
  }, [examSchedule?.examScheduleId, subjectId]);

  /* ---------- Download Excel Template ---------- */
  const handleDownloadTemplate = async () => {
    if (!examSchedule?.examScheduleId || !subjectId) {
      setError("Exam schedule or subject not selected");
      return;
    }

    let studentsList = students;

    if (!studentsList.length) {
      try {
        const res = await examMarksEntryService.getMarksBySchedule(
          examSchedule.examScheduleId,
          subjectId
        );
        studentsList = res.data?.students || res.data || [];
        studentsList.sort((a, b) => parseInt(a.roll_number || 0) - parseInt(b.roll_number || 0));
      } catch (err) {
        setError("Failed to fetch students");
        return;
      }
    }

    if (!studentsList.length) {
      setError("No students found");
      return;
    }

    const rows = studentsList.map((s) => {
      const mark = s.subject_marks?.[0] || {};
      return [
        s.roll_number || "",
        `${s.student_firstname || ""} ${s.student_middlename || ""} ${s.student_lastname || ""}`.trim(),
        mark.marks_obtained ?? "",
        mark.attendance_status || "PRESENT",
        100, // You can make this dynamic if max_marks is available
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, ...rows]);

    // Add dropdown for Attendance
    const attendanceOptions = ["PRESENT", "ABSENT", "MALPRACTICE", "REVIEW_FOR_ENTRY"];
    const startRow = 2;
    const endRow = rows.length + 1;
    worksheet["!dataValidation"] = [
      {
        type: "list",
        allowBlank: true,
        sqref: `D${startRow}:D${endRow}`,
        formula1: `"${attendanceOptions.join(",")}"`,
        showDropDown: true,
      },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Entry");
    XLSX.writeFile(workbook, `Marks_BulkUpload_${examSchedule.examScheduleName || "Exam"}_${subjectName || "Subject"}.xlsx`);
  };

  /* ---------- Upload Excel ---------- */
  const handleFileChange = (e) => {
    setError("");
    setParsedData([]);
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setError("Only Excel files (.xlsx, .xls) are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (rows.length < 2) {
          setError("Excel file is empty or has no data");
          return;
        }

        const headers = rows[0].map(h => String(h).trim());
        const missing = templateHeaders.filter(
          (h) => !headers.some((x) => x.toLowerCase() === h.toLowerCase())
        );

        if (missing.length) {
          setError(`Missing required columns: ${missing.join(", ")}`);
          return;
        }

        const data = rows.slice(1).map((r, i) => {
          const rollIndex = headers.findIndex(h => h.toLowerCase() === "roll no");
          const nameIndex = headers.findIndex(h => h.toLowerCase() === "student name");
          const marksIndex = headers.findIndex(h => h.toLowerCase() === "marks obtained");
          const attendIndex = headers.findIndex(h => h.toLowerCase() === "attendance status");
          const totalIndex = headers.findIndex(h => h.toLowerCase() === "total marks");

          const marksRaw = r[marksIndex];
          const marks = marksRaw === "" ? "" : Number(marksRaw);
          const total = Number(r[totalIndex]) || 100;

          const errors = [];
          if (marksRaw !== "" && (isNaN(marks) || marks < 0)) {
            errors.push("Invalid marks");
          }
          if (marks !== "" && marks > total) {
            errors.push(`Marks > total (${total})`);
          }

          return {
            id: i,
            roll_no: r[rollIndex] || "",
            student_name: r[nameIndex] || "",
            marks_obtained: marks,
            attendance_status: r[attendIndex] || "PRESENT",
            total_marks: total,
            _error: errors.length ? errors.join(", ") : null,
          };
        });

        setParsedData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to parse Excel file");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- Inline Edit ---------- */
  const handleChange = (id, field, value) => {
    setParsedData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        if (field === "marks_obtained") {
          const marks = value === "" ? "" : Number(value);
          const errors = [];
          if (value !== "" && (isNaN(marks) || marks < 0)) errors.push("Invalid marks");
          if (marks !== "" && marks > row.total_marks) errors.push(`Marks > total (${row.total_marks})`);

          return { ...row, marks_obtained: marks, _error: errors.length ? errors.join(", ") : null };
        }

        return { ...row, [field]: value };
      })
    );
  };

  /* ---------- Enter Key Navigation ---------- */
  const handleEnterKey = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    const validRows = parsedData.filter(
      (row) =>
        !row._error &&
        row.marks_obtained !== "" &&
        row.marks_obtained !== null &&
        !isNaN(row.marks_obtained)
    );

    if (!validRows.length) {
      setError("No valid marks to submit. Fix errors or enter marks.");
      return;
    }

    const payload = validRows.map((row) => ({
      exam_schedule_id: examSchedule.examScheduleId,
      subject_id: Number(subjectId),
      marks_obtained: Number(row.marks_obtained),
      attendance_status: row.attendance_status || "PRESENT",
      // Note: Since we don't have student_id/exam_marks_id from Excel,
      // backend should match by roll_no + schedule + subject
      // OR you can enhance template to include hidden student_id column
    }));

    try {
      setIsSubmitting(true);
      await examMarksEntryService.submitMarksBatch(payload);

      setAlertMessage(`Successfully uploaded ${validRows.length} marks`);
      setShowSuccess(true);
    } catch (err) {
      console.error("Upload failed", err);
      setAlertMessage(err.response?.data?.message || "Failed to upload marks");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccess(false);
            onSuccess();
            onClose();
          }}
        >
          {alertMessage}
        </SweetAlert>
      )}

      {showError && (
        <SweetAlert danger title="Error" onConfirm={() => setShowError(false)}>
          {alertMessage}
        </SweetAlert>
      )}

   <div className="min-h-screen bg-gray-50 p-6">
  <div className="bg-gray-50 w-full max-w-6xl mx-auto rounded-xl shadow-lg">

          {/* Header */}
          <div className="p-3 bg-blue-700 text-white rounded-t-xl">
            <div className="flex justify-between items-center">
              <p><strong>Bulk Upload Marks</strong></p>
               {/* <div className="mt-3 text-sm"> */}
              <p><strong>Exam Schedule:</strong> {examSchedule?.examScheduleName || "N/A"}</p>
              <p><strong>Paper:</strong> {subjectName || "N/A"}</p>
            {/* </div> */}
              <button
                onClick={onClose}
                className="text-3xl font-bold hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
            </div>
           
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 items-start">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                <Download size={18} /> Download Template
              </button>

              <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                <Upload size={18} /> Upload Filled Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {parsedData.length > 0 && (
              <div className="border rounded-xl overflow-hidden shadow">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-sm">
                    <thead className="table-header">
                      <tr>
                        {templateHeaders.map((h) => (
                          <th key={h} className="px-4 py-3 bg-[#2162c1] text-white">{h}</th>
                        ))}
                        <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`border-b transition hover:bg-blue-50 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } ${row._error ? "bg-red-50" : ""}`}
                        >
                          <td className="px-4 py-3">{row.roll_no}</td>
                          <td className="px-4 py-3">{row.student_name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={row.marks_obtained}
                              data-index={index}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "marks_obtained",
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              onKeyDown={(e) => handleEnterKey(e, index)}
                              className="w-24 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.attendance_status}
                              onChange={(e) =>
                                handleChange(row.id, "attendance_status", e.target.value)
                              }
                              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="PRESENT">Present</option>
                              <option value="ABSENT">Absent</option>
                              <option value="MALPRACTICE">Malpractice</option>
                              <option value="REVIEW_FOR_ENTRY">Review for Entry</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">{row.total_marks}</td>
                          <td className="px-4 py-3">
                            {row._error ? (
                              <span className="text-red-600 font-medium">{row._error}</span>
                            ) : (
                              <span className="text-green-600">Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {parsedData.length > 0 && (
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || parsedData.some(r => r._error)}
                className="px-10 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow"
              >
                {isSubmitting ? "Uploading..." : "Confirm & Upload"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}