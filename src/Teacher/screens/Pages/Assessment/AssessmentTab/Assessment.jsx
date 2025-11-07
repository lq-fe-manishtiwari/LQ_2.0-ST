'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Clipboard,
  Video,
  ChevronDown,
  Filter,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Assessment = () => {
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filterOpen, setFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    program: [],
    selectedGrade: [],
    classDataId: [],
    gradeDivisionId: [],
    paper: '',
    module: '',
    unit: '',
  });

  const customBlue = 'rgb(33 98 193 / var(--tw-bg-opacity, 1))';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Mock filter options
  const programOptions = ['MCA-BTech-Graduation', 'BCA', 'BBA', 'M.Tech'];
  const classOptions = ['Class 7A', 'Class 7C', 'Class 8A', 'Class 8B', 'Class 9B', 'Class 10A'];
  const divisionOptions = ['A', 'B', 'C'];
  
  const grades = [
    { id: '1', name: 'Grade 1' },
    { id: '2', name: 'Grade 2' },
    { id: '3', name: 'Grade 3' },
  ];

  const classes = [
    { id: 'FY', name: 'FY' },
    { id: 'SY', name: 'SY' },
    { id: 'TY', name: 'TY' },
  ];

  const divisions = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
  ];

  const subjects = [
    { id: '1', name: 'Mathematics', color: '#3B82F6' },
    { id: '2', name: 'Science', color: '#10B981' },
    { id: '3', name: 'English', color: '#F59E0B' },
  ];

  const assessments = [
    {
      id: 101,
      title: 'Unit Test 1 - Algebra & Geometry',
      subject: { name: 'Mathematics', color: '#3B82F6' },
      startDate: 'Oct 15, 10:00 AM',
      endDate: 'Oct 15, 11:30 AM',
      attempted: 28,
      total: 35,
      status: 'Attempted',
      proctoring: true,
      offline: false,
      type: 'Online',
      percentage: 80,
    },
    {
      id: 102,
      title: 'Physics Practical Exam',
      subject: { name: 'Science', color: '#10B981' },
      startDate: 'Oct 18, 09:00 AM',
      endDate: 'Oct 18, 12:00 PM',
      attempted: 0,
      total: 35,
      status: 'Not Attempted',
      proctoring: false,
      offline: true,
      type: 'Offline',
      percentage: 0,
    },
    {
      id: 103,
      title: 'English Essay Writing',
      subject: { name: 'English', color: '#F59E0B' },
      startDate: 'Oct 20, 02:00 PM',
      endDate: 'Oct 20, 04:00 PM',
      attempted: 15,
      total: 35,
      status: 'In Progress',
      proctoring: false,
      offline: false,
      type: 'Online',
      percentage: 43,
    },
  ];

  // Handle Program Selection (Multi)
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters(prev => ({ ...prev, program: [...prev.program, value] }));
    }
  };

  const removeProgram = (prog) => {
    setFilters(prev => ({ ...prev, program: prev.program.filter(p => p !== prog) }));
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    if (nextYear < today.getFullYear() || (nextYear === today.getFullYear() && nextMonth <= today.getMonth())) {
      setCurrentMonth(nextMonth);
      setCurrentYear(nextYear);
    }
  };

  const isNextDisabled = () => {
    const today = new Date();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth());
  };

  // Custom Select Component from TeacherList
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
                    <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                        {value || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
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

  // Multi Select Program Component from TeacherList
  const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const availableOptions = programOptions.filter(p => !selectedPrograms.includes(p));

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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <div
                    className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedPrograms.length > 0 ? (
                        selectedPrograms.map(prog => (
                            <span
                                key={prog}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {prog}
                                <button
                                    onClick={() => onProgramRemove(prog)}
                                    className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
                                    title="Remove Program"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm ml-1">Select Program(s)</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>
                
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {availableOptions.length > 0 ? (
                            availableOptions.map(prog => (
                                <div
                                    key={prog}
                                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                                    onClick={() => handleSelect(prog)}
                                >
                                    {prog}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">All programs selected.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium" style={{ color: customBlue }}>
            {months[currentMonth]} / {currentYear}
          </span>
          <button onClick={handlePrevMonth} className="p-2" style={{ color: customBlue }}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 disabled:opacity-50"
            style={{ color: customBlue }}
            disabled={isNextDisabled()}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter</span>
          <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filterOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      {/* Filter Panel (Updated UI) */}
      {filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. Program - Multi Select with Chips (Custom Component) */}
            <MultiSelectProgram
                label="Program"
                selectedPrograms={filters.program}
                programOptions={programOptions}
                onProgramChange={handleProgramChange}
                onProgramRemove={removeProgram}
            />

            {/* 2. Select Class */}
            <CustomSelect
                label="Select Class"
                value={filters.classDataId[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  classDataId: e.target.value ? [e.target.value] : [],
                  gradeDivisionId: []
                }))}
                options={classOptions}
                placeholder="Select Class"
                disabled={filters.program.length === 0}
            />

            {/* 3. Division */}
            <CustomSelect
                label="Division"
                value={filters.gradeDivisionId[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  gradeDivisionId: e.target.value ? [e.target.value] : []
                }))}
                options={divisionOptions}
                placeholder="Select Division"
                disabled={!filters.classDataId.length}
            />

            {/* 4. Select Paper */}
            <CustomSelect
                label="Select Paper"
                value={filters.paper || ''}
                onChange={(e) => setFilters(prev => ({
                    ...prev,
                    paper: e.target.value || ''
                }))}
                options={['Mathematics', 'Science', 'English', 'History']}
                placeholder="Select Paper"
                disabled={!filters.gradeDivisionId.length}
            />

            {/* 5. Module */}
            <CustomSelect
                label="Module"
                value={filters.module || ''}
                onChange={(e) => setFilters(prev => ({
                    ...prev,
                    module: e.target.value || ''
                }))}
                options={['Module 1', 'Module 2', 'Module 3']}
                placeholder="Select Module"
                disabled={!filters.paper}
            />

            {/* 6. Unit */}
            <CustomSelect
                label="Unit"
                value={filters.unit || ''}
                onChange={(e) => setFilters(prev => ({
                    ...prev,
                    unit: e.target.value || ''
                }))}
                options={['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4']}
                placeholder="Select Unit"
                disabled={!filters.module}
            />

          </div>
        </div>
      )}

      {/* Add New */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <button
          onClick={() => navigate('/teacher/assessments/teacher-add-new-assessment')}
          className="flex items-center gap-3"
          style={{ color: customBlue }}
        >
          <span className="flex items-center justify-center rounded-full h-10 w-10 text-white"
            style={{ backgroundColor: customBlue }}>
            <Plus className="h-6 w-6" />
          </span>
          <span className="font-medium text-base sm:text-lg">Add New Assessment</span>
        </button>
      </div>

      {/* Assessments List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your assessments</p>
        </div>

        {/* Assessments Grid */}
        <div className="p-6">
          <div className="grid gap-4">
            {assessments.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ backgroundColor: a.subject.color }}>
                      {a.proctoring ? <Video className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    </div>
                    <div className="flex gap-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'Attempted' ? 'bg-green-100 text-green-700' : 
                        a.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.status}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        a.type === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {a.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-icon btn-view"><Eye className="w-4 h-4" /></button>
                    <button className="btn-icon btn-edit"><Edit className="w-4 h-4" /></button>
                    <button className="btn-icon btn-delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{a.title}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Start: {a.startDate}</div>
                    <div>End: {a.endDate}</div>
                    <div>Attempted: {a.attempted}/{a.total}</div>
                    <div>Type: {a.proctoring ? 'Proctored' : a.offline ? 'Offline' : 'Online'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Subject: {a.subject.name}</span>
                    <span>Completion: {a.percentage}%</span>
                  </div>
                  <span>Students: {a.attempted}/{a.total}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to 2 of 2 assessments
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
