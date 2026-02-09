import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Upload, Download } from "lucide-react";
import { teacherProfileService } from "../Services/academicDiary.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
// import BulkUploadModal from "../Components/BulkUploadModal";

const tabs = [
  { label: "Professional Ethics", to: "/teacher/academic-diary/professional-ethics" },
  { label: "Committee", to: "/teacher/academic-diary/committee" },
  { label: "Daily Work Report", to: "/teacher/academic-diary/daily-work-report" },
  { label: "Advanced Learner", to: "/teacher/academic-diary/advanced-learner" },
  { label: "Slow Learner", to: "/teacher/academic-diary/slow-learner" },
  { label: "Contributions", to: "/teacher/academic-diary/contributions" },
  { label: "Teaching Plan", to: "/teacher/academic-diary/teaching-plan" },
  { label: "Timetable", to: "/teacher/academic-diary/time-table" },
  { label: "Leave", to: "/teacher/academic-diary/leave" },
  { label: "Monitoring Reports", to: "/teacher/academic-diary/monitoring-reports" },
];

export default function AcademicTabsNav() {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { getUserId, getCollegeId } = useUserProfile();
  const teacherId = getUserId();
  const collegeId = getCollegeId();

  const handleDownload = async () => {
    if (!teacherId || !collegeId) {
      alert("Missing teacher or college information");
      return;
    }

    try {
      setDownloading(true);
      const blob = await teacherProfileService.downloadAcademicDiaryByTeacher(teacherId, collegeId);

      // Create Object URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Filename - you might want to confirm format or get from headers if available
      // For now using a standard timestamped name
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Academic_Diary_${date}.pdf`); // Assuming PDF, adjust if needed

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download diary. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tabs Section */}
        <div className="flex flex-wrap gap-2 md:gap-4 mx-2 sm:mx-4">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap w-auto flex-shrink-0 px-4 py-2 text-sm ${isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || !teacherId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex-shrink-0 mx-2 sm:mx-4 lg:mx-0 whitespace-nowrap w-auto"
        >
          <Download size={16} />
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
}
