import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";

const tabs = [
  { label: "Task Assignment", to: "/teacher/task-management/task-assignment" },
  { label: "Professional Task", to: "/teacher/task-management/professional-tasks" },
  { label: "Personal Task", to: "/teacher/task-management/personal-tasks" },
  { label: "Timesheet", to: "/teacher/task-management/timesheet" },
];

export default function TasksTabsNav() {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs + Close Button Container */}
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
        </div>
      </div>
    </div>
  );
}
