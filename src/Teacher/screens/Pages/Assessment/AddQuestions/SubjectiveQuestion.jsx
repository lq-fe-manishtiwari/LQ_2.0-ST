import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Upload } from 'lucide-react';

const SubjectiveQuestion = ({ formData, handleChange, errors, touched }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const handleSelect = (fieldName, value) => {
    handleChange({ target: { name: fieldName, value } });
    setOpenDropdown(null);
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

  return (
    <div className="space-y-8">
      {/* Program, Class, Subject */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CustomDropdown
          fieldName="Program"
          label="Program"
          value={formData.Program}
          options={['MBA', 'BCA', 'MCA']}
          placeholder="Select Program"
          required
        />
        

        <CustomDropdown
          fieldName="Paper"
          label="Paper"
          value={formData.subject}
          options={['Mathematics', 'Science', 'English']}
          placeholder="Select Paper"
          required
        />
            <CustomDropdown
          fieldName="Module"
          label="Module"
          value={formData.chapter}
          options={['Chapter 1', 'Chapter 2', 'Chapter 3']}
          placeholder="Select Module"
          required
        />
        
      </div>

      {/* Chapter, Topic, Course Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    
        <div>
          <label className="block font-medium mb-1 text-gray-700">Unit</label>
          <input 
            type="text" 
            name="topic" 
            value={formData.topic} 
            onChange={handleChange}
            placeholder="Enter Unit"
            className="w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 border-gray-300"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1 text-gray-700">Course Outcome</label>
          <input 
            type="text" 
            name="courseOutcomes" 
            value={formData.courseOutcomes} 
            onChange={handleChange}
            placeholder="Enter CO"
            className="w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 border-gray-300"
          />
        </div>
          <CustomDropdown
          fieldName="bloomsLevel"
          label="Bloom's Level"
          value={formData.bloomsLevel}
          options={['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']}
          placeholder="Select BL"
        />
        
      </div>

      {/* Bloom's Level, Category, Question Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
 

        <CustomDropdown
          fieldName="questionType"
          label="Question Type"
          value={formData.questionType}
          options={['General', 'Essay', 'Short Answer']}
          placeholder="General"
          required
        />
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