import React from "react";
import { NavLink } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
// import Buttons from "./Buttons";

const tabs = [
  { label: "Dashboard", to: "/teacher/exam/dashboard" },
  { label: "Schedule", to: "/teacher/exam/schedule" },
  { label: "Paper", to: "/teacher/exam/paper" },
  { label: "Marks Entry", to: "/teacher/exam/marksEntry" },
  { label: "Edit Requests", to: "/teacher/exam/EditRequests" },
  { label: "Re-Evaluation", to: "/teacher/exam/Evaluation" }

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
              style={{ width: "9.6rem" }}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap text-center flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm ${
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