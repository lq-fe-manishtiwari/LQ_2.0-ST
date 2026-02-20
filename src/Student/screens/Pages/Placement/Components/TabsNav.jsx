import React from "react";
import { NavLink } from "react-router-dom";

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
  return (
    <div className="mb-2 sm:mb-4">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-wrap justify-start gap-2 flex-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/student-placement"}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap w-auto flex items-center gap-2 flex-shrink-0 px-4 py-2 text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
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
 