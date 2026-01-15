import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SweetAlert from "react-bootstrap-sweetalert";
import { examgService } from "../Services/Exam.service";
import { fetchExamScheduleById } from "../Services/examSchedule.graphql.service";

// 🔹 Local modal components
import CreatePaper from "../Component/CreatePaper";
import Evaluation from "../Component/Evaluation";
import MarksEntry from "../Component/MarksEntry";
import BulkUpload from "../Component/BulkUpload";
import UploadExamPaper from "../Component/UploadExamPaper";

const AssignedTasks = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
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
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-GB")
    : "-";


  const fetchAndSetSchedule = async (examScheduleId, component) => {
    if (!examScheduleId) return;

    setLoading(true);
    try {
      const response = await fetchExamScheduleById(examScheduleId);
      if (!response) throw new Error("Exam schedule not found");

      const schedule = {
        examScheduleId: response.examScheduleId || response.exam_schedule_id,
        examScheduleName:
          response.examScheduleName || response.exam_schedule_name,
        startDate: response.startDate,
        endDate: response.endDate,
        academicYear: response.academicYear?.name,
        semester: response.semester?.name,
        division: response.division?.divisionName,
        examToolTypeName: response.examToolTypeName,
        examTypeId: response.examTypeId,
        courses:
          response.courses?.map((course) => ({
            examScheduleCourseId:
              course.examScheduleCourseId ||
              course.exam_schedule_course_id,
            subjectId: course.subjectId || course.subject_id,
            examDate: course.examDate,
            startExamDateTime: course.startExamDateTime,
            endExamDateTime: course.endExamDateTime,
            currentStudentStrength: course.currentStudentStrength,
            classrooms: course.classrooms || [],
            tool: course.tool, // Pass the whole tool object
            subjectDetails: course.subjectDetails, // Pass subject details
          })) || [],
      };

      setBulkData(schedule);
      setActiveComponent(component);
    } catch (err) {
      console.error("Failed to fetch exam schedule", err);
    } finally {
      setLoading(false);
    }
  };

 const handleAction = async (duty, examScheduleId, subject) => {
  setSelectedDuty(duty);
  setSelectedExamScheduleId(examScheduleId);
  setSelectedSubject(subject);

  switch (duty.duty_type) {
    case "CREATE_PAPERS":
      setShowCreateModal(true);
      break;

    case "PAPER_REVALUATION":
      // Navigate to the revaluation page
      navigate("/teacher/exam/Evaluation", {
        state: { examScheduleId, subjectId: subject?.subject_id }
      });
      break;

    case "ANSWER_SHEET_MARKING":
      // Navigate to the answer sheets page
      navigate("/teacher/exam/answer-sheets", {
        state: { examScheduleId, subjectId: subject?.subject_id }
      });
      break;

    case "MARKS_ENTRY":
      setShowMarksModal(true);
      break;

    default:
      break;
  }
};

  const closeAll = () => {
    setActiveComponent(null);
    setShowMarksModal(false);
    setShowCreateModal(false);
    setSelectedDuty(null);
    setSelectedExamScheduleId(null);
    setSelectedSubject(null);
    setBulkData(null);
  };

  /* ✅ ONLY ADDITION */
  const isFullPageActive = [
    "CREATE_PAPERS",
    "UPLOAD_PAPER",
    "MARKS_ENTRY",
    "BULK_UPLOAD",
    "PAPER_REVALUATION",
  ].includes(activeComponent);

  const dutyTypeLabels = {
  CREATE_PAPERS: "Create Papers",
  PAPER_REVALUATION: "Paper Revaluation",
  MARKS_ENTRY: "Marks Entry",
  ANSWER_SHEET_MARKING: "Answer Sheet Marking",
};

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔹 ASSIGNED TASKS UI (HIDDEN WHEN FULL PAGE ACTIVE) */}
      {!isFullPageActive && (
        <div className="p-6">
          <div className="rounded-xl shadow overflow-hidden bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Name</th>
                  <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
                  {/* <th className="px-4 py-3 bg-[#2162c1] text-white">Assigned By</th> */}
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
                    item.teacher_subject_duties?.flatMap(
                      (subject, subjectIndex) =>
                        subject.duty_assignments?.map(
                          (duty, dutyIndex) => (
                            <tr
                              key={`${examIndex}-${subjectIndex}-${dutyIndex}`}
                              className="border-t"
                            >
                              <td className="px-4 py-3">
                                {item.exam_schedule_name}
                              </td>
                              <td className="px-4 py-3">
                                {subject.subject_name}
                              </td>
                              {/* <td className="px-4 py-3">
                                {item.teacher_first_name}{" "}
                                {item.teacher_last_name}
                              </td> */}
                              <td className="px-4 py-3">
                                {formatDate(duty.start_date)}
                              </td>
                              <td className="px-4 py-3">
                                {formatDate(duty.end_date)}
                              </td>
                           <td className="px-4 py-3">
                              {dutyTypeLabels[duty.duty_type] || duty.duty_type}
                            </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() =>
                                    handleAction(
                                      duty,
                                      item.exam_schedule_id ||
                                        item.examScheduleId,
                                      subject
                                    )
                                  }
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Start
                                </button>
                              </td>
                            </tr>
                          )
                        )
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            await fetchAndSetSchedule(
              selectedExamScheduleId,
              "MARKS_ENTRY"
            );
          }}
          onCancel={async () => {
            setShowMarksModal(false);
            await fetchAndSetSchedule(
              selectedExamScheduleId,
              "BULK_UPLOAD"
            );
          }}
          onEscapeKey={closeAll}
          onOutsideClick={closeAll}
        />
      )}

      {/* 🔵 CREATE PAPER METHOD MODAL */}
      {showCreateModal && selectedDuty && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Exam Paper</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Choose how you want to create the exam paper
            </p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={async () => {
                  setShowCreateModal(false);
                  await fetchAndSetSchedule(
                    selectedExamScheduleId,
                    "CREATE_PAPERS"
                  );
                }}
                className="border rounded-lg p-4 hover:border-green-500 hover:bg-green-50 transition text-left"
              >
                <h3 className="font-medium text-green-700 mb-1">
                  Create using Questions
                </h3>
                <p className="text-sm text-gray-600">
                  Create exam paper by selecting or adding questions.
                </p>
              </button>

              <button
                onClick={async () => {
                  setShowCreateModal(false);
                  await fetchAndSetSchedule(
                    selectedExamScheduleId,
                    "UPLOAD_PAPER"
                  );
                }}
                className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <h3 className="font-medium text-blue-700 mb-1">
                  Upload Exam Paper
                </h3>
                <p className="text-sm text-gray-600">
                  Upload exam paper file
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔽 FULL PAGE COMPONENTS */}
      {activeComponent === "CREATE_PAPERS" && bulkData && selectedDuty && (
        <CreatePaper
          dutyId={selectedDuty.teacher_exam_duty_assignment_id}
          examSchedule={bulkData}
          subjectId={selectedSubject?.subject_id}
          subjectName={selectedSubject?.subject_name}
          onClose={closeAll}
        />
      )}

      {activeComponent === "PAPER_REVALUATION" && selectedDuty && (
        <Evaluation
          dutyId={selectedDuty.teacher_exam_duty_assignment_id}
          examScheduleId={selectedExamScheduleId}
          onClose={closeAll}
        />
      )}

      {activeComponent === "MARKS_ENTRY" && bulkData && selectedDuty && (
        <MarksEntry
          dutyId={selectedDuty.teacher_exam_duty_assignment_id}
          examSchedule={bulkData}
          subjectId={selectedSubject?.subject_id}
          subjectName={selectedSubject?.subject_name}
          onClose={closeAll}
        />
      )}

      {activeComponent === "BULK_UPLOAD" && bulkData && selectedDuty && (
        <BulkUpload
          dutyId={selectedDuty.teacher_exam_duty_assignment_id}
          examSchedule={bulkData}
          subjectId={selectedSubject?.subject_id}
          subjectName={selectedSubject?.subject_name}
          onClose={closeAll}
        />
      )}

      {activeComponent === "UPLOAD_PAPER" && bulkData && selectedDuty && (
        <UploadExamPaper
          dutyId={selectedDuty.teacher_exam_duty_assignment_id}
          examSchedule={bulkData}
          subjectId={selectedSubject?.subject_id}
          subjectName={selectedSubject?.subject_name}
          onClose={closeAll}
        />
      )}
    </div>
  );
};

export default AssignedTasks;