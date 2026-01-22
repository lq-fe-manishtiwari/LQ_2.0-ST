// pages/dashboard/LibraryDashboard.tsx
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
  Legend as BarLegend,
} from "recharts";

const LibraryDashboard = () => {
  // Books Circulation Status
  const circulationData = [
    { name: "Checked Out", value: 187, color: "#3b82f6" },
    { name: "Overdue", value: 42, color: "#ef4444" },
    { name: "Available", value: 548, color: "#10b981" },
    { name: "Reserved", value: 31, color: "#f59e0b" },
    { name: "In Repair", value: 12, color: "#6b7280" },
  ];

  // Popular Categories (Top 5)
  const categoryData = [
    { category: "Computer Science", count: 124, color: "#6366f1" },
    { category: "Programming", count: 98, color: "#8b5cf6" },
    { category: "Management", count: 76, color: "#ec4899" },
    { category: "Design Reference", count: 62, color: "#f43f5e" },
    { category: "Mathematics", count: 58, color: "#14b8a6" },
  ];

  // Recent Activity (last 7 days)
  const recentActivity = [
    { id: 1, action: "Checked Out", book: "Clean Code", user: "Shravan", time: "2 hours ago" },
    { id: 2, action: "Returned", book: "The Design of Everyday Things", user: "Priya", time: "5 hours ago" },
    { id: 3, action: "Overdue Reminder Sent", book: "Introduction to Algorithms", user: "Rahul", time: "Yesterday" },
    { id: 4, action: "New Book Added", book: "Staff Engineer", user: "Admin", time: "2 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview • Circulation • Popular Books • Recent Activity
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Books"
            value="920"
            subtitle="in collection"
            color="indigo"
          />
          <StatCard
            title="Checked Out"
            value="187"
            subtitle="currently"
            color="blue"
          />
          <StatCard
            title="Overdue Books"
            value="42"
            subtitle="needs attention"
            color="red"
          />
          <StatCard
            title="New Additions"
            value="18"
            subtitle="this month"
            color="green"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Circulation Status - Donut Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
              Current Circulation Status
            </h2>

            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={circulationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={125}
                  paddingAngle={4}
                  label={({ value }) => `${value}`}
                  labelLine={false}
                >
                  {circulationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Categories - Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
              Top Categories
            </h2>

            <BarResponsiveContainer width="100%" height={360}>
              <BarChart data={categoryData} barGap={12}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="category" axisLine={false} tick={{ fill: "#64748b" }} />
                <YAxis axisLine={false} tick={{ fill: "#64748b" }} />
                <BarTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                />
                <BarLegend wrapperStyle={{ paddingTop: "20px" }} />
              </BarChart>
            </BarResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.action}: <span className="text-indigo-600">{item.book}</span>
                  </p>
                  <p className="text-sm text-gray-600">by {item.user}</p>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "Add New Book",
            "Bulk Upload",
            "Check-Out Book",
            "Check-In Book",
            "View Overdue",
            "Generate Report",
          ].map((action) => (
            <button
              key={action}
              className="py-4 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors border border-indigo-200 shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Reusable Stat Card */
const StatCard = ({ title, value, subtitle, color }) => {
  const colors = {
    indigo: "from-indigo-600 to-indigo-700",
    blue: "from-blue-600 to-blue-700",
    red: "from-red-600 to-red-700",
    green: "from-emerald-600 to-teal-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}
    >
      <p className="text-white/90 text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className="text-4xl font-extrabold mt-3">{value}</p>
      {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
    </div>
  );
};

export default LibraryDashboard;