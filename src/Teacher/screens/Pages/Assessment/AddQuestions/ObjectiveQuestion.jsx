import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ObjectiveQuestion = ({ formData, handleChange, errors, touched }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const handleSelect = (fieldName, value) => {
    handleChange({ target: { name: fieldName, value } });
    setOpenDropdown(null);
  };

  const handleEditorChange = (fieldName, data) => {
    handleChange({ target: { name: fieldName, value: data } });
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
      <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md min-h-[42px] flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 ${
          errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-gray-300'
        }`}
        onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'} text-sm md:text-base`}>
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

  const editorConfig = {
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'fontColor', 'fontBackgroundColor', '|',
        'bulletedList', 'numberedList', '|',
        'alignment', '|',
        'undo', 'redo'
      ]
    },
    language: 'en',
    licenseKey: '',
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* Grade, Class, Subject - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <CustomDropdown
          fieldName="grade"
          label="Grade"
          value={formData.grade}
          options={['MBA', 'BCA', 'MCA']}
          placeholder="Select Grade"
          required
        />
        
        <CustomDropdown
          fieldName="class"
          label="Class"
          value={formData.class}
          options={['FY', 'SY', 'TY']}
          placeholder="Select Class"
          required
        />

        <CustomDropdown
          fieldName="subject"
          label="Subject"
          value={formData.subject}
          options={['Mathematics', 'Science', 'English']}
          placeholder="Select Subject"
          required
        />
      </div>

      {/* Chapter, Topic, Course Outcomes - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <CustomDropdown
          fieldName="chapter"
          label="Chapter"
          value={formData.chapter}
          options={['Chapter 1', 'Chapter 2', 'Chapter 3']}
          placeholder="Select Chapter"
          required
        />
        
        <div>
          <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">Topic</label>
          <input 
            type="text" 
            name="topic" 
            value={formData.topic} 
            onChange={handleChange}
            placeholder="Enter Topic"
            className="w-full border rounded-md px-3 py-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 border-gray-300 text-sm md:text-base"
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">Course Outcomes</label>
          <input 
            type="text" 
            name="courseOutcomes" 
            value={formData.courseOutcomes} 
            onChange={handleChange}
            placeholder="Enter CO"
            className="w-full border rounded-md px-3 py-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 border-gray-300 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Bloom's Level, Category, No. of Options - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <CustomDropdown
          fieldName="bloomsLevel"
          label="Bloom's Level"
          value={formData.bloomsLevel}
          options={['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']}
          placeholder="Select BL"
        />
        
        <CustomDropdown
          fieldName="category"
          label="Category"
          value={formData.category}
          options={['Objective Question', 'Subjective Question']}
          placeholder="Objective Question"
          required
        />

        <CustomDropdown
          fieldName="noOfOptions"
          label="No. of Options"
          value={formData.noOfOptions}
          options={['3', '4', '5']}
          placeholder="4"
          required
        />
      </div>

      {/* Question Type, Question Level, Default Marks - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <CustomDropdown
          fieldName="questionType"
          label="Question Type"
          value={formData.questionType}
          options={['General', 'MCQ', 'True/False']}
          placeholder="General"
          required
        />

        <CustomDropdown
          fieldName="questionLevel"
          label="Question Level"
          value={formData.questionLevel}
          options={['Basic', 'Intermediate', 'Advanced']}
          placeholder="Basic"
          required
        />

        <div>
          <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
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
            className={`w-full border rounded-md px-3 py-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 text-sm md:text-base ${
              errors.defaultMarks && touched.defaultMarks ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.defaultMarks && touched.defaultMarks && (
            <p className="mt-1 text-sm text-red-600">{errors.defaultMarks}</p>
          )}
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="question" 
          value={formData.question} 
          onChange={handleChange}
          rows="4"
          placeholder="Enter your question here..."
          className={`w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 text-sm md:text-base ${
            errors.question && touched.question ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.question && touched.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question}</p>
        )}
      </div>

      {/* Question Images */}
      <div>
        <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">Question Images</label>
        <div className="relative">
          <input
            type="text"
            value={formData.questionImages || ""}
            readOnly
            placeholder="No file chosen"
            className="w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 border-gray-300 text-sm md:text-base"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden xs:inline">Choose file</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">Supported formats: jpeg, png, jpg, pdf (Max 150MB)</p>
        <p className="text-xs text-gray-500">0 Images Selected</p>
      </div>

      {/* Options with CKEditor - Responsive Grid */}
      <div className="space-y-4 md:space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
              Option 1 <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-md overflow-hidden transition-all duration-150 hover:border-blue-400 ${
              errors.option1 && touched.option1 ? 'border-red-500' : 'border-gray-300'
            }`}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option1 || ''}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleEditorChange('option1', data);
                }}
              />
            </div>
            {errors.option1 && touched.option1 && (
              <p className="mt-1 text-sm text-red-600">{errors.option1}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
              Option 2 <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-md overflow-hidden transition-all duration-150 hover:border-blue-400 ${
              errors.option2 && touched.option2 ? 'border-red-500' : 'border-gray-300'
            }`}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option2 || ''}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleEditorChange('option2', data);
                }}
              />
            </div>
            {errors.option2 && touched.option2 && (
              <p className="mt-1 text-sm text-red-600">{errors.option2}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
              Option 3 <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-md overflow-hidden transition-all duration-150 hover:border-blue-400 ${
              errors.option3 && touched.option3 ? 'border-red-500' : 'border-gray-300'
            }`}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option3 || ''}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleEditorChange('option3', data);
                }}
              />
            </div>
            {errors.option3 && touched.option3 && (
              <p className="mt-1 text-sm text-red-600">{errors.option3}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
              Option 4 <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-md overflow-hidden transition-all duration-150 hover:border-blue-400 ${
              errors.option4 && touched.option4 ? 'border-red-500' : 'border-gray-300'
            }`}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option4 || ''}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleEditorChange('option4', data);
                }}
              />
            </div>
            {errors.option4 && touched.option4 && (
              <p className="mt-1 text-sm text-red-600">{errors.option4}</p>
            )}
          </div>
        </div>
      </div>

      {/* Answer - Responsive Layout */}
      <div>
        <label className="block font-medium mb-1 text-gray-700 text-sm md:text-base">
          Correct Answer <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col xs:flex-row flex-wrap gap-3 md:gap-4">
          {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer min-w-[100px]">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={formData.answer === option}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObjectiveQuestion;