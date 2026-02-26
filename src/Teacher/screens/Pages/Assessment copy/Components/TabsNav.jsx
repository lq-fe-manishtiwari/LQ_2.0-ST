import React, { memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings, X } from "lucide-react";

const DEFAULT_TABS = [
  { label: "Dashboard", to: "/admin-assessment/dashboard" },
  { label: "Assessment", to: "/admin-assessment/assessment" },
  { label: "Questions", to: "/admin-assessment/questions" },
  { label: "Reports", to: "/admin-assessment/reports" },
];

const TabsNav = ({ customTabs }) => {
  const navigate = useNavigate();
  const tabs = customTabs || DEFAULT_TABS;
  const isSettingsView = !!customTabs;

  const handleClose = () => {
    navigate("/admin-assessment/dashboard");
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-2 md:p-2">
      {/* Tabs Section */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `tab-link text-center whitespace-nowrap flex-shrink-0 w-auto px-3 py-2 ${isActive ? "tab-active" : "tab-inactive"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      {/* Buttons Section - Right aligned */}
      <div className="flex justify-end">
        {!isSettingsView ? (
          // Settings button
          <button
            onClick={() => navigate("/admin-assessment/settings")}
            className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg transition flex-shrink-0"
          >
            <Settings size={18} />
            <span className="hidden sm:inline"></span>
          </button>
        ) : (
          // Close button
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all flex-shrink-0"
            aria-label="Close settings and return to dashboard"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(TabsNav);