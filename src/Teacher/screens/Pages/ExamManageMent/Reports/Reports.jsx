import React, { useState, useEffect } from "react";
// import HeaderFilters from "./HeaderFilters";
import FinalResultsReport from "./FinalResultsReport";
import StudentAttendanceReport from "./StudentAttendanceReport";
import MarksEntryReport from "./MarksEntryReport";

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState("marks-entry");

  const [filters, setFilters] = useState({
    program: "",
    batch: "",
    academicYear: "",
    semester: "",
    division: "",
    schedule: "",
    paper: "",
    scheduleName: "",
    paperName: "",
  });

  const reportTabs = [
    { id: "marks-entry", name: "Marks Entry", color: "blue" },
    { id: "final-results", name: "Final Results", color: "purple" },
    { id: "student-attendance", name: "Student Attendance", color: "indigo" },
  ];

  // const showHeaderFilters = true; // All 3 tabs use filters

  const filterVisibilityByTab = {
    "final-results": { showSemester: true, showDivision: true, showSchedule: false, showPaper: false },
    "student-attendance": { showSemester: true, showDivision: false, showSchedule: true, showPaper: false },
    "marks-entry": { showSemester: true, showDivision: false, showSchedule: true, showPaper: true },
  };

  useEffect(() => {
    const visibility = filterVisibilityByTab[selectedTab] || {};

    setFilters((prev) => ({
      ...prev,
      division: visibility.showDivision ? prev.division : "",
      paper: visibility.showPaper ? prev.paper : "",
      paperName: visibility.showPaper ? prev.paperName : "",
      schedule: visibility.showSchedule ? prev.schedule : "",
      scheduleName: visibility.showSchedule ? prev.scheduleName : "",
    }));
  }, [selectedTab]);

  const getTabStyles = (color, isActive) => {
    const colors = {
      indigo: { from: "indigo-500", to: "indigo-600", hover: "indigo-50", text: "indigo-700" },
      blue:   { from: "blue-500",   to: "blue-600",   hover: "blue-50",   text: "blue-700"   },
      purple: { from: "purple-500", to: "purple-600", hover: "purple-50", text: "purple-700" },
    };

    const c = colors[color] || colors.indigo;

    return isActive
      ? `bg-gradient-to-r from-${c.from} to-${c.to} text-white shadow-lg shadow-${color}-500/30 border-${color}-400`
      : `text-gray-700 hover:bg-${c.hover} hover:text-${c.text} border-transparent`;
  };

  const renderTabButton = (tab) => {
    const isActive = selectedTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setSelectedTab(tab.id)}
        className={`
          relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
          border-2 whitespace-nowrap flex-1 text-center
          min-w-[140px] max-w-[220px]
          ${getTabStyles(tab.color, isActive)}
        `}
      >
        {tab.name}
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header + Tabs */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#2162c1] mb-4 tracking-tight">
            Reports Dashboard
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-md p-4 lg:p-5 border border-gray-200/70">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
              {reportTabs.map(renderTabButton)}
            </div>
          </div>
        </div>

        {/* Filters */}
        {/* <div className="mb-6 bg-white rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-200/60">
          <HeaderFilters
            filters={filters}
            setFilters={setFilters}
            {...(filterVisibilityByTab[selectedTab] || {})}
          />
        </div> */}

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
          <div className="p-5 lg:p-6 min-h-[500px]">
            {selectedTab === "final-results" && (
              <FinalResultsReport
                academicYearId={filters.academicYear}
                semesterId={filters.semester}
                divisionId={filters.division}
                examForTypeId={1}
              />
            )}

            {selectedTab === "student-attendance" && (
              <StudentAttendanceReport examScheduleId={filters.schedule} />
            )}

            {selectedTab === "marks-entry" && (
              <MarksEntryReport
                examScheduleId={filters.schedule}
                subjectId={filters.paper}
                examScheduleName={filters.scheduleName}
                subjectName={filters.paperName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;