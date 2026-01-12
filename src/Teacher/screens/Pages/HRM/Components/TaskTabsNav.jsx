import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
// import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Task Assignment", to: "/teacher/hrm/tasks/task-assignment" },
  { label: "My Tasks", to: "/teacher/hrm/tasks/my-tasks" },
  { label: "Timesheet", to: "/teacher/hrm/tasks/timesheet" },
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

          {/* Close Button */}
          {/* <button
            onClick={() => navigate("/hrm")}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all ml-4"
          >
            ×
          </button> */}
        </div>
      </div>

      {/* Modal Section */}
      {/* {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )} */}
    </div>
  );
}
