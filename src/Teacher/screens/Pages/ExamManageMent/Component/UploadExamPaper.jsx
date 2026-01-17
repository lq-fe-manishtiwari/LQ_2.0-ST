import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

// import { collegeService } from "../../../pages/Academics/Services/college.service";
// import { batchService } from "../../Academics/Services/batch.Service";
import { examPaperService } from "../Services/ExamPaper.Service";
import { fetchExamSchedulesByAcademicYearId } from "../Services/examSchedule.graphql.service";
import { uploadFileToS3 } from "../../../../../_services/api";

const CustomSelect = ({ label, value, placeholder, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"
          }`}
        >
          {value || placeholder}
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UploadExamPaper = ({ dutyId, examSchedule, subjectId, subjectName, onClose }) => {
  const navigate = useNavigate();

  const [collegeId, setCollegeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [questionPaperUrl, setQuestionPaperUrl] = useState("");

  // Filters chain - auto-populated from props
  const [filters, setFilters] = useState({
    program: "",
    batch: "",
    academicYear: "",
    semester: "",
  });

  const [formData, setFormData] = useState({
    paper_name: "",
    paper_description: "",
    exam_schedule_id: examSchedule?.examScheduleId || "",
    subject_id: subjectId || "",
    exam_tool_id: "",
    start_date_time: "",
    end_date_time: "",
    exam_duration: "",
    remark: "",
    min_marks: "",
    max_marks: "",
  });

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedToolName, setSelectedToolName] = useState("");

  // Auto-populate from props
  useEffect(() => {
    if (!examSchedule || !subjectId) return;

    const matchingCourse = examSchedule.courses?.find(
      (course) => String(course.subjectId) === String(subjectId)
    );

    if (matchingCourse) {
      setSelectedToolName(matchingCourse.tool?.toolName || "Theory");

      const toDateTimeLocal = (dateInput) => {
        if (!dateInput) return "";
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().slice(0, 16);
      };

      const start = toDateTimeLocal(matchingCourse.startExamDateTime);
      const end = toDateTimeLocal(matchingCourse.endExamDateTime);

      let duration = "";
      if (start && end) {
        const diffMs = new Date(end) - new Date(start);
        duration = (diffMs / (1000 * 60 * 60)).toFixed(1);
      }

      setFormData((prev) => ({
        ...prev,
        exam_tool_id: matchingCourse.tool?.toolId || "",
        start_date_time: start,
        end_date_time: end,
        exam_duration: duration,
        min_marks: matchingCourse.minimumMarks || matchingCourse.tool?.minimumMarks || "",
        max_marks: matchingCourse.maximumMarks || matchingCourse.tool?.maximumMarks || ""
      }));
    }
  }, [examSchedule, subjectId]);

  // Get active college
  useEffect(() => {
    const college = JSON.parse(localStorage.getItem("activeCollege"));
    if (college?.id) {
      setCollegeId(college.id);
    } else {
      navigate("/college-selection");
    }
  }, [navigate]);

  // Load programs
  // useEffect(() => {
  //   if (!collegeId) return;
  //   collegeService.getProgramByCollegeId(collegeId).then(setPrograms).catch(console.error);
  // }, [collegeId]);

  // Cascading: Program → Batch
  // useEffect(() => {
  //   if (!filters.program) return setBatches([]);
  //   batchService.getBatchByProgramId([filters.program]).then(setBatches).catch(console.error);
  // }, [filters.program]);

  // Batch → Academic Years
  useEffect(() => {
    const batch = batches.find((b) => b.batch_id === filters.batch);
    setAcademicYears(batch?.academic_years || []);
  }, [filters.batch, batches]);

  // Academic Year → Semesters
  useEffect(() => {
    const ay = academicYears.find((a) => a.academic_year_id === filters.academicYear);
    if (!ay) return setSemesters([]);

    const uniqueSemesters = [];
    const seen = new Set();
    ay.semester_divisions?.forEach((sd) => {
      if (!seen.has(sd.semester_id)) {
        seen.add(sd.semester_id);
        uniqueSemesters.push(sd);
      }
    });
    setSemesters(uniqueSemesters);
  }, [filters.academicYear, academicYears]);

  // Load exam schedules when academic year selected
  useEffect(() => {
    if (!filters.academicYear) {
      setExamSchedules([]);
      return;
    }

    fetchExamSchedulesByAcademicYearId(Number(filters.academicYear))
      .then((res) => setExamSchedules(res?.content || []))
      .catch((err) => {
        console.error("Failed to load schedules:", err);
        setExamSchedules([]);
      });
  }, [filters.academicYear]);

  // When schedule selected → load subjects + auto-fill tool & dates
  useEffect(() => {
    if (!formData.exam_schedule_id) {
      setSubjects([]);
      setSelectedToolName("");
      setFormData((prev) => ({
        ...prev,
        subject_id: "",
        exam_tool_id: "",
        min_marks: "",
        max_marks: "",
        start_date_time: "",
        end_date_time: "",
        exam_duration: "",
      }));
      return;
    }

    const selectedSchedule = examSchedules.find(
      (s) => String(s.examScheduleId) === String(formData.exam_schedule_id)
    );

    if (selectedSchedule?.courses) {
      setSubjects(
        selectedSchedule.courses.map((course) => ({
          subject_id: course.subjectId,
          subject_name: course.subjectDetails?.subjectName || "",
        }))
      );

      // If subject already selected → try to auto-fill tool & dates
      if (formData.subject_id) {
        const selectedCourse = selectedSchedule.courses.find(
          (c) => String(c.subjectId) === String(formData.subject_id)
        );

        if (selectedCourse?.tool) {
          setFormData((prev) => ({
            ...prev,
            exam_tool_id: String(selectedCourse.tool.toolId || ""),
            min_marks: String(selectedCourse.tool.minimumMarks || ""),
            max_marks: String(selectedCourse.tool.maximumMarks || ""),
          }));
          setSelectedToolName(selectedCourse.tool.toolName || "Unknown Tool");
        }

        // Auto-fill dates & duration
        const toDateTimeLocal = (value) => {
          if (!value) return "";
          const date = new Date(value);
          if (isNaN(date)) return "";
          const pad = (n) => String(n).padStart(2, "0");
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
            date.getHours()
          )}:${pad(date.getMinutes())}`;
        };

        const start = toDateTimeLocal(selectedCourse.startExamDateTime);
        const end = toDateTimeLocal(selectedCourse.endExamDateTime);

        let duration = "";
        if (start && end) {
          const diffMs = new Date(end) - new Date(start);
          const diffHours = diffMs / (1000 * 60 * 60);
          duration = diffHours > 0 ? diffHours.toFixed(1) : "";
        }

        setFormData((prev) => ({
          ...prev,
          start_date_time: start,
          end_date_time: end,
          exam_duration: duration,
        }));
      }
    }
  }, [formData.exam_schedule_id, formData.subject_id, examSchedules]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    toast.info("Uploading question paper...");

    try {
      const s3Url = await uploadFileToS3(file);
      setQuestionPaperUrl(s3Url);
      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paper_name?.trim() || !formData.exam_schedule_id || !formData.subject_id || !questionPaperUrl) {
      toast.error("Please fill required fields and upload the question paper");
      return;
    }

    const payload = {
      paper_name: formData.paper_name.trim(),
      paper_description: formData.paper_description?.trim() || "",
      exam_schedule_id: parseInt(formData.exam_schedule_id),
      subject_id: parseInt(formData.subject_id),
      exam_tool_id: formData.exam_tool_id ? parseInt(formData.exam_tool_id) : null,
      start_date_time: formData.start_date_time ? `${formData.start_date_time}:00` : null,
      end_date_time: formData.end_date_time ? `${formData.end_date_time}:00` : null,
      exam_duration: formData.exam_duration ? Number(formData.exam_duration) * 60 : null,
      remark: formData.remark?.trim() || null,
      min_marks: Number(formData.min_marks) || 0,
      max_marks: Number(formData.max_marks) || 0,
      question_paper_url: questionPaperUrl,
      sections: null, // explicitly no sections for uploaded paper
      college_id: collegeId,
    };

    setLoading(true);

    try {
      await examPaperService.saveExampaper(payload);

      setAlert(
        <SweetAlert
          success
          title="Success"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            if (onClose) {
              onClose();
            } else {
              navigate("/exam-management/papers");
            }
          }}
        >
          Exam paper uploaded successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Error saving uploaded exam paper:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save exam paper. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!(
    formData.paper_name?.trim() &&
    formData.exam_schedule_id &&
    formData.subject_id &&
    questionPaperUrl
  );

  if (!collegeId) return <div className="p-10 text-center">Loading college information...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gray-50 w-full max-w-6xl mx-auto rounded-xl shadow-lg">
        <div className="p-8">
          {alert}

          {/* Exam Schedule Details Card */}
          {examSchedule && (
            <div className="bg-blue-50 rounded-lg p-5 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Exam Schedule Details</h3>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Exam Schedule:</span>
                  <p className="text-gray-900 font-semibold">{examSchedule?.examScheduleName || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Paper:</span>
                  <p className="text-gray-900 font-semibold">{subjectName || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Academic Year:</span>
                  <p className="text-gray-800">{examSchedule?.academicYear || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Semester:</span>
                  <p className="text-gray-800">{examSchedule?.semester || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Division:</span>
                  <p className="text-gray-800">{examSchedule?.division || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-blue-800 mb-6">Upload Exam Paper</h1>

          {/* Filters - only show if not coming from props */}
          {!examSchedule && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CustomSelect
                  label="Program *"
                  value={programs.find((p) => p.program_id === filters.program)?.program_name || ""}
                  placeholder="Select Program"
                  options={programs.map((p) => ({ label: p.program_name, value: p.program_id }))}
                  onChange={(opt) =>
                    setFilters({ program: opt.value, batch: "", academicYear: "", semester: "" })
                  }
                />

                <CustomSelect
                  label="Batch *"
                  value={batches.find((b) => b.batch_id === filters.batch)?.batch_name || ""}
                  placeholder="Select Batch"
                  disabled={!filters.program}
                  options={batches.map((b) => ({ label: b.batch_name, value: b.batch_id }))}
                  onChange={(opt) =>
                    setFilters((prev) => ({ ...prev, batch: opt.value, academicYear: "", semester: "" }))
                  }
                />

                <CustomSelect
                  label="Academic Year *"
                  value={academicYears.find((a) => a.academic_year_id === filters.academicYear)?.name || ""}
                  placeholder="Select Year"
                  disabled={!filters.batch}
                  options={academicYears.map((a) => ({ label: a.name, value: a.academic_year_id }))}
                  onChange={(opt) => setFilters((prev) => ({ ...prev, academicYear: opt.value, semester: "" }))}
                />

                <CustomSelect
                  label="Semester *"
                  value={semesters.find((s) => s.semester_id === filters.semester)?.name || ""}
                  placeholder="Select Semester"
                  disabled={!filters.academicYear}
                  options={semesters.map((s) => ({ label: s.name, value: s.semester_id }))}
                  onChange={(opt) => setFilters((prev) => ({ ...prev, semester: opt.value }))}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paper Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.paper_name}
                  onChange={(e) => setFormData({ ...formData, paper_name: e.target.value })}
                  placeholder="Enter paper name"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.paper_description}
                  onChange={(e) => setFormData({ ...formData, paper_description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Schedule & Subject - auto-filled if from props */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Schedule <span className="text-red-500">*</span>
                </label>
                {examSchedule ? (
                  <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700">
                    {examSchedule.examScheduleName}
                  </div>
                ) : (
                  <select
                    value={formData.exam_schedule_id}
                    onChange={(e) => setFormData({ ...formData, exam_schedule_id: e.target.value })}
                    required
                    disabled={!filters.academicYear}
                    className="w-full border rounded-lg px-4 py-2.5"
                  >
                    <option value="">Select Exam Schedule</option>
                    {examSchedules.map((sch) => (
                      <option key={sch.examScheduleId} value={sch.examScheduleId}>
                        {sch.examScheduleName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paper <span className="text-red-500">*</span>
                </label>
                {subjectName ? (
                  <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-gray-700">
                    {subjectName}
                  </div>
                ) : (
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                    disabled={!formData.exam_schedule_id}
                    className="w-full border rounded-lg px-4 py-2.5"
                  >
                    <option value="">Select Paper</option>
                    {subjects.map((sub) => (
                      <option key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

        {/* Auto-filled info */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Tool</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {selectedToolName || "— auto-filled —"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Marks</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {formData.min_marks || "— auto —"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {formData.max_marks || "— auto —"}
            </div>
          </div>
        </div> */}

        {/* Dates & Duration - shown for reference */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {formData.start_date_time || "— auto —"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {formData.end_date_time || "— auto —"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
            <div className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700">
              {formData.exam_duration || "— auto —"}
            </div>
          </div>
        </div> */}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Question Paper <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            disabled={uploading}
            className="w-full border rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="mt-2 text-blue-600">Uploading...</p>}
          {questionPaperUrl && (
            <p className="mt-2 text-green-600">File uploaded successfully ✓</p>
          )}
        </div>

        {/* Remark (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remark (optional)</label>
          <input
            type="text"
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            placeholder="Any additional notes..."
            className="w-full border rounded-lg px-4 py-2.5"
          />
        </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    navigate("/exam-management/papers");
                  }
                }}
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || uploading || !isFormValid}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Upload & Save Paper"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadExamPaper;