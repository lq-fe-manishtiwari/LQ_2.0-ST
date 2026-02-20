import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";


const tabs = [
  { label: "Professional Ethics", to: "/teacher/academic-diary/professional-ethics" },
  { label: "Committee", to: "/teacher/academic-diary/committee" },
  { label: "Daily Work Report", to: "/teacher/academic-diary/daily-work-report" },
  { label: "Advanced Learner", to: "/teacher/academic-diary/advanced-learner" },
  { label: "Slow Learner", to: "/teacher/academic-diary/slow-learner" },
  { label: "Contributions", to: "/teacher/academic-diary/contributions" },
  { label: "Teaching Plan", to: "/teacher/academic-diary/teaching-plan" },
  { label: "Timetable", to: "/teacher/academic-diary/time-table" },
  { label: "Leave", to: "/teacher/academic-diary/leave" },
  { label: "Monitoring Reports", to: "/teacher/academic-diary/monitoring-reports" },
];

export default function AcademicTabsNav() {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs Section */}
        <div className="flex flex-wrap gap-2 md:gap-4 mx-2 sm:mx-4">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap w-auto flex-shrink-0 px-4 py-2 text-sm ${isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
