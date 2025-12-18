// src/Teacher/Dashboard/TabsNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "My Attendance", to: "MyAttendance" },
  { label: "Personal", to: "Personal" },
  { label: "Communication", to: "Communication" },
  { label: "Employment History", to: "EmploymentHistory" },
  { label: "Qualification", to: "Qualification" },
  { label: "Password", to: "Password" },
  { label: "Meeting Link", to: "MeetingLink" },
  { label: "Know My Class", to: "KnowMyClass" },
];

export default function TabsNav() {
  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to} // relative path
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}