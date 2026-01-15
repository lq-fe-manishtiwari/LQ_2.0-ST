import React, { useMemo } from "react";
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
import { motion } from "framer-motion"; 
import {
  FileCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Users,
  FileText,
  Download,
  Lock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

const ExamDashboard = () => {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const evaluationData = useMemo(
    () => [
      { name: "Evaluated", value: 62, color: isDark ? "#34d399" : "#10b981" },
      { name: "Moderation Pending", value: 11, color: isDark ? "#a78bfa" : "#8b5cf6" },
      { name: "Re-checking Requested", value: 8, color: isDark ? "#fbbf24" : "#f59e0b" },
      { name: "Answer Sheets Pending", value: 14, color: isDark ? "#f87171" : "#ef4444" },
      { name: "Not Collected", value: 5, color: isDark ? "#9ca3af" : "#6b7280" },
    ],
    [isDark]
  );

  const performanceData = [
    { subject: "Physics", avg: 68, failure: 18 },
    { subject: "Chemistry", avg: 74, failure: 12 },
    { subject: "Mathematics", avg: 62, failure: 28 },
    { subject: "Biology", avg: 79, failure: 9 },
    { subject: "English", avg: 71, failure: 14 },
  ];

  const quickActions = [
    { label: "Mark Absent Students", icon: Users, color: "indigo" },
    { label: "Enter Practical Marks", icon: BookOpen, color: "emerald" },
    { label: "Generate Marksheet PDF", icon: Download, color: "amber" },
    { label: "Send Re-eval Notification", icon: RefreshCw, color: "rose" },
    { label: "Moderate Borderline Cases", icon: AlertTriangle, color: "purple" },
    { label: "Upload Scanned Copies", icon: FileText, color: "cyan" },
    { label: "Export Result Analysis", icon: FileCheck, color: "orange" },
    { label: "Lock Evaluation Session", icon: Lock, color: "teal" },
  ];

  const pendingTasks = [
    { paper: "Physics - Set A", count: 22, priority: "High", time: "Today", icon: AlertCircle },
    { paper: "Maths - Set B", count: 18, priority: "Medium", time: "Tomorrow", icon: Clock },
    { paper: "Chemistry - Set C", count: 14, priority: "Normal", time: "2 days", icon: Info },
    { paper: "Re-eval - Biology P2", count: 7, priority: "High", time: "Today", icon: AlertCircle },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gradient-to-br from-slate-50 via-white to-gray-100"} p-4 md:p-8 transition-colors duration-300`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"} tracking-tight`}>
          Exam Evaluation Dashboard
        </h1>
        <p className={`mt-2 text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Real-time evaluation insights • Performance analytics • Action center
        </p>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { title: "Sheets Collected", value: 214, subtitle: "out of 248", color: "indigo", icon: FileCheck },
          { title: "Evaluated", value: 148, subtitle: "62% complete", color: "emerald", icon: CheckCircle2 },
          { title: "Pending Eval", value: 66, subtitle: "22 critical today", color: "amber", icon: Clock },
          { title: "Re-eval Requests", value: 11, subtitle: "4 high priority", color: "rose", icon: RefreshCw },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border ${isDark ? "border-gray-700" : "border-gray-100/60"} p-6`}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-800"}`}>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            Evaluation Progress
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={evaluationData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={125}
                paddingAngle={4}
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {evaluationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? "#1f2937" : "#ffffff"} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? "#1f2937" : "white", border: "none", borderRadius: "12px", color: isDark ? "white" : "black" }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border ${isDark ? "border-gray-700" : "border-gray-100/60"} p-6`}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-800"}`}>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            Subject-wise Performance
          </h2>
          <BarResponsiveContainer width="100%" height={360}>
            <BarChart data={performanceData} barGap={20}>
              <CartesianGrid strokeDasharray="4 4" stroke={isDark ? "#374151" : "#e5e7eb"} vertical={false} />
              <XAxis dataKey="subject" axisLine={false} tick={{ fill: isDark ? "#9ca3af" : "#64748b" }} />
              <YAxis yAxisId="left" domain={[0, 100]} axisLine={false} tick={{ fill: isDark ? "#9ca3af" : "#64748b" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 40]} axisLine={false} tick={{ fill: isDark ? "#f87171" : "#ef4444" }} />
              <BarTooltip contentStyle={{ backgroundColor: isDark ? "#1f2937" : "white", border: "none", borderRadius: "12px", color: isDark ? "white" : "black" }} />
              <Bar yAxisId="left" dataKey="avg" name="Avg %" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={32} />
              <Bar yAxisId="right" dataKey="failure" name="Failure %" fill="#f43f5e" radius={[12, 12, 0, 0]} barSize={32} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            </BarChart>
          </BarResponsiveContainer>
        </motion.div>
      </div>

      {/* Pending Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks - Colorful + Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border ${isDark ? "border-gray-700" : "border-gray-100/60"} p-6`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>Pending Tasks</h2>
          <div className="space-y-4">
            {pendingTasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border ${task.priority === "High" ? "bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800" : task.priority === "Medium" ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <task.icon className={`w-5 h-5 ${task.priority === "High" ? "text-red-600" : task.priority === "Medium" ? "text-amber-600" : "text-emerald-600"}`} />
                    <div>
                      <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>{task.paper}</p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{task.count} papers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : task.priority === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>
                      {task.priority}
                    </span>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{task.time}</p>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${task.priority === "High" ? "bg-red-500" : task.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min((task.count / 30) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border ${isDark ? "border-gray-700" : "border-gray-100/60"} p-6`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`group p-5 rounded-xl bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 dark:from-${action.color}-950/30 dark:to-${action.color}-900/20 border border-${action.color}-200 dark:border-${action.color}-800/50 text-${action.color}-700 dark:text-${action.color}-300 font-medium hover:shadow-lg hover:from-${action.color}-100 hover:to-${action.color}-200 transition-all duration-300 flex items-center gap-3`}
              >
                <action.icon className={`w-5 h-5 group-hover:scale-110 transition-transform`} />
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* Animated Card */
const Card = ({ title, value, color, subtitle, icon: Icon }) => {
  const colorMap = {
    indigo: "from-indigo-600 to-indigo-700",
    emerald: "from-emerald-600 to-teal-700",
    amber: "from-amber-600 to-orange-700",
    rose: "from-rose-600 to-pink-700",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-2xl shadow-xl p-6 relative overflow-hidden`}
    >
      <div className="absolute -right-6 -top-6 opacity-20">
        <Icon size={80} />
      </div>
      <p className="text-white/90 text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className="text-4xl md:text-5xl font-extrabold mt-3">{value}</p>
      {subtitle && <p className="text-white/80 text-sm mt-2">{subtitle}</p>}
    </motion.div>
  );
};

export default ExamDashboard;