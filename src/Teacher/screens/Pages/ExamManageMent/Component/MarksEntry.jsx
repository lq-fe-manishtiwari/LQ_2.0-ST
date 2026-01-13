import React, { useState, useEffect } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

export default function MarksEntry({
  dutyId,
  examSchedule,
  subjectId,
  subjectName,
  onClose,
}) {
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sweetAlert, setSweetAlert] = useState(null);

  /* ----------------- Load Students & Existing Marks ----------------- */
  useEffect(() => {
    const fetchStudents = async () => {
      if (!examSchedule?.examScheduleId || !subjectId) return;

      setLoading(true);
      try {
        const res = await examMarksEntryService.getMarksBySchedule(
          examSchedule.examScheduleId,
          subjectId
        );

        const studentsList = res.data?.students || res.data || [];

        // Sort by roll number
        studentsList.sort(
          (a, b) => parseInt(a.roll_number || 0) - parseInt(b.roll_number || 0)
        );

        setStudents(studentsList);

        // Map students and extract marks from subject_marks[0] if exists
        setMarksData(
          studentsList.map((s) => {
            const mark = s.subject_marks?.[0] || {}; // Get first (and only) subject mark

            return {
              student_id: s.student_id,
              student_firstname: s.student_firstname || "",
              student_middlename: s.student_middlename || "",
              student_lastname: s.student_lastname || "",
              roll_number: s.roll_number || "",
              permanent_registration_number: s.permanent_registration_number || "",
              marks_obtained: mark.marks_obtained ?? "", // Pre-fill if exists
              attendance_status: mark.attendance_status || "PRESENT",
              exam_marks_id: mark.exam_marks_id || null,
            };
          })
        );
      } catch (err) {
        console.error("Failed to load students", err);
        setStudents([]);
        setMarksData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [examSchedule?.examScheduleId, subjectId]);

  /* ----------------- Handle Input Change ----------------- */
  const handleChange = (studentId, field, value) => {
    setMarksData((prev) =>
      prev.map((m) =>
        m.student_id === studentId ? { ...m, [field]: value } : m
      )
    );
  };

  /* ----------------- Enter Key Navigation ----------------- */
  const handleMarksEnter = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select(); // Optional: select text for quick overwrite
      }
    }
  };

  /* ----------------- Submit Marks ----------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledMarks = marksData.filter(
      (m) =>
        m.marks_obtained !== "" &&
        m.marks_obtained !== null &&
        !isNaN(m.marks_obtained)
    );

    if (filledMarks.length === 0) {
      setSweetAlert(
        <SweetAlert
          warning
          title="No Marks Entered"
          onConfirm={() => setSweetAlert(null)}
        >
          Please enter or update marks for at least one student.
        </SweetAlert>
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = filledMarks.map((s) => ({
        exam_schedule_id: examSchedule.examScheduleId,
        subject_id: Number(subjectId),
        marks_obtained: Number(s.marks_obtained),
        attendance_status: s.attendance_status || "PRESENT",
        ...(s.exam_marks_id
          ? { exam_marks_id: s.exam_marks_id }
          : { student_id: s.student_id }),
      }));

      await examMarksEntryService.submitMarksBatch(payload);

      setSweetAlert(
        <SweetAlert
          success
          title="Success"
          onConfirm={() => {
            setSweetAlert(null);
            onClose();
          }}
        >
          Marks submitted successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Submit failed", err);
      setSweetAlert(
        <SweetAlert
          danger
          title="Submission Failed"
          onConfirm={() => setSweetAlert(null)}
        >
          {err.response?.data?.message || "Failed to submit marks. Please try again."}
        </SweetAlert>
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {sweetAlert}

<div className="min-h-screen bg-gray-50 p-6">
  <div className="bg-gray-50 w-full max-w-6xl mx-auto rounded-xl shadow-lg">

          {/* Header */}
          <div className="p-3 text-blue-700 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-bold mb-4">Marks Entry</h4>
                   <span className="font-semibold">Exam Schedule:</span>{" "}
                    <span className="font-medium">
                      {examSchedule?.examScheduleName || "N/A"}
                    </span>{" "}
                        <span className="font-semibold">Paper:</span>{" "}
                    <span className="font-medium">{subjectName || "N/A"}</span>

               
              </div>

              <button
                onClick={onClose}
                className="text-3xl font-bold hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {loading && (
              <div className="text-center py-10">
                <p className="text-blue-600 text-lg">Loading students...</p>
              </div>
            )}

            {!loading && students.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-600 text-lg">
                  No students found for this exam and subject.
                </p>
              </div>
            )}

            {!loading && students.length > 0 && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                  <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full text-sm text-gray-700">
                      <thead className="table-header">
                        <tr>
                          <th className="px-4 py-3 bg-[#2162c1] text-white">Roll</th>
                          <th className="px-4 py-3 bg-[#2162c1] text-white">Student Name</th>
                          <th className="px-4 py-3 bg-[#2162c1] text-white">Reg. No</th>
                          <th className="px-4 py-3 bg-[#2162c1] text-white">Marks Obtained</th>
                          <th className="px-4 py-3 bg-[#2162c1] text-white">Attendance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {marksData.map((s, index) => (
                          <tr
                            key={s.student_id}
                            className={`border-b transition hover:bg-blue-50 ${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <td className="px-6 py-3 text-center font-medium">
                              {s.roll_number || "-"}
                            </td>

                            <td className="px-6 py-3">
                              {`${s.student_firstname} ${s.student_middlename || ""} ${s.student_lastname}`.trim()}
                            </td>

                            <td className="px-6 py-3 text-gray-600">
                              {s.permanent_registration_number || "-"}
                            </td>

                            <td className="px-6 py-3">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={s.marks_obtained}
                                data-index={index}
                                onChange={(e) =>
                                  handleChange(
                                    s.student_id,
                                    "marks_obtained",
                                    e.target.value === "" ? "" : Number(e.target.value)
                                  )
                                }
                                onKeyDown={(e) => handleMarksEnter(e, index)}
                                className="w-24 mx-auto rounded-md border px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                                placeholder="0"
                              />
                            </td>

                            <td className="px-6 py-3">
                              <select
                                value={s.attendance_status}
                                onChange={(e) =>
                                  handleChange(s.student_id, "attendance_status", e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="MALPRACTICE">Malpractice</option>
                                <option value="REVIEW_FOR_ENTRY">Review for Entry</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-center mt-8 space-x-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="px-10 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium transition shadow"
                  >
                    {submitting ? "Saving..." : "Save Marks"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}