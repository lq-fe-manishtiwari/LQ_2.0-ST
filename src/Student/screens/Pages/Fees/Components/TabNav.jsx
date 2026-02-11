import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  {
    label: "Fees",
    to: "/student/fees",
    iconActive: "tab-active",     // your old class
    iconInactive: "tab-inactive", // your old class
    match: [
      "/student/fees",
      "/student/fees-details",
      "/student/payment-history",
    ],
  },
  // Add more tabs here if needed
];

export default function TabsNav() {
  const location = useLocation();

  const isTabActive = (tab) => {
    // Returns true if current URL matches any of the tab.match paths
    return tab.match.some((path) => location.pathname.startsWith(path));
  };

  return (
    <div className="mb-2 sm:mb-4">
      <div className="flex flex-wrap gap-1 sm:gap-2" role="tablist">
        {tabs.map((tab) => {
          const active = isTabActive(tab);

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              role="tab"
              style={{ width: "9.6rem" }}
              className={`tab-link whitespace-nowrap text-center
                          px-3 py-2 text-xs sm:text-sm
                          ${active ? tab.iconActive : tab.iconInactive}`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
