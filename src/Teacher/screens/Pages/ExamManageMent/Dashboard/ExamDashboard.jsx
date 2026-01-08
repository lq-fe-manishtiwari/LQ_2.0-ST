import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer as BarResponsiveContainer,
} from "recharts";

const ExamDashboard = () => {
  // Pie Chart Data
  const pieData = [
    { name: "Completed", value: 65, color: "#10b981" },
    { name: "Pending", value: 20, color: "#f59e0b" },
    { name: "In Progress", value: 10, color: "#3b82f6" },
    { name: "Not Started", value: 5, color: "#ef4444" },
  ];

  // Bar Chart Data
  const barData = [
    { subject: "Physics", average: 78 },
    { subject: "Chemistry", average: 85 },
    { subject: "Mathematics", average: 72 },
    { subject: "Biology", average: 88 },
    { subject: "English", average: 80 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* Header (Clean – No Icons) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage classes, students, exams, and performance overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="Total Classes" value="5" color="blue" />
        <Card title="Total Students" value="120" color="green" />
        <Card title="Pending Evaluations" value="8" color="orange" />
        <Card title="ATKT / Failed Students" value="6" color="red" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">
            Exam & Evaluation Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">
            Subject-wise Performance
          </h2>
          <BarResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <BarTooltip formatter={(value) => `${value}%`} />
              <Bar
                dataKey="average"
                fill="#6366f1"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </BarResponsiveContainer>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Recent Activities</h2>
          <table className="w-full text-sm">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="text-left py-2">Student</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Rahul Sharma</td>
                <td>Physics</td>
                <td>Pending</td>
                <td className="text-blue-500 cursor-pointer">
                  Evaluate
                </td>
              </tr>
              <tr>
                <td className="py-2">Anita Verma</td>
                <td>Chemistry</td>
                <td>Completed</td>
                <td className="text-green-500 cursor-pointer">
                  View
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Upcoming Tasks</h2>
          <ul className="space-y-2 text-gray-700">
            <li>📌 Physics Exam Evaluation</li>
            <li>📌 Chemistry Revaluation Review</li>
            <li>📌 Faculty Meeting – Friday</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* Card Component */
const Card = ({ title, value, color }) => {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-500",
    red: "text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500">{title}</p>
      <h2 className={`text-3xl font-bold ${colors[color]}`}>
        {value}
      </h2>
    </div>
  );
};

export default ExamDashboard;
