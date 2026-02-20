import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  // { label: "Dashboard", to: "/student-placement" },
  // { label: "Profile", to: "/student-placement/profile" },
  { label: "Job Openings", to: "/student-placement/job-openings" },
  { label: "My Applications", to: "/student-placement/my-registrations" },
  { label: "My Interviews", to: "/student-placement/my-interviews" },
  { label: "My Offers", to: "/student-placement/my-offers" },
  { label: "Consent", to: "/student-placement/consent" },
  // { label: "Eligibility", to: "/student-placement/eligibility" },
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
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
