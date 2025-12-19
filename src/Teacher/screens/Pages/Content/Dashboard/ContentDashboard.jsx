import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Filter, ChevronDown, Plus, Settings } from 'lucide-react';
import ContentApiService from '../services/contentApi';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import SubjectsList from '../components/SubjectsList';
import ModulesUnitsList from '../components/ModulesUnitsList';

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-xl min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`${value ? 'text-gray-900' : 'text-gray-400'} whitespace-nowrap overflow-hidden text-ellipsis flex-1`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ContentDashboard() {
  const { profile, getTeacherId, isLoaded, loading: profileLoading } = useUserProfile();

  // Load saved filter values from localStorage
  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem('contentDashboardFilters');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savedFilters = loadSavedFilters();
  const [selectedPaperType, setSelectedPaperType] = useState(savedFilters.paperType || 'Vertical');
  const [selectedProgram, setSelectedProgram] = useState(savedFilters.program || '');
  const [selectedBatch, setSelectedBatch] = useState(savedFilters.batch || '');
  const [selectedSemester, setSelectedSemester] = useState(savedFilters.semester || '');

  const [selectedSubTab, setSelectedSubTab] = useState(null); // For sub-tabs (verticals/specializations)

  const [filterOpen, setFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [allSubjects, setAllSubjects] = useState([]); // Store all subjects before filtering

  // State for API data
  const [allocatedPrograms, setAllocatedPrograms] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modules/units display
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modulesData, setModulesData] = useState([]);

  // Add Content handler - modified to work with Link
  const onAddContent = () => {
    console.log('Add Content button clicked');
    // This function will still be called if you click the button,
    // but the Link will handle navigation
  };

  // Dynamic paper types based on API response
  const getPaperTypes = () => {
    const types = [];
    Object.keys(subjectTypes).forEach(typeName => {
      const typeInfo = subjectTypes[typeName].type_info;
      let color = 'bg-primary-600 text-gray-50 border-gray-200';


      types.push({
        id: typeName,
        label: typeInfo.type_name,
        color: color,
        count: typeInfo.subject_count
      });
    });
    return types;
  };

  const paperTypes = getPaperTypes();


  // Get sub-tabs based on selected paper type
  const getSubTabs = () => {
    const currentType = subjectTypes[selectedPaperType.toLowerCase()];
    if (!currentType) return [];

    if (selectedPaperType.toLowerCase() === 'vertical') {
      // For vertical, use verticals as sub-tabs
      const verticals = currentType.verticals?.map(vertical => ({
        id: vertical.id,
        name: vertical.name,
        code: vertical.code,
        type: 'vertical'
      })) || [];

      // Only return verticals if they exist, otherwise return empty
      return verticals;
    } else {
      // For non-vertical types, check if specializations exist in API response
      const apiSpecializations = currentType.type_info?.sub_tabs?.specializations || [];

      // If API has specializations in sub_tabs, use them
      if (apiSpecializations.length > 0) {
        return getSpecializationsFromSubjects();
      }

      // If no specializations in API, return empty (no sub-tabs)
      return [];
    }
  };

  // Get unique specializations from all subjects
  const getSpecializationsFromSubjects = () => {
    if (!allSubjects || allSubjects.length === 0) return [];

    const specializationsMap = new Map();
    let hasSubjectsWithoutSpecialization = false;

    allSubjects.forEach(subject => {
      // Check if subject has no specialization
      if (!subject.specialization || subject.specialization === null) {
        hasSubjectsWithoutSpecialization = true;
      }

      if (subject.specializations && subject.specializations.length > 0) {
        subject.specializations.forEach(spec => {
          // Include all specializations (even deleted ones) since subjects might reference them
          specializationsMap.set(spec.specialization_id, {
            id: spec.specialization_id,
            name: spec.name,
            code: spec.code,
            type: 'specialization'
          });
        });
      }
    });

    const specializations = Array.from(specializationsMap.values());

    // Add "General" option for subjects without specialization
    if (hasSubjectsWithoutSpecialization) {
      specializations.unshift({
        id: null,
        name: "General",
        code: "general",
        type: 'specialization'
      });
    }

    return specializations;
  };

  const availableSubTabs = getSubTabs();

  // Filter subjects based on selected sub-tab
  const getFilteredSubjects = () => {
    if (!selectedSubTab || !allSubjects) return allSubjects;

    if (selectedSubTab.type === 'vertical') {
      // Filter by vertical
      return allSubjects.filter(subject => {
        return subject.verticals && subject.verticals.some(vertical =>
          // Use loose equality or ensure types match, and ignore is_deleted for now as it causes issues with test data
          vertical.vertical_id == selectedSubTab.id
        );
      });
    } else if (selectedSubTab.type === 'specialization') {
      // Filter by specialization
      if (selectedSubTab.id === null) {
        // "General" - subjects without specialization
        return allSubjects.filter(subject =>
          !subject.specialization || subject.specialization === null
        );
      } else {
        // Specific specialization
        return allSubjects.filter(subject => {
          const subjectSpecializationId = subject.specialization ?
            parseInt(subject.specialization) : null;
          return subjectSpecializationId === selectedSubTab.id;
        });
      }
    }

    return allSubjects;
  };

  const filteredSubjects = getFilteredSubjects();

  // Clear selected subject when sub-tab changes
  useEffect(() => {
    setSelectedSubject(null);
    setModulesData([]);
  }, [selectedSubTab]);

  // Fetch allocated programs when user profile is available
  useEffect(() => {
    const fetchAllocatedPrograms = async () => {
      if (!isLoaded || profileLoading) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }

      const teacherId = getTeacherId();
      console.log("Profile loaded:", profile);
      console.log("teacher_id:", teacherId);

      if (!teacherId) {
        console.log('Teacher ID not available in profile');
        return;
      }

      console.log('Teacher ID found:', teacherId);
      setLoading(true);
      setError(null);
      try {
        const response = await ContentApiService.getAllocatedPrograms(teacherId);

        // Process the API response to group by programs
        if (response.success && response.data?.allocations) {
          const processedPrograms = processAllocationsData(response.data.allocations);
          setAllocatedPrograms(processedPrograms);

          // Auto-select first program, batch, and semester only if no saved values
          if (processedPrograms.length > 0 && !savedFilters.program) {
            const firstProgram = processedPrograms[0];
            setSelectedProgram(firstProgram.id.toString());

            if (firstProgram.batches.length > 0) {
              setSelectedBatch(firstProgram.batches[0].id.toString());
            }

            if (firstProgram.semesters.length > 0) {
              setSelectedSemester(firstProgram.semesters[0].id.toString());
            }
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching allocated programs:', error);
        setError('Failed to load programs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocatedPrograms();
  }, [isLoaded, profileLoading, getTeacherId, profile]);

  // Process allocations data to group by programs
  const processAllocationsData = (allocations) => {
    const programsMap = new Map();

    allocations.forEach(allocation => {
      const programId = allocation.program_id;

      if (!programsMap.has(programId)) {
        programsMap.set(programId, {
          id: programId,
          name: allocation.program.program_name,
          code: allocation.program.program_code,
          academicYearId: allocation.academic_year_id, // Add academic year ID
          batches: new Map(),
          semesters: new Map()
        });
      }

      const program = programsMap.get(programId);

      // Add batch if not exists
      if (allocation.batch) {
        program.batches.set(allocation.batch.batch_id, {
          id: allocation.batch.batch_id,
          name: allocation.batch.batch_name,
          code: allocation.batch.batch_code
        });
      }

      // Add semester if not exists
      if (allocation.semester) {
        program.semesters.set(allocation.semester_id, {
          id: allocation.semester_id,
          number: allocation.semester.semester_number,
          name: allocation.semester.name,
          academic_year_name: allocation.academic_year?.name
        });
      }
    });

    // Convert Maps to Arrays
    return Array.from(programsMap.values()).map(program => ({
      ...program,
      batches: Array.from(program.batches.values()),
      semesters: Array.from(program.semesters.values())
    }));
  };

  // Process subject types API response
  const processSubjectTypesData = (apiData) => {
    const processedTypes = {};

    if (apiData.type_buttons) {
      apiData.type_buttons.forEach(typeButton => {
        const typeName = typeButton.type_name.toLowerCase();
        processedTypes[typeName] = {
          type_info: typeButton,
          verticals: typeButton.sub_tabs?.verticals || [],
          specializations: typeButton.sub_tabs?.specializations || []
        };
      });
    }

    return processedTypes;
  };

  // Fetch subject types when program and semester are selected
  useEffect(() => {
    const fetchSubjectTypes = async () => {
      if (selectedProgram && selectedSemester) {
        setLoading(true);
        setError(null);
        try {
          // Get academic year ID from selected program data
          const selectedProgramData = allocatedPrograms.find(p => p.id.toString() === selectedProgram);
          const academicYearId = selectedProgramData?.academicYearId;

          if (!academicYearId) {
            throw new Error('Academic year ID not found for selected program');
          }

          const response = await ContentApiService.getSubjectTypes(academicYearId, selectedSemester);

          if (response.success && response.data) {
            // Process the new API response structure
            const processedTypes = processSubjectTypesData(response.data);
            setSubjectTypes(processedTypes);

            // Auto-select first available paper type
            if (response.data.type_buttons && response.data.type_buttons.length > 0) {
              setSelectedPaperType(response.data.type_buttons[0].type_name);
            }
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error fetching subject types:', error);
          setError('Failed to load subject types. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setSubjectTypes({});
      }
    };

    fetchSubjectTypes();
  }, [selectedProgram, selectedSemester, allocatedPrograms]);

  // Auto-select first sub-tab when sub-tabs are available
  useEffect(() => {
    if (availableSubTabs.length > 0) {
      setSelectedSubTab(availableSubTabs[0]);
    } else {
      setSelectedSubTab(null);
    }
    setSelectedSubject(null);
    setModulesData([]);
  }, [availableSubTabs.length, selectedPaperType]);

  const selectedProgramData = allocatedPrograms.find(p => p.id.toString() === selectedProgram);

  // Save filter values to localStorage whenever they change
  useEffect(() => {
    const filters = {
      paperType: selectedPaperType,
      program: selectedProgram,
      batch: selectedBatch,
      semester: selectedSemester
    };
    localStorage.setItem('contentDashboardFilters', JSON.stringify(filters));
  }, [selectedPaperType, selectedProgram, selectedBatch, selectedSemester]);

  const handleSubjectClick = async (subject) => {
    console.log('Subject clicked:', subject);

    if (!subject || !subject.subject_id) {
      console.error('Invalid subject data');
      return;
    }

    // Set selected subject immediately to show loading/selection state
    setSelectedSubject(subject);
    setModulesData([]); // Clear previous data while fetching

    try {
      // Don't set global loading as it hides the subject list, user might want to see the list while fetching content details
      // Or we can use a separate loading state for modules
      const response = await ContentApiService.getModulesAndUnits(subject.subject_id);

      if (response.success && response.data) {
        // The API returns the subject object with 'modules' array inside it
        // based on the user provided example: { subject_id, subject_name, modules: [...] }
        const subjectData = response.data;
        setModulesData(subjectData.modules || []);
      } else {
        setModulesData([]);
      }
    } catch (error) {
      console.error('Error fetching modules and units:', error);
      // Optional: Show a toast notification instead of alert
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left side - Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter</span>
          <ChevronDown
            className={`w-4 h-4 text-blue-600 transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {/* Right side - Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">


          <Link to="/teacher/content/add-content" className="flex items-center justify-center p-3 rounded-lg transition-all">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomSelect
            label="Program"
            value={selectedProgramData?.name || ''}
            onChange={(e) => {
              const program = allocatedPrograms.find(p => p.name === e.target.value);
              setSelectedProgram(program ? program.id.toString() : '');
              setSelectedBatch('');
              setSelectedSemester('');
            }}
            options={allocatedPrograms.map(p => ({ value: p.name, label: p.name }))}
            placeholder="Select Program"
            disabled={loading}
          />
          <CustomSelect
            label="Academic Year / Semester"
            value={(() => {
              const semester = selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester);
              return semester ? (semester.academic_year_name ? `${semester.academic_year_name} - ${semester.name}` : semester.name) : '';
            })()}
            onChange={(e) => {
              const semester = selectedProgramData?.semesters?.find(s => s.name === e.target.value);
              setSelectedSemester(semester ? semester.id.toString() : '');
            }}
            options={selectedProgramData?.semesters?.map(s => ({
              value: s.name,
              label: s.academic_year_name ? `${s.academic_year_name} - ${s.name}` : s.name
            })) || []}
            placeholder="Select Academic Year / Semester"
            disabled={!selectedProgram || loading}
          />
          <CustomSelect
            label="Batch"
            value={selectedProgramData?.batches?.find(b => b.id.toString() === selectedBatch)?.name || ''}
            onChange={(e) => {
              const batch = selectedProgramData?.batches?.find(b => b.name === e.target.value);
              setSelectedBatch(batch ? batch.id.toString() : '');
            }}
            options={selectedProgramData?.batches?.map(b => ({ value: b.name, label: b.name })) || []}
            placeholder="Select Batch"
            disabled={!selectedProgram || loading}
          />
        </div>
      )}

      {/* Paper Type Buttons */}
      <div className="flex gap-3 flex-wrap">
        {paperTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedPaperType(type.label)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${selectedPaperType === type.label
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200/50'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs Row */}
      {availableSubTabs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSubTabs.map((subTab, index) => (
            <button
              key={`${subTab.type || 'tab'}-${subTab.id ?? 'general'}-${index}`}
              onClick={() => setSelectedSubTab(subTab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSubTab?.id === subTab.id && selectedSubTab?.type === subTab.type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              {subTab.name}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : selectedProgram && selectedSemester && subjectTypes[selectedPaperType.toLowerCase()] ? (
          <>
            <SubjectsList
              subjectTypes={subjectTypes}
              selectedPaperType={selectedPaperType}
              academicYearId={selectedProgramData?.academicYearId}
              semesterId={selectedSemester}
              selectedProgramData={selectedProgramData}
              filteredSubjects={filteredSubjects}
              setAllSubjects={setAllSubjects}
              onSubjectClick={handleSubjectClick}
              selectedSubjectId={selectedSubject?.subject_id}
            />
            {selectedSubject && (
              <ModulesUnitsList
                modules={modulesData}
                colorCode={selectedSubject.color_code || "#3b82f6"}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Dashboard</h3>
            <p className="text-gray-600 mb-4">
              {selectedProgram && selectedSemester && !subjectTypes[selectedPaperType.toLowerCase()]
                ? 'Content not available'
                : 'Select Program and Semester to view available content.'}
            </p>
            {selectedProgram && selectedSemester && subjectTypes[selectedPaperType.toLowerCase()] && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Selected: {selectedProgramData?.name}</p>
                <p>Semester: {selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester)?.name}</p>
                {selectedBatch && <p>Batch: {selectedProgramData?.batches?.find(b => b.id.toString() === selectedBatch)?.name}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
}