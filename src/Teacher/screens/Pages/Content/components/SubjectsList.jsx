import React, { useState, useEffect } from 'react';
import ContentApiService from '../services/contentApi';

export default function SubjectsList({
  subjectTypes,
  selectedPaperType,
  academicYearId,
  semesterId,
  selectedProgramData
}) {

  const [selectedTab, setSelectedTab] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available tabs from subject types
  const getAvailableTabs = () => {
    const currentType = subjectTypes[selectedPaperType.toLowerCase()];
    if (!currentType) return [];

    const tabs = [];

    // Add verticals as tabs
    if (currentType.verticals?.length > 0) {
      currentType.verticals.forEach(vertical => {
        tabs.push({
          id: vertical.id,
          name: vertical.name,
          type: 'vertical',
          count: vertical.subject_count,
          code: vertical.code
        });
      });
    }

    // Add specializations as tabs
    if (currentType.specializations?.length > 0) {
      currentType.specializations.forEach(specialization => {
        tabs.push({
          id: specialization.id,
          name: specialization.name,
          type: 'specialization',
          count: specialization.subject_count,
          code: specialization.code
        });
      });
    }

    return tabs;
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
            setSubjects(response.data || []);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setError(`Failed to load subjects: ${error.message}`);
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

  if (!subjectTypes[selectedPaperType.toLowerCase()]) {
    return null;
  }

  const currentType = subjectTypes[selectedPaperType.toLowerCase()];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {selectedPaperType} Subjects - {selectedProgramData?.name} (Semester {selectedProgramData?.semesters?.find(s => s.id.toString() === semesterId)?.name})
      </h3>


      {/* Show tab buttons */}
      {availableTabs.length > 0 ? (
        <div>



          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => {
                console.log('Rendering subject:', subject);
                return (
                  <div
                    key={subject.subject_id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h6 className="font-medium text-gray-900 mb-2">
                      {subject.name}
                    </h6>
                    {subject.subject_code && (
                      <p className="text-sm text-gray-500 mb-2">
                        Subject Code: {subject.subject_code}
                      </p>
                    )}
                    {subject.paper_code && (
                      <p className="text-sm text-gray-500 mb-2">
                        Paper Code: {subject.paper_code}
                      </p>
                    )}
                    {subject.credits && (
                      <p className="text-sm text-gray-500 mb-2">
                        Credits: {subject.credits}
                      </p>
                    )}
                    {subject.color_code && (
                      <div className="flex items-center mt-2">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: subject.color_code }}
                        ></div>
                        <span className="text-xs text-gray-400">Color Code</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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