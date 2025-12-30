import React, { useEffect, useMemo, useState } from "react";
import { leaveService } from "../Services/Leave.Service";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  Clock,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement
);

/* ================= CONSTANTS ================= */
const STAT_CONFIG = [
  {
    key: "total_pending",
    label: "Pending",
    icon: Clock,
    gradient: "from-yellow-400 to-yellow-500",
  },
  {
    key: "total_approved",
    label: "Approved",
    icon: CheckCircle,
    gradient: "from-green-400 to-green-500",
  },
  {
    key: "total_rejected",
    label: "Rejected",
    icon: XCircle,
    gradient: "from-red-400 to-red-500",
  },
  {
    key: "total_applied",
    label: "Total Applied",
    icon: Layers,
    gradient: "from-blue-400 to-blue-500",
  },
];

export default function LeaveDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const userId = profile?.user?.user_id || profile?.user_id;
        if (!userId) throw new Error("User not found");

        const res = await leaveService.getLeavesSummaryByUserId(userId);
        setSummary(res);
      } catch (e) {
        setError("Unable to load leave dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= CHART DATA ================= */
  const statusChart = useMemo(() => ({
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [
          summary?.total_pending || 0,
          summary?.total_approved || 0,
          summary?.total_rejected || 0,
        ],
        backgroundColor: ["#facc15", "#22c55e", "#ef4444"],
        borderRadius: 8,
      },
    ],
  }), [summary]);

  const typeChart = useMemo(() => ({
    labels: summary?.leave_summary?.map(l => l.leave_type_name) || [],
    datasets: [
      {
        data: summary?.leave_summary?.map(l => l.applied || 0) || [],
        backgroundColor: [
          "#2563eb",
          "#22c55e",
          "#f97316",
          "#7c3aed",
          "#ef4444",
        ],
      },
    ],
  }), [summary]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-semibold text-lg">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        {/* <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Leave Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of your leave applications and balances
          </p>
        </div> */}

        {/* ================= STATS ================= */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STAT_CONFIG.map(({ key, label, icon: Icon, gradient }) => (
            <div
              key={key}
              className={`rounded-2xl p-6 text-white bg-gradient-to-r ${gradient} shadow-lg hover:scale-[1.03] transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {summary[key] || 0}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <ChartCard title="Leave Status Overview">
            <Bar data={statusChart} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Leave Type Distribution">
            <Doughnut data={typeChart} options={doughnutOptions} />
          </ChartCard>
        </div>

        {/* ================= LEAVE BALANCE ================= */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Leave Balance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.leave_summary.map(item => (
            <div
              key={item.leave_type_id}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg text-gray-800">
                {item.leave_type_name}
              </h3>

              <p className="text-4xl font-bold text-blue-600 mt-4">
                {item.balance}
              </p>
              <p className="text-sm text-gray-500">Remaining Days</p>

              <div className="mt-5 text-sm space-y-1">
                <p>✅ Approved: <span className="font-medium text-green-600">{item.approved}</span></p>
                <p>⏳ Pending: <span className="font-medium text-yellow-600">{item.pending}</span></p>
                <p>📄 Total Applied: <span className="font-medium">{item.applied}</span></p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */
const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-80">{children}</div>
  </div>
);

/* ================= CHART OPTIONS ================= */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { usePointStyle: true },
    },
  },
};
