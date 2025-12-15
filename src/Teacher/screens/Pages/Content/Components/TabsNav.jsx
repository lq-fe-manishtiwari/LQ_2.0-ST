import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
// import Buttons from "./Buttons";

const tabs = [
  // { label: "Academic", to: "/teacher/content/Academic" },
  // { label: "Sport", to: "/teacher/content/Sport" },
  // { label: "Vertical1_4 (Major)", to: "/teacher/content/Vertical1_4" },
  // { label: "Vertical2 (Minor)", to: "/teacher/content/Vertical2" },
  // { label: "Vertical3 (OE)", to: "/teacher/content/Vertical3" },
  // { label: "Vertical5 (AEC/VEC/IKS)", to: "/teacher/content/Vertical5" },
  // { label: "Vertical6 (Other's)", to: "/teacher/content/Vertical6" },

    { label: "Content", to: "/content/content-dashboard" },
  // { label: "Content Setting", to: "/content/content-setting" },
  // { label: "Quiz", to: "/content/add-quiz" },
  { label: "Quiz", to: "/content/quiz-dashboard" },
  { label: "Question", to: "/content/question-dashboard" },
  // { label: "Teacher Content", to: "/content/teacher-content" },
  { label: "Student Project", to: "/content/student-project" },
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
                `tab-link whitespace-nowrap w-auto flex-shrink-0 cursor-default px-4 py-2 text-sm tab-active ${
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