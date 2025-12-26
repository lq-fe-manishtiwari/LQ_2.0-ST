import React, { useState, useEffect, useRef } from "react";
import { Edit3, X, ChevronDown } from "lucide-react";
import { getTeacherAllocatedPrograms } from "../../../../../_services/api";
import { leaveService } from "../Services/Leave.Service";
import SweetAlert from "react-bootstrap-sweetalert";

/* =======================
   Custom Select Component
======================= */
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
        className={`w-full px-3 py-2 border rounded flex justify-between cursor-pointer ${
          disabled || loading
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

/* =======================
   Main Component
======================= */
export default function ClassLeave() {
  const [program, setProgram] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Full Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [teacherRemark, setTeacherRemark] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  /* =======================
     Fetch Allocations
  ======================= */
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const teacherId = userProfile?.user?.teacher_id || userProfile?.teacher_id;

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

  /* =======================
     Options
  ======================= */
  const programOptions = allocations
    .map((a) => ({
      value: a.program?.program_id?.toString(),
      label: a.program?.program_name,
    }))
    .filter((opt, i, arr) => opt.value && arr.findIndex((o) => o.value === opt.value) === i);

  const academicYearOptions = allocations
    .filter((a) => a.program?.program_id?.toString() === program)
    .map((a) => ({
      value: a.academic_year_id?.toString(),
      label: a.academic_year?.name,
    }))
    .filter((opt, i, arr) => opt.value && arr.findIndex((o) => o.value === opt.value) === i);

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
    .filter((opt, i, arr) => opt.value && arr.findIndex((o) => o.value === opt.value) === i);

  /* =======================
     Fetch Leaves
  ======================= */
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
          attachments: Array.isArray(leave.attachment) ? leave.attachment : [],
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

  /* =======================
     Open Full Review Form
  ======================= */
  const openReviewForm = (leave) => {
    setCurrentLeave(leave);
    setSelectedStatus(leave.status); // default to current
    setTeacherRemark("");
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setCurrentLeave(null);
    setTeacherRemark("");
    setSelectedStatus("");
  };

  /* =======================
     Save Status + Remark
  ======================= */
  const handleSaveReview = async () => {
    if (!currentLeave || !selectedStatus || selectedStatus === currentLeave.status) {
      closeReviewForm();
      return;
    }

    try {
      const payload = {
        leave_status: selectedStatus, // "APPROVED" or "REJECTED"
        remark: teacherRemark.trim(), 
      };

      await leaveService.updateLeaveStatus(currentLeave.id, payload);

      // Update local state
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === currentLeave.id
            ? { ...l, status: selectedStatus }
            : l
        )
      );

      closeReviewForm();

      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setAlert(null)}
        >
          Leave has been {selectedStatus === "APPROVED" ? "approved" : "rejected"} successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Failed to update leave:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
        >
          Failed to update leave status. Please try again.
        </SweetAlert>
      );
    }
  };

  /* =======================
     Status Badge
  ======================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* =======================
     Main List View
  ======================= */
  if (!showReviewForm) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        {alert}

        <h1 className="text-3xl font-bold text-blue-700 mb-8">Class Leaves Approval</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm mb-8">
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

        {/* Leaves Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {leavesLoading ? (
            <div className="p-12 text-center text-gray-500">Loading leaves...</div>
          ) : leaves.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {program && academicYear && semester
                ? "No leave requests found."
                : "Please select Program, Year, and Semester to view leaves."}
            </div>
          ) : (
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Sr</th>
                  <th className="table-th">Student</th>
                  <th className="table-th">Leave Type</th>
                  <th className="table-th">From → To</th>
                  <th className="table-th">Days</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{l.sr}</td>
                    <td className="p-4 font-medium">{l.studentName}</td>
                    <td className="p-4">{l.leaveType}</td>
                    <td className="p-4">{l.fromDate} → {l.toDate}</td>
                    <td className="p-4 text-center font-semibold">{l.days}</td>
                    <td className="p-4 text-center">
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* {l.status === "PENDING" ? ( */}
                        <button
                          onClick={() => openReviewForm(l)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Review Leave"
                        >
                          <Edit3 size={22} />
                        </button>
                      {/* ) : (
                        <span className="text-gray-400">—</span>
                      )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  /* =======================
     Full Review Form View
  ======================= */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {alert}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-700">Review Leave Request</h2>
            <button
              onClick={closeReviewForm}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              ← Back to List
            </button>
          </div>

          {currentLeave && (
            <div className="space-y-8">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <p className="text-lg font-semibold">{currentLeave.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <p className="text-lg">{currentLeave.leaveType}</p>
                </div>
              </div>

              {/* Dates & Days */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <p className="text-lg">{currentLeave.fromDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <p className="text-lg">{currentLeave.toDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
                  <p className="text-2xl font-bold text-blue-600">{currentLeave.days}</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentLeave.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border rounded-lg text-center hover:bg-blue-50 transition"
                      >
                        <div className="text-blue-600 font-medium">
                          View Attachment {idx + 1}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Click to open</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher's Remark & Status */}
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
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={closeReviewForm}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  disabled={selectedStatus === currentLeave.status}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Decision
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}