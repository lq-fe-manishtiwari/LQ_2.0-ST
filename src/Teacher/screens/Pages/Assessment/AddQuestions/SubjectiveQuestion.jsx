import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Upload, Filter, X } from 'lucide-react';

const SubjectiveQuestion = ({ formData, handleChange, errors, touched }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: "all",
    filterOpen: false,
  });
  const dropdownRefs = useRef({});

  const programOptions = ["MCA-BTech-Graduation", "BCA", "BBA", "M.Tech"];
  const classOptions = ["Class 7A", "Class 8B", "Class 9B", "Class 10A"];
  const divisionOptions = ["A", "B", "C"];

  const handleSelect = (fieldName, value) => {
    handleChange({ target: { name: fieldName, value } });
    setOpenDropdown(null);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CustomDropdown = ({ fieldName, label, value, options, placeholder, required = false }) => (
    <div ref={el => dropdownRefs.current[fieldName] = el} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md min-h-[40px] flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 ${
          errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-gray-300'
        }`}
        onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === fieldName ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>
      {openDropdown === fieldName && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect(fieldName, '')}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(fieldName, option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {errors[fieldName] && touched[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      )}
    </div>
  );

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
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border ${
              disabled
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
            } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={value ? "text-gray-900" : "text-gray-400"}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect("")}
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

  const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const availableOptions = programOptions.filter((p) => !selectedPrograms.includes(p));

    const handleSelect = (program) => {
      onProgramChange({ target: { value: program } });
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
              selectedPrograms.map((prog) => (
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
            <ChevronDown
              className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
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
                <div className="px-4 py-3 text-sm text-gray-500">All programs selected.</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <div className="mb-6">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter Questions</span>
          <ChevronDown
            className={`w-4 h-4 text-blue-600 transition-transform ${
              filters.filterOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelectProgram
                label="Program"
                selectedPrograms={filters.program}
                programOptions={programOptions}
                onProgramChange={handleProgramChange}
                onProgramRemove={removeProgram}
              />

              <CustomSelect
                label="Class"
                value={filters.classDataId[0] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    classDataId: e.target.value ? [e.target.value] : [],
                    gradeDivisionId: [],
                  }))
                }
                options={classOptions}
                placeholder="Select Class"
                disabled={filters.program.length === 0}
              />

              <CustomSelect
                label="Division"
                value={filters.gradeDivisionId[0] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    gradeDivisionId: e.target.value ? [e.target.value] : [],
                  }))
                }
                options={divisionOptions}
                placeholder="Select Division"
                disabled={!filters.classDataId.length}
              />

              <CustomSelect
                label="Status"
                value={
                  filters.activeInactiveStatus.charAt(0).toUpperCase() +
                    filters.activeInactiveStatus.slice(1) || "All"
                }
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    activeInactiveStatus: e.target.value.toLowerCase(),
                  }))
                }
                options={["All", "Active", "Inactive"]}
                placeholder="Select Status"
              />
            </div>
          </div>
        )}
      </div>

      


      {/* Question */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="question" 
          value={formData.question} 
          onChange={handleChange}
          rows="4"
          placeholder="Enter your question here..."
          className={`w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
            errors.question && touched.question ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.question && touched.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question}</p>
        )}
      </div>

      {/* Question Images */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">Question Images</label>
        <div className="relative">
          <input
            type="text"
            value={formData.questionImages || ""}
            readOnly
            placeholder="No file chosen"
            className="w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 border-gray-300"
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="hidden"
            id="questionImages"
            multiple
          />
          <label
            htmlFor="questionImages"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <Upload className="h-4 w-4" />
            <span>Choose file</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">Supported formats: jpeg, png, jpg, pdf (Max 150MB)</p>
        <p className="text-xs text-gray-500">0 Images Selected</p>
      </div>

      {/* Default Marks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Default Marks <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            name="defaultMarks" 
            value={formData.defaultMarks} 
            onChange={handleChange}
            placeholder="Enter Default Marks"
            min="1"
            max="100"
            className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
              errors.defaultMarks && touched.defaultMarks ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.defaultMarks && touched.defaultMarks && (
            <p className="mt-1 text-sm text-red-600">{errors.defaultMarks}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectiveQuestion;