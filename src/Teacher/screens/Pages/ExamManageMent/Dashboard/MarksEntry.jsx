import React, { useEffect, useState } from "react";
import { examgService } from "../Services/Exam.service";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

const MarksEntry = () => {
  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState([]);

  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     Fetch Exam Schedules
  ==========================*/
  useEffect(() => {
    if (!teacherId) return;

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => setExamSchedules(res || []))
      .catch(console.error);
  }, [teacherId]);

  /* =========================
     Handle Exam Schedule Change
  ==========================*/
  const handleExamScheduleChange = (e) => {
    const scheduleId = e.target.value;

    setSelectedExamScheduleId(scheduleId);
    setSelectedSubjectId("");
    setMarksData([]);
    setSubjects([]);

    if (!scheduleId) return;

    const selectedSchedule = examSchedules.find(
      (ex) => ex.exam_schedule_id === Number(scheduleId)
    );

    // 🔑 Extract subjects from teacher_subject_duties
    setSubjects(selectedSchedule?.teacher_subject_duties || []);
  };

  /* =========================
     Fetch Marks by Subject
  ==========================*/
  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubjectId(subjectId);

    if (!subjectId || !selectedExamScheduleId) return;

    setLoading(true);
    try {
      const response = await examMarksEntryService.getMarksBySchedule(
        selectedExamScheduleId,
        subjectId
      );

      // ✅ FILTER ONLY THOSE WITH MARKS ENTERED
      const filtered = (response?.data || []).filter(
        (item) =>
          item.subject_marks &&
          item.subject_marks.length > 0 &&
          item.subject_marks[0].marks_obtained !== null
      );

      setMarksData(filtered);
    } catch (err) {
      console.error(err);
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* =========================
            Filters
        ==========================*/}
        <div className="flex gap-4 p-4 border-b">
          <select
            className="border rounded-lg px-4 py-2 w-80"
            value={selectedExamScheduleId}
            onChange={handleExamScheduleChange}
          >
            <option value="">Select Exam Schedule</option>
            {examSchedules.map((exam) => (
              <option
                key={exam.exam_schedule_id}
                value={exam.exam_schedule_id}
              >
                {exam.exam_schedule_name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2 w-72"
            value={selectedSubjectId}
            onChange={handleSubjectChange}
            disabled={!subjects.length}
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.subject_id} value={sub.subject_id}>
                {sub.subject_name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
            Table
        ==========================*/}
        <div
          className="overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 240px)" }}
        >
          <table className="w-full border-collapse min-w-[1400px]">
            <thead className="table-header">
              <tr className="bg-[#2162c1] text-white">
                <th className="px-4 py-3 bg-[#2162c1] text-white">Student Name</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Roll No</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">PRN</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Subject</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Type</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Max Marks</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Marks Obtained</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Min Marks</th>
                <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : marksData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                marksData.map((row, index) => {
                  const subject = row.subject_marks[0];

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {row.student_firstname} {row.student_lastname}
                      </td>
                      <td className="px-4 py-3">{row.roll_number}</td>
                      <td className="px-4 py-3">
                        {row.permanent_registration_number}
                      </td>
                      <td className="px-4 py-3">{subject.subject_name}</td>
                      <td className="px-4 py-3">{subject.exam_type}</td>
                      <td className="px-4 py-3">{subject.maximum_marks}</td>
                      <td className="px-4 py-3 font-semibold">
                        {subject.marks_obtained}
                      </td>
                      <td className="px-4 py-3">{subject.minimum_marks}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                          -
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            Footer
        ==========================*/}
        <div className="px-6 py-4 text-gray-500">
          Showing {marksData.length} entries
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;
