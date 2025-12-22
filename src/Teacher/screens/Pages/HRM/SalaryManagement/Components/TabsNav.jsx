import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
    { label: "Dashboard", to: "/hrm/salary/dashboard" },
    { label: "Type", to: "/hrm/salary/type" },
    { label: "Employee", to: "/hrm/salary/employee" },
    { label: "Attendance", to: "/hrm/salary/attendance" },
    { label: "Teacher", to: "/hrm/salary/teacher" },
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
    );
}
