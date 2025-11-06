import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { label: "Pending Feedback Forms", to: "/teacher-feedback/pending-feedback" },
  { label: "My Submitted Forms", to: "/teacher-feedback/submitted-feedback" },
];

export default function TabsNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isActive ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
            }`
          }
          style={({ isActive }) =>
            isActive ? { backgroundColor: "rgb(33 98 193)" } : {}
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
