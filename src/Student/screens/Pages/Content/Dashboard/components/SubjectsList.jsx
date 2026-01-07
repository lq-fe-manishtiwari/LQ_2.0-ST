import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ContentService } from "../../Service/Content.service";
import { useUserProfile } from "../../../../../../contexts/UserProfileContext";
import SelectionModal from "./SelectionModal";

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
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Track if current tab is locked
  const [currentTabName, setCurrentTabName] = useState('');
  const [configData, setConfigData] = useState(null);

  // Refs to prevent duplicate API calls
  const lastFetchedTab = useRef(null);
  const isFetching = useRef(false);

  // ---- GET TAB BASED ON selectedSubTab OR type_info ----
  const getAvailableTabs = () => {
    // If selectedSubTab exists (vertical/specialization), use it
    if (selectedSubTab) {
      console.log('✅ Using selectedSubTab:', selectedSubTab.name);
      return [
        {
          id: selectedSubTab.id,        // vertical_id or specialization_id
          name: selectedSubTab.name,
          type: selectedSubTab.type,    // "vertical" / "specialization"
          code: selectedSubTab.code
        }
      ];
    }

    // Check if current type has subtabs
    const currentType = subjectTypes[selectedPaperType.toLowerCase()];
    const hasSubTabs = currentType?.verticals?.length > 0 || currentType?.specializations?.length > 0;

    if (hasSubTabs) {
      // If subtabs exist but none selected yet, don't fetch at tab level
      console.log('⏸️ Subtabs exist but none selected yet - skipping tab level fetch');
      return [];
    }

    // If no selectedSubTab and no subtabs, use type_info (no sub-tabs case)
    if (currentType?.type_info) {
      console.log('✅ Using type_info (no subtabs):', currentType.type_info.type_name);
      return [
        {
          id: currentType.type_info.type_id,
          name: currentType.type_info.type_name,
          type: "type_info",
          code: currentType.type_info.type_code
        }
      ];
    }

    return [];
  };

  const availableTabs = getAvailableTabs();

  // ============================================
  // Handle Modal Actions
  // ============================================
  const handleCancelSelection = () => {
    setShowModal(false);
    // Set current tab as locked (subjects will show with lock icon)
    setIsLocked(true);
  };

  const handleGoToSelection = async () => {
    setShowModal(false);

    if (selectionStatus?.config_id) {
      try {
        console.log('Fetching config for config_id:', selectionStatus.config_id);
        const response = await ContentService.getSubjectSelectionConfig(selectionStatus.config_id);

        if (response.success) {
          console.log('Subject Selection Config Response:', response.data);

          // Navigate to selection page with the config data
          navigate('/student-dashboard/subject-selection', {
            state: {
              configData: response.data,
              configId: selectionStatus.config_id,
              academicYearId,
              semesterId,
              studentId: profile?.student_id
            }
          });
        }
      } catch (error) {
        console.error('Error fetching selection config:', error);
      }
    }
  };

  // ============================================
  // Fetch Student Selection Status
  // ============================================
  const fetchSelectionStatus = async (tab) => {
    if (!tab || !academicYearId || !semesterId || !profile?.student_id) return;

    try {
      const currentType = subjectTypes[selectedPaperType.toLowerCase()];
      const subjectTypeId = currentType?.type_info?.type_id;

      if (!subjectTypeId) {
        console.warn('Subject type ID not found');
        return;
      }

      // For vertical type tabs, pass the vertical ID
      const verticalTypeId = tab.type === 'vertical' ? tab.id : null;

      console.log('Fetching selection status with params:', {
        academicYearId,
        semesterId,
        studentId: profile.student_id,
        subjectTypeId,
        verticalTypeId
      });

      const response = await ContentService.getSelectionByAcademicSemester(
        academicYearId,
        semesterId,
        profile.student_id,
        subjectTypeId,
        verticalTypeId
      );

      console.log('🔍 response', response);

      if (response.success && response.data) {
        // Handle array response - API returns array sometimes
        let responseData = response.data;

        // If API returned an array, get first element
        if (Array.isArray(response.data)) {
          console.log('⚠️ API returned ARRAY, length:', response.data.length);
          if (response.data.length === 0) {
            console.log('📭 Empty array response - no selection data');
            setIsLocked(false);
            return;
          }
          responseData = response.data[0]; // Get first element
          console.log('📦 Extracted data from array:', responseData);
        }

        console.log('✅ Selection status API SUCCESS');
        console.log('Full response.data:', JSON.stringify(responseData, null, 2));
        console.log('Response keys:', Object.keys(responseData));
        console.log('has_selection value:', responseData.has_selection);
        console.log('config_id value:', responseData.config_id);

        // Check if response is truly blank (null or empty object)
        const isBlankResponse = !responseData || Object.keys(responseData).length === 0;

        if (isBlankResponse) {
          console.log('⚠️ Response is BLANK/EMPTY');
          setIsLocked(false);
          return;
        }

        setSelectionStatus(responseData);

        // Check if selection is required - only show modal if config_id exists
        console.log('📊 Selection check:', {
          has_selection: responseData.has_selection,
          has_selection_type: typeof responseData.has_selection,
          config_id: responseData.config_id,
          config_id_type: typeof responseData.config_id,
          shouldShowModal: !responseData.has_selection && responseData.config_id
        });

        if (!responseData.has_selection && responseData.config_id) {
          console.log('🔒 CONDITIONS MET! Locking tab and showing modal for:', tab.name);
          console.log('Setting currentTabName to:', tab.name);
          console.log('Setting isLocked to: true');

          setCurrentTabName(tab.name);
          setIsLocked(true);

          // Fetch config data for modal and show modal only after data is loaded
          ContentService.getSubjectSelectionConfig(responseData.config_id)
            .then(configResponse => {
              if (configResponse.success) {
                console.log('✅ Config data loaded:', configResponse.data);
                setConfigData(configResponse.data);
                setShowModal(true);
              }
            })
            .catch(err => console.error('Error fetching config for modal:', err));
        } else {
          console.log('✅ Tab unlocked - Reason:',
            !responseData.has_selection ? 'has_selection is false but no config_id' : 'has_selection is true'
          );
          setIsLocked(false);
        }
      } else {
        // Blank/invalid response - don't lock or show modal
        console.log('No valid response, keeping subjects unlocked');
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Error fetching selection status:', error);
      setIsLocked(false); // Don't lock on error
    }
  };

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
        tabType,
        profile?.student_id
      );

      if (response.success && Array.isArray(response.data)) {
        console.log("API Response Data:", response.data);
        console.log("Filtering by tab:", tab);

        // Only filter if it's a vertical/specialization tab, not type_info
        let filteredData = response.data;

        if (tab.type === 'vertical') {
          filteredData = response.data.filter(subject => {
            const hasVertical = subject.verticals?.some(v => v.vertical_id === tab.id);
            console.log(`Subject "${subject.name}" has vertical ${tab.id}:`, hasVertical);
            return hasVertical;
          });
        } else if (tab.type === 'specialization') {
          filteredData = response.data.filter(subject =>
            subject.specializations?.some(s => s.specialization_id === tab.id)
          );
        }
        // For type_info, use all subjects without filtering

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

  // Fetch subjects automatically when subTab changes OR when type changes
  useEffect(() => {
    if (availableTabs.length > 0) {
      const currentTab = availableTabs[0];
      const tabKey = `${currentTab.id}-${currentTab.type}-${selectedPaperType}-${academicYearId}-${semesterId}`;

      // Check if it's a different tab
      const isDifferentTab = lastFetchedTab.current !== tabKey;

      // Prevent duplicate calls for SAME tab only
      if (!isDifferentTab && isFetching.current) {
        console.log('Skipping duplicate API call for tab:', currentTab.name);
        return;
      }

      // Mark as fetching
      isFetching.current = true;
      lastFetchedTab.current = tabKey;

      console.log('🔄 Fetching data for tab:', currentTab.name, 'Type:', currentTab.type);

      // Reset locked state when tab changes
      setIsLocked(false);
      setShowModal(false);

      // Fetch both subjects and selection status
      Promise.all([
        fetchSubjects(currentTab),
        fetchSelectionStatus(currentTab)
      ]).finally(() => {
        isFetching.current = false;
      });
    } else {
      setSubjects([]);
      setSelectionStatus(null);
      setIsLocked(false);
      setShowModal(false);
      lastFetchedTab.current = null;
    }
  }, [selectedSubTab?.id, academicYearId, semesterId, selectedPaperType, profile?.student_id]);

  // ---------------------------------------------
  // When Search Filter Updates → Show filtered list
  // ---------------------------------------------
  useEffect(() => {
    if (filteredSubjects) {
      setSubjects(filteredSubjects);
    }
  }, [filteredSubjects]);

  if (!subjectTypes[selectedPaperType.toLowerCase()]) return null;

  // Debug: Log modal state before render
  console.log('🎭 Render - showModal:', showModal, 'isLocked:', isLocked, 'currentTabName:', currentTabName);

  return (
    <div>
      {/* Selection Modal */}
      <SelectionModal
        isOpen={showModal}
        onClose={handleCancelSelection}
        onGoToSelection={handleGoToSelection}
        tabName={currentTabName}
        startTime={configData?.start_time}
        endTime={configData?.end_time}
      />

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
                onClick={() => !isLocked && onSubjectClick(subject)}
                disabled={isLocked}
                className={`relative w-full py-2 px-3 rounded-md text-white text-sm font-medium shadow transition-all duration-200 ${isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : selectedSubjectId === subject.subject_id
                    ? "ring-2 ring-offset-2 scale-[1.02]"
                    : "hover:scale-[1.01]"
                  }`}
                style={{
                  backgroundColor: subject.color_code || "#3b82f6",
                  "--tw-ring-color": subject.color_code || "#3b82f6"
                }}
              >
                {isLocked && (
                  <svg
                    className="w-4 h-4 absolute top-2 right-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
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
