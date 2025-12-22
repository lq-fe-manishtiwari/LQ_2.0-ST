import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { label: "My Leaves", to: "/student/leaves" },
  // { label: "My Submitted Forms", to: "/teacher/leaves/submitted-feedback" },
];

export default function TabsNav() {
  return (
    <div className="flex justify-between w-full mb-6">
      <div className="flex gap-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-5 py-2 rounded-full text-sm font-medium transition-all
               ${
                 isActive
                   ? "bg-blue-600 text-white shadow"
                   : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
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
