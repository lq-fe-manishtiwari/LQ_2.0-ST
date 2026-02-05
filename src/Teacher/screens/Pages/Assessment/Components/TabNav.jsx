import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FileText, HelpCircle, Settings, X } from "lucide-react";

const tabs = [
  {
    label: "Academic",
    children: [
      {
        label: "Dashboard",
        to: "/teacher/assessments/dashboard",
        icon: HelpCircle,
      },
      {
        label: "Assessment",
        to: "/teacher/assessments/assessment",
        icon: FileText,
      },
      {
        label: "Questions",
        to: "/teacher/assessments/questions",
        icon: HelpCircle,
      },
    ],
  },
];

export default function TabsNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isAcademicRoute =
    pathname.startsWith("/teacher/assessments/assessment") ||
    pathname.startsWith("/teacher/assessments/questions") ||
    pathname.startsWith("/teacher/assessments/dashboard");

  // 👇 NEW: detect settings page
  const isSettingsView = pathname.startsWith(
    "/teacher/assessments/settings"
  );

  const handleClose = () => {
    navigate("/teacher/assessments/dashboard");
  };

  return (
    <>
      {/* MAIN TABS + SETTINGS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3 mx-2 sm:mx-4">
        {/* MAIN TABS */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          {tabs.map((t) => {
            if (t.children) {
              const active = isAcademicRoute;
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

        {/* SETTINGS / CLOSE BUTTON */}
        <div className="flex justify-end">
          {!isSettingsView ? (
            <button
              onClick={() =>
                navigate("/teacher/assessments/settings")
              }
              className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg transition flex-shrink-0"
            >
              <Settings size={18} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all flex-shrink-0"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          )}
        </div>
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
