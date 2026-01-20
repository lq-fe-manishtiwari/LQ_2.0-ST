import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, Calendar, Award } from "lucide-react";

const tabs = [
  { label: "Dashboard", to: "/student-placement", icon: <LayoutDashboard size={16} /> },
  { label: "Job Openings", to: "/student-placement/job-openings", icon: <Briefcase size={16} /> },
  { label: "My Applications", to: "/student-placement/my-registrations", icon: <FileText size={16} /> },
  { label: "My Interviews", to: "/student-placement/my-interviews", icon: <Calendar size={16} /> },
  { label: "My Offers", to: "/student-placement/my-offers", icon: <Award size={16} /> },
];

export default function TabsNav() {
  const location = useLocation();

  return (
    <div className="mb-2 sm:mb-4">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {tabs.map((t) => {
          const isActive = location.pathname === t.to;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/student-placement"}
              style={{ width: "9.6rem" }}
              className={`tab-link whitespace-nowrap text-center px-3 py-2 text-xs sm:text-sm flex items-center justify-center gap-1 ${
                isActive ? "tab-active" : "tab-inactive"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
