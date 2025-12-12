import React, { useState, useEffect } from 'react';
import ContentApiService from '../services/contentApi';

export default function SubjectsList({
  subjectTypes,
  selectedPaperType,
  academicYearId,
  semesterId,
  selectedProgramData,
  filteredSubjects,
  setAllSubjects,
  onSubjectClick,
  selectedSubjectId
}) {

  const [selectedTab, setSelectedTab] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available tabs from subject types
  const getAvailableTabs = () => {
    const currentType = subjectTypes[selectedPaperType.toLowerCase()];
    if (!currentType) return [];

    const typeInfo = currentType?.type_info;
    if (!typeInfo) return [];

    return [
      {
        id: typeInfo.type_id,
        name: typeInfo.type_name,
        type: "type_info",
        count: typeInfo.subject_count,
        code: typeInfo.type_code,
      }
    ];
  };

  const availableTabs = getAvailableTabs();

  // Auto-select first tab and fetch subjects immediately
  useEffect(() => {
    console.log('Available tabs:', availableTabs);
    console.log('Current selected tab:', selectedTab);

    const fetchSubjects = async (tabToUse) => {
      if (tabToUse && academicYearId && semesterId) {
        // Get the type_name from subjectTypes for tabType
        const currentType = subjectTypes[selectedPaperType.toLowerCase()];
        const tabType = currentType?.type_info?.type_name || selectedPaperType;

        console.log('Fetching subjects with params:', {
          tabId: tabToUse.id,
          academicYearId,
          semesterId,
          tabType: tabType
        });

        setLoading(true);
        setError(null);
        try {
          const response = await ContentApiService.getSubjectsByTab(
            tabToUse.id,
            academicYearId,
            semesterId,
            tabType
          );

          console.log('API Response:', response);

          if (response.success && response.data) {
            const fetchedSubjects = response.data || [];
            setSubjects(fetchedSubjects);
            // Pass all subjects to parent for filtering
            if (setAllSubjects) {
              setAllSubjects(fetchedSubjects);
            }
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setSubjects([]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (availableTabs.length > 0 && !selectedTab) {
      console.log('Auto-selecting first tab:', availableTabs[0]);
      const firstTab = availableTabs[0];
      setSelectedTab(firstTab);
      // Immediately fetch subjects for the first tab without waiting for state update
      fetchSubjects(firstTab);
    } else if (availableTabs.length === 0) {
      setSelectedTab(null);
      setSubjects([]);
    }
  }, [availableTabs.length, academicYearId, semesterId, subjectTypes, selectedPaperType]);

  // Reset when paper type changes
  useEffect(() => {
    setSelectedTab(null);
    setSubjects([]);
  }, [selectedPaperType]);

  // Update subjects when filtered subjects change
  useEffect(() => {
    if (filteredSubjects) {
      setSubjects(filteredSubjects);
    }
  }, [filteredSubjects]);

  if (!subjectTypes[selectedPaperType.toLowerCase()]) {
    return null;
  }

  const currentType = subjectTypes[selectedPaperType.toLowerCase()];

  return (
    <div>
      {/* Show tab buttons */}
      {availableTabs.length > 0 ? (
        <div>
          {/* Subjects Grid */}
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading subjects...</div>
              </div>
            ) : subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject, index) => (
                  <button
                    key={subject.subject_id || index}
                    onClick={() => onSubjectClick && onSubjectClick(subject)}
                    className={`w-full py-2 px-3 rounded-md text-white text-sm font-medium shadow transition-all duration-200 transform ${selectedSubjectId === subject.subject_id
                      ? 'translate-y-[-2px] ring-2 ring-offset-2 ring-offset-white opacity-100 shadow-md scale-[1.02]'
                      : 'hover:opacity-90 hover:scale-[1.01]'
                      }`}
                    style={{
                      backgroundColor: subject.color_code || "#3b82f6",
                      // Use outline color that matches background if selected
                      '--tw-ring-color': subject.color_code || "#3b82f6"
                    }}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  No subjects available for this selection.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">
            This type has direct subjects. Click on a different type or use filters to view content.
          </p>
        </div>
      )}
    </div>
  );
}