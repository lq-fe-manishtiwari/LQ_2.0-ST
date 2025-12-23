import React, { useState, useEffect } from "react";
import { leaveService } from "../Services/Leave.Service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function MyLeaves() {
  /* -------------------- DASHBOARD DATA -------------------- */


  /* -------------------- STATE FOR LEAVE RECORDS -------------------- */
  const [leaveRecords, setLeaveRecords] = useState([]);
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

  /* -------------------- MODAL STATE -------------------- */
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState(null);

  /* -------------------- LEAVE FORM STATE -------------------- */
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    leaveFor: "FULL_DAY",
    fromDate: "",
    toDate: "",
    days: "",
    remark: "",
    attachment: [],
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
        const collegeId = userProfile?.college_id;
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

        // Fetch user's leave records
        const leavesResponse = await leaveService.getLeavesByUserId(userId);
        
        const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
        
        const leavesWithSr = leaves.map((leave, index) => ({
          ...leave,
          sr: index + 1,
        }));

        setLeaveRecords(leavesWithSr);
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
    } catch (err) {
      console.error("Error refetching leaves:", err);
    }
  };

  const handleFormChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "attachment") {
    setLeaveForm((prev) => ({
      ...prev,
      newAttachments: Array.from(files)
    }));
  } else {
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }
};

  const resetFormAndCloseModal = () => {
    setShowLeaveModal(false);
    setIsEditMode(false);
    setEditingLeaveId(null);
    setLeaveForm({
      type: "",
      leaveFor: "FULL_DAY",
      fromDate: "",
      toDate: "",
      days: "",
      remark: "",
      attachment: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const user_id = userProfile?.user?.user_id || userProfile?.user_id;
      const college_id = userProfile?.college_id;

      const payload = {
        college_id,
        user_id,
        leave_type_id: leaveForm.type,
        leaveFor: leaveForm.leaveFor,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: leaveForm.days,
        remark: leaveForm.remark,
        attachment: leaveForm.attachment,
      };

      if (isEditMode) {
        await leaveService.updateLeave(editingLeaveId, payload);
        setSuccessMessage("Leave updated successfully!");
      } else {
        await leaveService.applyLeave(payload);
        setSuccessMessage("Leave applied successfully!");
      }

      setShowSuccessAlert(true);
      resetFormAndCloseModal();
      await refetchLeaves();
    } catch (error) {
      console.error("Failed to save leave", error);
      setErrorMessage("Failed to save leave. Please try again.");
      setShowErrorAlert(true);
    }
  };

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
  }

  setLeaveForm((prev) => ({
    ...prev,
    days: calculatedDays.toFixed(1),
  }));
}, [leaveForm.fromDate, leaveForm.toDate, leaveForm.leaveFor]);

  const handleEdit = (leave) => {
    setIsEditMode(true);
    setEditingLeaveId(leave.leave_id || leave.id);

    setLeaveForm({
      type: leave.leave_type_id || leave.type_id || "",
      leaveFor: leave.leave_duration || "FULL_DAY",
      fromDate: leave.from || leave.start_date || "",
      toDate: leave.to || leave.end_date || "",
      days: leave.days || leave.no_of_days || "",
      remark: leave.remark || "",
      existingAttachments: Array.isArray(leave.attachment)
      ? leave.attachment
      : [],
      attachment: [], // Files cannot be pre-filled
    });

    setShowLeaveModal(true);
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
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

   const displayLeaveFor = (leaveFor) => {
  switch (leaveFor) {
    case "FULL_DAY":
      return "Normal";
    case "HALF_DAY":
      return "Half Day";
    default:
      return "Normal";
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* -------------------- HEADER -------------------- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Leaves</h1>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Apply Leave
          </button>
        </div>

        {/* -------------------- LEAVE TABLE -------------------- */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading leaves...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : leaveRecords.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No leave records found.</div>
          ) : (
            <>
              <table className="w-full">
               <thead className="table-header">
                  <tr className="text-blue-700 text-left">
                    <th className="p-4">Sr No</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Leave For</th>
                    <th className="p-4">From</th>
                    <th className="p-4">To</th>
                    <th className="p-4">Days</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Remark</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((leave) => (
                    <tr key={leave.sr} className="border-t hover:bg-blue-50">
                      <td className="p-4">{leave.sr}</td>
                      <td className="p-4 font-medium">{leave.leave_type_name || leave.leave_type}</td>
                      <td className="p-4">{displayLeaveFor(leave.leave_duration || leave.leave_for)}</td>
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
                      <td className="p-4">{leave.remark || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleEdit(leave)}
                          className="mr-3 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H11v-.586l9.414-9.414z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(leave.apply_leave_id || leave.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H9V4a1 1 0 012-1h4a1 1 0 012 1v3" />
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

        {/* -------------------- APPLY / EDIT LEAVE MODAL -------------------- */}
    {/* -------------------- APPLY / EDIT LEAVE MODAL -------------------- */}
{showLeaveModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md lg:max-w-lg rounded-xl shadow-xl border p-5 relative max-h-[85vh] overflow-y-auto">

      <h2 className="text-2xl font-semibold mb-6">
        {isEditMode ? "Edit Leave" : "Apply Leave"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={leaveForm.type}
            onChange={(e) => {
              handleFormChange(e);
              // Reset days when leave type changes
              setLeaveForm((prev) => ({ ...prev, days: "" }));
            }}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((lt) => (
              <option key={lt.leave_type_id} value={lt.leave_type_id}>
                {lt.leave_type}{" "}
                {lt.no_of_days_allowed ? `(Max: ${lt.no_of_days_allowed} days)` : "(Unlimited)"}
              </option>
            ))}
          </select>
        </div>

        {/* Leave For */}
        <div>
          <label className="block text-sm font-medium mb-1">Leave For</label>
        <select
          name="leaveFor"
          value={leaveForm.leaveFor}
          onChange={handleFormChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="FULL_DAY">Normal</option>
          <option value="HALF_DAY">Half Day</option>
        </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fromDate"
              value={leaveForm.fromDate}
              onChange={(e) => {
                handleFormChange(e);
                // Auto-set To Date if HALF_DAY
                if (leaveForm.leaveFor === "HALF_DAY") {
                  setLeaveForm((prev) => ({
                    ...prev,
                    toDate: e.target.value,
                  }));
                }
              }}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="toDate"
              value={leaveForm.toDate}
              onChange={handleFormChange}
              required
              min={leaveForm.fromDate || new Date().toISOString().split("T")[0]}
              disabled={leaveForm.leaveFor === "HALF_DAY"}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                leaveForm.leaveFor === "HALF_DAY" ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* Auto-calculated Number of Days */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Days <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={leaveForm.days}
            disabled
            placeholder="Auto-calculated"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 cursor-not-allowed"
          />

          {/* Validation & Calculation Display */}
          {leaveForm.fromDate && leaveForm.toDate && leaveForm.type && (
            <>
              {(() => {
                const from = new Date(leaveForm.fromDate);
                const to = new Date(leaveForm.toDate);
                const diffTime = Math.abs(to - from);
                let calculatedDays = (diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

                if (leaveForm.leaveFor === "HALF_DAY") {
                  calculatedDays = 0.5;
                }

                const selectedType = leaveTypes.find(
                  (lt) => lt.leave_type_id === parseInt(leaveForm.type)
                );
                const maxAllowed = selectedType?.no_of_days_allowed
                  ? parseFloat(selectedType.no_of_days_allowed)
                  : null;

                const exceedsLimit = maxAllowed !== null && calculatedDays > maxAllowed;

                return (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      exceedsLimit ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {exceedsLimit
                      ? `⚠️ Requested: ${calculatedDays} days (Max allowed: ${maxAllowed} days)`
                      : `✓ Calculated: ${calculatedDays} day${calculatedDays !== 1 ? "s" : ""}`}
                  </p>
                );
              })()}
            </>
          )}
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium mb-1">Remark</label>
          <textarea
            name="remark"
            placeholder="Reason for leave"
            value={leaveForm.remark}
            onChange={handleFormChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Attachment */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Attachment (Optional)
          </label>
          <input
            type="file"
            name="attachment"
            onChange={handleFormChange}
            multiple
            className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {leaveForm.attachment.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected files: {leaveForm.attachment.map((f) => f.name).join(", ")}
            </div>
          )}
           {/* Existing Attachments */}
            {isEditMode && leaveForm.existingAttachments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Existing Attachments
                </p>
                <ul className="list-disc list-inside text-sm text-blue-600">
                  {leaveForm.existingAttachments.map((url, idx) => (
                    <li key={idx}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Attachment {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={resetFormAndCloseModal}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              !leaveForm.type ||
              !leaveForm.fromDate ||
              !leaveForm.toDate ||
              (() => {
                if (!leaveForm.type) return false;
                const selected = leaveTypes.find(
                  (lt) => lt.leave_type_id === parseInt(leaveForm.type)
                );
                const max = selected?.no_of_days_allowed
                  ? parseFloat(selected.no_of_days_allowed)
                  : null;
                if (max === null) return false;
                const from = new Date(leaveForm.fromDate);
                const to = new Date(leaveForm.toDate);
                let days = (Math.abs(to - from) / (1000 * 60 * 60 * 24)) + 1;
                if (leaveForm.leaveFor === "HALF_DAY") days = 0.5;
                return days > max;
              })()
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isEditMode ? "Update Leave" : "Submit Leave"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* -------------------- DELETE CONFIRMATION SWEETALERT -------------------- */}
        <SweetAlert
          show={showConfirmDelete}
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          title="Are you sure?"
           confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
          focusCancelBtn
        >
          This action cannot be undone.
        </SweetAlert>

        {/* -------------------- SUCCESS SWEETALERT -------------------- */}
        <SweetAlert
          show={showSuccessAlert}
          success
          title="Success!"
           confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          confirmBtnBsStyle="success"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>

        {/* -------------------- ERROR SWEETALERT -------------------- */}
        <SweetAlert
          show={showErrorAlert}
          error
          title="Error!"
           confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          confirmBtnBsStyle="danger"
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
  <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
  </div>
);