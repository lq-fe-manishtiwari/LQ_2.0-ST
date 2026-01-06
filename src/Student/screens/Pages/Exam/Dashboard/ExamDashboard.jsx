import React from "react";
import { FileText, Calendar, ClipboardList, Users } from "lucide-react";

const ExamDashboard = () => {
  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">Exam Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Exams"
          value="12"
          icon={<FileText />}
        />
        <DashboardCard
          title="Scheduled Exams"
          value="5"
          icon={<Calendar />}
        />
        <DashboardCard
          title="Papers Created"
          value="20"
          icon={<ClipboardList />}
        />
        <DashboardCard
          title="Assigned Teachers"
          value="8"
          icon={<Users />}
        />
      </div>

      {/* Recent Exams Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Recent Exams</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Exam Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">Mid Term Exam</td>
              <td className="px-4 py-3">Internal</td>
              <td className="px-4 py-3">12 Feb 2026</td>
              <td className="px-4 py-3 text-green-600 font-medium">
                Scheduled
              </td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3">Final Exam</td>
              <td className="px-4 py-3">External</td>
              <td className="px-4 py-3">25 Mar 2026</td>
              <td className="px-4 py-3 text-orange-500 font-medium">
                Draft
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* Reusable Card Component */
const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <div className="text-blue-600">{icon}</div>
    </div>
  );
};

export default ExamDashboard;
