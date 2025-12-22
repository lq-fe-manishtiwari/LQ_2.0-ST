import React, { useState, useEffect } from "react";
import { leaveService } from "../Services/Leave.Service";

export default function MyLeaves() {
  /* -------------------- DASHBOARD DATA (You can also fetch this dynamically if needed) -------------------- */
  const leaveStats = {
    balance: 12,
    approved: 8,
    total: 15,
    byType: [
      { type: "Casual Leave", count: 5 },
      { type: "Medical Leave", count: 3 },
      { type: "Duty Leave", count: 2 },
    ],
  };

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

  /* -------------------- LEAVE FORM STATE -------------------- */
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    leaveFor: "Normal",
    fromDate: "",
    toDate: "",
    days: "",
    remark: "",
    attachment: [], // array of File objects
  });

  /* -------------------- DYNAMIC LEAVE TYPES -------------------- */
  const [leaveTypes, setLeaveTypes] = useState([]);

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
        setLeaveTypes(typesResponse || []);

        // Fetch user's leave records
        const leavesResponse = await leaveService.getLeavesByUserId(userId);
        
        // Ensure data is an array
        const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
        
        // Add serial number
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

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "attachment") {
      setLeaveForm({
        ...leaveForm,
        attachment: Array.from(files),
      });
    } else {
      setLeaveForm({
        ...leaveForm,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const user_id = userProfile?.user?.user_id || userProfile?.user_id;

      const payload = {
        college_id: userProfile?.college_id,
        user_id: user_id,
        leave_type_id: leaveForm.type,
        leaveFor: leaveForm.leaveFor,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: leaveForm.days,
        remark: leaveForm.remark,
        attachment: leaveForm.attachment,
      };

      await leaveService.applyLeave(payload);

      alert("Leave applied successfully");
      setShowLeaveModal(false);

      // Reset form
      setLeaveForm({
        type: "",
        leaveFor: "Normal",
        fromDate: "",
        toDate: "",
        days: "",
        remark: "",
        attachment: [],
      });

      // Optionally: Refresh leave records after applying new leave
      // You can refetch here if needed
    } catch (error) {
      console.error("Failed to apply leave", error);
      alert("Failed to apply leave");
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

        {/* -------------------- DASHBOARD CARDS -------------------- */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Leave Balance" value={leaveStats.balance} />
          <StatCard title="Leaves Approved" value={leaveStats.approved} />
          <StatCard title="Total Leaves" value={leaveStats.total} />
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
            <p className="text-sm font-semibold mb-2">Leave by Type</p>
            {leaveStats.byType.map((l, i) => (
              <p key={i} className="text-sm text-gray-700">
                {l.type}: <b>{l.count}</b>
              </p>
            ))}
          </div>
        </div> */}

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
                <thead className="bg-blue-50">
                  <tr className="text-blue-700 text-left">
                    <th className="p-4">Sr No</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Leave For</th>
                    <th className="p-4">From</th>
                    <th className="p-4">To</th>
                    <th className="p-4">Days</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((leave) => (
                    <tr key={leave.sr} className="border-t hover:bg-blue-50">
                      <td className="p-4">{leave.sr}</td>
                      <td className="p-4 font-medium">{leave.type || leave.leave_type}</td>
                      <td className="p-4">{leave.leaveFor || leave.leave_for || "Normal"}</td>
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

        {/* -------------------- APPLY LEAVE MODAL -------------------- */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6">Apply Leave</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Leave Type</label>
                  <select
                    name="type"
                    value={leaveForm.type}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt.leave_type_id} value={lt.leave_type_id}>
                        {lt.leave_type}
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Normal</option>
                    <option>Half Day</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <input
                      type="date"
                      name="fromDate"
                      value={leaveForm.fromDate}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <input
                      type="date"
                      name="toDate"
                      value={leaveForm.toDate}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Days */}
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Days</label>
                  <input
                    type="number"
                    name="days"
                    placeholder="e.g., 2 or 0.5"
                    step="0.5"
                    value={leaveForm.days}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveModal(false);
                      setLeaveForm({
                        type: "",
                        leaveFor: "Normal",
                        fromDate: "",
                        toDate: "",
                        days: "",
                        remark: "",
                        attachment: [],
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit Leave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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