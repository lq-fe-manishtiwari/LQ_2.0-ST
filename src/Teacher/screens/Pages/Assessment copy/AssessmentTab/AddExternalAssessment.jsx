'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { ChevronDown, Calendar, Clock, Check, Upload, X, CheckCircle } from 'lucide-react';
import assesment_logo from '@/_assets/images_new_design/Assessment_logo.svg';

import { contentService } from '../../Academics/Services/content.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { AssessmentService } from '../Services/assessment.service';
import { RubricService } from '../Settings/Service/rubric.service';
import moment from "moment";
import { useAssessmentFormLogic } from '../../Assessment/hooks/useAssessmentFormLogic';

const AddExternalAssessment = ({ grade, nba, currentUser, showSuccessModal, showWarningModal, userRole, mode: propMode, assessmentData }) => {
  const { userID, userRole: contextUserRole } = useUserProfile();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id;

  // Options State
  const [programOptions, setProgramOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]); // New
  const [academicYearOptions, setAcademicYearOptions] = useState([]); // New
  const [semesterOptions, setSemesterOptions] = useState([]); // New
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]); // New
  const [topicOptions, setTopicOptions] = useState([]); // New
  const [rubrics, setRubrics] = useState([]); // Added for real rubrics

  // Selected State
  const [selectedGrade, setSelectedGrade] = useState(grade?.grade || '');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(''); // New
  const [selectedChapter, setSelectedChapter] = useState(''); // New
  const [selectedTopic, setSelectedTopic] = useState(''); // New
  const [assessmentType, setAssessmentType] = useState('STANDARD_GENERAL'); // New
  const [rubricType, setRubricType] = useState(''); // New

  // Derive formData for the hook (uses teacher ID)
  const hookFormData = useMemo(() => ({
    selectedProgram: String(selectedGrade || ''),
    selectedAcademicSemester: selectedAcademicYear && selectedSemester
      ? `${selectedAcademicYear}-${selectedSemester}`
      : '',
    selectedBatch: String(selectedBatch || ''),
    selectedSubject: String(selectedSubject || ''),
  }), [selectedGrade, selectedAcademicYear, selectedSemester, selectedBatch, selectedSubject]);

  const { options: hookOptions } = useAssessmentFormLogic(hookFormData);

  const [testDate, setTestDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [testLastDate, setTestLastDate] = useState(new Date(new Date().setDate(new Date().getDate() + 2))); // New
  const [timeLimit, setTimeLimit] = useState(''); // New
  const [title, setTitle] = useState(assessmentData?.title || '');

  const [hoveredParent, setHoveredParent] = useState(null); // New
  const [assessmentOpen, setAssessmentOpen] = useState(false); // New
  const [mode, setMode] = useState(propMode || 'ONLINE'); // New

  // Helper refs for filtering
  const allBatchesRef = useRef([]);
  const allAcademicYearsRef = useRef([]);
  const allSemestersRef = useRef([]);

  // dropdown control for custom dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const ASSESSMENT_TYPE_MAP = {
    STANDARD_GENERAL: 'General',
    STANDARD_BL_CO: 'General with BL & CO',
    RUBRIC_STANDARD: 'Standard Rubric',
    RUBRIC_BL_CO: 'Rubric with BL & CO',
  };

  // EDIT MODE INITIALIZATION
  useEffect(() => {
    const fetchProgramsAndInitialize = async () => {
      if (!assessmentData || !collegeId) return;
      try {
        const ad = assessmentData;

        // 1. Load Batches & Cascade Data
        const batchRes = await batchService.getBatchByProgramId([ad.program_id]);
        const batchesData = Array.isArray(batchRes) ? batchRes : [];

        const extractedAYs = [];
        const extractedSems = [];
        batchesData.forEach(batch => {
          batch.academic_years?.forEach(ay => {
            extractedAYs.push({ academic_year_id: ay.academic_year_id, name: ay.name, batchId: batch.batch_id });
            ay.semester_divisions?.forEach(sem => {
              extractedSems.push({ semester_id: sem.semester_id, semester_name: sem.name, academicYearId: ay.academic_year_id, divisions: sem.divisions || [] });
            });
          });
        });

        allBatchesRef.current = batchesData;
        allAcademicYearsRef.current = extractedAYs;
        allSemestersRef.current = extractedSems;

        // 2. Load Subjects
        const subjectRes = await contentService.getSubjectbyProgramId(ad.program_id);
        const subjects = subjectRes.filter(s => !s.is_deleted).map(s => ({ subject_id: s.subject_id, name: s.subject_name || s.name }));

        // 3. Load Modules
        let chapters = [];
        if (ad.subject_id) {
          const moduleRes = await contentService.getModulesbySubject(ad.subject_id);
          const rawMods = Array.isArray(moduleRes) ? moduleRes : (moduleRes?.modules || []);
          chapters = rawMods.map(m => ({ chapter_id: m.module_id, label: m.module_name, units: m.units || [] }));
        }

        // 4. Load Topics
        let topics = [];
        if (ad.module_id) {
          const selectedModule = chapters.find(c => c.chapter_id == ad.module_id);
          topics = selectedModule?.units.map(u => ({ topic_id: u.unit_id, label: u.unit_name })) || [];
        }

        // 5. Relevant Lists
        const relevantAYs = extractedAYs.filter(ay => ay.batchId == ad.batch_id);
        const relevantSems = extractedSems.filter(s => s.academicYearId == ad.academic_year_id);
        const selectedSemObj = extractedSems.find(s => s.semester_id == ad.semester_id);
        const divisionsList = selectedSemObj?.divisions?.map(d => ({
          grade_division_id: d.division_id,
          name: d.division_name
        })) || [];

        setBatchOptions(batchesData.map(b => ({ value: b.batch_id, label: b.batch_name })));
        setAcademicYearOptions(relevantAYs.map(ay => ({ value: ay.academic_year_id, label: ay.name })));
        setSemesterOptions(relevantSems.map(s => ({ value: s.semester_id, label: s.semester_name })));
        setDivisionOptions(divisionsList);
        setSubjectOptions(subjects);
        setChapterOptions(chapters);
        setTopicOptions(topics);

        setSelectedGrade(ad.program_id);
        setSelectedBatch(ad.batch_id);
        setSelectedAcademicYear(ad.academic_year_id);
        setSelectedSemester(ad.semester_id);
        setSelectedDivision(ad.division_id);
        setSelectedSubject(ad.subject_id);
        setSelectedChapter(ad.module_id);
        setSelectedTopic(ad.unit_id);
        setAssessmentType(ad.type);
        setTestDate(ad.test_start_datetime ? new Date(ad.test_start_datetime) : testDate);
        setTestLastDate(ad.test_end_datetime ? new Date(ad.test_end_datetime) : testLastDate);
        setTimeLimit(ad.time_limit_minutes || '');
        setMode(ad.mode || mode);
      } catch (err) {
        console.error('Failed to fetch programs or initialize edit:', err);
      }
    };
    fetchProgramsAndInitialize();
  }, [assessmentData, collegeId]);


  const handleGradeChange = async (gradeId, setFieldValue) => {
    setSelectedGrade(gradeId);
    setFieldValue('grade', gradeId);

    // Reset child fields
    setFieldValue('batch_id', '');
    setFieldValue('academic_year_id', '');
    setFieldValue('semester_id', '');
    setFieldValue('grade_division_id', '');
    setFieldValue('subject_id', '');
    setFieldValue('chapter_id', '');
    setFieldValue('topic_id', '');

    setSelectedBatch('');
    setSelectedAcademicYear('');
    setSelectedSemester('');
    setSelectedDivision('');
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedTopic('');

    setBatchOptions([]);
    setAcademicYearOptions([]);
    setSemesterOptions([]);
    setDivisionOptions([]);
    setSubjectOptions([]);
    setChapterOptions([]);
    setTopicOptions([]);

    if (!gradeId) return;

    // Fetch Batches (Refactored logic)
    try {
      const res = await batchService.getBatchByProgramId([gradeId]);
      if (res && Array.isArray(res)) {
        const batchesData = res;

        // Extract AYs and Semesters for caching
        const extractedAcademicYears = [];
        const extractedSemesters = [];

        batchesData.forEach(batch => {
          if (batch.academic_years && Array.isArray(batch.academic_years)) {
            batch.academic_years.forEach(ay => {
              extractedAcademicYears.push({
                academic_year_id: ay.academic_year_id,
                name: ay.name,
                batchId: batch.batch_id,
                semester_divisions: ay.semester_divisions
              });

              if (ay.semester_divisions && Array.isArray(ay.semester_divisions)) {
                ay.semester_divisions.forEach(semDiv => {
                  extractedSemesters.push({
                    semester_id: semDiv.semester_id,
                    semester_name: semDiv.name,
                    academicYearId: ay.academic_year_id,
                    divisions: semDiv.divisions || []
                  });
                });
              }
            });
          }
        });

        // Store in Refs
        allBatchesRef.current = batchesData;
        allAcademicYearsRef.current = extractedAcademicYears;
        allSemestersRef.current = extractedSemesters;

        setBatchOptions(batchesData.map(b => ({ value: b.batch_id, label: b.batch_name })));
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }

    // Fetch Subjects
    try {
      const response = await contentService.getSubjectbyProgramId(gradeId);
      const subjects = response.filter(s => !s.is_deleted)
        .map(s => ({ subject_id: s.subject_id, name: s.subject_name || s.name }));
      setSubjectOptions(subjects);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setSubjectOptions([]);
    }
  };

  const handleBatchChange = (batchId, setFieldValue) => {
    setSelectedBatch(batchId);
    setFieldValue('batch_id', batchId);
    setFieldValue('academic_year_id', '');
    setFieldValue('semester_id', '');
    setFieldValue('grade_division_id', '');

    // Filter AYs
    const filteredAYs = allAcademicYearsRef.current.filter(ay => ay.batchId == batchId);
    const uniqueAYs = filteredAYs.filter((ay, index, self) =>
      index === self.findIndex(a => a.academic_year_id === ay.academic_year_id)
    );
    setAcademicYearOptions(uniqueAYs.map(ay => ({ value: ay.academic_year_id, label: ay.name })));
    setSemesterOptions([]);
    setDivisionOptions([]);
  };

  const handleAcademicYearChange = (ayId, setFieldValue) => {
    setSelectedAcademicYear(ayId);
    setFieldValue('academic_year_id', ayId);
    setFieldValue('semester_id', '');
    setFieldValue('grade_division_id', '');

    // Filter Semesters
    const filteredSems = allSemestersRef.current.filter(s => s.academicYearId == ayId);
    setSemesterOptions(filteredSems.map(s => ({ value: s.semester_id, label: s.semester_name })));
    setDivisionOptions([]);
  };

  const handleSemesterChange = (semId, setFieldValue) => {
    setSelectedSemester(semId);
    setFieldValue('semester_id', semId);
    setFieldValue('grade_division_id', '');

    // Extract Divisions
    const selectedSemObj = allSemestersRef.current.find(s => s.semester_id == semId);
    if (selectedSemObj && selectedSemObj.divisions) {
      setDivisionOptions(selectedSemObj.divisions.map(d => ({
        grade_division_id: d.division_id,
        name: d.division_name
      })));
    } else {
      setDivisionOptions([]);
    }
  };

  const handleDivisionChange = (divisionId, setFieldValue) => {
    setSelectedDivision(divisionId);
    if (!divisionId) {
      setFieldValue('grade_division_id', '');
      return;
    }

    if (divisionId === 'All') {
      setFieldValue('grade_division_id', 'All');
    } else {
      setFieldValue('grade_division_id', divisionId);
    }
  };

  const handleSubjectChange = async (subjectId, setFieldValue) => {
    setSelectedSubject(subjectId);
    setFieldValue('subject_id', subjectId);
    setFieldValue('chapter_id', '');
    setFieldValue('topic_id', '');
    setChapterOptions([]);
    setTopicOptions([]);

    if (subjectId) {
      try {
        const response = await contentService.getModulesbySubject(subjectId);
        const modules = Array.isArray(response) ? response : (response?.modules || []);
        setChapterOptions(modules.map(m => ({
          chapter_id: m.module_id,
          label: m.module_name,
          units: m.units || []
        })));
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    }
  };

  const handleChapterChange = (chapterId, setFieldValue) => {
    setSelectedChapter(chapterId);
    setFieldValue('chapter_id', chapterId);
    setFieldValue('topic_id', '');

    if (chapterId) {
      const module = chapterOptions.find(m => m.chapter_id === chapterId);
      if (module && module.units) {
        setTopicOptions(module.units.map(u => ({
          topic_id: u.unit_id,
          label: u.unit_name
        })));
      }
    }
  };

  const handleTopicChange = (topicId, setFieldValue) => {
    setSelectedTopic(topicId);
    setFieldValue('topic_id', topicId);
  };

  const handleRubricTypeChange = async (type, setFieldValue) => {
    setFieldValue('rubric_type', type);
    setFieldValue('rubric_id', '');
    setFieldValue('rubric_name', '');
    setRubricType(type);
    setRubrics([]);

    if (type && collegeId) {
      try {
        const res = await RubricService.getRubricsByCollegeAndType(collegeId, type);

        setRubrics(res || []);
      } catch (error) {
        console.error('❌ Error fetching rubrics:', error);
      }
    } else {
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required('Please enter the Assessment Title'),
    grade: Yup.string().trim().required('Please select the Program'),
    batch_id: Yup.string().trim().required('Please select Batch'),
    academic_year_id: Yup.string().trim().required('Please select Academic Year'),
    semester_id: Yup.string().trim().required('Please select Semester'),
    grade_division_id: Yup.string().trim().required('Please select the Division'),
    subject_id: Yup.string().trim().required('Please select the Subject'),
    chapter_id: Yup.string().trim(), // Module - Optional for external? Or required? 
    topic_id: Yup.string().trim(),   // Unit - Optional
    test_category: Yup.string().trim().required('Please select the Category'),
    assessment_type: Yup.string().required('Please select Assessment Type'),
    rubric_type: Yup.string().when('assessment_type', {
      is: (val) => val?.startsWith('RUBRIC'),
      then: (schema) => schema.required('Please select Rubric Type'),
      otherwise: (schema) => schema.notRequired(),
    }),
    min_marks: Yup.number().required('Please enter the Passing Threshold').min(0),
    max_marks: Yup.number()
      .required('Please enter the Total Marks')
      .min(Yup.ref('min_marks'), 'Total Marks must be greater than Passing Threshold'),
    date_time: Yup.string().required('Please select a valid date and time'),
    time_limit: Yup.number().required('Please enter time limit').min(1),
  });

  const formatDateForInput = (date) => {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DDTHH:mm');
  };

  const getMinDate = () => {
    return formatDateForInput(new Date());
  };

  return (

    <Formik
      initialValues={{
        title: title,
        grade: selectedGrade,
        batch_id: selectedBatch,
        academic_year_id: selectedAcademicYear,
        semester_id: selectedSemester,
        grade_division_id: selectedDivision,
        subject_id: selectedSubject,
        chapter_id: selectedChapter,
        topic_id: selectedTopic,
        test_category: assessmentData?.category ? (assessmentData.category.charAt(0).toUpperCase() + assessmentData.category.slice(1).toLowerCase()) : '',
        assessment_type: assessmentType,
        rubric_type: assessmentData?.rubric_type || rubricType,
        rubric_id: assessmentData?.rubric_id || '',
        rubric_name: assessmentData?.rubric_name || '',
        min_marks: assessmentData?.min_marks || '',
        max_marks: assessmentData?.max_marks || '',
        question_image: assessmentData?.questions?.[0]?.question_image || '',
        question_image_name: assessmentData?.questions?.[0]?.question_image_name || '',
        date_time: formatDateForInput(testDate),
        test_last_date: formatDateForInput(testLastDate),
        time_limit: assessmentData?.time_limit_minutes || 90,
        int_ext_type: 'External',
        mode: mode,
      }}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          setSubmitting(true);

          const selectedSubjectObj = subjectOptions.find(s => s.subject_id == values.subject_id);
          const selectedModuleObj = chapterOptions.find(c => c.chapter_id == values.chapter_id);
          const selectedTopicObj = topicOptions.find(t => t.topic_id == values.topic_id);

          const payload = {
            college_id: parseInt(collegeId),
            mode: values.mode,
            academic_year_id: parseInt(values.academic_year_id),
            batch_id: parseInt(values.batch_id),
            program_id: parseInt(values.grade),
            semester_id: parseInt(values.semester_id),
            division_id: values.grade_division_id ? parseInt(values.grade_division_id) : null,

            subject_id: parseInt(values.subject_id),
            subject_name: selectedSubjectObj?.name || '',

            module_id: values.chapter_id ? parseInt(values.chapter_id) : null,
            module_name: selectedModuleObj?.label || '',
            unit_id: values.topic_id ? parseInt(values.topic_id) : null,
            unit_name: selectedTopicObj?.label || '',

            title: values.title,
            type: (() => {
              const map = {
                'STANDARD_GENERAL': 'STANDARD',
                'STANDARD_BL_CO': 'STANDARD_BL_CO',
                'RUBRIC_STANDARD': 'RUBRIC',
                'RUBRIC_BL_CO': 'RUBRIC_BL_CO'
              };
              return map[values.assessment_type] || 'STANDARD';
            })(),
            category: values.test_category?.toUpperCase() || "EXTERNAL",
            status: "DRAFT",

            test_start_datetime: moment(values.date_time).format("YYYY-MM-DDTHH:mm:ss"),
            test_end_datetime: moment(values.test_last_date).format("YYYY-MM-DDTHH:mm:ss"),
            time_limit_minutes: parseInt(values.time_limit),
            assessment_id: assessmentData ? parseInt(assessmentData.assessment_id || assessmentData.id) : undefined,

            rubric_id: values.rubric_id ? parseInt(values.rubric_id) : null,
            min_marks: parseInt(values.min_marks),
            max_marks: parseInt(values.max_marks),

            // Map single image to questions array
            questions: values.question_image ? [{
              question_image: values.question_image
            }] : []
          };

          console.log(assessmentData ? "Updating External Assessment:" : "Submitting External Assessment:", payload);
          if (assessmentData) {
            await AssessmentService.updateAssessment(assessmentData.assessment_id || assessmentData.id, payload);
            showSuccessModal && showSuccessModal(true, 'Assessment updated successfully!');
          } else {
            await AssessmentService.createAssessment(payload);
            showSuccessModal && showSuccessModal(true, 'Assessment added successfully!');
          }
          resetForm();
        } catch (error) {
          console.error(error);
          showWarningModal && showWarningModal(true, 'Failed to add assessment');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {
        // CustomDropdown component
        const CustomDropdown = ({ fieldName, label, value, options, placeholder = '', required = false, onChangeCallback }) => {
          // Helper to get option value
          const getOptValue = (opt) => {
            if (typeof opt === 'string') return opt;
            return opt.value ?? opt.grade_id ?? opt.subject_id ?? opt.chapter_id ?? opt.topic_id ?? opt.grade_division_id ?? opt.class_id;
          };

          // Helper to get option label
          const getOptLabel = (opt) => {
            if (typeof opt === 'string') return opt;
            return opt.label ?? opt.name ?? opt.division?.name;
          };

          // Find selected option to display label
          const selectedOption = options.find(opt => {
            return getOptValue(opt) == value;
          });

          return (
            <div ref={el => dropdownRefs.current[fieldName] = el} className="relative">
              <label className="block font-medium mb-1 text-gray-700">
                {label}{required && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md min-h-[40px] flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 ${errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-gray-300'
                  }`}
                onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
              >
                <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedOption ? getOptLabel(selectedOption) : placeholder}
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
                    const optValue = getOptValue(option);
                    const optLabel = getOptLabel(option);
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
        };
        const isRubricAssessment = values.assessment_type?.startsWith('RUBRIC');

        useEffect(() => {
          if (!isRubricAssessment) {
            setFieldValue('rubric_type', '');
            setFieldValue('rubric_id', '');
            setFieldValue('rubric_name', '');
          }
        }, [values.assessment_type]);

        // Auto-calculate Test End Date
        useEffect(() => {
          if (values.date_time && values.time_limit) {
            const startDate = new Date(values.date_time);
            const limit = parseInt(values.time_limit);
            if (!isNaN(startDate.getTime()) && !isNaN(limit)) {
              const endDate = new Date(startDate.getTime() + limit * 60000);
              const formattedEnd = formatDateForInput(endDate);
              if (values.test_last_date !== formattedEnd) {
                setFieldValue('test_last_date', formattedEnd);
                setTestLastDate(endDate);
              }
            }
          }
        }, [values.date_time, values.time_limit]);

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
                  value={values.title}
                  onChange={(e) => {
                    handleChange(e);
                    setTitle(e.target.value);
                  }}
                  className={`w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 ${errors.title && touched.title ? 'text-red-600' : ''
                    }`}
                />
                {errors.title && touched.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Program, Batch, Academic Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="grade"
                label="Program"
                value={values.grade}
                options={hookOptions.programs}
                placeholder="Select Program"
                required
                onChangeCallback={(val) => {
                  handleGradeChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="batch_id"
                label="Batch"
                value={values.batch_id}
                options={batchOptions}
                placeholder="Select Batch"
                required
                onChangeCallback={(val) => {
                  handleBatchChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="academic_year_id"
                label="Academic Year"
                value={values.academic_year_id}
                options={academicYearOptions}
                placeholder="Select Academic Year"
                required
                onChangeCallback={(val) => {
                  handleAcademicYearChange(val, setFieldValue);
                }}
              />
            </div>

            {/* Semester, Division, Subject */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="semester_id"
                label="Semester"
                value={values.semester_id}
                options={semesterOptions}
                placeholder="Select Semester"
                required
                onChangeCallback={(val) => {
                  handleSemesterChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="grade_division_id"
                label="Division"
                value={values.grade_division_id}
                options={divisionOptions.length ? divisionOptions.map(d => ({ value: d.grade_division_id, label: d.name })) : [{ label: 'All', value: 'All' }]}
                placeholder="Select Division"
                required
                onChangeCallback={(val) => {
                  handleDivisionChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="subject_id"
                label={userRole?.userRole === 'ADMIN' ? 'Paper' : 'Subject'}
                value={values.subject_id}
                options={subjectOptions}
                placeholder={userRole?.userRole === 'ADMIN' ? 'Select Paper' : 'Select Subject'}
                required
                onChangeCallback={(val) => {
                  handleSubjectChange(val, setFieldValue);
                }}
              />
            </div>

            {/* Module, Unit, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="chapter_id"
                label="Module"
                value={values.chapter_id}
                options={chapterOptions}
                placeholder="Select Module"
                onChangeCallback={(val) => {
                  handleChapterChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="topic_id"
                label="Unit"
                value={values.topic_id}
                options={topicOptions}
                placeholder="Select Unit"
                onChangeCallback={(val) => {
                  handleTopicChange(val, setFieldValue);
                }}
              />

              <CustomDropdown
                fieldName="test_category"
                label="Category"
                value={values.test_category}
                options={['Objective', 'Subjective',]}
                placeholder="Select Category"
                required
                onChangeCallback={(val) => {
                  setFieldValue('test_category', val);
                }}
              />
            </div>

            {/* Mode Selection Removed - Handled via Tabs */}

            {/* Assessment Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative">
                <label className="block font-medium mb-1 text-gray-700">
                  Assessment Type <span className="text-red-500">*</span>
                </label>

                {/* Dropdown Button */}
                <div
                  className="w-full px-3 py-2.5 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                  onClick={() => setAssessmentOpen(!assessmentOpen)}
                >
                  <span className={values.assessment_type && ASSESSMENT_TYPE_MAP[values.assessment_type] ? 'text-gray-900' : 'text-gray-400'}>
                    {values.assessment_type && ASSESSMENT_TYPE_MAP[values.assessment_type]
                      ? ASSESSMENT_TYPE_MAP[values.assessment_type]
                      : 'Select Assessment Type'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {/* Dropdown */}
                {assessmentOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg">

                    {/* STANDARD */}
                    <div
                      className="relative px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                      onMouseEnter={() => setHoveredParent('STANDARD')}
                      onMouseLeave={() => setHoveredParent(null)}
                    >
                      <span>Standard</span>
                      <ChevronDown className="w-4 h-4 -rotate-90" />

                      {hoveredParent === 'STANDARD' && (
                        <div className="absolute left-full top-0 ml-1 w-56 bg-white border rounded-md shadow-lg">
                          <div
                            className="px-4 py-2 hover:bg-blue-50"
                            onClick={() => {
                              setFieldValue('assessment_type', 'STANDARD_GENERAL');
                              setAssessmentOpen(false);
                            }}
                          >
                            General
                          </div>
                          <div
                            className="px-4 py-2 hover:bg-blue-50"
                            onClick={() => {
                              setFieldValue('assessment_type', 'STANDARD_BL_CO');
                              setAssessmentOpen(false);
                            }}
                          >
                            General with BL & CO
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RUBRIC */}
                    {values.test_category !== 'Objective' && (
                      <div
                        className="relative px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                        onMouseEnter={() => setHoveredParent('RUBRIC')}
                        onMouseLeave={() => setHoveredParent(null)}
                      >
                        <span>Rubric</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />

                        {hoveredParent === 'RUBRIC' && (
                          <div className="absolute left-full top-0 ml-1 w-56 bg-white border rounded-md shadow-lg">
                            <div
                              className="px-4 py-2 hover:bg-blue-50"
                              onClick={() => {
                                setFieldValue('assessment_type', 'RUBRIC_STANDARD');
                                setAssessmentOpen(false);
                              }}
                            >
                              Standard Rubric
                            </div>
                            <div
                              className="px-4 py-2 hover:bg-blue-50"
                              onClick={() => {
                                setFieldValue('assessment_type', 'RUBRIC_BL_CO');
                                setAssessmentOpen(false);
                              }}
                            >
                              Rubric with BL & CO
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
                {errors.assessment_type && touched.assessment_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.assessment_type}</p>
                )}
              </div>

              <div></div>
              <div></div>
            </div>

            {isRubricAssessment && (
              <CustomDropdown
                fieldName="rubric_type"
                label="Rubric Type"
                value={values.rubric_type}
                options={[
                  { value: 'ANALYTIC', label: 'Analytic Rubric (The "Detailed" approach)' },
                  { value: 'HOLISTIC', label: 'Holistic Rubric (The "Big Picture" approach)' },
                  { value: 'SINGLE_POINT', label: 'Single-Point Rubric (The "Feedback" approach)' },
                  { value: 'DEVELOPMENTAL', label: 'Developmental Rubric (The "Career Growth" approach)' },
                ]}
                placeholder="Select Rubric Type"
                required
                onChangeCallback={(val) => handleRubricTypeChange(val, setFieldValue)}
              />
            )}
            {isRubricAssessment && values.rubric_type && (
              <CustomDropdown
                fieldName="rubric_id"
                label="Rubric Name"
                value={values.rubric_id}
                options={rubrics.map(r => ({ value: r.rubric_id, label: r.rubric_name || r.title || r.name }))}
                placeholder="Select Rubric Name"
                required
                onChangeCallback={(val) => {
                  setFieldValue('rubric_id', val);
                  const selected = rubrics.find(r => r.rubric_id == val);
                  setFieldValue('rubric_name', selected ? (selected.rubric_name || selected.title || selected.name) : '');
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Test Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    name="date_time"
                    type="datetime-local"
                    min={getMinDate()}
                    className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.date_time && touched.date_time
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
                  Time Limit (Minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    name="time_limit"
                    type="number"
                    placeholder="Enter minutes (e.g. 90)"
                    min="1"
                    className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.time_limit && touched.time_limit
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

              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Test End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    name="test_last_date"
                    type="datetime-local"
                    min={getMinDate()}
                    onChange={(e) => {
                      handleChange(e);
                      setTestLastDate(new Date(e.target.value));
                    }}
                    className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.test_last_date && touched.test_last_date
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.min_marks && touched.min_marks
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
                  className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.max_marks && touched.max_marks
                    ? 'border-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {errors.max_marks && touched.max_marks && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_marks}</p>
                )}
              </div>
            </div>

            {/* Question Image Upload (Single) */}
            {!isRubricAssessment && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Paper / Image</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="question_image_upload"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const url = await uploadFileToS3(file);
                            setFieldValue('question_image', url);
                            setFieldValue('question_image_name', file.name);
                          } catch (err) {
                            console.error("Upload failed", err);
                            alert("Failed to upload image.");
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="question_image_upload"
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Question Image
                    </label>
                  </div>

                  {values.question_image && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm border border-blue-100">
                      <span className="truncate max-w-[200px]">{values.question_image_name || "Uploaded File"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue('question_image', '');
                          setFieldValue('question_image_name', '');
                        }}
                        className="text-blue-400 hover:text-red-500 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {values.question_image && (
                  <div className="mt-2 text-xs text-gray-500">
                    File uploaded successfully. This will be attached to the assessment.
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-all ${isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{assessmentData ? 'Updating...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>{assessmentData ? 'Update Assessment' : 'Create Assessment'}</span>
                  </>
                )}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik >

  );
};

export default AddExternalAssessment;