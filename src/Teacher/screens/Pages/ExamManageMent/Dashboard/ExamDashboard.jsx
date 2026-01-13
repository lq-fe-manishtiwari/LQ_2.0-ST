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
  // Evaluation Progress (more exam-management focused)
  const evaluationData = [
    { name: "Evaluated", value: 62, color: "#10b981" },
    { name: "Moderation Pending", value: 11, color: "#8b5cf6" },
    { name: "Re-checking Requested", value: 8, color: "#f59e0b" },
    { name: "Answer Sheets Pending", value: 14, color: "#ef4444" },
    { name: "Not Collected", value: 5, color: "#6b7280" },
  ];

  // Subject-wise average marks + failure rate
  const performanceData = [
    { subject: "Physics", avg: 68, failure: 18 },
    { subject: "Chemistry", avg: 74, failure: 12 },
    { subject: "Mathematics", avg: 62, failure: 28 },
    { subject: "Biology", avg: 79, failure: 9  },
    { subject: "English", avg: 71, failure: 14 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 p-6 md:p-8">

      {/* Header - Exam Management Focus */}
      <div className="mb-10">
       
        <p className="mt-3 text-lg text-gray-600">
          Evaluation progress • Result statistics • Pending tasks • Quality control
        </p>
      </div>

      {/* Quick Status Cards - Exam centric */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Answer Sheets Collected" value="214" color="indigo" subtitle="out of 248" />
        <Card title="Evaluated Papers" value="148" color="emerald" subtitle="62% complete" />
        <Card title="Pending Evaluation" value="66" color="amber" subtitle="Critical: 22 today" />
        <Card title="Re-evaluation Requests" value="11" color="rose" subtitle="4 high priority" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Evaluation Progress - Donut style */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            Current Evaluation Status
          </h2>

          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={evaluationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={125}
                paddingAngle={3}
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {evaluationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.96)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 12px 30px -8px rgba(0,0,0,0.18)"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                wrapperStyle={{ paddingTop: "24px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Performance - Dual bar (Avg + Failure %) */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100/60 p-6 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            Subject Performance Overview
          </h2>

          <BarResponsiveContainer width="100%" height={360}>
            <BarChart data={performanceData} barGap={16}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="subject" axisLine={false} tick={{ fill: '#64748b' }} />
              <YAxis yAxisId="left" domain={[0, 100]} axisLine={false} tick={{ fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 40]} axisLine={false} tick={{ fill: '#ef4444' }} />
              
              <BarTooltip 
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.97)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 12px 30px -8px rgba(0,0,0,0.18)"
                }}
              />

              <Bar 
                yAxisId="left"
                dataKey="avg" 
                name="Average %" 
                fill="#6366f1" 
                radius={[10, 10, 0, 0]} 
                barSize={32}
              />
              <Bar 
                yAxisId="right"
                dataKey="failure" 
                name="Failure %" 
                fill="#f43f5e" 
                radius={[10, 10, 0, 0]} 
                barSize={32}
              />

              <Legend wrapperStyle={{ paddingTop: "24px" }} iconType="circle" />
            </BarChart>
          </BarResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Pending List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Tasks - Exam Management Focus */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Pending Evaluation Tasks</h2>
          <div className="space-y-4">
            {[
              { paper: "Physics - Set A", count: 22, priority: "High", time: "Today" },
              { paper: "Maths - Set B", count: 18, priority: "Medium", time: "Tomorrow" },
              { paper: "Chemistry - Set C", count: 14, priority: "Normal", time: "2 days" },
              { paper: "Re-eval - Biology P2", count: 7, priority: "High", time: "Today" },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.paper}</p>
                  <p className="text-sm text-gray-600">{item.count} papers</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    item.priority === "High" ? "bg-red-100 text-red-700" :
                    item.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {item.priority}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Exam Management Actions */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100/60 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Mark Absent Students",
              "Enter Practical Marks",
              "Generate Marksheet PDF",
              "Send Re-eval Notification",
              "Moderate Borderline Cases",
              "Upload Scanned Copies",
              "Export Result Analysis",
              "Lock Evaluation Session"
            ].map((action, i) => (
              <button
                key={i}
                className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl text-indigo-700 font-medium hover:from-indigo-100 hover:to-violet-100 transition-all duration-300 border border-indigo-100 hover:shadow-md text-center"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

/* Card Component - Exam Style */
const Card = ({ title, value, color, subtitle }) => {
  const colorMap = {
    indigo:   "from-indigo-600 to-indigo-700",
    emerald:  "from-emerald-600 to-teal-700",
    amber:    "from-amber-600 to-orange-700",
    rose:     "from-rose-600 to-pink-700",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className="text-4xl font-extrabold mt-2">{value}</p>
      {subtitle && (
        <p className="text-white/75 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default ExamDashboard;