import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const tabs = [
  { label: "Dashboard", to: "/teacher/placement" },
  { label: "Job Openings", to: "/teacher/placement/jobs" },
  { label: "Registration", to: "/teacher/placement/registration" },
  { label: "Interviews", to: "/teacher/placement/interviews" },
  { label: "Offer", to: "/teacher/placement/offer" },
  { label: "Companies", to: "/teacher/placement/companies" },
  { label: "Drive Scheduling", to: "/teacher/placement/drive-scheduling" },
  { label: "Student Consents", to: "/teacher/placement/student-consents" },
  { label: "Reports", to: "/teacher/placement/reports" },
];

export default function TabsNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mb-2 sm:mb-4">
      <div className="flex flex-wrap gap-1 sm:gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((t) => {
            const isActive = location.pathname === t.to;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                style={{ width: "9.6rem" }}
                className={`tab-link whitespace-nowrap text-center px-3 py-2 text-xs sm:text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
                }`}
              >
                {t.label}
              </NavLink>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/teacher/placement/settings')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}