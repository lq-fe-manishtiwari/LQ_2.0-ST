// src/Student/components/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";

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

import studyplanActive from "@/_assets/images_new_design/icons/learning_plan.svg";
import studyplanInactive from "@/_assets/images_new_design/icons/learning_plan.svg";

import logoutIcon from "@/_assets/images_new_design/icons/Logout.svg";
import toggleIcon from "@/_assets/images/toggle-icon.svg";
import closebtn from "@/_assets/images/Close.svg";

/* ──────────────────────── COMPONENT ──────────────────────── */
const StudentSidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logo
  const [logoURL] = useState(() => localStorage.getItem("logoURL") ?? "");

  // Logout
  const logout = () => {
    try {
      // Clear localStorage first
      localStorage.clear();
      // Use window.location for clean navigation to avoid React Router issues
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force page reload to login
      window.location.href = "/";
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

  // Menu Items (Student-only)
  const menuItems = useMemo(
    () => [
      {
        to: "/student-dashboard",
        label: "My Learning",
        iconActive: dashboardActive,
        iconInactive: dashboardInactive,
      },
      {
        to: "/timetable",
        label: "TimeTable",
        iconActive: contentActive,
        iconInactive: contentInactive,
        match: [
          "/timetable",
        ],
      },
      // {
      //   to: "/attendance",
      //   label: "Attendance",
      //   iconActive: contentActive,
      //   iconInactive: contentInactive,
      //   match: [
      //     "/attendance",
      //     "/attendance/my-attendance",
      //   ],
      // },
      {
        to: "/curriculum",
        label: "Content",
        iconActive: contentActive,
        iconInactive: contentInactive,
        match: [
          "/curriculum",
          "/list-content-student",
          "/add-content-student",
          "/view-project",
          "/student-view-content",
        ],
      },
      // {
      //   to: "/my-assessment",
      //   label: "Assessment",
      //   iconActive: assessmentActive,
      //   iconInactive: assessmentInactive,
      //   match: ["/my-assessment", "/st-view-test-details", "/st-retest"],
      // },
      // {
      //   to: "/student-learning-plan",
      //   label: "Learning Plan",
      //   iconActive: studyplanActive,
      //   iconInactive: studyplanInactive,
      //   match: [
      //     "/student-learning-plan",
      //     "/student-lp-view-curriculum",
      //     "/student-lp-start-quiz",
      //   ],
      // },
      // {
      //   to: "/student-analytics",
      //   label: "Insights",
      //   iconActive: analyticsActive,
      //   iconInactive: analyticsInactive,
      // },
      // {
      //   to: "/student-coding",
      //   label: "Coding",
      //   iconActive: codingActive,
      //   iconInactive: codingInactive,
      // },
      // {
      //   to: "/student-quickNotesList",
      //   label: "Quick Notes",
      //   iconActive: quicknotesActive,
      //   iconInactive: quicknotesInactive,
      //   match: ["/student-quickNotesList", "/student-view-note"],
      // },
      {
        to: "/student/leaves",
        label: "Leaves",
        iconActive: classActive,
        iconInactive: classInactive,
      },
      // {
      //   to: "/student-engage",
      //   label: "Engage",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      // {
      //   to: "/student/alumini",
      //   label: "Alumni",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      {
        to: "/student/academic-calendar",
        label: "Academic Calender",
        iconActive: classActive,
        iconInactive: classInactive,
      },

      // {
      //   to: "/student/my-library",
      //   label: "My Library",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      // {
      //   to: "/student-placement",
      //   label: "Placement",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      // {
      //   to: "/student/us-feedback",
      //   label: "Feedback",
      //   iconActive: assessmentActive,
      //   iconInactive: assessmentInactive,
      //   match: ["/student/us-feedback"],
      // },
      // {
      //   to: "/student/committees",
      //   label: "My Committees",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      //   match: [
      //     "/student/committees",
      //     "/student/committee"
      //   ],
      // },

      // {
      //   to: "/certificate",
      //   label: "Certificate",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      // {
      //   to: "/Documents",
      //   label: "My Documents",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
      // {
      //   to: "/student/exam",
      //   label: "Examination",
      //   iconActive: classActive,
      //   iconInactive: classInactive,
      // },
    ],
    []
  );

  const handleMobileToggle = () => setIsMobileOpen((prev) => !prev);

  const renderMenu = (closeOnClick = false) => {
    return menuItems.map((item, i) => {
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
            <Link to="/student-dashboard">
              {logoURL ? (
                <img
                  src={logoURL}
                  alt="Logo"
                  className="w-[140px] transition-all duration-300"
                />
              ) : (
                <img
                  src="https://demo-learnqoch.s3.ap-south-1.amazonaws.com/engage/1751987287-western-removebg-preview.png"
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

export default StudentSidebar;