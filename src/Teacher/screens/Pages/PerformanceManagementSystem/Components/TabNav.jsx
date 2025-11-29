import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
// import Buttons from "./Buttons";

const tabs = [
  { label: "User", to: "/pms/user-dashboard" },
  { label: "Document", to: "/pms/document" },
  { label: "Department", to: "/pms/department" },
  { label: "Task Assignment", to: "/pms/task-assignment" },
  { label: "My Tasks", to: "/pms/my-task" },
  { label: "API", to: "/pms/api" },
  { label: "Timesheet", to: "/pms/timesheet" },
  { label: "Leave", to: "/pms/leave" },
 

];

export default function TabsNav() {

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs Section */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>
      {/* <Buttons/> */}

    </div>
  );
}