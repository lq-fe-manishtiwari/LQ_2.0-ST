// src/components/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useUserProfile } from "@/contexts/UserProfileContext";
// import { authenticationService } from "@/_services/admin";
import "@/_assets/customStyle.css";

/* ──────────────────────── ICONS ──────────────────────── */
import dashboardActive from "@/_assets/images_new_design/icons/dashboard_active.svg";
import dashboardInactive from "@/_assets/images_new_design/icons/Dashboard.svg";

import classActive from "@/_assets/images_new_design/icons/class_active.svg";
import classInactive from "@/_assets/images_new_design/icons/class.svg";


import contentActive from "@/_assets/images_new_design/icons/curriculum_active.svg";
import contentInactive from "@/_assets/images_new_design/icons/curriculum.svg";

import assessmentActive from "@/_assets/images_new_design/icons/assessment_active.svg";
import assessmentInactive from "@/_assets/images_new_design/icons/Assessment.svg";

import analyticsActive from "@/_assets/images_new_design/icons/analytics_active.svg";
import analyticsInactive from "@/_assets/images_new_design/icons/analytics.svg";

import codingActive from "@/_assets/images_new_design/icons/active_code.svg";
import codingInactive from "@/_assets/images_new_design/icons/coding.svg";

import quicknotesActive from "@/_assets/images_new_design/icons/quick_notesactive.svg";
import quicknotesInactive from "@/_assets/images_new_design/icons/quick_notes.svg";

import syllabusActive from "@/_assets/images_new_design/icons/learning_plan.svg";
import syllabusInactive from "@/_assets/images_new_design/icons/learning_plan.svg";

import logoutIcon from "@/_assets/images_new_design/icons/Logout.svg";
import toggleIcon from "@/_assets/images/toggle-icon.svg"; // or use closebtn
import closebtn from "@/_assets/images/Close.svg";

/* ──────────────────────── COMPONENT ──────────────────────── */
const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName, designation, userType, profileImage } = useUserProfile();

  // Mobile state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logo & Feature Flags
  const [logoURL] = useState(() => localStorage.getItem("logoURL") ?? "");
  const [chapterTopicAccess] = useState(() =>
    localStorage.getItem("chapter_topic_access")
  );
  const [reportAccess] = useState(() => localStorage.getItem("report_access"));

  // Logout
  const logout = () => {
    try {
      const username = localStorage.getItem("username");
      // Clear localStorage first
      localStorage.clear();
      // Use window.location for clean navigation to avoid React Router issues
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force page reload to login
      window.location.href = "/login";
    }
  };

  // Active state helper
  const isActive = (item, pathname) => {
    if (pathname === item.to) return true;
    if (Array.isArray(item.match)) {
      return item.match.some((p) => pathname.startsWith(p));
    }
    if (item.match) return pathname.startsWith(item.match);
    return pathname.startsWith(item.to);
  };

  // Menu Items
  const menuItems = useMemo(
    () => [
      {
        to: "/dashboard",
        label: "My Teaching",
        iconActive: dashboardActive,
        iconInactive: dashboardInactive,
      },
      // {
      //   to: "/teacher/class",
      //   label: "Class",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      //   match: [
      //     "/teacher/class",
      //     "/timetable-list",
      //     "/timetable-view",
      //     "/timetable-edit",
      //   ],
      // },
      {
        to: "/teacher/timetable",
        label: "TimeTable",
        iconActive: assessmentActive,
        iconInactive: assessmentInactive,
        match: [
          "/teacher/timetable",
        ],
      },
      {
        to: "/teacher/attendance",
        label: "Attendance",
        iconActive: assessmentActive,
        iconInactive: assessmentInactive,
        match: [
          "/teacher/attendance",
        ],
      },


      {
        to: "/teacher/content",
        label: "Content",
        iconActive: contentActive,
        iconInactive: contentInactive,
        match: [
          "/teacher/content",
          "/teacher-view-content",
          "/teacher-content-manage",
          "/teacher-edit-content",
          "/add-content-teacher",
          "/student-content",
          "/teacher-edit-project",
          "/student-view-project",
        ],
      },
      {
        to: "/subject-selection",
        label: "Paper Selection",
        iconActive: contentActive,
        iconInactive: contentInactive,
        match: ["/subject-selection"],
      },
      {
        to: "/teacher/assessments",
        label: "Assessment",
        iconActive: assessmentActive,
        iconInactive: assessmentInactive,
        match: [
          "/teacher/assessments",
          "/teacher-add-assessment",
          "/teacher-view-assessments",
          "/teacher-view-st-test-result",
          "/teacher-view-assessments-details",
          "/teacher-add-question",
          "/teacher-edit-question",
        ],
      },
      {
        to: "/teacher/us-feedback",
        label: "Feedback",
        iconActive: assessmentActive,
        iconInactive: assessmentInactive,
        match: [
          "/teacher/us-feedback",
        ],
      },
      {
        to: "/teacher/committees",
        label: "Committee",
        iconActive: classActive,
        iconInactive: classInactive,
        match: ["/teacher/committees", "/teacher/committee"],
      },
       
      {
  to: "/teacher/placement",
  label: "Placement",
  iconActive: classActive,
  iconInactive: classInactive,
  match: ["/teacher/placement"], // remove the '*' — startsWith handles nested routes
},

     
      {
        to: "/teacher-analytics",
        label: "Insights",
        iconActive: analyticsActive,
        iconInactive: analyticsInactive,
      },
      {
        to: "/teacher-coding",
        label: "Coding",
        iconActive: codingActive,
        iconInactive: codingInactive,
      },
      {
        to: "/teacher-quickNotesList",
        label: "Quick Notes",
        iconActive: quicknotesActive,
        iconInactive: quicknotesInactive,
        match: ["/teacher-quickNotesList", "/teacher-view-note"],
      },
      {
        to: "/teacher-engage",
        label: "Engage",
        iconActive: contentActive,
        iconInactive: contentInactive,
      },
      {
        to: "/teacher-syllabus",
        label: "Academics",
        iconActive: syllabusActive,
        iconInactive: syllabusInactive,
        show: chapterTopicAccess === "true" || chapterTopicAccess === true,
      },
      {
        to: "/teacher/academic-calendar",
        label: "Academic Calendar",
        iconActive: classActive,
        iconInactive: classInactive,
        match: ["/teacher/academic-calendar"]
      },


      {
        to: "/teacher/library",
        label: "My Library",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      // {
      //   to: "/pms",
      //   label: "HRM",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      //  },
      {
        to: "/teacher/hrm",
        label: "HRM",
        iconActive: classActive,
        iconInactive: classInactive,
        match: [
          "/teacher/hrm",
        ],
      },
      {
        to: "/teacher-certificate",
        label: "Certificate",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      {
        to: "/reports",
        label: "Reports",
        iconActive: classActive,
        iconInactive: classInactive,
        show: reportAccess === "true" || reportAccess === true,
      },
      {
        to: "/teacher/exam",
        label: "Exam Management",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      {
        to: "/teacher/leaves",
        label: "Leaves",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      {
        to: "/obe-setting",
        label: "OBE Setting",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      {
        to: "/Document-Generation-dashbaord",
        label: "Document",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      {
        to: "/Purchase",
        label: "Purchase",
        iconActive: classActive,
        iconInactive: classInactive,
      },
    ],
    [chapterTopicAccess, reportAccess]
  );

  const handleMobileToggle = () => setIsMobileOpen((prev) => !prev);

  const renderMenu = (closeOnClick = false) => {
    return menuItems.map((item, i) => {
      if (item.show === false) return null;

      const active = isActive(item, location.pathname);

      return (
        <li key={i} className="my-1">
          <Link
            to={item.to}
            onClick={() => closeOnClick && setIsMobileOpen(false)}
            className={classNames(
              "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-blue-600",
              active
                ? "border border-orange-400 bg-orange-50 font-semibold"
                : "hover:bg-blue-50"
            )}
          >
            <img
              src={active ? item.iconActive : item.iconInactive}
              alt={item.label}
              className="w-5 h-5"
            />
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        </li>
      );
    });
  };

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <div
        className={classNames(
          "hidden md:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 overflow-y-auto transition-all duration-300 flex-col justify-between",
          isOpen ? "w-[220px]" : "w-[80px]"
        )}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between py-6 px-4 relative">
          {isOpen && (
            <Link to="/teacher-dashboard">
              {logoURL ? (
                <img
                  src={logoURL}
                  alt="Logo"
                  className="w-[140px] transition-all duration-300"
                />
              ) : (
                <img
                  src="https://learnqoch.com/wp-content/uploads/al_opt_content/IMAGE/learnqoch.com/wp-content/uploads/2024/08/LearnQoch-WebT_Logo.png.bv_resized_mobile.png.bv.webp?bv_host=learnqoch.com"
                  alt="Default Logo"
                  className="w-[140px]"
                />
              )}
            </Link>
          )}
          <button
            onClick={toggle}
            className={classNames(
              "bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300",
              isOpen ? "ml-2" : "mx-auto"
            )}
          >
            <img src={toggleIcon} alt="Toggle" className="w-4 h-4" />
          </button>
        </div>



        {/* Menu */}
        <ul className="list-none flex-1 px-2">{renderMenu()}</ul>

        {/* Logout */}
        <div className="px-2 mb-6">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 text-blue-600 rounded-md hover:bg-blue-50 w-full"
          >
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* ===== Mobile Hamburger Button ===== */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={handleMobileToggle}
            className="bg-blue-600 p-2 rounded-md"
          >
            <img src={toggleIcon} alt="Menu" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ===== Mobile Sidebar Drawer ===== */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleMobileToggle}
        >
          <div
            className="absolute top-0 left-0 w-[250px] h-full bg-white shadow-lg p-4 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo + Close */}
            <div className="flex items-center justify-between mb-6">
              <img
                src={
                  logoURL ||
                  "https://demo-learnqoch.s3.ap-south-1.amazonaws.com/engage/1751987287-western-removebg-preview.png"
                }
                alt="Logo"
                className="w-[120px]"
              />
              <button
                onClick={handleMobileToggle}
                className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center"
              >
                <img src={closebtn} alt="Close" className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile User Profile Section */}
            {(fullName || userType) && (
              <div className="py-3 border-b border-gray-200 mb-4">
                <div className="flex items-center space-x-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fullName || 'User'}
                    </p>
                    {designation && (
                      <p className="text-xs text-gray-500 truncate">{designation}</p>
                    )}
                    <p className="text-xs text-blue-600 font-medium">
                      {userType || 'Teacher'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu */}
            <ul className="list-none flex-1">{renderMenu(true)}</ul>

            {/* Mobile Logout */}
            <div className="mt-4">
              <button
                onClick={logout}
                className="flex items-center space-x-3 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 w-full"
              >
                <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;