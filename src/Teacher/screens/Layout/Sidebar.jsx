// src/Teacher/screens/Layout/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";
import { useUserProfile } from "@/contexts/UserProfileContext";
import "@/_assets/customStyle.css";
import {
  LayoutDashboard,
  Clock,
  FileCheck,
  Library,
  BookText,
  BarChart3,
  MessageSquare,
  Users2,
  Briefcase,
  FileEdit,
  GraduationCap,
  Code,
  StickyNote,
  Award,
  CalendarDays,
  Settings,
  FileText,
  ShoppingCart
} from "lucide-react";

/* ──────────────────────── ICONS (FALLBACKS) ──────────────────────── */
import logoutIcon from "@/_assets/images_new_design/icons/Logout.svg";
import toggleIcon from "@/_assets/images/toggle-icon.svg";
import closebtn from "@/_assets/images/Close.svg";

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const { fullName, designation, userType, profileImage } = useUserProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoURL] = useState(() => localStorage.getItem("logoURL") ?? "");
  const [chapterTopicAccess] = useState(() => localStorage.getItem("chapter_topic_access") === "true");
  const [reportAccess] = useState(() => localStorage.getItem("report_access") === "true");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menuItems = useMemo(() => {
    const items = [
      { to: "/dashboard", label: "My Teaching", icon: LayoutDashboard, match: ["/dashboard"] },
      { to: "/teacher/timetable", label: "TimeTable", icon: Clock, match: ["/teacher/timetable"] },
      { to: "/teacher/attendance", label: "Attendance", icon: FileCheck, match: ["/teacher/attendance"] },
      { to: "/teacher/content", label: "Content", icon: Library, match: ["/teacher/content", "/teacher-view-content", "/teacher-content-manage", "/teacher-edit-content", "/add-content-teacher", "/student-content", "/teacher-edit-project", "/student-view-project"] },
      { to: "/subject-selection", label: "Paper Selection", icon: BookText, match: ["/subject-selection"] },
      { to: "/teacher/assessments", label: "Assessment", icon: FileEdit, match: ["/teacher/assessments", "/teacher-add-assessment", "/teacher-view-assessments", "/teacher-view-st-test-result", "/teacher-view-assessments-details", "/teacher-add-question", "/teacher-edit-question"] },
      { to: "/teacher/academic-diary", label: "Academic Diary", icon: BookText, match: ["/teacher/academic-diary"] },
      { to: "/teacher/us-feedback", label: "Feedback", icon: MessageSquare, match: ["/teacher/us-feedback"] },
      { to: "/teacher/committees", label: "Committee", icon: Users2, match: ["/teacher/committees", "/teacher/committee"] },
      { to: "/teacher/placement", label: "Placement", icon: Briefcase, match: ["/teacher/placement"] },
      { to: "/teacher-analytics", label: "Insights", icon: BarChart3, match: ["/teacher-analytics"] },
      { to: "/teacher-coding", label: "Coding", icon: Code, match: ["/teacher-coding"] },
      { to: "/teacher-quickNotesList", label: "Quick Notes", icon: StickyNote, match: ["/teacher-quickNotesList", "/teacher-view-note"] },
      { to: "/teacher-engage", label: "Engage", icon: MessageSquare, match: ["/teacher-engage"] },
      { to: "/teacher/academic-calendar", label: "Academic Calendar", icon: GraduationCap, match: ["/teacher/academic-calendar"] },
      { to: "/teacher/library", label: "My Library", icon: Library, match: ["/teacher/library"] },
      { to: "/teacher/hrm", label: "HRM", icon: Briefcase, match: ["/teacher/hrm"] },
      { to: "/teacher-certificate", label: "Certificate", icon: Award, match: ["/teacher-certificate"] },
      { to: "/teacher/exam", label: "Exam Management", icon: FileEdit, match: ["/teacher/exam"] },
      { to: "/teacher/leaves", label: "Leaves", icon: CalendarDays, match: ["/teacher/leaves"] },
      { to: "/obe-setting", label: "OBE Setting", icon: Settings, match: ["/obe-setting"] },
      { to: "/Document-Generation-dashbaord", label: "Document", icon: FileText, match: ["/Document-Generation-dashbaord"] },
      { to: "/Purchase", label: "Purchase", icon: ShoppingCart, match: ["/Purchase"] },
    ];

    if (chapterTopicAccess) {
      items.push({ to: "/teacher-syllabus", label: "Academics", icon: GraduationCap, match: ["/teacher-syllabus"] });
    }

    if (reportAccess) {
      items.push({ to: "/reports", label: "Reports", icon: BarChart3, match: ["/reports"] });
    }

    return items;
  }, [chapterTopicAccess, reportAccess]);

  const handleMobileToggle = () => setIsMobileOpen(!isMobileOpen);

  const isItemActive = (item, pathname) => {
    return item.match.some(path => pathname.startsWith(path));
  };

  const renderMenuItems = (onClick = null) =>
    menuItems.map((item, idx) => {
      const active = isItemActive(item, location.pathname);
      return (
        <li key={idx} className="my-1 list-none">
          <Link
            to={item.to}
            onClick={onClick}
            className={classNames(
              "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200",
              active ? "border border-orange-400 bg-orange-50 font-bold text-orange-600 shadow-sm" : "hover:bg-blue-50 text-blue-600"
            )}
          >
            <item.icon size={20} className={active ? "text-orange-600" : "text-blue-600"} />
            {(isOpen || onClick) && <span className="text-sm font-bold">{item.label}</span>}
          </Link>
        </li>
      );
    });

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <div className={classNames(
        "hidden md:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 overflow-y-auto transition-all duration-300 flex-col justify-between",
        isOpen ? "w-[220px]" : "w-[80px]"
      )}>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col items-center py-6 border-b border-gray-100">
            <div className={classNames("flex items-center justify-center", isOpen ? "h-[80px]" : "h-[60px]")}>
              <img
                src={logoURL || "https://learnqoch.com/wp-content/uploads/al_opt_content/IMAGE/learnqoch.com/wp-content/uploads/2024/08/LearnQoch-WebT_Logo.png.bv_resized_mobile.png.bv.webp?bv_host=learnqoch.com"}
                alt="Logo"
                className={classNames("object-contain transition-all", isOpen ? "max-w-[140px] max-h-[80px]" : "max-w-[60px] max-h-[60px]")}
              />
            </div>
          </div>

          <div className="absolute top-0 -right-0 h-full w-8 flex items-center justify-end cursor-pointer group/toggle z-50" onClick={toggle}>
            <div className="w-6 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-md flex items-center justify-center opacity-0 group-hover/toggle:opacity-100 transition-all duration-200">
              <svg className={classNames("w-3.5 h-3.5 text-gray-600 transition-transform duration-300", isOpen ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <ul className="flex-1 px-2 space-y-1 mt-4">
            {renderMenuItems()}
          </ul>
        </div>

        <div className="px-2 mb-6">
          <button onClick={logout} className="flex items-center space-x-3 px-3 py-2 text-blue-600 rounded-md hover:bg-blue-50 w-full">
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            {isOpen && <span className="text-sm font-bold">Log Out</span>}
          </button>
        </div>
      </div>

      {/* ===== Mobile Hamburger ===== */}
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button onClick={handleMobileToggle} className="bg-blue-600 p-2 rounded-md shadow-lg">
            <img src={toggleIcon} alt="Menu" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ===== Mobile Sidebar Overlay ===== */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden" onClick={handleMobileToggle}>
          <div className="absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <img src={logoURL || "https://learnqoch.com/wp-content/uploads/al_opt_content/IMAGE/learnqoch.com/wp-content/uploads/2024/08/LearnQoch-WebT_Logo.png.bv_resized_mobile.png.bv.webp?bv_host=learnqoch.com"} alt="Logo" className="h-10 object-contain" />
              <button onClick={handleMobileToggle} className="p-2 hover:bg-gray-100 rounded-full">
                <img src={closebtn} alt="Close" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{fullName || "User"}</p>
                <p className="text-xs text-blue-600 font-medium">{designation || userType || "Teacher"}</p>
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto p-2 space-y-1">
              {renderMenuItems(() => setIsMobileOpen(false))}
            </ul>

            <div className="p-4 border-t border-gray-100">
              <button onClick={logout} className="flex items-center space-x-3 px-3 py-3 text-red-600 rounded-md hover:bg-red-50 w-full transition-colors font-bold">
                <img src={logoutIcon} alt="Logout" className="w-5 h-5 opacity-70" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;