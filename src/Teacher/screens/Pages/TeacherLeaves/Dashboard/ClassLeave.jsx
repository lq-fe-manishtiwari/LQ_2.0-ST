import React, { useState, useEffect, useRef } from "react";
import {
  Edit,
  Eye,
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ChevronDown, // Added missing import
} from "lucide-react";
import { getTeacherAllocatedPrograms } from "../../../../../_services/api";
import { leaveService } from "../Services/Leave.Service";
import SweetAlert from "react-bootstrap-sweetalert";

/* ======================= Custom Select Component ======================= */
const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const displayValue =
    options.find((opt) => opt.value?.toString() === value?.toString())?.label ||
    "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border rounded flex justify-between cursor-pointer ${disabled || loading
            ? "bg-gray-100 text-gray-500"
            : "bg-white hover:border-blue-400"
          }`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span>{loading ? "Loading..." : displayValue || placeholder}</span>
        <ChevronDown className="w-4 h-4 mt-1" />
      </div>
      {isOpen && !disabled && !loading && (
        <div className="absolute z-20 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ======================= Main Component ======================= */
export default function ClassLeave() {
  const [program, setProgram] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [teacherRemark, setTeacherRemark] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  /* ======================= Fetch Allocations ======================= */
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const userProfile = JSON.parse(
          localStorage.getItem("userProfile") || "{}"
        );
        const teacherId =
          userProfile?.user?.teacher_id || userProfile?.teacher_id;

        const response = await getTeacherAllocatedPrograms(teacherId);
        const normal = response?.data?.normal_allocation || [];
        const classTeacher = response?.data?.class_teacher_allocation || [];

        setAllocations([...normal, ...classTeacher]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  /* ======================= Derived Options ======================= */
  const programOptions = allocations
    .map((a) => ({
      value: a.program?.program_id?.toString(),
      label: a.program?.program_name,
    }))
    .filter(
      (opt, i, arr) =>
        opt.value && arr.findIndex((o) => o.value === opt.value) === i
    );

  const academicYearOptions = allocations
    .filter((a) => a.program?.program_id?.toString() === program)
    .map((a) => ({
      value: a.academic_year_id?.toString(),
      label: a.academic_year?.name,
    }))
    .filter(
      (opt, i, arr) =>
        opt.value && arr.findIndex((o) => o.value === opt.value) === i
    );

  const semesterOptions = allocations
    .filter(
      (a) =>
        a.program?.program_id?.toString() === program &&
        a.academic_year_id?.toString() === academicYear
    )
    .map((a) => ({
      value: a.semester_id?.toString(),
      label: a.semester?.name,
    }))
    .filter(
      (opt, i, arr) =>
        opt.value && arr.findIndex((o) => o.value === opt.value) === i
    );

  /* ======================= Fetch Leaves ======================= */
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!academicYear || !semester) {
        setLeaves([]);
        return;
      }

      setLeavesLoading(true);
      try {
        const response = await leaveService.getLeaveByAcaddemicyearIdSemesterId(
          parseInt(academicYear),
          parseInt(semester)
        );

        const data = Array.isArray(response) ? response : [];
        const formatted = data.map((leave, index) => ({
          id: leave.apply_leave_id,
          sr: index + 1,
          studentName: `${leave.first_name || ""} ${leave.last_name || ""}`.trim(),
          leaveType: leave.leave_type_name || leave.leave_type,
          fromDate: leave.start_date,
          toDate: leave.end_date,
          days: leave.no_of_days,
          status: leave.leave_status,
          studentReason: leave.remark || "",
          attachments: Array.isArray(leave.attachment)
            ? leave.attachment.filter(Boolean)
            : [],
        }));

        setLeaves(formatted);
      } catch (err) {
        console.error(err);
        setLeaves([]);
      } finally {
        setLeavesLoading(false);
      }
    };

    fetchLeaves();
  }, [academicYear, semester]);

  /* ======================= Status Helpers ======================= */
  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  /* ======================= Review Form Controls ======================= */
  const openReviewForm = (leave) => {
    setCurrentLeave(leave);
    setSelectedStatus(leave.status);
    setTeacherRemark("");
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setCurrentLeave(null);
    setTeacherRemark("");
    setSelectedStatus("");
  };

  const handleSaveReview = async () => {
    if (
      !currentLeave ||
      !selectedStatus ||
      selectedStatus === currentLeave.status
    ) {
      closeReviewForm();
      return;
    }

    try {
      const payload = {
        leave_status: selectedStatus,
        remark: teacherRemark.trim(),
      };

      await leaveService.updateLeaveStatus(currentLeave.id, payload);

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === currentLeave.id ? { ...l, status: selectedStatus } : l
        )
      );

      closeReviewForm();
      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setAlert(null)}
        >
          Leave has been{" "}
          {selectedStatus === "APPROVED" ? "approved" : "rejected"} successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Failed to update leave:", err);
      setAlert(
        <SweetAlert danger title="Error!" onConfirm={() => setAlert(null)}>
          Failed to update leave status. Please try again.
        </SweetAlert>
      );
    }
  };

  /* ======================= Attachment Preview ======================= */
  const handleViewAttachment = (url, name = "Attachment") => {
    let fileType = "application/octet-stream";
    if (url) {
      const extension = url.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
        fileType = `image/${extension === "jpg" ? "jpeg" : extension}`;
      } else if (extension === "pdf") {
        fileType = "application/pdf";
      }
    }
    setPreviewFile({ url, name, type: fileType });
  };

  /* ======================= Pagination ======================= */
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const totalEntries = leaves.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = leaves.slice(indexOfFirstEntry, indexOfLastEntry);

  /* ======================= Conditional Rendering ======================= */

  // Review Form View
  if (showReviewForm) {
    return (
      <>
        {alert}
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">
                    Review Leave Request
                  </h2>
                  <button
                    onClick={closeReviewForm}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 border rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                </div>
              </div>

              {currentLeave && (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name
                      </label>
                      <p className="text-lg font-semibold">{currentLeave.studentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type
                      </label>
                      <p className="text-lg">{currentLeave.leaveType}</p>
                    </div>
                  </div>

                  {/* Dates & Days */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <p className="text-lg">{currentLeave.fromDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <p className="text-lg">{currentLeave.toDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Days
                      </label>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentLeave.days}
                      </p>
                    </div>
                  </div>

                  {/* Student's Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student's Reason
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {currentLeave.studentReason || "No reason provided"}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {currentLeave.attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Attachments ({currentLeave.attachments.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentLeave.attachments.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleViewAttachment(url, `Attachment ${idx + 1}`)
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
                          >
                            <Eye size={16} />
                            View Attachment {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Input */}
                  <div className="space-y-6 pt-6 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Remark (Optional)
                      </label>
                      <textarea
                        value={teacherRemark}
                        onChange={(e) => setTeacherRemark(e.target.value)}
                        rows="4"
                        placeholder="Add note or reason for your decision..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approve</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6">
                    <button
                      onClick={closeReviewForm}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReview}
                      // disabled={selectedStatus === currentLeave.status}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shared Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold truncate">
                  {previewFile.name}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 bg-gray-50">
                {previewFile.type.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="w-full h-full object-contain"
                  />
                ) : previewFile.type === "application/pdf" ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <FileText className="w-16 h-16 mb-4 text-gray-400" />
                    <p>Preview not available for this file type.</p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download Instead
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Main List View
  return (
    <>
      {alert}
      <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
              Class Leaves Approval
            </h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
            <CustomSelect
              label="Program"
              value={program}
              onChange={setProgram}
              options={programOptions}
              placeholder="Select Program"
              loading={loading}
            />
            <CustomSelect
              label="Academic Year"
              value={academicYear}
              onChange={setAcademicYear}
              options={academicYearOptions}
              placeholder="Select Academic Year"
              disabled={!program}
            />
            <CustomSelect
              label="Semester"
              value={semester}
              onChange={setSemester}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={!academicYear}
            />
          </div>

          {/* Table / Cards Container */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {leavesLoading ? (
              <div className="p-8 sm:p-10 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                Loading leaves...
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-8 sm:p-10 text-center text-gray-500">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No leave records
                  </h3>
                  <p className="text-gray-500">
                    {program && academicYear && semester
                      ? "No leave requests found for the selected criteria."
                      : "Please select Program, Year, and Semester to view leaves."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="table-header">
                        <tr>
                          <th className="table-th p-4 text-left font-semibold">Sr. No.</th>
                          <th className="table-th p-4 text-left font-semibold">Student Name</th>
                          <th className="table-th p-4 text-left font-semibold">Leave Type</th>
                          <th className="table-th p-4 text-left font-semibold">From</th>
                          <th className="table-th p-4 text-left font-semibold">To</th>
                          <th className="table-th p-4 text-left font-semibold">Days</th>
                          <th className="table-th p-4 text-left font-semibold">Status</th>
                          <th className="table-th p-4 text-left font-semibold">Attachments</th>
                          <th className="table-th p-4 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentEntries.map((leave) => (
                          <tr
                            key={leave.id}
                            className="border-t hover:bg-blue-50 transition-colors"
                          >
                            <td className="p-4">{leave.sr}</td>

                            <td className="p-4 font-medium">
                              {leave.studentName}
                            </td>

                            <td className="p-4">
                              {leave.leaveType}
                            </td>

                            <td className="p-4">
                              {leave.fromDate}
                            </td>

                            <td className="p-4">
                              {leave.toDate}
                            </td>

                            <td className="p-4">
                              {leave.days}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${statusColor(
                                  leave.status
                                )}`}
                              >
                                {getStatusIcon(leave.status)}
                                {leave.status}
                              </span>
                            </td>

                            <td className="p-4">
                              {leave.attachments.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {leave.attachments.map((url, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() =>
                                        handleViewAttachment(url, `Attachment ${idx + 1}`)
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 border border-blue-200"
                                    >
                                      <Eye className="w-3 h-3" />
                                      View
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => openReviewForm(leave)}
                                className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition border border-amber-200"
                                title="Review Leave"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>


                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {currentEntries.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            #{leave.sr}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${statusColor(
                              leave.status
                            )}`}
                          >
                            {getStatusIcon(leave.status)}
                            {leave.status}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-800">
                          {leave.days} day{leave.days !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {leave.studentName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{leave.leaveType}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {leave.studentReason || "No reason provided"}
                          </p>
                        </div>

                        {leave.attachments.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {leave.attachments.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    handleViewAttachment(url, `Attachment ${idx + 1}`)
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 border border-blue-200"
                                >
                                  <Eye size={12} />
                                  View {idx + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">From</p>
                              <p className="text-sm font-medium">{leave.fromDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">To</p>
                              <p className="text-sm font-medium">{leave.toDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Days</p>
                              <p className="text-sm font-medium">{leave.days}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Edit className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Action</p>
                              <button
                                onClick={() => openReviewForm(leave)}
                                className="p-1.5 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition border border-amber-200 mt-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                        {Math.min(currentPage * entriesPerPage, totalEntries)} of{" "}
                        {totalEntries} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => {
                            if (
                              window.innerWidth < 640 &&
                              Math.abs(i + 1 - currentPage) > 1 &&
                              i + 1 !== 1 &&
                              i + 1 !== totalPages
                            ) {
                              if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                return (
                                  <span key={i} className="px-2 py-1">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            }
                            return (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1.5 rounded text-sm ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Shared Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold truncate">
                  {previewFile.name}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 bg-gray-50">
                {previewFile.type.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="w-full h-full object-contain"
                  />
                ) : previewFile.type === "application/pdf" ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <FileText className="w-16 h-16 mb-4 text-gray-400" />
                    <p>Preview not available for this file type.</p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download Instead
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}