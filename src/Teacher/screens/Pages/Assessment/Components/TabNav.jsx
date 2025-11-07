import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  {
    label: "Academic",
    children: [
      { label: "Assessment", to: "/teacher/assessments/assessment" },
      { label: "Questions", to: "/teacher/assessments/questions" },
    ],
  },
  { label: "Vertical 1 & 4(Major)", to: "/teacher/assessments/vertical1_4" },
  { label: "Vertical 2(Minor)", to: "/teacher/assessments/vertical2" },
  { label: "Vertical 3(OE)", to: "/teacher/assessments/vertical3" },
  { label: "Vertical 5(AEC/VEC/IKS)", to: "/teacher/assessments/vertical5" },
  { label: "Vertical 6(Other's)", to: "/teacher/assessments/vertical6" },
];

export default function TabsNav() {
  const { pathname } = useLocation();

  const isAcademicRoute =
    pathname.startsWith("/teacher/assessments/assessment") ||
    pathname.startsWith("/teacher/assessments/questions");

  return (
    <>
      {/* MAIN TABS */}
      <div className="flex gap-3 flex-wrap mb-3">
        {tabs.map((t) => {
          if (t.children) {
            const active = isAcademicRoute; // only active if subroute active
            return (
              <div
                key={t.label}
                className={`px-4 py-2 rounded-lg cursor-default ${
                  active ? "bg-blue-600 text-white font-semibold" : "bg-gray-200 text-gray-700"
                }`}
              >
                {t.label}
              </div>
            );
          }

          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg ${
                  isActive ? "bg-blue-600 text-white font-semibold" : "bg-gray-200 text-gray-700"
                }`
              }
            >
              {t.label}
            </NavLink>
          );
        })}
      </div>

      {/* SUB TABS for Academic only */}
      {isAcademicRoute && (
        <div className="flex gap-3 mb-3">
          {tabs[0].children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded border ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-gray-300 text-gray-600"
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}
