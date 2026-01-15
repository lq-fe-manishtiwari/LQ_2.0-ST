import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, Filter } from 'lucide-react';

// Custom Select Component
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
          <span className={`${value ? 'text-gray-900' : 'text-gray-400'} truncate`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FilterSection Component
 * Displays cascading filter dropdowns for Program, Batch, Academic Year, and Semester
 * Program → Batch → Academic Year & Semester (from batch data)
 */
const FilterSection = ({
    filters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    programs = [],
    batches = [],
    academicYears = [],
    semesters = [],
}) => {
    const [filterOpen, setFilterOpen] = useState(false);
    const programOptions = programs.map(p => p.program_name);
    const batchOptions = batches.map(b => b.batch_name || b.batch_year || `${b.start_year}-${b.end_year}`);
    const academicYearOptions = academicYears.map(y => y.name);
    const semesterOptions = semesters.map(s => s.name);

    const getProgramValue = () => {
        const program = programs.find(p => p.program_id === filters.programId);
        return program ? program.program_name : '';
    };

    const getBatchValue = () => {
        const batch = batches.find(b => b.batch_id === filters.batchId);
        return batch ? (batch.batch_name || batch.batch_year || `${batch.start_year}-${batch.end_year}`) : '';
    };

    const getAcademicYearValue = () => {
        const year = academicYears.find(y => y.id === filters.academicYearId);
        return year ? year.name : '';
    };

    const getSemesterValue = () => {
        const semester = semesters.find(s => s.id === filters.semesterId);
        return semester ? semester.name : '';
    };

    const handleProgramChange = (e) => {
        const programName = e.target.value;
        const program = programs.find(p => p.program_name === programName);
        onFilterChange("programId", program ? program.program_id : '');
    };

    const handleBatchChange = (e) => {
        const batchName = e.target.value;
        const batch = batches.find(b => (b.batch_name || b.batch_year || `${b.start_year}-${b.end_year}`) === batchName);
        onFilterChange("batchId", batch ? batch.batch_id : '');
    };

    const handleAcademicYearChange = (e) => {
        const yearName = e.target.value;
        const year = academicYears.find(y => y.name === yearName);
        onFilterChange("academicYearId", year ? year.id : '');
    };

    const handleSemesterChange = (e) => {
        const semesterName = e.target.value;
        const semester = semesters.find(s => s.name === semesterName);
        onFilterChange("semesterId", semester ? semester.id : '');
    };

    return (
        <>
        {/* Filter Button */}
        <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all mb-4"
        >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
                className={`w-4 h-4 text-blue-600 transition-transform ${filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
        </button>

        {/* Filter Panel */}
        {filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            {/* Filter Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Program Filter */}
                <CustomSelect
                    label="Program"
                    value={getProgramValue()}
                    onChange={handleProgramChange}
                    options={programOptions}
                    placeholder="Select Program"
                />

                {/* Batch Filter */}
                <CustomSelect
                    label="Batch"
                    value={getBatchValue()}
                    onChange={handleBatchChange}
                    options={batchOptions}
                    placeholder="Select Batch"
                    disabled={!filters.programId}
                />

                {/* Academic Year Filter */}
                <CustomSelect
                    label="Academic Year"
                    value={getAcademicYearValue()}
                    onChange={handleAcademicYearChange}
                    options={academicYearOptions}
                    placeholder="Select Academic Year"
                    disabled={!filters.batchId}
                />

                {/* Semester Filter */}
                <CustomSelect
                    label="Semester"
                    value={getSemesterValue()}
                    onChange={handleSemesterChange}
                    options={semesterOptions}
                    placeholder="Select Semester"
                    disabled={!filters.batchId}
                />
            </div>

            {/* Clear Filters Link - Only show if any filter is applied */}
            {(filters.programId || filters.batchId || filters.academicYearId || filters.semesterId) && (
                <div className="flex justify-end mt-2">
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
        )}
        </>
    );
};

FilterSection.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func.isRequired,
    programs: PropTypes.array,
    batches: PropTypes.array,
    academicYears: PropTypes.array,
    semesters: PropTypes.array,
};

export default FilterSection;
