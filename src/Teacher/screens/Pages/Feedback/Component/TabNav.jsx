import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Pending Feedback Forms", to: "/teacher/feedback/pending-feedback" },
  { label: "My Submitted Forms", to: "/teacher/feedback/submitted-feedback" },
];

export default function TabsNav() {
  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs Section */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((t) => (
            <NavLink
            style={{width:"200px"}}
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive? "bg-blue-700 text-white " : "bg-gray-200 text-gray-700"
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
