// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { leaveService } from "../Services/Leave.Service";

const StatCard = ({ title, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-center">
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-4xl font-bold text-${color}-600 mt-3`}>{value}</p>
  </div>
);

export default function LeaveDashboard() {
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const userId = userProfile?.user?.user_id || userProfile?.user_id;

        if (!userId) {
          setError("User profile not found. Please log in again.");
          setLoading(false);
          return;
        }

        const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
        setLeaveSummary(summaryResponse);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leave summary:", err);
        setError("Failed to load leave summary. Please try again later.");
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-gray-500 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Leave Dashboard</h1>

        {/* Overall Statistics */}
        {leaveSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard title="Total Applied" value={leaveSummary.total_applied || 0} />
            <StatCard title="Approved" value={leaveSummary.total_approved || 0} color="green" />
            <StatCard title="Pending" value={leaveSummary.total_pending || 0} color="yellow" />
            <StatCard title="Rejected" value={leaveSummary.total_rejected || 0} color="red" />
          </div>
        )}

        {/* Leave Balance Summary */}
        {leaveSummary && leaveSummary.leave_summary && leaveSummary.leave_summary.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Leave Balance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveSummary.leave_summary.map((item) => (
                <div
                  key={item.leave_type_id}
                  className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition border"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {item.leave_type_name}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {item.balance || 0}
                      </p>
                      <p className="text-sm text-gray-600">Remaining Days</p>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        Used (Approved): <span className="font-medium text-green-600">{item.approved || 0}</span> days
                      </p>
                      <p>
                        Total Allowed: <span className="font-medium">{item.balance + (item.approved || 0)}</span> days
                      </p>
                      <p>
                        Pending Applications: <span className="font-medium text-yellow-600">{item.pending || 0}</span>
                      </p>
                      <p>
                        Total Applied: <span className="font-medium">{item.applied || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">No leave balance data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}