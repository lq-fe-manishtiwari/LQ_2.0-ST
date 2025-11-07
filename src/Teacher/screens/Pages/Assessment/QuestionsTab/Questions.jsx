'use client';
import React, { useState, useRef, useEffect } from 'react';
import BulkUploadAssessmentModal from '../Components/BulkUploadAssessmentModal';
import { Plus, Filter, ChevronDown, X, Upload, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    filterOpen: false,
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
  });

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const programOptions = ['MBA Grade Testing', 'BCA', 'MCA'];
  const classOptions = ['Class A', 'Class B', 'Class C'];
  const divisionOptions = ['Div 1', 'Div 2', 'Div 3'];
  const moduleOptions = ['Module 1', 'Module 2', 'Module 3'];

  // Handle Program Selection (Multi)
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters((prev) => ({ ...prev, program: [...prev.program, value] }));
    }
  };

  const removeProgram = (prog) => {
    setFilters((prev) => ({
      ...prev,
      program: prev.program.filter((p) => p !== prog),
    }));
  };

  // 🔹 Custom Select Component
  const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
  }) => {
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border ${
              disabled
                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white border-gray-300 cursor-pointer hover:border-[rgb(33,98,193)]'
            } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
              {options.map((option) => (
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

  // 🔹 Multi Select Program Component
  const MultiSelectProgram = ({
    label,
    selectedPrograms,
    programOptions,
    onProgramChange,
    onProgramRemove,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const availableOptions = programOptions.filter(
      (p) => !selectedPrograms.includes(p)
    );

    const handleSelect = (program) => {
      onProgramChange({ target: { value: program } });
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <div
            className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-[rgb(33,98,193)] transition-all duration-150"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedPrograms.length > 0 ? (
              selectedPrograms.map((prog) => (
                <span
                  key={prog}
                  className="inline-flex items-center gap-1 bg-[rgb(33,98,193,0.1)] text-[rgb(33,98,193)] px-2 py-1 rounded-full text-xs font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {prog}
                  <button
                    onClick={() => onProgramRemove(prog)}
                    className="hover:bg-blue-100 rounded-full p-0.5 ml-0.5 transition-colors"
                    title="Remove Program"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm ml-1">
                Select Program(s)
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {availableOptions.length > 0 ? (
                availableOptions.map((prog) => (
                  <div
                    key={prog}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(prog)}
                  >
                    {prog}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  All programs selected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {/* Left: Filter Button */}
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))
          }
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-[rgb(33,98,193)]" />
          <span className="text-[rgb(33,98,193)] font-medium">Filter</span>
          <ChevronDown
            className={`w-4 h-4 text-[rgb(33,98,193)] transition-transform ${
              filters.filterOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Right: Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/teacher/assessments/add-question')}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>

          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* 🔹 Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Program */}
            <MultiSelectProgram
              label="Program"
              selectedPrograms={filters.program}
              programOptions={programOptions}
              onProgramChange={handleProgramChange}
              onProgramRemove={removeProgram}
            />

            {/* 2. Class */}
            <CustomSelect
              label="Class"
              value={filters.classDataId[0] || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  classDataId: e.target.value ? [e.target.value] : [],
                  gradeDivisionId: [],
                }))
              }
              options={classOptions}
              placeholder="Select Classes"
              disabled={filters.program.length === 0}
            />

            {/* 3. Paper */}
            <CustomSelect
              label="Paper"
              value={filters.gradeDivisionId[0] || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  gradeDivisionId: e.target.value ? [e.target.value] : [],
                }))
              }
              options={divisionOptions}
              placeholder="Select Paper"
              disabled={!filters.classDataId.length}
            />

            {/* 4. Module */}
            <CustomSelect
              label="Module"
              value={
                filters.activeInactiveStatus === 'all'
                  ? ''
                  : filters.activeInactiveStatus
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  activeInactiveStatus: e.target.value || 'all',
                }))
              }
              options={moduleOptions}
              placeholder="All Module"
            />

            {/* 5. Get Questions Button */}
            <div className="flex items-end">
              <button className="bg-[rgb(33,98,193)] hover:bg-[rgb(28,78,153)] text-white font-semibold px-4 py-3 rounded-lg text-sm transition w-full min-h-[44px]">
                Get Q's
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Questions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your assessment questions</p>
        </div>

        {/* Questions Grid */}
        <div className="p-6">
          <div className="grid gap-4">
            {/* Question Card 1 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    Q1
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Multiple Choice</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Objective</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-icon btn-edit"><Edit className="w-4 h-4" /></button>
                  <button className="btn-icon btn-delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">What is the capital of France?</h3>
              <div className="text-sm text-gray-600 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>A) London</div>
                  <div>B) Berlin</div>
                  <div className="text-green-600 font-medium">C) Paris ✓</div>
                  <div>D) Madrid</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Program: BCA</span>
                  <span>Class: 1st Year</span>
                  <span>Paper: General Knowledge</span>
                </div>
                <span>Created: 2 days ago</span>
              </div>
            </div>

            {/* Question Card 2 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    Q2
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">True/False</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Objective</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-icon btn-edit"><Edit className="w-4 h-4" /></button>
                  <button className="btn-icon btn-delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">JavaScript is a compiled programming language.</h3>
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex gap-4">
                  <div>A) True</div>
                  <div className="text-green-600 font-medium">B) False ✓</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Program: MCA</span>
                  <span>Class: 2nd Year</span>
                  <span>Paper: Web Development</span>
                </div>
                <span>Created: 1 week ago</span>
              </div>
            </div>

            {/* Question Card 3 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    Q3
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">Short Answer</span>
                    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Subjective</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-icon btn-edit"><Edit className="w-4 h-4" /></button>
                  <button className="btn-icon btn-delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Explain the difference between let, const, and var in JavaScript.</h3>
              <div className="text-sm text-gray-600 mb-3">
                <p className="italic">Expected answer: Explanation of scope, hoisting, and reassignment differences...</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Program: BCA</span>
                  <span>Class: 3rd Year</span>
                  <span>Paper: Advanced JavaScript</span>
                </div>
                <span>Created: 3 days ago</span>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to 3 of 25 questions
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadAssessmentModal onClose={() => setShowBulkUpload(false)} />
      )}
    </div>
  );
};

export default Questions;
