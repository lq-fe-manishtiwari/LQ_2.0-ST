import React from "react";
import { NavLink } from "react-router-dom";
import { Table, Calendar, CheckSquare } from "lucide-react";

const tabs = [
  {
    label: (
      <>
        <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        Tabular View
      </>
    ),
    to: "/teacher-class/Tabular-view",
    rightAlign: false,
  },
  {
    label: (
      <>
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        Monthly View
      </>
    ),
    to: "/teacher-class/Monthly-view",
    rightAlign: false,
  },
  {
    label: (
      <>
        <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        Attendance
      </>
    ),
    to: "/teacher-class/Attendance",
    rightAlign: true,
  },
];

export default function TabsNav() {
  return (
    <div className="flex justify-between w-full">
      {/* Left Side Tabs */}
      <div className="flex gap-2 md:gap-4">
        {tabs
          .filter((t) => !t.rightAlign)
          .map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link flex items-center whitespace-nowrap px-3 py-2 ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
      </div>

      {/* Right Side Tab */}
      <div className="flex gap-2 md:gap-4">
        {tabs
          .filter((t) => t.rightAlign)
          .map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link flex items-center whitespace-nowrap px-3 py-2 ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
      </div>
    </div>
  );
}
