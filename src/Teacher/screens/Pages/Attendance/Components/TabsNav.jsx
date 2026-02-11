import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Plus, Settings, Upload } from "lucide-react";
// import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Dashboard", to: "/teacher/attendance/dashboard" },
  { label: "Tabular View", to: "/teacher/attendance/tabular-view" },
  { label: "Card View", to: "/teacher/attendance/card-view" },
  { label: "Timetable View", to: "/teacher/attendance/timetable-view" },
  { label: "QR Attendance", to: "/teacher/attendance/qr-attendance" },
  { label: "Reports", to: "/teacher/attendance/reports" },
];

export default function TabsNav() {
  const navigate = useNavigate();
  const [showBulkUpload, setShowBulkUpload] = useState(false);

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
                `tab-link text-center flex-1 sm:flex-none whitespace-nowrap sm:w-auto sm:min-w-[9rem] px-2 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm transition-all duration-200 rounded-full ${isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        {/* <button
                    onClick={() => navigate("/hrm/settings")}
                    className="flex items-center gap-2 text-gray-800 font-medium px-3 py-2 rounded-lg transition"
                >
                    <Settings size={18} />
                </button> */}

      </div>



      {/* Modal Section */}
      {/* {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )} */}
    </div>
  );
}