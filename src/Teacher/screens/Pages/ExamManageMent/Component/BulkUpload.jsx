import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

export default function BulkUpload({
  examSchedule,      // Pass full exam schedule from parent
  dutyId,
  onClose,
  onSuccess = () => {},
}) {
  console.log(examSchedule);
  const [parsedData, setParsedData] = useState([]);
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

  // Validate examSchedule data
  useEffect(() => {
    if (!examSchedule) {
      setError("Exam schedule data is missing");
    }
  }, [examSchedule]);

  /* ---------- Download Excel Template ---------- */
  const handleDownloadTemplate = async () => {
    if (!examSchedule?.examScheduleId) {
      setError("Exam schedule not found");
      return;
    }

    try {
      const res = await examMarksEntryService.getMarksBySchedule(examSchedule.examScheduleId);
      const students = res.data || [];

      if (!students.length) {
        setError("No students found for this schedule");
        return;
      }

      const rows = students.map((s) => [
        s.roll_number,
        `${s.student_firstname} ${s.student_middlename || ""} ${s.student_lastname}`,
        s.marks_obtained ?? "",
        s.attendance_status || "PRESENT",
        s.total_marks || 100,
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, ...rows]);

      // Add dropdown for Attendance Status
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
      XLSX.writeFile(workbook, `Marks_BulkUpload_Schedule_${examSchedule.examScheduleId}.xlsx`);
    } catch (err) {
      console.error(err);
      setError("Failed to download Excel template");
    }
  };

  /* ---------- Upload Excel ---------- */
  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    if (!["xlsx", "xls"].includes(file.name.split(".").pop())) {
      setError("Only Excel files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      const headers = rows[0];
      const missing = templateHeaders.filter(
        (h) => !headers.some((x) => String(x).trim().toLowerCase() === h.toLowerCase())
      );
      if (missing.length) {
        setError(`Missing headers: ${missing.join(", ")}`);
        return;
      }

      const data = rows.slice(1).map((r, i) => {
        const marks = Number(r[2]);
        const total = Number(r[4]);
        const errors = [];
        if (isNaN(marks)) errors.push("Invalid marks");
        if (marks > total) errors.push("Marks exceed total");

        return {
          id: i,
          roll_no: r[0],
          student_name: r[1],
          marks_obtained: marks,
          attendance_status: r[3],
          total_marks: total,
          exam_schedule_id: examSchedule.examScheduleId,
          duty_id: dutyId,
          _error: errors.length ? errors.join(", ") : null,
        };
      });

      setParsedData(data);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    const valid = parsedData.filter((d) => !d._error);
    if (!valid.length) {
      setError("No valid records to submit");
      return;
    }

    try {
      setIsSubmitting(true);
      await examMarksEntryService.submitMarksBatch(valid);

      setAlertMessage(`Uploaded ${valid.length} records successfully`);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to upload marks");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Helper to format Date ---------- */
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(); // You can use toDateString() for longer format
  };

  return (
    <>
      {showSuccess && (
        <SweetAlert
          success
          title="Success"
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
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setShowError(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-lg">

          {/* Header */}
          <div className="p-6 bg-blue-700 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Bulk Upload Marks</h2>
            <button onClick={onClose} className="text-2xl font-bold">×</button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* Exam Schedule Info */}
            <div className="bg-gray-50 p-4 rounded border">
              <p><strong>Exam:</strong> {examSchedule?.examScheduleName || "-"}</p>
              <p><strong>Start Date:</strong> {formatDate(examSchedule?.startDate)}</p>
              <p><strong>End Date:</strong> {formatDate(examSchedule?.endDate)}</p>
              <p>
                <strong>Course:</strong>{" "}
                {examSchedule?.courses?.map(c => c.subjectId).join(", ") || "-"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex gap-2">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border rounded text-blue-600"
              >
                <Download size={16} />
                Download Excel
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                <Upload size={16} />
                Upload Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Preview Table */}
            {parsedData.length > 0 && (
              <div className="overflow-auto border rounded mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {templateHeaders.map((h) => (
                        <th key={h} className="p-2 text-left">{h}</th>
                      ))}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((r) => (
                      <tr key={r.id} className={r._error ? "bg-red-50" : ""}>
                        <td className="p-2">{r.roll_no}</td>
                        <td className="p-2">{r.student_name}</td>
                        <td className="p-2">{r.marks_obtained}</td>
                        <td className="p-2">{r.attendance_status}</td>
                        <td className="p-2">{r.total_marks}</td>
                        <td className="p-2">
                          {r._error ? (
                            <span className="text-red-600">{r._error}</span>
                          ) : (
                            <span className="text-green-600">Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
