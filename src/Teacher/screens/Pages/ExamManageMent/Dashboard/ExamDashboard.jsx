import { useEffect, useState } from "react";
import { examgService } from "../../ExamManageMent/Services/Exam.service";

// 🔹 Local components (modal-style)
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

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

  const teacher = JSON.parse(localStorage.getItem("userProfile"));
  const teacherId = teacher?.teacher_id;

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

  // 🔹 Handle Start button
  const handleAction = (duty) => {
    setSelectedDuty(duty);

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

  const closeAll = () => {
    setActiveComponent(null);
    setShowMarksModal(false);
    setSelectedDuty(null);
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
                item.teacher_subject_duties?.flatMap(
                  (subject, subjectIndex) =>
                    subject.duty_assignments?.map((duty, dutyIndex) => (
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

                        <td className="px-4 py-3">
                          {item.teacher_first_name}{" "}
                          {item.teacher_last_name}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(duty.start_date)}
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(duty.end_date)}
                        </td>

                        <td className="px-4 py-3">
                          {duty.duty_type}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleAction(duty)}
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

      {/* 🔵 MARKS ENTRY OPTION MODAL */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Marks Entry Method
            </h2>

            <button
              className="w-full mb-3 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                setShowMarksModal(false);
                setActiveComponent("BULK_UPLOAD");
              }}
            >
              Bulk Upload
            </button>

            <button
              className="w-full py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                setShowMarksModal(false);
                setActiveComponent("MARKS_ENTRY");
              }}
            >
              Individual Entry
            </button>

            <button
              className="w-full mt-3 text-gray-500"
              onClick={closeAll}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔽 RENDER ACTIVE COMPONENTS */}
      {activeComponent === "CREATE_PAPERS" && (
        <CreatePaper
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          onClose={closeAll}
        />
      )}

      {activeComponent === "PAPER_REVALUATION" && (
        <Evaluation
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          onClose={closeAll}
        />
      )}

      {activeComponent === "MARKS_ENTRY" && (
        <MarksEntry
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          onClose={closeAll}
        />
      )}

      {activeComponent === "BULK_UPLOAD" && (
        <BulkUpload
          dutyId={selectedDuty?.teacher_exam_duty_assignment_id}
          onClose={closeAll}
        />
      )}
    </div>
  );
};

export default ExamDashboard;
