'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { Plus, Calendar, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import assesment_logo from '@/_assets/images_new_design/Assessment_logo.svg';

const AddExternalAssessment = ({ grade, nba, currentUser, showSuccessModal, showWarningModal, userRole }) => {
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(grade?.grade || '');
  const [selectedClass, setSelectedClass] = useState(grade?.grade_class?.class || 'FY');
  const [testDate, setTestDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  // dropdown control for custom dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Mock data for UI (replace with API calls as needed)
  useEffect(() => {
    setGrades([
      { grade_id: '1', name: 'MBA Grade Testing' },
      { grade_id: '2', name: 'BCA' },
      { grade_id: '3', name: 'MCA' },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains && ref.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGradeChange = (gradeId, setFieldValue) => {
    setSelectedGrade(gradeId);
    setClasses([
      { class_id: 'FY', name: 'FY' },
      { class_id: 'SY', name: 'SY' },
      { class_id: 'TY', name: 'TY' },
    ]);
    setDivisions([]);
    setSubjects([]);
    setFieldValue('grade', gradeId);
    setFieldValue('class_id', '');
    setFieldValue('grade_division_id', '');
    setFieldValue('subject_id', '');
  };

  const handleClassChange = (classId, setFieldValue) => {
    setSelectedClass(classId);
    setDivisions([
      { grade_division_id: '1', division: { name: 'A' } },
      { grade_division_id: '2', division: { name: 'B' } },
      { grade_division_id: '3', division: { name: 'C' } },
    ]);
    setSubjects([]);
    setFieldValue('class_id', classId);
    setFieldValue('grade_division_id', '');
    setFieldValue('subject_id', '');
  };

  const handleDivisionChange = (divisionId, setFieldValue) => {
    setSubjects([
      { subject_id: '1', name: 'Mathematics' },
      { subject_id: '2', name: 'Science' },
      { subject_id: '3', name: 'English' },
    ]);
    setFieldValue('grade_division_id', divisionId);
    setFieldValue('subject_id', '');
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required('Please enter the Assessment Title'),
    grade: Yup.string().trim().required('Please select the Program'),
    class_id: Yup.string().trim().required('Please select the Class'),
    grade_division_id: Yup.string().trim().required('Please select the Division'),
    subject_id: Yup.string().trim().required('Please select the Subject'),
    test_category: Yup.string().trim().required('Please select the Category'),
    min_marks: Yup.number().required('Please enter the Passing Threshold').min(0),
    max_marks: Yup.number()
      .required('Please enter the Total Marks')
      .min(Yup.ref('min_marks'), 'Total Marks must be greater than Passing Threshold'),
    date_time: Yup.string().required('Please select a valid date and time'),
  });

  const formatDateForInput = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    return date.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  return (
   
        <Formik
          initialValues={{
            title: '',
            grade: selectedGrade,
            class_id: selectedClass,
            grade_division_id: '',
            subject_id: '',
            test_category: '',
            min_marks: '',
            max_marks: '',
            date_time: formatDateForInput(testDate),
            int_ext_type: 'External',
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, { setSubmitting, resetForm }) => {
            // Convert date_time to Unix timestamp
            values.date_time = Math.floor(new Date(values.date_time).getTime() / 1000);
            console.log('Submitting:', values);
            // Simulate API call
            setTimeout(() => {
              showSuccessModal(true, 'Assessment added successfully!');
              resetForm();
              setSubmitting(false);
            }, 1000);
          }}
        >
          {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {
            // CustomDropdown component
            const CustomDropdown = ({ fieldName, label, value, options, placeholder = '', required = false, onChangeCallback }) => (
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
                    {value ? options.find(opt => (opt.grade_id || opt.class_id || opt.grade_division_id || opt.subject_id || opt) === value)?.name || value : placeholder}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === fieldName ? 'rotate-180' : 'rotate-0'}`}
                  />
                </div>
                {openDropdown === fieldName && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        if (onChangeCallback) onChangeCallback('');
                        setOpenDropdown(null);
                      }}
                    >
                      {placeholder}
                    </div>
                    {options.map((option) => {
                      const optValue = typeof option === 'string' ? option : (option.grade_id || option.class_id || option.grade_division_id || option.subject_id);
                      const optLabel = typeof option === 'string' ? option : option.name;
                      return (
                        <div
                          key={optValue}
                          className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            if (onChangeCallback) onChangeCallback(optValue);
                            setOpenDropdown(null);
                          }}
                        >
                          {optLabel}
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors[fieldName] && touched[fieldName] && (
                  <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
                )}
              </div>
            );

            return (
              <Form onSubmit={handleSubmit} className="space-y-8">
                {/* Header with Logo & Title */}
                <div className="flex items-center space-x-4 border-b border-gray-200 pb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center p-3">
                    <img src={assesment_logo} alt="Assessment" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <Field
                      name="title"
                      placeholder="Enter Assessment Title"
                      className={`w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 ${
                        errors.title && touched.title ? 'text-red-600' : ''
                      }`}
                    />
                    {errors.title && touched.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                </div>

                {/* Program, Class, Division */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <CustomDropdown
                    fieldName="grade"
                    label="Program"
                    value={values.grade}
                    options={grades}
                    placeholder="Select Program"
                    required
                    onChangeCallback={(val) => {
                      handleGradeChange(val, setFieldValue);
                    }}
                  />

                  <CustomDropdown
                    fieldName="class_id"
                    label="Class"
                    value={values.class_id}
                    options={classes}
                    placeholder="Select Class"
                    required
                    onChangeCallback={(val) => {
                      handleClassChange(val, setFieldValue);
                    }}
                  />

                  <CustomDropdown
                    fieldName="grade_division_id"
                    label="Division"
                    value={values.grade_division_id}
                    options={divisions.map(d => ({ grade_division_id: d.grade_division_id, name: d.division.name }))}
                    placeholder="Select Division"
                    required
                    onChangeCallback={(val) => {
                      handleDivisionChange(val, setFieldValue);
                    }}
                  />
                </div>

                {/* Subject & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomDropdown
                    fieldName="subject_id"
                    label={userRole?.userRole === 'ADMIN' ? 'Paper' : 'Subject'}
                    value={values.subject_id}
                    options={subjects}
                    placeholder={userRole?.userRole === 'ADMIN' ? 'Select Paper' : 'Select Subject'}
                    required
                    onChangeCallback={(val) => {
                      setFieldValue('subject_id', val);
                    }}
                  />

                  <CustomDropdown
                    fieldName="test_category"
                    label="Category"
                    value={values.test_category}
                    options={['Objective','Subjective','Coding','Mixed']}
                    placeholder="Select Category"
                    required
                    onChangeCallback={(val) => {
                      setFieldValue('test_category', val);
                    }}
                  />
                </div>

                {/* Result Date, Passing Threshold, Total Marks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Result Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      name="date_time"
                      type="datetime-local"
                      min={getMinDate()}
                      value={formatDateForInput(testDate)}
                      onChange={(e) => {
                        handleChange(e);
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate)) setTestDate(newDate);
                      }}
                      className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                        errors.date_time && touched.date_time
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.date_time && touched.date_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_time}</p>
                  )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Passing Threshold <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="min_marks"
                      type="number"
                      placeholder="Enter Passing Threshold"
                      min="0"
                      max="999"
                      className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                        errors.min_marks && touched.min_marks
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.min_marks && touched.min_marks && (
                      <p className="mt-1 text-sm text-red-600">{errors.min_marks}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="max_marks"
                      type="number"
                      placeholder="Enter Total Marks"
                      min="0"
                      max="999"
                      className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                        errors.max_marks && touched.max_marks
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.max_marks && touched.max_marks && (
                      <p className="mt-1 text-sm text-red-600">{errors.max_marks}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-all ${
                      isSubmitting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Submit Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
     
  );
};

export default AddExternalAssessment;