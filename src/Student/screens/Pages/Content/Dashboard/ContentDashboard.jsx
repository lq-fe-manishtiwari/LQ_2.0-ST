import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown } from 'lucide-react';
import ContentService from '../Service/Content.service';
import { StudentService } from '../../Profile/Student.Service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import SubjectsList from './components/ModulesUnitsList';
import ModulesUnitsList from './components/ModulesUnitsList';

export default function ContentDashboard() {
  const { userProfile } = useUserProfile();
  const [selectedPaperType, setSelectedPaperType] = useState('Vertical');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
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
    const fetchAllocatedPrograms = async () => {
      if (!userProfile?.student_id) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await StudentService.getStudentHistory(userProfile.student_id);
        
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
  }, [userProfile?.student_id]);

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
  }, [availableSubTabs.length, selectedPaperType]);

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

  return (
    <div className="p-4 space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">Filter</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {filterOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <div className="text-sm text-gray-600 mb-2">Filter Options</div>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">All Content</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">Recent</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">Favorites</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 w-full">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add Content Button */}
          <Link
            to="/student/content/add-content"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            Add Content
          </Link>
        </div>

        {/* Right side - Paper type buttons */}
        <div className="flex gap-2">
          {paperTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedPaperType(type.label)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border ${selectedPaperType === type.label ? type.color : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Rows - Show/Hide based on showFilters state */}
      {showFilters && (
        <>
          {/* Second Row - Program, Batch, Semester dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Program Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setSelectedBatch('');
                  setSelectedSemester('');
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">select program</option>
                {allocatedPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={!selectedProgram || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">select batch</option>
                {selectedProgramData?.batches?.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedProgram || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">select semester</option>
                {selectedProgramData?.semesters?.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Sub-tabs Row */}
      {availableSubTabs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSubTabs.map((subTab, index) => (
            <button
              key={`${subTab.type}-${subTab.id}-${index}`}
              onClick={() => setSelectedSubTab(subTab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSubTab?.id === subTab.id && selectedSubTab?.type === subTab.type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {subTab.name}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
