'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { Search, Calendar, Clock, CheckCircle, Loader2, ChevronDown, Image, FileText, Plus } from 'lucide-react';
import assesment_logo from '@/_assets/images_new_design/Assessment_logo.svg';
import SearchImg from '@/_assets/images/Search.svg';

// Mock services (replace with actual imports)
const gradeService = {
  getAll: () => Promise.resolve([{ grade_id: '1', name: 'MBA' }, { grade_id: '2', name: 'BCA' }]),
  getGradeDivision: () => Promise.resolve([
    { grade_division_id: '1', grade: { name: 'MBA' }, division: { name: 'A' }, active: true },
    { grade_division_id: '2', grade: { name: 'MBA' }, division: { name: 'B' }, active: true }
  ])
};
const classService = {
  getClassDetailsByGradeId: () => Promise.resolve([
    { class_data: { class_data_id: 'FY', name_data: 'FY' } },
    { class_data: { class_data_id: 'SY', name_data: 'SY' } }
  ])
};
const gradeSubjectService = {
  getGradeSubjects: () => Promise.resolve([
    { subject: { subject_id: '1', name: 'Mathematics' } },
    { subject: { subject_id: '2', name: 'Science' } }
  ])
};
const chapterService = {
  getChapterBySubjectIDGradeID: () => Promise.resolve([
    { chapter_id: '1', label: 'Chapter 1' },
    { chapter_id: '2', label: 'Chapter 2' }
  ])
};
const topicService = {
  getTopicBySubjectAndChapter: () => Promise.resolve([
    { topic_id: '1', label: 'Topic 1' },
    { topic_id: '2', label: 'Topic 2' }
  ])
};
const questionService = {
  getQuestionBySunjectIdWithFlagV3Paging: () => Promise.resolve([
    {
      question: { question_id: '1', question: 'What is 2+2?', option1: '4', option2: '5', option3: '6', option4: '7', question_level: { question_level_type: 'EASY' }, objective_subjective_type: 'Objective', default_weight_age: 2 },
      assigned: false
    }
  ])
};

const AddInternalAssessment = ({ grade, nba, currentUser, showSuccessModal, showWarningModal, userRole }) => {
  const [state, setState] = useState({
    grades: [],
    classes: [],
    divisions: [],
    subjects: [],
    chapters: [],
    topics: [],
    questions: [],
    filteredQuestions: [],
    selectedGrade: '',
    selectedClass: '',
    selectedDivision: '',
    selectedSubject: '',
    selectedChapter: '',
    selectedTopic: '',
    selectedTestCategory: 'Objective',
    testDate: moment().add(2, 'minutes').toDate(),
    testLastDate: moment().add(1, 'day').add(2, 'minutes').toDate(),
    timeLimit: '',
    selectedQuestions: [],
    noOfQuestions: 0,
    noOfEasy: 0,
    noOfMedium: 0,
    noOfHard: 0,
    loadingQuestions: false,
    loadMore: false,
    currentPage: 0,
    bulkUploadType: 'Regular Assessment',
    isNBA: false,
  });

  // dropdown control for custom dropdowns (matches ObjectiveQuestion)
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const grades = await gradeService.getAll();
        setState(prev => ({ ...prev, grades }));
      } catch (error) {
        console.error("Error loading grades:", error);
      }
    };
    loadInitialData();
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

  const handleGradeChange = async (gradeId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedGrade: gradeId, classes: [], divisions: [], subjects: [] }));
    setFieldValue('grade_id', gradeId);
    if (gradeId) {
      const classes = await classService.getClassDetailsByGradeId(gradeId);
      const classOptions = classes.map(cls => ({
        class_id: cls.class_data.class_data_id,
        name: cls.class_data.name_data,
      }));
      setState(prev => ({ ...prev, classes: classOptions }));
    }
  };

  const handleClassChange = async (classId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedClass: classId, divisions: [] }));
    setFieldValue('class_id', classId);
    if (state.selectedGrade && classId) {
      const divisions = await gradeService.getGradeDivision(state.selectedGrade, classId);
      const formatted = divisions
        .filter(d => d.active)
        .map(d => ({
          grade_division_id: d.grade_division_id,
          grade_division_obj_str: JSON.stringify({
            grade_division_id: d.grade_division_id,
            grade_id: d.grade.grade_id,
          }),
          division: d.division
        }));
      setState(prev => ({ ...prev, divisions: formatted }));
    }
  };

  const handleDivisionChange = async (divisionObjStr, setFieldValue) => {
    if (!divisionObjStr) {
      setState(prev => ({ ...prev, subjects: [] }));
      setFieldValue('grade_division', '');
      return;
    }
    if (divisionObjStr === 'All') {
      const subjects = await gradeSubjectService.getGradeSubjects(state.selectedGrade, state.selectedClass, false);
      setState(prev => ({ ...prev, subjects: subjects.map(s => s.subject) }));
      setFieldValue('grade_division', 'All');
    } else {
      const obj = JSON.parse(divisionObjStr);
      setState(prev => ({ ...prev, selectedDivision: obj.grade_division_id }));
      const subjects = await gradeSubjectService.getGradeSubjects(state.selectedGrade, state.selectedClass, false);
      setState(prev => ({ ...prev, subjects: subjects.map(s => s.subject) }));
      setFieldValue('grade_division', divisionObjStr);
    }
  };

  const handleSubjectChange = async (subjectId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedSubject: subjectId, chapters: [] }));
    setFieldValue('subject_id', subjectId);
    if (subjectId) {
      const chapters = await chapterService.getChapterBySubjectIDGradeID(subjectId, state.selectedGrade);
      setState(prev => ({ ...prev, chapters }));
    }
  };

  const handleChapterChange = async (chapterId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedChapter: chapterId, topics: [] }));
    setFieldValue('chapter_id', chapterId);
    if (chapterId) {
      const topics = await topicService.getTopicBySubjectAndChapter(state.selectedSubject, chapterId);
      setState(prev => ({ ...prev, topics }));
    }
    loadQuestions(setFieldValue);
  };

  const handleTopicChange = (topicId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedTopic: topicId }));
    setFieldValue('topic_id', topicId);
    loadQuestions(setFieldValue);
  };

  const handleCategoryChange = (category, setFieldValue) => {
    setState(prev => ({ ...prev, selectedTestCategory: category }));
    setFieldValue('test_category', category);
    loadQuestions(setFieldValue);
  };

  const loadQuestions = async (setFieldValue) => {
    if (!state.selectedSubject) return;
    setState(prev => ({ ...prev, loadingQuestions: true }));
    try {
      const questions = await questionService.getQuestionBySunjectIdWithFlagV3Paging(
        state.selectedSubject, state.selectedGrade, 0, 10, state.selectedTestCategory,
        state.selectedChapter, state.selectedTopic
      );
      const formatted = questions.map(q => ({
        ...q.question,
        assigned: q.assigned,
        question_id: q.question.question_id,
        question: q.question.question.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, ""),
        color_code: q.question.question_level.question_level_type === 'EASY' ? '#10b981' :
                   q.question.question_level.question_level_type === 'MEDIUM' ? '#f59e0b' : '#ef4444',
        isChecked: false
      }));
      setState(prev => ({ ...prev, questions: formatted, filteredQuestions: formatted, loadingQuestions: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loadingQuestions: false }));
    }
  };

  const handleSelectAll = (checked) => {
    const updated = state.filteredQuestions.map(q => ({ ...q, isChecked: checked }));
    const counts = updated.reduce((acc, q) => {
      if (q.isChecked) {
        acc.total++;
        if (q.question_level.question_level_type === 'EASY') acc.easy++;
        else if (q.question_level.question_level_type === 'MEDIUM') acc.medium++;
        else if (q.question_level.question_level_type === 'HARD') acc.hard++;
      }
      return acc;
    }, { total: 0, easy: 0, medium: 0, hard: 0 });
    setState(prev => ({
      ...prev,
      filteredQuestions: updated,
      noOfQuestions: counts.total,
      noOfEasy: counts.easy,
      noOfMedium: counts.medium,
      noOfHard: counts.hard
    }));
  };

  const handleQuestionSelect = (questionId, checked) => {
    const updated = state.filteredQuestions.map(q => 
      q.question_id === questionId ? { ...q, isChecked: checked } : q
    );
    const counts = updated.reduce((acc, q) => {
      if (q.isChecked) {
        acc.total++;
        if (q.question_level.question_level_type === 'EASY') acc.easy++;
        else if (q.question_level.question_level_type === 'MEDIUM') acc.medium++;
        else if (q.question_level.question_level_type === 'HARD') acc.hard++;
      }
      return acc;
    }, { total: 0, easy: 0, medium: 0, hard: 0 });
    setState(prev => ({
      ...prev,
      filteredQuestions: updated,
      noOfQuestions: counts.total,
      noOfEasy: counts.easy,
      noOfMedium: counts.medium,
      noOfHard: counts.hard
    }));
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required('Please enter the Assessment Title'),
    grade_id: Yup.string().trim().required('Please select the Program'),
    class_id: Yup.string().trim().required('Please select the Class'),
    grade_division: Yup.string().trim().required('Please select the Division'),
    subject_id: Yup.string().trim().required('Please select the Subject'),
    test_category: Yup.string().trim().required('Please select the Category'),
    test_date: Yup.date().required('Please select test date'),
    test_last_date: Yup.date().required('Please select test end date'),
    time_limit: Yup.number().required('Please enter time limit').min(1),
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
            grade_id: state.selectedGrade,
            class_id: state.selectedClass,
            grade_division: '',
            subject_id: '',
            chapter_id: '',
            topic_id: '',
            test_category: state.selectedTestCategory,
            test_date: formatDateForInput(state.testDate),
            test_last_date: formatDateForInput(state.testLastDate),
            time_limit: state.timeLimit,
            int_ext_type: 'Internal',
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, { setSubmitting, resetForm }) => {
            values.test_date = Math.floor(new Date(values.test_date).getTime() / 1000);
            values.test_last_date = Math.floor(new Date(values.test_last_date).getTime() / 1000);
            console.log('Submitting:', values);
            setTimeout(() => {
              showSuccessModal && showSuccessModal(true, 'Assessment added successfully!');
              resetForm();
              setSubmitting(false);
            }, 1000);
          }}
        >
          {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {
            // CustomDropdown defined here so it can use setFieldValue, errors, touched
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
                      onClick={() => {
                        if (onChangeCallback) onChangeCallback('');
                        setOpenDropdown(null);
                      }}
                    >
                      {placeholder}
                    </div>
                    {options.map((option) => {
                      // option can be object or string
                      const optValue = typeof option === 'string' ? option : (option.value ?? option.grade_division_obj_str ?? option.subject_id ?? option.chapter_id ?? option.topic_id ?? option.class_id);
                      const optLabel = typeof option === 'string' ? option : (option.label ?? option.name ?? option.division?.name ?? option.name);
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

                {/* Program, Class, Division (using CustomDropdown) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <CustomDropdown
                    fieldName="grade_id"
                    label="Program"
                    value={values.grade_id}
                    options={state.grades.map(g => ({ value: g.grade_id, name: g.name }))}
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
                    options={state.classes.map(c => ({ value: c.class_id, name: c.name }))}
                    placeholder="Select Class"
                    required
                    onChangeCallback={(val) => {
                      handleClassChange(val, setFieldValue);
                    }}
                  />

                  <CustomDropdown
                    fieldName="grade_division"
                    label="Division"
                    value={values.grade_division}
                    options={[ 'All', ...state.divisions.map(d => ({ grade_division_obj_str: d.grade_division_obj_str, division: d.division }))]}
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
                    options={state.subjects.map(s => ({ subject_id: s.subject_id, name: s.name }))}
                    placeholder={userRole?.userRole === 'ADMIN' ? 'Select Paper' : 'Select Subject'}
                    required
                    onChangeCallback={(val) => {
                      handleSubjectChange(val, setFieldValue);
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
                      handleCategoryChange(val, setFieldValue);
                    }}
                  />
                </div>

                {/* Chapter & Topic (Additional for Internal) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomDropdown
                    fieldName="chapter_id"
                    label="Chapter"
                    value={values.chapter_id}
                    options={state.chapters.map(c => ({ chapter_id: c.chapter_id, label: c.label }))}
                    placeholder="Select Chapter"
                    onChangeCallback={(val) => {
                      handleChapterChange(val, setFieldValue);
                    }}
                  />

                  <CustomDropdown
                    fieldName="topic_id"
                    label="Topic"
                    value={values.topic_id}
                    options={state.topics.map(t => ({ topic_id: t.topic_id, label: t.label }))}
                    placeholder="Select Topic"
                    onChangeCallback={(val) => {
                      handleTopicChange(val, setFieldValue);
                    }}
                  />
                </div>

                {/* Test Dates & Time Limit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Test Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        name="test_date"
                        type="datetime-local"
                        min={getMinDate()}
                        className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                          errors.test_date && touched.test_date
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.test_date && touched.test_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.test_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Test End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        name="test_last_date"
                        type="datetime-local"
                        min={getMinDate()}
                        className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                          errors.test_last_date && touched.test_last_date
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.test_last_date && touched.test_last_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.test_last_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Time Limit (minutes) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        name="time_limit"
                        type="number"
                        placeholder="Enter time limit"
                        min="1"
                        max="999"
                        className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                          errors.time_limit && touched.time_limit
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.time_limit && touched.time_limit && (
                      <p className="mt-1 text-sm text-red-600">{errors.time_limit}</p>
                    )}
                  </div>
                </div>

                {/* Questions Section */}
                {state.questions.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Questions</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="font-medium">Select All Questions</span>
                        </label>
                        <div className="text-sm text-gray-600">
                          Selected: {state.noOfQuestions} | Easy: {state.noOfEasy} | Medium: {state.noOfMedium} | Hard: {state.noOfHard}
                        </div>
                      </div>
                      {state.filteredQuestions.map((question) => (
                        <div key={question.question_id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <input
                            type="checkbox"
                            checked={question.isChecked}
                            onChange={(e) => handleQuestionSelect(question.question_id, e.target.checked)}
                            className="mt-1 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span
                                className="px-2 py-1 text-xs font-medium text-white rounded"
                                style={{ backgroundColor: question.color_code }}
                              >
                                {question.question_level.question_level_type}
                              </span>
                              <span className="text-sm text-gray-500">Weight: {question.default_weight_age}</span>
                            </div>
                            <p className="text-sm text-gray-800">{question.question}</p>
                            {question.objective_subjective_type === 'Objective' && (
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>A) {question.option1}</div>
                                <div>B) {question.option2}</div>
                                <div>C) {question.option3}</div>
                                <div>D) {question.option4}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

export default AddInternalAssessment;
