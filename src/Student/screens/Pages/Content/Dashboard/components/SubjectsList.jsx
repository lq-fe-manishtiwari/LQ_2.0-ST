import React, { useState, useEffect } from "react";
import { ContentService } from "../../Service/Content.service";

export default function SubjectsList({
  subjectTypes,
  selectedPaperType,
  academicYearId,
  semesterId,
  selectedProgramData,
  filteredSubjects,
  setAllSubjects,
  onSubjectClick,
  selectedSubjectId,
  selectedSubTab // ✅ FIXED — coming from parent
}) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- GET TAB BASED ON selectedSubTab ----
  const getAvailableTabs = () => {
    if (!selectedSubTab) return [];
    return [
      {
        id: selectedSubTab.id,        // vertical_id or specialization_id
        name: selectedSubTab.name,
        type: selectedSubTab.type,    // "vertical" / "specialization"
        code: selectedSubTab.code
      }
    ];
  };

  const availableTabs = getAvailableTabs();

  // ============================================
  // Fetch Subjects When Tab Changes (CORRECT)
  // ============================================

  const fetchSubjects = async (tab) => {
    if (!tab || !academicYearId || !semesterId) return;

    setLoading(true);
    try {
      const tabType = selectedPaperType; // e.g., "Vertical" or "Specialization"

      console.log("Calling API → ", {
        tabId: tab.id,
        tabName: tab.name,
        academicYearId,
        semesterId,
        tabType
      });

      const response = await ContentService.getSubjectsByTab(
        tab.id,            // 🎯 correct tabId used now!
        academicYearId,
        semesterId,
        tabType
      );

      if (response.success && Array.isArray(response.data)) {
        console.log("API Response Data:", response.data);
        console.log("Filtering by tab:", tab);
        
        // Filter subjects based on selected vertical/specialization
        const filteredData = response.data.filter(subject => {
          if (tab.type === 'vertical') {
            const hasVertical = subject.verticals?.some(v => v.vertical_id === tab.id);
            console.log(`Subject "${subject.name}" has vertical ${tab.id}:`, hasVertical);
            return hasVertical;
          } else if (tab.type === 'specialization') {
            return subject.specializations?.some(s => s.specialization_id === tab.id);
          }
          return true;
        });
        
        console.log("Filtered subjects:", filteredData);
        setSubjects(filteredData);
        setAllSubjects && setAllSubjects(filteredData);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error fetching subjects: ", err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects automatically when subTab changes
  useEffect(() => {
    if (availableTabs.length > 0) {
      fetchSubjects(availableTabs[0]);
    }
  }, [selectedSubTab?.id, academicYearId, semesterId, selectedPaperType]);

  // ---------------------------------------------
  // When Search Filter Updates → Show filtered list
  // ---------------------------------------------
  useEffect(() => {
    if (filteredSubjects) {
      setSubjects(filteredSubjects);
    }
  }, [filteredSubjects]);

  if (!subjectTypes[selectedPaperType.toLowerCase()]) return null;

  return (
    <div>
      {/* SUBJECT GRID */}
      <div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading subjects...
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.subject_id}
                onClick={() => onSubjectClick(subject)}
                className={`w-full py-2 px-3 rounded-md text-white text-sm font-medium shadow transition-all duration-200 ${
                  selectedSubjectId === subject.subject_id
                    ? "ring-2 ring-offset-2 scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
                style={{
                  backgroundColor: subject.color_code || "#3b82f6",
                  "--tw-ring-color": subject.color_code || "#3b82f6"
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            No subjects available for this selection.
          </div>
        )}
      </div>
    </div>
  );
}
