import React, { useState, useEffect, useRef } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
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
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`w-full px-3 py-2 border ${disabled || loading ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[40px] flex items-center justify-between transition-all duration-150`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'} truncate`}>
          {loading ? "Loading..." : (value ? options.find(o => o.value == value)?.name || placeholder : placeholder)}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map(option => (
            <div
              key={option.value}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors truncate"
              onClick={() => handleSelect(option.value)}
              title={option.name}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main AttendanceFilters Component
const AttendanceFilters = ({
  filters,
  onFilterChange,
  showFilters = true,
  onToggleFilters,
  onResetFilters,
  onApplyFilters,
  allocations = [],
  loadingAllocations = false,
  timeSlots = [],
  loadingTimeSlots = false,
  showActiveFilters = true,
  compact = false,
  disabled = false
}) => {
  // Helper function to get unique options
  const getUniqueOptions = (filterFn, mapFn) => {
    const map = new Map();
    allocations.filter(filterFn).forEach(item => {
      const { id, name } = mapFn(item);
      if (id) map.set(id, name);
    });
    return Array.from(map.entries()).map(([value, name]) => ({ value: value.toString(), name }));
  };

  // Dynamic filter options from allocations
  const programOptions = getUniqueOptions(
    () => true,
    (item) => ({ id: item.program?.program_id, name: item.program?.program_name })
  );

  const batchOptions = getUniqueOptions(
    (item) => !filters.program || item.program?.program_id == filters.program,
    (item) => ({ id: item.batch?.batch_id, name: item.batch?.batch_name })
  );

  const academicYearOptions = getUniqueOptions(
    (item) => (!filters.program || item.program?.program_id == filters.program) &&
      (!filters.batch || item.batch?.batch_id == filters.batch),
    (item) => ({ id: item.academic_year_id, name: item.academic_year?.name })
  );

  const semesterOptions = getUniqueOptions(
    (item) => (!filters.program || item.program?.program_id == filters.program) &&
      (!filters.batch || item.batch?.batch_id == filters.batch) &&
      (!filters.academicYear || item.academic_year_id == filters.academicYear),
    (item) => ({ id: item.semester_id, name: item.semester?.name })
  );

  const divisionOptions = getUniqueOptions(
    (item) => (!filters.program || item.program?.program_id == filters.program) &&
      (!filters.batch || item.batch?.batch_id == filters.batch) &&
      (!filters.academicYear || item.academic_year_id == filters.academicYear) &&
      (!filters.semester || item.semester_id == filters.semester),
    (item) => ({ id: item.division_id, name: item.division?.division_name })
  );

  const paperOptions = () => {
    const map = new Map();
    allocations.filter(item =>
      (!filters.program || item.program?.program_id == filters.program) &&
      (!filters.batch || item.batch?.batch_id == filters.batch) &&
      (!filters.academicYear || item.academic_year_id == filters.academicYear) &&
      (!filters.semester || item.semester_id == filters.semester) &&
      (!filters.division || item.division_id == filters.division)
    ).forEach(alloc => {
      if (alloc.subjects && Array.isArray(alloc.subjects)) {
        alloc.subjects.forEach(sub => {
          map.set(sub.subject_id.toString(), sub.name);
        });
      }
    });
    return Array.from(map.entries()).map(([value, name]) => ({ value, name }));
  };

  const handleFilterChange = (field, value) => {
    if (onFilterChange) {
      const newFilters = { ...filters, [field]: value };

      // Reset subsequent filters
      if (field === 'program') {
        newFilters.batch = ''; newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = ''; newFilters.paper = '';
      } else if (field === 'batch') {
        newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = ''; newFilters.paper = '';
      } else if (field === 'academicYear') {
        newFilters.semester = ''; newFilters.division = ''; newFilters.paper = '';
      } else if (field === 'semester') {
        newFilters.division = ''; newFilters.paper = '';
      } else if (field === 'division') {
        newFilters.paper = ''; newFilters.timeSlot = '';
      } else if (field === 'paper') {
        newFilters.timeSlot = '';
      }

      onFilterChange(newFilters);
    }
  };

  const getFilterLabel = (filterType, value) => {
    if (!value) return '';

    const optionsMap = {
      program: programOptions,
      batch: batchOptions,
      academicYear: academicYearOptions,
      semester: semesterOptions,
      division: divisionOptions,
      paper: paperOptions()
    };

    const option = optionsMap[filterType]?.find(o => o.value === value);
    return option?.name || value;
  };

  // For compact mode - show only toggle button
  if (compact && !showFilters) {
    return (
      <div className="mb-4">
        <button
          onClick={onToggleFilters}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          disabled={disabled}
        >
          <Filter size={16} />
          Filters
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Header with toggle button */}
      {onToggleFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Academic Filters</h3>
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            disabled={disabled}
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Filters Grid */}
      {showFilters && (
        <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200`}>
          <CustomSelect
            label="Program"
            value={filters.program}
            onChange={(e) => handleFilterChange('program', e.target.value)}
            options={programOptions}
            placeholder="Select Program"
            disabled={disabled || loadingAllocations}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Batch"
            value={filters.batch}
            onChange={(e) => handleFilterChange('batch', e.target.value)}
            options={batchOptions}
            placeholder="Select Batch"
            disabled={disabled || loadingAllocations || !filters.program}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Academic Year"
            value={filters.academicYear}
            onChange={(e) => handleFilterChange('academicYear', e.target.value)}
            options={academicYearOptions}
            placeholder="Select Academic Year"
            disabled={disabled || loadingAllocations || !filters.batch}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Semester"
            value={filters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            options={semesterOptions}
            placeholder="Select Semester"
            disabled={disabled || loadingAllocations || !filters.academicYear}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Division"
            value={filters.division}
            onChange={(e) => handleFilterChange('division', e.target.value)}
            options={divisionOptions}
            placeholder="Select Division"
            disabled={disabled || loadingAllocations || !filters.semester}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Paper"
            value={filters.paper}
            onChange={(e) => handleFilterChange('paper', e.target.value)}
            options={paperOptions()}
            placeholder="Select Paper"
            disabled={disabled || loadingAllocations || !filters.division}
            loading={loadingAllocations}
          />

          <CustomSelect
            label="Time Slot"
            value={filters.timeSlot}
            onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
            options={timeSlots.map(slot => ({
              value: slot.timetable_id?.toString() || slot.time_slot_id?.toString(),
              name: `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`
            }))}
            placeholder="Select Time Slot"
            disabled={disabled || !filters.paper || loadingTimeSlots}
            loading={loadingTimeSlots}
          />

          {/* Filter Actions */}
          <div className={`${compact ? 'md:col-span-2' : 'lg:col-span-3'} flex justify-end gap-3 pt-2`}>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled || loadingAllocations}
              >
                Reset Filters
              </button>
            )}
            {onApplyFilters && (
              <button
                onClick={onApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled || loadingAllocations}
              >
                Apply Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {showActiveFilters && (filters.program || filters.batch || filters.academicYear || filters.semester || filters.division || filters.paper || filters.timeSlot) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.program && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Program: {getFilterLabel('program', filters.program)}
              <button
                onClick={() => handleFilterChange('program', '')}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.batch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Batch: {getFilterLabel('batch', filters.batch)}
              <button
                onClick={() => handleFilterChange('batch', '')}
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.academicYear && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Academic Year: {getFilterLabel('academicYear', filters.academicYear)}
              <button
                onClick={() => handleFilterChange('academicYear', '')}
                className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.semester && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              Semester: {getFilterLabel('semester', filters.semester)}
              <button
                onClick={() => handleFilterChange('semester', '')}
                className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.division && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              Division: {getFilterLabel('division', filters.division)}
              <button
                onClick={() => handleFilterChange('division', '')}
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.paper && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
              Paper: {getFilterLabel('paper', filters.paper)}
              <button
                onClick={() => handleFilterChange('paper', '')}
                className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.timeSlot && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
              Time Slot: {timeSlots.find(s => (s.timetable_id?.toString() || s.time_slot_id?.toString()) === filters.timeSlot)?.start_time?.slice(0, 5) || filters.timeSlot}
              <button
                onClick={() => handleFilterChange('timeSlot', '')}
                className="text-teal-600 hover:text-teal-800 disabled:opacity-50"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Default props
AttendanceFilters.defaultProps = {
  filters: {
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    division: '',
    paper: '',
    timeSlot: ''
  },
  allocations: [],
  loadingAllocations: false,
  showFilters: true,
  showActiveFilters: true,
  compact: false,
  disabled: false
};

export default AttendanceFilters;