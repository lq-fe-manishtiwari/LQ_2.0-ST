import { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { examgService } from "../../ExamManageMent/Services/Exam.service";
import { fetchExamScheduleById } from "../Services/examSchedule.graphql.service";

// 🔹 Local modal components
import CreatePaper from "../Component/CreatePaper";
import Evaluation from "../Component/Evaluation";
import MarksEntry from "../Component/MarksEntry";
import BulkUpload from "../Component/BulkUpload";

const ExamDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showMarksModal, setShowMarksModal] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState(null);
  const [bulkData, setBulkData] = useState(null);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

  // 🔹 Load exams
  useEffect(() => {
    if (!collegeId || !teacherId) {
      setLoading(false);
      return;
    }

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => {
        setExams(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collegeId, teacherId]);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  // 🔹 Fetch schedule for bulk or marks entry
  const fetchSchedule = async (examScheduleId) => {
    if (!examScheduleId) return;

    setLoading(true);
    try {
      const response = await fetchExamScheduleById(examScheduleId);
      if (!response) throw new Error("Exam schedule not found");

      const bulkSchedule = {
        examScheduleId: response.examScheduleId || response.exam_schedule_id,
        examScheduleName: response.examScheduleName || response.exam_schedule_name,
        startDate: response.startDate,
        endDate: response.endDate,
        academicYear: response.academicYear?.name,
        semester: response.semester?.name,
        division: response.division?.divisionName,
        courses:
          response.courses?.map((course) => ({
            examScheduleCourseId: course.examScheduleCourseId || course.exam_schedule_course_id,
            subjectId: course.subjectId || course.subject_id,
            examDate: course.examDate,
            startExamDateTime: course.startExamDateTime,
            endExamDateTime: course.endExamDateTime,
            currentStudentStrength: course.currentStudentStrength,
            classrooms: course.classrooms || [],
          })) || [],
      };

      setBulkData(bulkSchedule);
      setActiveComponent("MARKS_ENTRY");
    } catch (err) {
      console.error("Failed to fetch schedule", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Start button click
  const handleAction = (duty, examScheduleId) => {
    setSelectedDuty(duty);
    setSelectedExamScheduleId(examScheduleId);

    switch (duty.duty_type) {
      case "CREATE_PAPERS":
        setActiveComponent("CREATE_PAPERS");
        break;
      case "PAPER_REVALUATION":
        setActiveComponent("PAPER_REVALUATION");
        break;
      case "MARKS_ENTRY":
        setShowMarksModal(true);
        break;
      default:
        break;
    }
  };

  // 🔹 Handle Bulk Upload
  const handleBulkUpload = async (examScheduleId) => {
    if (!examScheduleId) return;
    setLoading(true);
    try {
      const response = await fetchExamScheduleById(examScheduleId);
      if (!response) return;

      const bulkSchedule = {
        examScheduleId: response.examScheduleId || response.exam_schedule_id,
        examScheduleName: response.examScheduleName || response.exam_schedule_name,
        startDate: response.startDate,
        endDate: response.endDate,
        academicYear: response.academicYear?.name,
        semester: response.semester?.name,
        division: response.division?.divisionName,
        courses:
          response.courses?.map((course) => ({
            examScheduleCourseId: course.examScheduleCourseId || course.exam_schedule_course_id,
            subjectId: course.subjectId || course.subject_id,
            examDate: course.examDate,
            startExamDateTime: course.startExamDateTime,
            endExamDateTime: course.endExamDateTime,
            currentStudentStrength: course.currentStudentStrength,
            classrooms: course.classrooms || [],
          })) || [],
      };

      setBulkData(bulkSchedule);
      setActiveComponent("BULK_UPLOAD");
    } catch (err) {
      console.error("Failed to fetch schedule for bulk upload", err);
    } finally {
      setLoading(false);
    }
  };

  const closeAll = () => {
    setActiveComponent(null);
    setShowMarksModal(false);
    setSelectedDuty(null);
    setSelectedExamScheduleId(null);
    setBulkData(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="rounded-xl shadow overflow-hidden bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Course</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Assigned By</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Start Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">End Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Assign Task</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  No records found
                </td>
              </tr>
            ) : (
              exams.flatMap((item, examIndex) =>
                item.teacher_subject_duties?.flatMap((subject, subjectIndex) =>
                  subject.duty_assignments?.map((duty, dutyIndex) => (
                    <tr
                      key={`${examIndex}-${subjectIndex}-${dutyIndex}`}
                      className="border-t"
                    >
                      <td className="px-4 py-3">{item.exam_schedule_name}</td>
                      <td className="px-4 py-3">{subject.subject_name}</td>
                      <td className="px-4 py-3">
                        {item.teacher_first_name} {item.teacher_last_name}
                      </td>
                      <td className="px-4 py-3">{formatDate(duty.start_date)}</td>
                      <td className="px-4 py-3">{formatDate(duty.end_date)}</td>
                      <td className="px-4 py-3">{duty.duty_type}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleAction(
                              duty,
                              item.exam_schedule_id || item.examScheduleId
                            )
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Start
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* 🔵 MARKS ENTRY METHOD MODAL */}
      {showMarksModal && selectedDuty && (
        <SweetAlert
          title="Marks Entry Method"
          showCancel
          confirmBtnText="Individual Entry"
          cancelBtnText="Bulk Upload"
          confirmBtnCssClass="bg-blue-600 text-white px-4 py-2 rounded"
          cancelBtnCssClass="bg-green-600 text-white px-4 py-2 rounded"
          onConfirm={async () => {
            setShowMarksModal(false);
            await fetchSchedule(selectedExamScheduleId); // individual
          }}
          onCancel={async () => {
            setShowMarksModal(false);
            await handleBulkUpload(selectedExamScheduleId); // bulk
          }}
          onEscapeKey={closeAll}
          onOutsideClick={closeAll}
        >
          <p className="text-gray-600">
            Please choose how you want to enter marks.
          </p>
        </SweetAlert>
      )}

      {/* 🔽 ACTIVE COMPONENTS */}
      {activeComponent === "CREATE_PAPERS" && selectedDuty && (
        <CreatePaper
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          examScheduleId={selectedExamScheduleId}
          onClose={closeAll}
        />
      )}

      {activeComponent === "PAPER_REVALUATION" && selectedDuty && (
        <Evaluation
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          examScheduleId={selectedExamScheduleId}
          onClose={closeAll}
        />
      )}

      {activeComponent === "MARKS_ENTRY" && bulkData && selectedDuty && (
        <MarksEntry
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          examSchedule={bulkData} 
          onClose={closeAll}
        />
      )}

      {activeComponent === "BULK_UPLOAD" && bulkData && selectedDuty && (
        <BulkUpload
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          examSchedule={bulkData} 
          onClose={closeAll}
        />
      )}
    </div>
  );
};

export default ExamDashboard;
