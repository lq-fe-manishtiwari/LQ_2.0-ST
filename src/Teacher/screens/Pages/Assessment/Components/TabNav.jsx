import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FileText, HelpCircle, Settings, X, BarChart } from "lucide-react";

const academicTabs = [
  { label: "Dashboard", to: "/teacher/assessments/dashboard", icon: HelpCircle },
  { label: "Assessment", to: "/teacher/assessments/assessment", icon: FileText },
  { label: "Questions", to: "/teacher/assessments/questions", icon: HelpCircle },
  { label: "Report", to: "/teacher/assessments/report", icon: BarChart },
];

export default function TabsNav({ customTabs = [] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isSettingsView = pathname.startsWith("/teacher/assessments/settings");

  const handleClose = () => navigate("/teacher/assessments/dashboard");

  const tabsToRender = isSettingsView ? customTabs : academicTabs;

  return (
    <>
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3 mx-2 sm:mx-4">
        {/* LEFT TABS */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          {tabsToRender.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `tab-link px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap ${isActive ? "tab-active" : "tab-inactive"
                  }`
                }
              >
                {Icon && <Icon size={16} />}
                {t.label}
              </NavLink>
            );
          })}
        </div>

        {/* RIGHT BUTTON */}
        <div className="flex justify-end">
          {!isSettingsView ? (
            <button
              onClick={() => navigate("/teacher/assessments/settings")}
              className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg"
            >
              <Settings size={18} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
