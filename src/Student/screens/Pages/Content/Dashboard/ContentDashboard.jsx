import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import ContentService from '../Service/Content.service';
import { StudentService } from '../../Profile/Student.Service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import SubjectsList from './components/SubjectsList';
import ModulesUnitsList from './components/ModulesUnitsList';

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
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
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
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  console.log('User profile in ContentDashboard:', profile);
  const [selectedPaperType, setSelectedPaperType] = useState('Vertical');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const dropdownRef = useRef(null);
  const [allSubjects, setAllSubjects] = useState([]);


  // State for API data
  const [allocatedPrograms, setAllocatedPrograms] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modules/units display
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modulesData, setModulesData] = useState([]);

  // Dynamic paper types based on API response
  const getPaperTypes = () => {
    const types = [];
    Object.keys(subjectTypes).forEach(typeName => {
      const typeInfo = subjectTypes[typeName].type_info;
      let color = 'bg-primary-600 text-gray-50 border-gray-200';


      types.push({
        id: typeName,
        label: typeInfo.type_name,
        color: color
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
      return currentType.verticals?.map(vertical => ({
        id: vertical.id,
        name: vertical.name,
        code: vertical.code,
        type: 'vertical'
      })) || [];
    } else {
      return currentType.specializations?.map(spec => ({
        id: spec.id,
        name: spec.name,
        code: spec.code,
        type: 'specialization'
      })) || [];
    }
  };

  const availableSubTabs = getSubTabs();

  // Fetch allocated programs when user profile is available
  useEffect(() => {
    console.log('User profile changed:', profile);
    const fetchAllocatedPrograms = async () => {
      if (!profile?.student_id) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await StudentService.getStudentHistory(profile.student_id);
        console.log('Student history response:', response);

        if (Array.isArray(response)) {
          const processedPrograms = processAllocationsData(response);
          setAllocatedPrograms(processedPrograms);

          if (processedPrograms.length > 0) {
            const firstProgram = processedPrograms[0];
            setSelectedProgram(firstProgram.id.toString());

            if (firstProgram.batches.length > 0) {
              setSelectedBatch(firstProgram.batches[0].id.toString());
            }

            if (firstProgram.semesters.length > 0) {
              setSelectedSemester(firstProgram.semesters[0].id.toString());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to load programs.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocatedPrograms();
  }, [profile?.student_id]);

  // Process student history data
  const processAllocationsData = (students) => {
    const programsMap = new Map();

    students.forEach(student => {
      const program = student.academic_year?.program;
      const batch = student.academic_year?.batch;
      const semester = student.semester;

      if (!program) return;

      const programId = program.program_id;

      if (!programsMap.has(programId)) {
        programsMap.set(programId, {
          id: programId,
          name: program.program_name,
          code: program.program_code,
          academicYearId: student.academic_year_id,
          batches: new Map(),
          semesters: new Map()
        });
      }

      const programData = programsMap.get(programId);

      if (batch) {
        programData.batches.set(batch.batch_id, {
          id: batch.batch_id,
          name: batch.batch_name,
          code: batch.batch_code
        });
      }

      if (semester) {
        programData.semesters.set(student.semester_id, {
          id: student.semester_id,
          number: semester.semester_number,
          name: semester.name
        });
      }
    });

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

          const response = await ContentService.getSubjectTypes(academicYearId, selectedSemester);

          if (response.success && response.data) {
            const processedTypes = processSubjectTypesData(response.data);
            setSubjectTypes(processedTypes);

            if (response.data.type_buttons && response.data.type_buttons.length > 0) {
              setSelectedPaperType(response.data.type_buttons[0].type_name);
            }
          } else {
            throw new Error(response.error || 'API endpoint not found. Please verify the endpoint URL.');
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

  // Auto-select first sub-tab when available
  useEffect(() => {
    if (availableSubTabs.length > 0) {
      setSelectedSubTab(availableSubTabs[0]);
    } else {
      setSelectedSubTab(null);
    }
    setSelectedSubject(null);
    setModulesData([]);
    setAllSubjects([]);
  }, [availableSubTabs.length, selectedPaperType]);

  // Clear selected subject when sub-tab changes
  useEffect(() => {
    setSelectedSubject(null);
    setModulesData([]);
    setAllSubjects([]);
  }, [selectedSubTab?.id]);

  const selectedProgramData = allocatedPrograms.find(p => p.id.toString() === selectedProgram);

  const handleSubjectClick = async (subject) => {
    console.log('Subject clicked:', subject);
    if (!subject || !subject.subject_id) {
      console.error('Invalid subject data');
      return;
    }
    setSelectedSubject(subject);
    setModulesData([]);

    try {
      const response = await ContentService.getModulesAndUnits(subject.subject_id);
      if (response.success && response.data) {
        setModulesData(response.data.modules || []);
      } else {
        setModulesData([]);
      }
    } catch (error) {
      console.error('Error fetching modules and units:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left side - Paper type buttons */}
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

        {/* Right side - Filter and Add Project */}
        <div className="flex gap-3 w-full lg:w-auto">
          <button
            onClick={() => navigate('student-project', {
              state: {
                programId: selectedProgram,
                semesterId: selectedSemester,
                academicYearId: selectedProgramData?.academicYearId
              }
            })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-transparent px-4 py-3 rounded-xl shadow-sm transition-all justify-center whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">My Projects</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all w-full justify-center whitespace-nowrap"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomSelect
            label="Program"
            value={selectedProgramData?.name || ''}
            onChange={() => { }}
            options={[]}
            placeholder="select program"
            disabled={true}
          />
          <CustomSelect
            label="Batch"
            value={selectedProgramData?.batches?.find(b => b.id.toString() === selectedBatch)?.name || ''}
            onChange={() => { }}
            options={[]}
            placeholder="select batch"
            disabled={true}
          />
          <CustomSelect
            label="Semester"
            value={selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester)?.name || ''}
            onChange={(e) => {
              const semester = selectedProgramData?.semesters?.find(s => s.name === e.target.value);
              setSelectedSemester(semester ? semester.id.toString() : '');
            }}
            options={selectedProgramData?.semesters?.map(s => ({ value: s.name, label: s.name })) || []}
            placeholder="select semester"
            disabled={loading}
          />
        </div>
      )}

      {/* Sub-tabs Row */}
      {availableSubTabs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSubTabs.map((subTab, index) => (
            <button
              key={`${subTab.type}-${subTab.id}-${index}`}
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
              filteredSubjects={allSubjects}
              setAllSubjects={setAllSubjects}
              onSubjectClick={handleSubjectClick}
              selectedSubjectId={selectedSubject?.subject_id}
              selectedSubTab={selectedSubTab}
            />
            {selectedSubject && allSubjects.length > 0 && (
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
            {selectedProgram && selectedSemester && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Selected: {selectedProgramData?.name}</p>
                <p>Semester: {selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester)?.name}</p>
                {selectedBatch && <p>Batch: {selectedProgramData?.batches?.find(b => b.id.toString() === selectedBatch)?.name}</p>}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
