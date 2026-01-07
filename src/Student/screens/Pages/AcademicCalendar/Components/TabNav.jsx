import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Dashboard", to: "/academic-calendar" },
];

export default function TabsNav() {
  return (
    <div className="mb-2 sm:mb-4">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end
            style={{ width: "9.6rem" }}
            className={({ isActive }) =>
              `tab-link whitespace-nowrap text-center
               px-3 py-2 text-xs sm:text-sm
               ${isActive ? "tab-active" : "tab-inactive"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
