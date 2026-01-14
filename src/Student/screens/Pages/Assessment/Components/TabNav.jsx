import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Assessment", to: "/my-assessment/assessment" },
  // { label: "Vertical 1 & 4(Major)", to: "/teacher-assessment/vertical1&4" },
];

export default function TabsNav() {
  return (
    <div className="flex gap-2 md:gap-4">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `tab-link text-center whitespace-nowrap flex-shrink-0 px-3 py-2 ${
              isActive ? "tab-active" : "tab-inactive"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
