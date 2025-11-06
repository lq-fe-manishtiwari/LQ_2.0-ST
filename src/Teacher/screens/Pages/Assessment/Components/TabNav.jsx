import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  {
    label: "Academic",
    children: [
      { label: "Assessment", to: "/teacher-assessments/assessment" },
      { label: "Questions",   to: "/teacher-assessments/questions" },
    ],
  },
  { label: "Vertical 1 & 4(Major)", to: "/teacher-assessments/vertical1_4" },
  { label: "Vertical 2(Minor)", to: "/teacher-assessments/vertical2" },
  { label: "Vertical 3(OE)", to: "/teacher-assessments/vertical3" },
  { label: "Vertical 5(AEC/VEC/IKS)", to: "/teacher-assessments/vertical5" },
  { label: "Vertical 6(Other's)", to: "/teacher-assessments/vertical6" },
];

export default function TabsNav() {
  const { pathname } = useLocation();

  return (
    <>
      {/* MAIN TABS */}
      <div className="flex gap-3 flex-wrap mb-3">
        {tabs.map((t) => {
          if (t.children) {
            // Academic parent tab active check
            const active = t.children.some((c) => pathname.startsWith(c.to));
            return (
              <div
                key={t.label}
                className={`tab-link px-4 py-2 rounded ${active ? "tab-active" : "tab-inactive"}`}
              >
                {t.label}
              </div>
            );
          }
          return (
            <NavLink key={t.to} to={t.to} className={({ isActive }) => `tab-link px-4 py-2 ${isActive ? "tab-active" : "tab-inactive"}`}>
              {t.label}
            </NavLink>
          );
        })}
      </div>

      {/* SUB TABS only for Academic */}
      {tabs[0].children && pathname.startsWith("/teacher-assessments") && (
        <div className="flex gap-3">
          {tabs[0].children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded border ${isActive ? "border-blue-600 text-blue-600 font-semibold" : "border-gray-300"}`
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
