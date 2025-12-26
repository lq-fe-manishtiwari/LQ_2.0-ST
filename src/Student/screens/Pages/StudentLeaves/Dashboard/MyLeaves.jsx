import React, { useState, useEffect } from "react";
import { leaveService } from "../Services/Leave.Service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function MyLeaves() {
  /* -------------------- STATE FOR LEAVE RECORDS -------------------- */
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
const [showPolicy, setShowPolicy] = useState(false);


  /* -------------------- PAGINATION -------------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const totalEntries = leaveRecords.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const currentEntries = leaveRecords.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  /* -------------------- FULL PAGE FORM STATE -------------------- */
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [oldDays, setOldDays] = useState(0);

  /* -------------------- LEAVE FORM STATE -------------------- */
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    leaveFor: "FULL_DAY",
    fromDate: "",
    toDate: "",
    days: "",
    reason: "",
    newAttachments: [],
    existingAttachments: [],
  });

  /* -------------------- DYNAMIC LEAVE TYPES -------------------- */
  const [leaveTypes, setLeaveTypes] = useState([]);

  /* -------------------- SWEETALERT STATES -------------------- */
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* -------------------- FETCH LEAVE TYPES & USER LEAVES -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const collegeId = userProfile?.college_id || "16";
        const userId = userProfile?.user?.user_id || userProfile?.user_id;

        if (!collegeId || !userId) {
          setError("User profile not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch leave types
        const typesResponse = await leaveService.getLeaveTypesByCollegeId(collegeId);
        const studentLeaveTypes = Array.isArray(typesResponse)
          ? typesResponse.filter((lt) => lt.user_type === "STUDENT" && lt.is_active)
          : [];
        setLeaveTypes(studentLeaveTypes);

        // Fetch user's leaves
        const leavesResponse = await leaveService.getLeavesByUserId(userId);
        const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
        const leavesWithSr = leaves.map((leave, index) => ({
          ...leave,
          sr: index + 1,
        }));
        setLeaveRecords(leavesWithSr);

        // Fetch leave summary
        const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
        setLeaveSummary(summaryResponse);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load leave data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refetchLeaves = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userId = userProfile?.user?.user_id || userProfile?.user_id;

      const leavesResponse = await leaveService.getLeavesByUserId(userId);
      const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
      const leavesWithSr = leaves.map((leave, index) => ({
        ...leave,
        sr: index + 1,
      }));
      setLeaveRecords(leavesWithSr);

      const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
      setLeaveSummary(summaryResponse);
    } catch (err) {
      console.error("Error refetching leaves:", err);
    }
  };

const handleFormChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "type") {
    const policyObj = leaveTypes.find(
      (lt) => lt.leave_type_id === parseInt(value)
    );
    setSelectedPolicy(policyObj?.leave_policy || null);
  }

  if (name === "attachment") {
    setLeaveForm((prev) => ({
      ...prev,
      newAttachments: Array.from(files),
    }));
  } else {
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const resetFormAndClose = () => {
    setShowFullPageForm(false);
    setIsEditMode(false);
    setEditingLeaveId(null);
    setEditingStatus(null);
    setOldDays(0);
    setLeaveForm({
      type: "",
      leaveFor: "FULL_DAY",
      fromDate: "",
      toDate: "",
      days: "",
      reason: "",
      newAttachments: [],
      existingAttachments: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const user_id = userProfile?.user?.user_id || userProfile?.user_id;
      const college_id = userProfile?.college_id || "16";

      if (!user_id || !college_id) {
        setErrorMessage("User information missing. Please log in again.");
        setShowErrorAlert(true);
        return;
      }

      const basePayload = {
        college_id,
        user_id,
        leave_type_id: leaveForm.type,
        leaveFor: leaveForm.leaveFor,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: leaveForm.days,
        reason: leaveForm.reason,
        attachment: leaveForm.newAttachments,
      };

      if (isEditMode) {
        await leaveService.updateLeaveForm(editingLeaveId, basePayload);
        setSuccessMessage("Leave updated successfully!");
      } else {
        await leaveService.applyLeave({
          ...basePayload,
          leave_status: "Pending",
        });
        setSuccessMessage("Leave applied successfully!");
      }

      setShowSuccessAlert(true);
      resetFormAndClose();
      await refetchLeaves();
    } catch (error) {
      console.error("Failed to save leave:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to save leave. Please try again."
      );
      setShowErrorAlert(true);
    }
  };

  // Function to count weekdays (Mon-Fri)
  const countWeekdays = (startDate, endDate) => {
    let count = 0;
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count += 1;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // Auto-calculate days
  useEffect(() => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.type) {
      setLeaveForm((prev) => ({ ...prev, days: "" }));
      return;
    }

    const selectedType = leaveTypes.find(
      (lt) => lt.leave_type_id === parseInt(leaveForm.type)
    );
    if (!selectedType) return;

    const from = new Date(leaveForm.fromDate);
    const to = new Date(leaveForm.toDate);
    if (to < from) {
      setLeaveForm((prev) => ({ ...prev, days: "" }));
      return;
    }

    const diffTime = to - from;
    const totalCalendarDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let calculatedDays = 0;

    if (leaveForm.leaveFor === "HALF_DAY") {
      setLeaveForm((prev) => ({ ...prev, toDate: prev.fromDate }));
      calculatedDays = 0.5;

      if (!selectedType.is_includes_weekends) {
        const day = from.getDay();
        if (day === 0 || day === 6) calculatedDays = 0;
      }
    } else {
      const weekdays = countWeekdays(leaveForm.fromDate, leaveForm.toDate);
      if (selectedType.is_includes_weekends) {
        calculatedDays = totalCalendarDays;
      } else {
        if (selectedType.is_sandwich_leaves && totalCalendarDays > weekdays) {
          calculatedDays = totalCalendarDays;
        } else {
          calculatedDays = weekdays;
        }
      }
    }

    setLeaveForm((prev) => ({
      ...prev,
      days: calculatedDays > 0 ? calculatedDays.toFixed(1) : "",
    }));
  }, [leaveForm.fromDate, leaveForm.toDate, leaveForm.leaveFor, leaveForm.type, leaveTypes]);

  const handleEdit = (leave) => {
    setIsEditMode(true);
    setEditingLeaveId(leave.apply_leave_id || leave.id);
    setEditingStatus(leave.leave_status);
    setOldDays(leave.days || leave.no_of_days);

    setLeaveForm({
      type: leave.leave_type_id?.toString() || "",
      leaveFor: leave.leave_duration || leave.leaveFor || "FULL_DAY",
      fromDate: leave.from || leave.start_date || leave.fromDate || "",
      toDate: leave.to || leave.end_date || leave.toDate || "",
      days: leave.days || leave.no_of_days || "",
      reason: leave.reason || leave.remark || "",
      existingAttachments: Array.isArray(leave.attachment)
        ? leave.attachment.filter(Boolean)
        : [],
      newAttachments: [],
    });
    setShowFullPageForm(true);
  };

  const confirmDelete = (leaveId) => {
    setDeleteLeaveId(leaveId);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      await leaveService.hardDeleteLeave(deleteLeaveId);
      setSuccessMessage("Leave deleted successfully!");
      setShowSuccessAlert(true);
      await refetchLeaves();
    } catch (error) {
      console.error("Failed to delete leave", error);
      setErrorMessage("Failed to delete leave. Please try again.");
      setShowErrorAlert(true);
    } finally {
      setShowConfirmDelete(false);
      setDeleteLeaveId(null);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "Rejected":
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const displayLeaveFor = (leaveFor) => {
    return leaveFor === "HALF_DAY" ? "Half Day" : "Normal";
  };

  // Compute available days (Approved + Pending deducted)
 const getAvailableDays = (leaveTypeId) => {
  // Best source: leaveSummary from dedicated API
  if (leaveSummary && leaveSummary.leave_summary) {
    const summaryItem = leaveSummary.leave_summary.find(
      item => item.leave_type_id === parseInt(leaveTypeId)
    );
    if (summaryItem && summaryItem.balance !== undefined) {
      return Math.max(0, parseFloat(summaryItem.balance));
    }
  }

  // Fallback to old logic if summary not available
  const selectedType = leaveTypes.find((lt) => lt.leave_type_id === parseInt(leaveTypeId));
  if (!selectedType || selectedType.no_of_days_allowed == null) return Infinity;

  const allowed = parseFloat(selectedType.no_of_days_allowed);
  let approvedDays = 0;
  let pendingDays = 0;

  leaveRecords.forEach((leave) => {
    if (leave.leave_type_id === parseInt(leaveTypeId)) {
      const days = parseFloat(leave.days || leave.no_of_days || 0);
      if (leave.leave_status === "Approved" || leave.leave_status === "APPROVED") {
        approvedDays += days;
      } else if (leave.leave_status === "Pending") {
        pendingDays += days;
      }
    }
  });

  if (isEditMode && editingLeaveId) {
    const oldD = parseFloat(oldDays || 0);
    if (editingStatus === "Approved" || editingStatus === "APPROVED") approvedDays -= oldD;
    else if (editingStatus === "Pending") pendingDays -= oldD;
  }

  return Math.max(0, allowed - (approvedDays + pendingDays));
};

  // Improved validation message
  const getDaysValidationMessage = () => {
    if (!leaveForm.type) return null;

    const available = getAvailableDays(leaveForm.type);

    if (available === Infinity) {
      if (!leaveForm.days || parseFloat(leaveForm.days) <= 0) {
        return "⚠️ Invalid date selection (e.g., weekends not counted)";
      }
      return `✓ ${leaveForm.days} day${leaveForm.days !== "1" ? "s" : ""} requested (Unlimited)`;
    }

    if (available <= 0) {
      return "❌ No leave balance remaining for this type";
    }

    if (!leaveForm.days || parseFloat(leaveForm.days) <= 0) {
      return "⚠️ Invalid date selection";
    }

    const requested = parseFloat(leaveForm.days);

    if (requested > available + 0.0001) {
      return `⚠️ Exceeds limit: Only ${available} day${available !== 1 ? "s" : ""} available`;
    }

    return `✓ ${requested} day${requested !== 1 ? "s" : ""} requested (${available} remaining)`;
  };

  const isSubmitDisabled = () => {
    if (
      !leaveForm.type ||
      !leaveForm.fromDate ||
      !leaveForm.toDate ||
      !leaveForm.days ||
      parseFloat(leaveForm.days) <= 0
    ) {
      return true;
    }

    const available = getAvailableDays(leaveForm.type);
    if (available !== Infinity && parseFloat(leaveForm.days) > available + 0.0001) {
      return true;
    }

    return false;
  };

  // ==================== FULL PAGE FORM VIEW ====================
  if (showFullPageForm) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
           <div className="flex justify-between items-center mb-8">
  <div className="flex items-center gap-4">
    <button
      onClick={resetFormAndClose}
      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
    >
      ← Back to Leaves
    </button>

    {selectedPolicy && (
      <button
        type="button"
        onClick={() => setShowPolicy(!showPolicy)}
        className="text-blue-600 text-sm font-medium hover:underline"
      >
        📄 View Leave Policy
      </button>
    )}
  </div>

  <h2 className="text-3xl font-bold text-blue-700">
    {isEditMode ? "Edit Leave" : "Apply Leave"}
  </h2>
</div>

{showPolicy && selectedPolicy && (
  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="font-semibold text-blue-700 mb-2">
      Leave Policy Details
    </h3>
    <p className="text-sm text-gray-700 whitespace-pre-line">
      {selectedPolicy}
    </p>
  </div>
)}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={leaveForm.type}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => {
                    const available = getAvailableDays(lt.leave_type_id);
                    const isDisabled = available <= 0 && available !== Infinity;

                    return (
                      <option
                        key={lt.leave_type_id}
                        value={lt.leave_type_id}
                        disabled={isDisabled}
                      >
                        {lt.leave_type}{" "}
                        {lt.no_of_days_allowed
                          ? `(Max: ${lt.no_of_days_allowed} days, ${lt.is_paid ? "Paid" : "Unpaid"}) ${
                              isDisabled
                                ? "- No balance left"
                                : `- ${available} day${available !== 1 ? "s" : ""} left`
                            }`
                          : `(Unlimited, ${lt.is_paid ? "Paid" : "Unpaid"})`}
                      </option>
                    );
                  })}
                </select>

                {leaveForm.type && getAvailableDays(leaveForm.type) <= 0 && getAvailableDays(leaveForm.type) !== Infinity && (
                  <p className="text-red-600 text-sm mt-2">
                    ❌ You have no remaining balance for this leave type.
                  </p>
                )}
              </div>

              {/* Leave For */}
              <div>
                <label className="block text-sm font-medium mb-2">Leave For</label>
                <select
                  name="leaveFor"
                  value={leaveForm.leaveFor}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FULL_DAY">Normal</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={leaveForm.fromDate}
                    onChange={handleFormChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={leaveForm.toDate}
                    onChange={handleFormChange}
                    required
                    min={leaveForm.fromDate || new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {leaveForm.leaveFor === "HALF_DAY" && (
                    <p className="text-xs text-gray-500 mt-1">
                      To Date auto-set to From Date for Half Day
                    </p>
                  )}
                </div>
              </div>

              {/* Number of Days */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Days
                </label>
                <input
                  type="text"
                  value={leaveForm.days || ""}
                  readOnly
                  placeholder="Auto-calculated"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
                {getDaysValidationMessage() && (
                  <p
                    className={`mt-3 text-sm font-medium ${
                      getDaysValidationMessage().includes("Exceeds") ||
                      getDaysValidationMessage().includes("No balance") ||
                      getDaysValidationMessage().includes("Invalid")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {getDaysValidationMessage()}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <textarea
                  name="reason"
                  placeholder="Reason for leave (optional)"
                  value={leaveForm.reason}
                  onChange={handleFormChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFormChange}
                  multiple
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {leaveForm.newAttachments.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {leaveForm.newAttachments.map((f) => f.name).join(", ")}
                  </div>
                )}
                {isEditMode && leaveForm.existingAttachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Existing Attachments
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-600">
                      {leaveForm.existingAttachments.map((url, idx) => (
                        <li key={idx}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Attachment {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isEditMode ? "Update Leave" : "Apply Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
        

        {/* SweetAlerts */}
        <SweetAlert
          show={showConfirmDelete}
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        >
          This action cannot be undone.
        </SweetAlert>
        <SweetAlert
          show={showSuccessAlert}
          success
          title="Success!"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>
        <SweetAlert
          show={showErrorAlert}
          error
          title="Error!"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      </div>
    );
  }

  // ==================== MAIN LIST VIEW ====================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Leaves</h1>
          <button
            onClick={() => setShowFullPageForm(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Apply Leave
          </button>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading leaves...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : leaveRecords.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No leave records found.</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="table-th">Sr No</th>
                    <th className="table-th">Leave Type</th>
                    <th className="table-th">Leave For</th>
                    <th className="table-th">From</th>
                    <th className="table-th">To</th>
                    <th className="table-th">Days</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Reason</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((leave) => (
                    <tr key={leave.sr} className="border-t hover:bg-blue-50">
                      <td className="p-4">{leave.sr}</td>
                      <td className="p-4 font-medium">
                        {leave.leave_type_name || leave.leave_type}
                      </td>
                      <td className="p-4">{displayLeaveFor(leave.leave_duration || leave.leaveFor)}</td>
                      <td className="p-4">{leave.from || leave.start_date}</td>
                      <td className="p-4">{leave.to || leave.end_date}</td>
                      <td className="p-4">{leave.days || leave.no_of_days}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                            leave.leave_status
                          )}`}
                        >
                          {leave.leave_status}
                        </span>
                      </td>
                      <td className="p-4">{leave.reason || leave.remark || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleEdit(leave)}
                          className="mr-3 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H11v-.586l9.414-9.414z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(leave.apply_leave_id || leave.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H9V4a1 1 0 012-1h4a1 1 0 012 1v3"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center py-4 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* SweetAlerts */}
        <SweetAlert
          show={showConfirmDelete}
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        >
          This action cannot be undone.
        </SweetAlert>
        <SweetAlert
          show={showSuccessAlert}
          success
          title="Success!"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>
        <SweetAlert
          show={showErrorAlert}
          error
          title="Error!"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      </div>
    </div>
  );
}