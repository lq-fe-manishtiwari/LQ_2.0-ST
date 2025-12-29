import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Dashboard", to: "/teacher/leaves/dashboard" },
  { label: "My Leaves", to: "/teacher/leaves/myleaves" },
  { label: "Class Leaves", to: "/teacher/leaves/class-leave" },
];

export default function TabsNav() {
  return (
    <div className="w-full mb-6">
      {/* Scrollable container for mobile */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 sm:overflow-visible">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:opacity-90"
              }`
            }
            style={({ isActive }) =>
              !isActive ? { backgroundColor: "#FFDDE5" } : {}
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
