import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import ContentApiService from '../services/contentApi';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';

export default function ContentDashboard() {
  const { userProfile } = useUserProfile();
  const [selectedPaperType, setSelectedPaperType] = useState('Vertical');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('Vertical 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default

  // State for API data
  const [allocatedPrograms, setAllocatedPrograms] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Get vertical options from API response
  const getVerticalOptions = () => {
    if (subjectTypes.vertical?.verticals) {
      return subjectTypes.vertical.verticals.map(vertical => ({
        id: vertical.id,
        name: vertical.name,
        code: vertical.code,
        count: vertical.subject_count
      }));
    }
    return [];
  };

  const paperTypes = getPaperTypes();
  const verticalOptions = getVerticalOptions();

  // Fetch allocated programs when user profile is available
  useEffect(() => {
    const fetchAllocatedPrograms = async () => {
      if (!userProfile?.teacher_id) {
        console.log('Teacher ID not available yet, waiting for user profile...');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const teacherId = userProfile.teacher_id;
        
        const response = await ContentApiService.getAllocatedPrograms(teacherId);
        
        // Process the API response to group by programs
        if (response.success && response.data?.allocations) {
          const processedPrograms = processAllocationsData(response.data.allocations);
          setAllocatedPrograms(processedPrograms);
          
          // Auto-select first program, batch, and semester
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
  }, [userProfile?.teacher_id]);

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
          name: allocation.semester.name
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
          const response = await ContentApiService.getSubjectTypes(selectedProgram, selectedSemester);
          
          if (response.success && response.data) {
            // Process the new API response structure
            const processedTypes = processSubjectTypesData(response.data);
            setSubjectTypes(processedTypes);
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
  }, [selectedProgram, selectedSemester]);

  const selectedProgramData = allocatedPrograms.find(p => p.id.toString() === selectedProgram);

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

        {/* Center - Search bar */}
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

        {/* Right side - Paper type buttons */}
        <div className="flex gap-2">
          {paperTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedPaperType(type.label)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                selectedPaperType === type.label
                  ? type.color
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
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

      {/* Third Row - Vertical filter buttons */}
      {selectedPaperType === 'Vertical' && verticalOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {verticalOptions.map((vertical) => (
            <button
              key={vertical.id}
              onClick={() => setSelectedVertical(vertical.name)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedVertical === vertical.name
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {vertical.name} 
            </button>
          ))}
        </div>
      )}
        </>
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
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedPaperType} Subjects - {selectedProgramData?.name} (Semester {selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester)?.name})
            </h3>
            
            {/* Show type information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">{subjectTypes[selectedPaperType.toLowerCase()].type_info.type_name}</h4>
                  <p className="text-sm text-blue-700 mt-1">{subjectTypes[selectedPaperType.toLowerCase()].type_info.type_description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">{subjectTypes[selectedPaperType.toLowerCase()].type_info.subject_count}</span>
                  <p className="text-xs text-blue-600">Total Subjects</p>
                </div>
              </div>
            </div>

            {/* Show vertical sub-type buttons */}
            {subjectTypes[selectedPaperType.toLowerCase()]?.verticals?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Select Vertical Type:</h4>
                <div className="flex flex-wrap gap-3">
                  {subjectTypes[selectedPaperType.toLowerCase()].verticals.map((vertical) => (
                    <button
                      key={vertical.id}
                      onClick={() => {
                        // TODO: Make API call to get subjects for this vertical
                        console.log('Fetch subjects for vertical:', vertical.id);
                      }}
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900 group-hover:text-blue-700">{vertical.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{vertical.subject_count} subjects</div>
                        <div className="text-xs text-gray-400 mt-1">{vertical.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show specialization sub-type buttons */}
            {subjectTypes[selectedPaperType.toLowerCase()]?.specializations?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Select Specialization:</h4>
                <div className="flex flex-wrap gap-3">
                  {subjectTypes[selectedPaperType.toLowerCase()].specializations.map((specialization) => (
                    <button
                      key={specialization.id}
                      onClick={() => {
                        // TODO: Make API call to get subjects for this specialization
                        console.log('Fetch subjects for specialization:', specialization.id);
                      }}
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900 group-hover:text-purple-700">{specialization.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{specialization.subject_count} subjects</div>
                        <div className="text-xs text-gray-400 mt-1">{specialization.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If no sub-types, show message for direct subjects */}
            {(!subjectTypes[selectedPaperType.toLowerCase()]?.verticals?.length &&
              !subjectTypes[selectedPaperType.toLowerCase()]?.specializations?.length) && (
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Select Program and Semester to view available content.
            </p>
            {selectedProgram && selectedSemester && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Selected: {selectedProgramData?.name}</p>
                <p>Semester: {selectedProgramData?.semesters?.find(s => s.id.toString() === selectedSemester)?.name}</p>
                {selectedBatch && <p>Batch: {selectedProgramData?.batches?.find(b => b.id.toString() === selectedBatch)?.name}</p>}
                <p>Paper Type: {selectedPaperType}</p>
                {selectedPaperType === 'Vertical' && <p>Vertical: {selectedVertical}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}