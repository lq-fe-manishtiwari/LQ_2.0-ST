import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
// import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Professional Ethics", to: "/teacher/academic-diary/professional-ethics" },
  { label: "Committee", to: "/teacher/academic-diary/committee" },
  { label: "Advanced Learner", to: "/teacher/academic-diary/advanced-learner" },
  { label: "Slow Learner", to: "/teacher/academic-diary/slow-learner" },
  { label: "Contributions", to: "/teacher/academic-diary/contributions" },
  { label: "Teaching Plan", to: "/teacher/academic-diary/teaching-plan" },
  { label: "Timetable", to: "/teacher/academic-diary/time-table" },
  { label: "Leave", to: "/teacher/academic-diary/leave" },
];

export default function AcademicTabsNav() {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs + Close button container */}
        <div className="flex justify-between items-center w-full">
          {/* Tabs Section */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                style={{ width: "9rem" }}
                className={({ isActive }) =>
                  `tab-link text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm ${isActive ? "tab-active" : "tab-inactive"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all ml-4"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
