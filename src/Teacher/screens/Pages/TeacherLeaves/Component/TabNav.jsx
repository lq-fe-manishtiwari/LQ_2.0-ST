import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "My Leaves", to: "/teacher/leaves" },
  // { label: "My Submitted Forms", to: "/teacher/leaves/submitted-feedback" },
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
              style={{ minWidth: "180px" }}
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