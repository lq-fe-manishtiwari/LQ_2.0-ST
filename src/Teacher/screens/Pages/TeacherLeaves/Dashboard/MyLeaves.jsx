import React, { useState, useEffect } from "react";
import { leaveService } from "../Services/Leave.Service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function MyLeaves() {
  /* -------------------- STATE FOR LEAVE RECORDS -------------------- */
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null); // ← Added missing state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const teacherLeaveTypes = Array.isArray(typesResponse)
          ? typesResponse.filter((lt) => lt.user_type === "TEACHER")
          : [];
        setLeaveTypes(teacherLeaveTypes);

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
        setLeaveSummary(summaryResponse); // Now this works!

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

      // Optionally refetch summary too
      const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
      setLeaveSummary(summaryResponse);
    } catch (err) {
      console.error("Error refetching leaves:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

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

  // Auto-calculate days
  useEffect(() => {
    if (!leaveForm.fromDate || !leaveForm.toDate) {
      setLeaveForm((prev) => ({ ...prev, days: "" }));
      return;
    }

    const from = new Date(leaveForm.fromDate);
    const to = new Date(leaveForm.toDate);
    const diffTime = Math.abs(to - from);
    let calculatedDays = (diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (leaveForm.leaveFor === "HALF_DAY") {
      calculatedDays = 0.5;
      setLeaveForm((prev) => ({ ...prev, toDate: prev.fromDate }));
    }

    setLeaveForm((prev) => ({
      ...prev,
      days: calculatedDays.toFixed(1),
    }));
  }, [leaveForm.fromDate, leaveForm.toDate, leaveForm.leaveFor]);

  const handleEdit = (leave) => {
    setIsEditMode(true);
    setEditingLeaveId(leave.apply_leave_id || leave.id);

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

  const getDaysValidationMessage = () => {
    if (!leaveForm.type || !leaveForm.days) return null;

    const selectedType = leaveTypes.find(
      (lt) => lt.leave_type_id === parseInt(leaveForm.type)
    );
    const maxAllowed = selectedType?.no_of_days_allowed
      ? parseFloat(selectedType.no_of_days_allowed)
      : null;
    const requested = parseFloat(leaveForm.days);

    if (maxAllowed === null) return null;
    if (requested > maxAllowed) {
      return `⚠️ Exceeds limit: Requested ${requested} days (Max: ${maxAllowed})`;
    }
    return `✓ ${requested} day${requested !== 1 ? "s" : ""} requested`;
  };

  const isSubmitDisabled = () => {
    if (!leaveForm.type || !leaveForm.fromDate || !leaveForm.toDate || !leaveForm.days) {
      return true;
    }

    const selectedType = leaveTypes.find(
      (lt) => lt.leave_type_id === parseInt(leaveForm.type)
    );
    const maxAllowed = selectedType?.no_of_days_allowed
      ? parseFloat(selectedType.no_of_days_allowed)
      : null;

    if (maxAllowed !== null && parseFloat(leaveForm.days) > maxAllowed) {
      return true;
    }

    return false;
  };

  // Full Page Form View (unchanged except label capitalization)
  if (showFullPageForm) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-700">
                {isEditMode ? "Edit Leave" : "Apply Leave"}
              </h2>
              <button
                onClick={resetFormAndClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                ← Back to Leaves
              </button>
            </div>

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
                  {leaveTypes.map((lt) => (
                    <option key={lt.leave_type_id} value={lt.leave_type_id}>
                      {lt.leave_type}{" "}
                      {lt.no_of_days_allowed
                        ? `(Max: ${lt.no_of_days_allowed} days)`
                        : "(Unlimited)"}
                    </option>
                  ))}
                </select>
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
                      getDaysValidationMessage().includes("Exceeds")
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

        {/* SweetAlerts remain the same */}
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

  // Main List View with Enhanced Summary Cards
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Overall Stats */}
        {/* {leaveSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Applied" value={leaveSummary.total_applied || 0} />
            <StatCard title="Approved" value={leaveSummary.total_approved || 0} />
            <StatCard title="Pending" value={leaveSummary.total_pending || 0} />
            <StatCard title="Rejected" value={leaveSummary.total_rejected || 0} />
          </div>
        )} */}

        {/* Leave Balance Summary */}
        {/* {leaveSummary && leaveSummary.leave_summary && leaveSummary.leave_summary.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Leave Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveSummary.leave_summary.map((item) => (
                <div
                  key={item.leave_type_id}
                  className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition border"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.leave_type_name}
                  </h3>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-blue-600">
                      {item.approved || 0} / {item.balance + (item.approved || 0)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Remaining: <span className="font-medium text-green-600">{item.balance}</span> days
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      <span>Applied: {item.applied}</span> |{" "}
                      <span>Pending: {item.pending}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Leaves</h1>
          <button
            onClick={() => setShowFullPageForm(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Apply Leave
          </button>
        </div>

        {/* Leave Table */}
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
    <th className="table-th text-center">Actions</th>
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

              {/* Pagination */}
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

/* -------------------- STAT CARD COMPONENT -------------------- */
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-center">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-4xl font-bold text-blue-600 mt-3">{value}</p>
  </div>
);