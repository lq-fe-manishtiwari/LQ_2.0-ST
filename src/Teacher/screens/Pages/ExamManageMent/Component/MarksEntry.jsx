import React, { useState, useEffect } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

export default function MarksEntry({ dutyId, examSchedule, onClose }) {
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sweetAlert, setSweetAlert] = useState(null);

  /* ----------------- Load Students ----------------- */
  useEffect(() => {
    const fetchStudents = async () => {
      if (!examSchedule?.examScheduleId) return;

      setLoading(true);
      try {
        const res = await examMarksEntryService.getMarksBySchedule(
          examSchedule.examScheduleId
        );

        const studentsList = res.data?.students || res.data || [];

        studentsList.sort(
          (a, b) => parseInt(a.roll_number || 0) - parseInt(b.roll_number || 0)
        );

        setStudents(studentsList);

        setMarksData(
          studentsList.map((s) => ({
            student_id: s.student_id,
            student_firstname: s.student_firstname || "",
            student_middlename: s.student_middlename || "",
            student_lastname: s.student_lastname || "",
            roll_number: s.roll_number || "",
            permanent_registration_number:
              s.permanent_registration_number || "",
            marks_obtained: s.marks_obtained ?? "",
            attendance_status: s.attendance_status || "PRESENT",
            exam_marks_id: s.exam_marks_id || null,
          }))
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
  }, [examSchedule]);

  /* ----------------- Handle Inline Change ----------------- */
  const handleChange = (studentId, field, value) => {
    setMarksData((prev) =>
      prev.map((m) =>
        m.student_id === studentId ? { ...m, [field]: value } : m
      )
    );
  };

  /* ----------------- Submit ----------------- */
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
          Please enter marks for at least one student.
        </SweetAlert>
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = filledMarks.map((s) => ({
        exam_schedule_id: examSchedule.examScheduleId,
        subject_id: s.subject_id || null, // Optional if examSchedule has subject_id
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
          Failed to submit marks. Please try again.
        </SweetAlert>
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {sweetAlert}

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-lg">
          {/* Header */}
          <div className="p-6 bg-blue-700 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Marks Entry</h2>
            <button onClick={onClose} className="text-2xl font-bold">
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {loading && (
              <p className="text-blue-600">Loading students...</p>
            )}

            {!loading && students.length === 0 && (
              <p className="text-gray-600">No students found.</p>
            )}

            {!loading && students.length > 0 && (
              <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg shadow-sm">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Reg. Number</th>
                        <th className="px-4 py-3">Marks</th>
                        <th className="px-4 py-3">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksData.map((s) => (
                        <tr key={s.student_id}>
                          <td className="p-3 border-b text-center">
                            {s.roll_number}
                          </td>
                          <td className="p-3 border-b">
                            {`${s.student_firstname} ${s.student_middlename} ${s.student_lastname}`}
                          </td>
                          <td className="p-3 border-b">
                            {s.permanent_registration_number}
                          </td>
                          <td className="p-3 border-b">
                            <input
                              type="number"
                              min="0"
                              value={s.marks_obtained}
                              onChange={(e) =>
                                handleChange(
                                  s.student_id,
                                  "marks_obtained",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              className="w-full border px-2 py-1 rounded"
                            />
                          </td>
                          <td className="p-3 border-b">
                            <select
                              value={s.attendance_status}
                              onChange={(e) =>
                                handleChange(
                                  s.student_id,
                                  "attendance_status",
                                  e.target.value
                                )
                              }
                              className="w-full border px-2 py-1 rounded"
                            >
                              <option value="PRESENT">Present</option>
                              <option value="ABSENT">Absent</option>
                              <option value="MALPRACTICE">Malpractice</option>
                              <option value="REVIEW_FOR_ENTRY">
                                Review for Entry
                              </option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    {submitting ? "Submitting..." : "Submit Marks"}
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
