import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown, Plus, FileCheck } from "lucide-react";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";
import { examgService } from "../Services/Exam.service";
import { toast } from "react-toastify";

/* ================= USER ================= */
const teacher = JSON.parse(localStorage.getItem("userProfile"));
const teacherId = teacher?.teacher_id;

const AnswerSheetList = () => {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const entriesPerPage = 10;

  const DEFAULT_FILTERS = {
    schedule: "",
    paper: "",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);

  /* ================= LOAD EXAM SCHEDULES ================= */
  useEffect(() => {
    if (!teacherId) return;

    examgService
      .getTeacherDutyAllocationsByTeacher(teacherId)
      .then((res) => setExamSchedules(res || []))
      .catch(console.error);
  }, []);

  /* ================= FILTER HANDLERS ================= */
  const handleExamScheduleChange = (e) => {
    const scheduleId = e.target.value;

    setFilters({
      schedule: scheduleId,
      paper: "",
    });

    setSubjects([]);

    if (!scheduleId) return;

    const selectedSchedule = examSchedules.find(
      (ex) => ex.exam_schedule_id === Number(scheduleId)
    );

    setSubjects(selectedSchedule?.teacher_subject_duties || []);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;

    setFilters((prev) => ({
      ...prev,
      paper: subjectId,
    }));
  };

  /* ================= LOAD ANSWER SHEETS ================= */
  useEffect(() => {
    const loadAnswerSheets = async () => {
      if (!filters.schedule || !filters.paper) {
        setRows([]);
        return;
      }

      setLoading(true);
      try {
        const res =
          await examMarksEntryService.getMarksByScheduleWithPaperURL(
            filters.schedule,
            filters.paper
          );

        const list = res.data || [];

        const mapped = list
          .map((s) => {
            const subject = s.subject_marks?.[0] || {};
            const dist = subject.marks_distribution?.[0] || {};

            if (!dist?.answersheetUrl) return null;

            return {
              id: subject.exam_marks_id,
              examScheduleId: filters.schedule,
              studentId: s.student_id,
              subjectId: subject.subject_id,
              studentName: `${s.student_firstname || ""} ${s.student_middlename || ""} ${s.student_lastname || ""}`.trim(),
              rollNo: s.roll_number || "-",
              ernNo: s.permanent_registration_number || "-",
              course: subject.subject_name || "-",
              status:
                subject.marks_obtained !== null ? "Evaluated" : "Pending",
              totalMarks: subject.marks_obtained ?? 0,
              maxMarks: subject.maximum_marks ?? 0,
              questionPaperUrl: subject.question_paper_url || "",
              answerSheetUrl: dist.answersheetUrl,
              answerSheetType: dist.answersheetUrl.endsWith(".pdf")
                ? "pdf"
                : "image",
            };
          })
          .filter(Boolean);

        setRows(mapped);
        setCurrentPage(0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load answer sheets");
      } finally {
        setLoading(false);
      }
    };

    loadAnswerSheets();
  }, [filters.schedule, filters.paper]);

  /* ================= SEARCH ================= */
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const s = searchText.toLowerCase();
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(s) ||
        r.rollNo.toLowerCase().includes(s) ||
        r.ernNo.toLowerCase().includes(s) ||
        r.course.toLowerCase().includes(s)
    );
  }, [searchText, rows]);

  /* ================= PAGINATION ================= */
  const totalEntries = filteredRows.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const paginatedData = useMemo(() => {
    const start = currentPage * entriesPerPage;
    return filteredRows.slice(start, start + entriesPerPage);
  }, [filteredRows, currentPage]);

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 bg-pink-100 text-pink-700 px-5 py-2.5 rounded-lg"
          >
            <Filter size={16} />
            Filter
            <ChevronDown size={16} />
          </button>

          <Link to="add">
            <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg">
              <Plus size={16} />
              Add Answer Sheet
            </button>
          </Link>
        </div>
      </div>

      {/* ================= FILTER PANEL ================= */}
      {showFilter && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="border rounded-lg px-4 py-2"
              value={filters.schedule}
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
              className="border rounded-lg px-4 py-2"
              value={filters.paper}
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
        </div>
      )}

      {loading && (
        <p className="text-blue-600 font-medium mb-4">
          Loading answer sheets…
        </p>
      )}

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-xl shadow bg-white">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-4 text-left">Student Name</th>
              <th className="px-4 py-4 text-center">Roll No</th>
              <th className="px-4 py-4 text-center">ERN No</th>
              <th className="px-4 py-4 text-center">Paper</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-4 py-4 text-center">Total Marks</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-medium">
                  {item.studentName}
                </td>
                <td className="px-4 py-4 text-center">{item.rollNo}</td>
                <td className="px-4 py-4 text-center">{item.ernNo}</td>
                <td className="px-4 py-4 text-center">{item.course}</td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Evaluated"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-medium">
                  {item.totalMarks}
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() =>
                      navigate(
                        `mark/${item.id}`,
                        {
                          state: {
                            examScheduleId: item.examScheduleId,
                            studentId: item.studentId,
                            subjectId: item.subjectId,
                            answerSheetUrl: item.answerSheetUrl,
                            answerSheetType: item.answerSheetType,
                            questionPaperUrl: item.questionPaperUrl,
                            studentData: item,
                          },
                        }
                      )
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FileCheck size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnswerSheetList;
