import React, { useState } from "react";

export default function MyLeaves() {

  /* -------------------- DASHBOARD DATA -------------------- */
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

  /* -------------------- LEAVE TABLE DATA -------------------- */
  const leaveRecords = [
    {
      sr: 1,
      type: "Casual Leave",
      leaveFor: "Normal",
      from: "2025-03-01",
      to: "2025-03-02",
      days: 2,
      status: "Approved",
      remark: "Personal work",
    },
    {
      sr: 2,
      type: "Medical Leave",
      leaveFor: "Half Day",
      from: "2025-03-10",
      to: "2025-03-10",
      days: 0.5,
      status: "Pending",
      remark: "Doctor visit",
    },
    {
      sr: 3,
      type: "Duty Leave",
      leaveFor: "Normal",
      from: "2025-03-15",
      to: "2025-03-16",
      days: 2,
      status: "Rejected",
      remark: "Workshop",
    },
  ];

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

  /* -------------------- LEAVE FORM -------------------- */
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    leaveFor: "Normal",
    fromDate: "",
    toDate: "",
    days: "",
    remark: "",
    attachment: null,
  });

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setLeaveForm({
      ...leaveForm,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Leave Applied:", leaveForm);
    setShowLeaveModal(false);
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
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Apply Leave
          </button>
        </div>

        {/* -------------------- DASHBOARD CARDS -------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Leave Balance" value={leaveStats.balance} />
          <StatCard title="Leaves Approved" value={leaveStats.approved} />
          <StatCard title="Total Leaves" value={leaveStats.total} />
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm font-semibold mb-2">Leave by Type</p>
            {leaveStats.byType.map((l, i) => (
              <p key={i} className="text-sm text-gray-700">
                {l.type}: <b>{l.count}</b>
              </p>
            ))}
          </div>
        </div>

        {/* -------------------- LEAVE TABLE -------------------- */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="text-blue-700">
              <tr className="text-blue-700 text-center">
                <th className="p-3">Sr No</th>
                <th className="p-3">Leave Type</th>
                <th className="p-3">Leave For</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
                <th className="p-3">Remark</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((leave) => (
                <tr key={leave.sr} className="border-t hover:bg-blue-50 text-center">
                  <td className="p-3">{leave.sr}</td>
                  <td className="p-3 font-medium">{leave.type}</td>
                  <td className="p-3">{leave.leaveFor}</td>
                  <td className="p-3">{leave.from}</td>
                  <td className="p-3">{leave.to}</td>
                  <td className="p-3">{leave.days}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-3">{leave.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -------------------- APPLY LEAVE MODAL -------------------- */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl">
              <h2 className="text-lg font-semibold mb-4">Apply Leave</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <select name="type" onChange={handleFormChange} className="w-full border rounded-lg p-2">
                  <option value="">Select Leave Type</option>
                  <option>Casual Leave</option>
                  <option>Medical Leave</option>
                  <option>Duty Leave</option>
                </select>

                <select name="leaveFor" onChange={handleFormChange} className="w-full border rounded-lg p-2">
                  <option>Normal</option>
                  <option>Half Day</option>
                </select>

                <input type="date" name="fromDate" onChange={handleFormChange} className="w-full border rounded-lg p-2" />
                <input type="date" name="toDate" onChange={handleFormChange} className="w-full border rounded-lg p-2" />
                <input type="number" name="days" placeholder="Number of Days" onChange={handleFormChange} className="w-full border rounded-lg p-2" />
                <textarea name="remark" placeholder="Remark" onChange={handleFormChange} className="w-full border rounded-lg p-2" />
                <input type="file" name="attachment" onChange={handleFormChange} />

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">
                    Submit
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

/* -------------------- STAT CARD -------------------- */
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl p-4 shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-blue-600">{value}</p>
  </div>
);
