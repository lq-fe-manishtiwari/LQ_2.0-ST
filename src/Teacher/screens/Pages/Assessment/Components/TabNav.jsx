import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FileText, HelpCircle } from "lucide-react";

const tabs = [
  {
    label: "Academic",
    children: [
      { label: "Assessment", to: "/teacher/assessments/assessment", icon: FileText },
      { label: "Questions", to: "/teacher/assessments/questions", icon: HelpCircle },
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
      <div className="flex flex-wrap gap-2 md:gap-4 mb-3 mx-2 sm:mx-4">
        {tabs.map((t) => {
          if (t.children) {
            const active = isAcademicRoute; // only active if subroute active
            return (
              <div
                key={t.label}
                className={`tab-link whitespace-nowrap w-auto flex-shrink-0 cursor-default px-4 py-2 text-sm ${
                  active ? "tab-active" : "tab-inactive"
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
                `tab-link whitespace-nowrap w-auto flex-shrink-0 px-4 py-2 text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
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
        <div className="flex flex-wrap gap-2 md:gap-4 mb-3 mx-2 sm:mx-4">
          {tabs[0].children.map((c) => {
            const Icon = c.icon;
            return (
              <NavLink
                key={c.to}
                to={c.to}
                className={({ isActive }) =>
                  `tab-link whitespace-nowrap w-auto flex-shrink-0 px-4 py-2 text-sm flex items-center gap-2 ${
                    isActive ? "tab-active" : "tab-inactive"
                  }`
                }
              >
                <Icon size={16} />
                {c.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
}
