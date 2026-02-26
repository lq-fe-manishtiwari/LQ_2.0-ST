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
import { useLocation, useNavigate } from 'react-router-dom';

// Services
import { collegeService } from '../../Academics/Services/college.service';
import { contentService } from '../../Content/services/content.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import { AssessmentService } from '../Services/assessment.service';
import { QuestionsService } from '../Services/questions.service.js';
import { RubricService } from '../Settings/Service/rubric.service';

const EditAssessment = ({ showSuccessModal, showWarningModal, userRole }) => {
  const { userID, userRole: contextUserRole } = useUserProfile();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id;

  const navigate = useNavigate();
  const location = useLocation();
  // Get assessment data from location state or we might need to fetch it if refreshing
  const initialAssessmentData = location.state?.assessmentData;

  // ── Separate state for dates so they are never affected by Formik re-renders ──
  const [testStartDate, setTestStartDate] = useState('');
  const [testEndDate, setTestEndDate] = useState('');

  const [state, setState] = useState({
    grades: [],
    batches: [],
    academicYears: [],
    semesters: [],
    divisions: [],
    subjects: [],
    chapters: [],
    topics: [],
    questions: [],
    filteredQuestions: [],

    selectedGrade: '',
    selectedBatch: '',
    selectedAcademicYear: '',
    selectedSemester: '',
    selectedDivision: '',
    selectedSubject: '',
    selectedChapter: '',
    selectedTopic: '',

    selectedTestCategory: 'Objective',
    assessmentType: 'Standard',
    rubricType: '',
    timeLimit: '',
    mode: 'ONLINE',

    noOfQuestions: 0,
    noOfEasy: 0,
    noOfMedium: 0,
    noOfHard: 0,
    loadingQuestions: false,

    isInitializing: true,
    rubrics: [],
  });

  // Helper refs for filtering
  const allBatchesRef = useRef([]);
  const allAcademicYearsRef = useRef([]);
  const allSemestersRef = useRef([]);
  const dropdownRefs = useRef({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState(null);

  // 1. Fetch Assessment Details on Mount (if not fully present or to be safe)
  useEffect(() => {
    const init = async () => {
      if (!collegeId) return;

      try {
        // A. Load Programs (Grades)
        let programsData = [];
        const role = contextUserRole || userRole?.userRole;
        if (role === "SUPERADMIN") {
          const storedPrograms = localStorage.getItem("college_programs");
          if (storedPrograms) programsData = JSON.parse(storedPrograms);
          else programsData = await collegeService.getProgrambyUserIdandCollegeId(userID, collegeId);
        } else {
          programsData = await collegeService.getProgrambyUserIdandCollegeId(userID, collegeId);
        }

        const formattedGrades = programsData.map(p => ({
          grade_id: p.program_id,
          name: p.program_name || p.name
        }));

        // B. If we have assessment data, start the cascade
        if (initialAssessmentData) {
          // Need the full object usually. If id exists, fetch full details just in case
          const fullAssessment = await AssessmentService.getAssessmentById(initialAssessmentData.id || initialAssessmentData.assessment_id);
          const ad = fullAssessment || initialAssessmentData;

          console.log("Initializing Edit with:", ad);

          // B1. Fetch Batches for the program
          const batchRes = await batchService.getBatchByProgramId([ad.program_id]);
          const batchesData = Array.isArray(batchRes) ? batchRes : [];

          // Process Batches/AY/Semesters structure
          const extractedAcademicYears = [];
          const extractedSemesters = [];
          batchesData.forEach(batch => {
            if (batch.academic_years && Array.isArray(batch.academic_years)) {
              batch.academic_years.forEach(ay => {
                extractedAcademicYears.push({
                  academic_year_id: ay.academic_year_id,
                  name: ay.name,
                  batchId: batch.batch_id,
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

          allBatchesRef.current = batchesData;
          allAcademicYearsRef.current = extractedAcademicYears;
          allSemestersRef.current = extractedSemesters;

          // B2. Fetch Subjects
          const subjectRes = await contentService.getSubjectbyProgramId(ad.program_id);
          const subjects = subjectRes.filter(s => !s.is_deleted)
            .map(s => ({ subject_id: s.subject_id, name: s.subject_name || s.name }));

          // B3. Fetch Modules (Chapters)
          let chapters = [];
          if (ad.subject_id) {
            const moduleRes = await contentService.getModulesbySubject(ad.subject_id);
            const modules = moduleRes?.modules || moduleRes || [];
            chapters = modules.map(m => ({
              chapter_id: m.module_id,
              label: m.module_name,
              units: m.units || []
            }));
          }

          // B4. Topics
          let topics = [];
          if (ad.module_id) {
            const selectedModule = chapters.find(c => c.chapter_id == ad.module_id);
            if (selectedModule) {
              topics = selectedModule.units.map(u => ({
                topic_id: u.unit_id,
                label: u.unit_name
              }));
            }
          }

          // B5. Determine available options for current selection
          const relevantAYs = extractedAcademicYears.filter(ay => ay.batchId == ad.batch_id)
            .filter((ay, i, self) => i === self.findIndex(a => a.academic_year_id === ay.academic_year_id));

          const relevantSems = extractedSemesters.filter(s => s.academicYearId == ad.academic_year_id);

          const selectedSemObj = extractedSemesters.find(s => s.semester_id == ad.semester_id);
          const divisions = selectedSemObj?.divisions?.map(d => ({
            grade_division_id: d.division_id,
            grade_division_obj_str: JSON.stringify({ grade_division_id: d.division_id }),
            division: { name: d.division_name }
          })) || [];

          // B6. Load All Questions for this filter
          const qFilters = {
            college_id: collegeId,
            program_id: ad.program_id,
            subject_id: ad.subject_id,
            module_id: ad.module_id,
            unit_id: ad.unit_id,
          };
          if (ad.category && ad.category !== 'MIXED') qFilters.category = ad.category.toUpperCase();

          let allQuestions = [];
          try {
            const qRes = await contentService.getAssessmentQuestionsByFilter(qFilters);
            const fetchedQs = Array.isArray(qRes) ? qRes : (qRes?.questions || []);

            // Map and Check existing questions
            const existingInfo = ad.questions || []; // Array of { question_id, ... }
            const existingIds = new Set(existingInfo.map(q => q.question_id));

            allQuestions = fetchedQs.map(q => {
              const opts = q.options || [];
              const levelName = q.question_level_name ? q.question_level_name.toUpperCase() : 'MEDIUM';
              return {
                ...q,
                question_id: q.question_id,
                question: q.question ? q.question.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "") : "",
                color_code: levelName === 'EASY' ? '#10b981' : levelName === 'MEDIUM' ? '#f59e0b' : '#ef4444',
                question_level: { question_level_type: levelName },
                default_weight_age: q.default_marks || q.default_weight_age || 1,
                option1: opts[0]?.option_text || '',
                option2: opts[1]?.option_text || '',
                option3: opts[2]?.option_text || '',
                option4: opts[3]?.option_text || '',
                isChecked: existingIds.has(q.question_id), // MARK CHECKED
                objective_subjective_type: q.question_category === 'OBJECTIVE' ? 'Objective' : 'Subjective'
              };
            });
          } catch (err) {
            console.error("Error loading questions init:", err);
          }

          // Calc Counts
          const counts = allQuestions.reduce((acc, q) => {
            if (q.isChecked) {
              acc.total++;
              if (q.question_level.question_level_type === 'EASY') acc.easy++;
              else if (q.question_level.question_level_type === 'MEDIUM') acc.medium++;
              else if (q.question_level.question_level_type === 'HARD') acc.hard++;
            }
            return acc;
          }, { total: 0, easy: 0, medium: 0, hard: 0 });


          // Set dates independently so Formik title edits never reset them
          setTestStartDate(ad.test_start_datetime ? moment(ad.test_start_datetime).format('YYYY-MM-DDTHH:mm') : '');
          setTestEndDate(ad.test_end_datetime ? moment(ad.test_end_datetime).format('YYYY-MM-DDTHH:mm') : '');

          setState({
            grades: formattedGrades,
            batches: batchesData.map(b => ({ value: b.batch_id, label: b.batch_name })),
            academicYears: relevantAYs.map(ay => ({ value: ay.academic_year_id, label: ay.name })),
            semesters: relevantSems.map(s => ({ value: s.semester_id, label: s.semester_name })),
            divisions: divisions,
            subjects: subjects,
            chapters: chapters,
            topics: topics,

            questions: allQuestions,
            filteredQuestions: allQuestions,

            selectedGrade: ad.program_id,
            selectedBatch: ad.batch_id,
            selectedAcademicYear: ad.academic_year_id,
            selectedSemester: ad.semester_id,
            selectedDivision: ad.division_id, // could be string if logic differs
            selectedSubject: ad.subject_id,
            selectedChapter: ad.module_id,
            selectedTopic: ad.unit_id,
            selectedTestCategory: ad.category ? (ad.category.charAt(0).toUpperCase() + ad.category.slice(1).toLowerCase()) : 'Objective',
            assessmentType: ad.type,

            dummy_date: null,
            timeLimit: ad.time_limit_minutes,

            noOfQuestions: counts.total,
            noOfEasy: counts.easy,
            noOfMedium: counts.medium,
            noOfHard: counts.hard,

            noOfMedium: counts.medium,
            noOfHard: counts.hard,
            mode: ad.mode || 'ONLINE', // Init from data

            isInitializing: false
          });

        } else {
          // Fallback if no assessment loaded
          setState(prev => ({ ...prev, grades: formattedGrades, isInitializing: false }));
        }

      } catch (error) {
        console.error("Error init edit:", error);
      }
    };

    init();
  }, [collegeId, userID]);

  const handleRubricTypeChange = async (type, setFieldValue) => {
    setFieldValue('rubric_type', type);
    setFieldValue('rubric_id', '');
    setFieldValue('rubric_name', '');
    setState(prev => ({ ...prev, rubricType: type, rubrics: [] }));

    if (type && collegeId) {
      try {
        const res = await RubricService.getRubricsByCollegeAndType(collegeId, type);
        setState(prev => ({ ...prev, rubrics: res || [] }));
      } catch (error) {
        console.error("Error fetching rubrics:", error);
      }
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

  const handleGradeChange = async (gradeId, setFieldValue) => {
    setState(prev => ({ ...prev, selectedGrade: gradeId, batches: [], academicYears: [], semesters: [], divisions: [], subjects: [], chapters: [], topics: [] }));
    setFieldValue('grade_id', gradeId); setFieldValue('batch_id', ''); setFieldValue('academic_year_id', ''); setFieldValue('semester_id', ''); setFieldValue('subject_id', '');

    try {
      const res = await batchService.getBatchByProgramId([gradeId]);
      const batchesData = Array.isArray(res) ? res : [];
      allBatchesRef.current = batchesData;
      const subjects = (await contentService.getSubjectbyProgramId(gradeId)).map(s => ({ subject_id: s.subject_id, name: s.subject_name || s.name }));

      setState(prev => ({ ...prev, batches: batchesData.map(b => ({ value: b.batch_id, label: b.batch_name })), subjects }));
    } catch (e) { console.error(e) }
  };

  const loadQuestions = async (setFieldValue, overrides = {}) => {
    const currentGrade = state.selectedGrade;
    const currentSubject = overrides.selectedSubject !== undefined ? overrides.selectedSubject : state.selectedSubject;
    const currentChapter = overrides.selectedChapter !== undefined ? overrides.selectedChapter : state.selectedChapter;
    const currentTopic = overrides.selectedTopic !== undefined ? overrides.selectedTopic : state.selectedTopic;
    const currentCategory = overrides.selectedTestCategory !== undefined ? overrides.selectedTestCategory : state.selectedTestCategory;

    if (!currentSubject) return;

    setState(prev => ({ ...prev, loadingQuestions: true }));
    try {
      const filters = {
        college_id: collegeId,
        program_id: currentGrade,
        subject_id: currentSubject,
        module_id: currentChapter,
        unit_id: currentTopic,
      };
      if (currentCategory && currentCategory !== 'Mixed') filters.category = currentCategory.toUpperCase();

      const res = await contentService.getAssessmentQuestionsByFilter(filters);
      const fetchedQuestions = Array.isArray(res) ? res : (res?.questions || []);

      const formatted = fetchedQuestions.map(q => {
        const levelName = q.question_level_name ? q.question_level_name.toUpperCase() : 'MEDIUM';
        return {
          ...q,
          isChecked: false, // Reset checked on new fetch? Yes usually.
          question_id: q.question_id,

          // ... simplistic mapping
          question: q.question ? q.question.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "") : "",
          color_code: levelName === 'EASY' ? '#10b981' : levelName === 'MEDIUM' ? '#f59e0b' : '#ef4444',
          question_level: { question_level_type: levelName },
          default_weight_age: q.default_marks || q.default_weight_age || 1,
        };
      });

      setState(prev => ({ ...prev, questions: formatted, filteredQuestions: formatted, loadingQuestions: false }));
    } catch (error) {
      console.error("Error loading questions", error);
      setState(prev => ({ ...prev, loadingQuestions: false }));
    }
  };


  const handleBatchChange = (batchId, setFieldValue) => {
    setFieldValue('batch_id', batchId);
    setFieldValue('academic_year_id', '');
    setFieldValue('semester_id', '');
    setFieldValue('grade_division', '');

    const filteredAYs = allAcademicYearsRef.current.filter(ay => ay.batchId == batchId);

    setState(prev => ({
      ...prev,
      selectedBatch: batchId,
      academicYears: filteredAYs.map(ay => ({ value: ay.academic_year_id, label: ay.name })),
      semesters: [],
      divisions: [],
      selectedAcademicYear: '',
      selectedSemester: '',
      selectedDivision: ''
    }));
  };

  const handleAcademicYearChange = (ayId, setFieldValue) => {
    setFieldValue('academic_year_id', ayId);
    setFieldValue('semester_id', '');
    setFieldValue('grade_division', '');

    const filteredSems = allSemestersRef.current.filter(s => s.academicYearId == ayId);

    setState(prev => ({
      ...prev,
      selectedAcademicYear: ayId,
      semesters: filteredSems.map(s => ({ value: s.semester_id, label: s.semester_name })),
      divisions: [],
      selectedSemester: '',
      selectedDivision: ''
    }));
  };

  const handleSemesterChange = (semId, setFieldValue) => {
    setFieldValue('semester_id', semId);
    setFieldValue('grade_division', '');

    // Extract Divisions from the selected semester from REF
    const selectedSemObj = allSemestersRef.current.find(s => s.semester_id == semId);
    let divisionsList = [];
    if (selectedSemObj && selectedSemObj.divisions) {
      divisionsList = selectedSemObj.divisions.map(d => ({
        grade_division_id: d.division_id,
        grade_division_obj_str: JSON.stringify({
          grade_division_id: d.division_id,
        }),
        division: { name: d.division_name }
      }));
    }

    setState(prev => ({
      ...prev,
      selectedSemester: semId,
      divisions: divisionsList,
      selectedDivision: ''
    }));
  };

  const handleDivisionChange = async (divisionObjStr, setFieldValue) => {
    if (!divisionObjStr) {
      setFieldValue('grade_division', '');
      return;
    }

    if (divisionObjStr === 'All') {
      setFieldValue('grade_division', 'All');
      setState(prev => ({ ...prev, selectedDivision: 'All' }));
    } else {
      const obj = typeof divisionObjStr === 'string' && divisionObjStr.startsWith('{') ? JSON.parse(divisionObjStr) : null;
      const divisionId = obj?.grade_division_id || divisionObjStr;

      setState(prev => ({ ...prev, selectedDivision: divisionId }));
      setFieldValue('grade_division', divisionObjStr);
    }
  };


  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    grade_id: Yup.string().required('Program is required'),
    // ... other validations
    test_date: Yup.date().required('Start date required'),
    test_last_date: Yup.date().required('End date required'),
    time_limit: Yup.number().required('Time limit required').min(1),
  });

  const ASSESSMENT_TYPE_MAP = {
    STANDARD: 'Standard',
    STANDARD_GENERAL: 'General',
    STANDARD_BL_CO: 'General with BL & CO',
    RUBRIC_STANDARD: 'Standard Rubric',
    RUBRIC_BL_CO: 'Rubric with BL & CO',
  };

  const handleAssessmentTypeChange = (type, setFieldValue) => {
    setFieldValue('assessment_type', type);
    if (!type.startsWith('RUBRIC')) {
      setFieldValue('rubric_type', '');
      setFieldValue('rubric_id', '');
      setFieldValue('rubric_name', '');
    }
    setAssessmentOpen(false);
  };

  if (state.isInitializing) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const CustomDropdown = ({ fieldName, label, value, options, placeholder, onChangeCallback, setFieldValue, errors, touched, openDropdown, setOpenDropdown, dropdownRef }) => (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">{label}</label>
      <div
        className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md flex justify-between items-center ${errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
        onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {options.find(o => (o.value ?? o.grade_id ?? o.subject_id ?? o.chapter_id ?? o.topic_id) == value)?.label
            ?? options.find(o => (o.value ?? o.grade_id ?? o.subject_id ?? o.chapter_id ?? o.topic_id) == value)?.name
            ?? options.find(o => (o.value ?? o.grade_id ?? o.subject_id ?? o.chapter_id ?? o.topic_id) == value)?.division?.name
            ?? placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      {openDropdown === fieldName && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => {
            const val = opt.value ?? opt.grade_id ?? opt.subject_id ?? opt.chapter_id ?? opt.topic_id;
            const lbl = opt.label ?? opt.name ?? opt.division?.name;
            return (
              <div key={val} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => {
                if (onChangeCallback) onChangeCallback(val);
                else setFieldValue(fieldName, val);
                setOpenDropdown(null);
              }}>
                {lbl}
              </div>
            )
          })}
        </div>
      )}
      {errors[fieldName] && touched[fieldName] && <p className="text-sm text-red-600 mt-1">{errors[fieldName]}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Assessment</h2>

      <Formik
        initialValues={{
          title: initialAssessmentData?.title || '',
          grade_id: state.selectedGrade,
          batch_id: state.selectedBatch,
          academic_year_id: state.selectedAcademicYear,
          semester_id: state.selectedSemester,
          grade_division: state.selectedDivision, // might need adjustment
          subject_id: state.selectedSubject,
          chapter_id: state.selectedChapter,
          topic_id: state.selectedTopic,
          test_category: state.selectedTestCategory,
          assessment_type: state.assessmentType,
          rubric_type: initialAssessmentData?.rubric_type || '',
          rubric_id: initialAssessmentData?.rubric_id || '',
          rubric_name: initialAssessmentData?.rubric_name || '',
          test_date: testStartDate,
          test_last_date: testEndDate,
          time_limit: state.timeLimit,
          mode: state.mode,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            const payload = {
              college_id: collegeId,
              title: values.title,
              mode: values.mode,
              // ... maintain IDs
              academic_year_id: values.academic_year_id,
              batch_id: values.batch_id,
              program_id: values.grade_id,
              semester_id: values.semester_id,
              division_id: values.grade_division === 'All' ? null : (typeof values.grade_division === 'string' && values.grade_division.startsWith('{') ? JSON.parse(values.grade_division)?.grade_division_id : values.grade_division),

              subject_id: values.subject_id,
              subject_name: state.subjects.find(s => s.subject_id == values.subject_id)?.name || '',

              module_id: values.chapter_id,
              module_name: state.chapters.find(c => c.chapter_id == values.chapter_id)?.label || '',

              unit_id: values.topic_id || null,
              unit_name: state.topics.find(t => t.topic_id == values.topic_id)?.label || '',

              type: values.assessment_type,
              category: values.test_category?.toUpperCase(),
              status: "DRAFT",

              test_start_datetime: testStartDate ? moment(testStartDate).format("YYYY-MM-DDTHH:mm:ss") : '',
              test_end_datetime: testEndDate ? moment(testEndDate).format("YYYY-MM-DDTHH:mm:ss") : '',
              time_limit_minutes: parseInt(values.time_limit),

              rubric_id: values.rubric_id || null,

              questions: state.filteredQuestions.filter(q => q.isChecked).map((q, index) => ({
                question_id: q.question_id,
                marks_override: q.default_weight_age,
                question_order: index + 1
              }))
            };

            console.log("Update Payload:", payload);
            await AssessmentService.updateAssessment(initialAssessmentData.id, payload);
            if (showSuccessModal) showSuccessModal(true, 'Assessment updated!');
            else alert("Assessment updated successfully!");
            navigate(-1); // Go back
          } catch (e) {
            console.error("Update failed", e);
            if (showWarningModal) showWarningModal(true, 'Failed to update');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assessment Title</label>
                  <Field name="title" className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                  {errors.title && touched.title && <div className="text-red-500 text-sm">{errors.title}</div>}
                </div>
              </div>
            </div>

            {/* Dropdowns Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomDropdown
                fieldName="grade_id" label="Program" value={values.grade_id}
                options={state.grades}
                onChangeCallback={(val) => handleGradeChange(val, setFieldValue)}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['grade_id'] = el}
              />
              <CustomDropdown
                fieldName="batch_id" label="Batch" value={values.batch_id}
                options={state.batches}
                onChangeCallback={(val) => handleBatchChange(val, setFieldValue)}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['batch_id'] = el}
              />
              <CustomDropdown
                fieldName="academic_year_id" label="Academic Year" value={values.academic_year_id}
                options={state.academicYears}
                onChangeCallback={(val) => handleAcademicYearChange(val, setFieldValue)}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['academic_year_id'] = el}
              />
            </div>

            {/* Dropdowns Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomDropdown
                fieldName="semester_id" label="Semester" value={values.semester_id}
                options={state.semesters}
                onChangeCallback={(val) => handleSemesterChange(val, setFieldValue)}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['semester_id'] = el}
              />
              <CustomDropdown
                fieldName="grade_division" label="Division" value={values.grade_division}
                options={state.divisions.length ? state.divisions : [{ label: 'All', value: 'All' }]}
                onChangeCallback={(val) => handleDivisionChange(val, setFieldValue)}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['grade_division'] = el}
              />
              <CustomDropdown
                fieldName="subject_id" label="Subject" value={values.subject_id}
                options={state.subjects}
                onChangeCallback={async (val) => {
                  setFieldValue('subject_id', val);
                  setFieldValue('chapter_id', '');
                  setFieldValue('topic_id', '');
                  setState(prev => ({ ...prev, selectedSubject: val, chapters: [], topics: [] }));
                  try {
                    const response = await contentService.getModulesbySubject(val);
                    const modules = response?.modules || response || [];
                    setState(prev => ({
                      ...prev,
                      chapters: modules.map(m => ({ chapter_id: m.module_id, label: m.module_name, units: m.units || [] }))
                    }));
                  } catch (e) { console.error(e) }
                  loadQuestions(setFieldValue, { selectedSubject: val, selectedChapter: '', selectedTopic: '' });
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['subject_id'] = el}
              />
            </div>

            {/* Dropdowns Row 3 - Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomDropdown
                fieldName="chapter_id" label="Module" value={values.chapter_id}
                options={state.chapters}
                onChangeCallback={(val) => {
                  setFieldValue('chapter_id', val);
                  setFieldValue('topic_id', '');
                  const selectedModule = state.chapters.find(c => c.chapter_id == val);
                  setState(prev => ({
                    ...prev,
                    selectedChapter: val,
                    topics: selectedModule?.units?.map(u => ({ topic_id: u.unit_id, label: u.unit_name })) || [],
                    selectedTopic: ''
                  }));
                  loadQuestions(setFieldValue, { selectedChapter: val, selectedTopic: '' });
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['chapter_id'] = el}
              />
              <CustomDropdown
                fieldName="topic_id" label="Unit" value={values.topic_id}
                options={state.topics}
                onChangeCallback={(val) => {
                  setFieldValue('topic_id', val);
                  setState(prev => ({ ...prev, selectedTopic: val }));
                  loadQuestions(setFieldValue, { selectedTopic: val });
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['topic_id'] = el}
              />
              <CustomDropdown
                fieldName="test_category" label="Category" value={values.test_category}
                options={[{ label: 'Objective', value: 'Objective' }, { label: 'Subjective', value: 'Subjective' }]}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['test_category'] = el}
              />
            </div>


            {/* Assessment Type & Rubrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block font-medium mb-1 text-gray-700">Assessment Type</label>
                <div
                  className="w-full px-3 py-2.5 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                  onClick={() => setAssessmentOpen(!assessmentOpen)}
                >
                  <span className={values.assessment_type ? 'text-gray-900' : 'text-gray-400'}>
                    {ASSESSMENT_TYPE_MAP[values.assessment_type] || 'Select Assessment Type'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                {assessmentOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg">
                    <div
                      className="relative px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                      onMouseEnter={() => setHoveredParent('STANDARD')}
                      onMouseLeave={() => setHoveredParent(null)}
                    >
                      <span>Standard</span>
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                      {hoveredParent === 'STANDARD' && (
                        <div className="absolute left-full top-0 ml-1 w-56 bg-white border rounded-md shadow-lg">
                          <div className="px-4 py-2 hover:bg-blue-50" onClick={() => handleAssessmentTypeChange('STANDARD_GENERAL', setFieldValue)}>General</div>
                          <div className="px-4 py-2 hover:bg-blue-50" onClick={() => handleAssessmentTypeChange('STANDARD_BL_CO', setFieldValue)}>General with BL & CO</div>
                        </div>
                      )}
                    </div>
                    <div
                      className="relative px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                      onMouseEnter={() => setHoveredParent('RUBRIC')}
                      onMouseLeave={() => setHoveredParent(null)}
                    >
                      <span>Rubric</span>
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                      {hoveredParent === 'RUBRIC' && (
                        <div className="absolute left-full top-0 ml-1 w-56 bg-white border rounded-md shadow-lg">
                          <div className="px-4 py-2 hover:bg-blue-50" onClick={() => handleAssessmentTypeChange('RUBRIC_STANDARD', setFieldValue)}>Standard Rubric</div>
                          <div className="px-4 py-2 hover:bg-blue-50" onClick={() => handleAssessmentTypeChange('RUBRIC_BL_CO', setFieldValue)}>Rubric with BL & CO</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div></div>
              <div></div>
            </div>

            {values.assessment_type?.startsWith('RUBRIC') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomDropdown
                  fieldName="rubric_type" label="Rubric Type" value={values.rubric_type}
                  options={[
                    { value: 'ANALYTIC', label: 'Analytic Rubric' },
                    { value: 'HOLISTIC', label: 'Holistic Rubric' },
                    { value: 'SINGLE_POINT', label: 'Single-Point Rubric' },
                    { value: 'DEVELOPMENTAL', label: 'Developmental Rubric' },
                  ]}
                  onChangeCallback={(val) => handleRubricTypeChange(val, setFieldValue)}
                  setFieldValue={setFieldValue} errors={errors} touched={touched}
                  openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['rubric_type'] = el}
                />
                {values.rubric_type && (
                  <CustomDropdown
                    fieldName="rubric_id" label="Rubric Name" value={values.rubric_id}
                    options={state.rubrics.map(r => ({ value: r.rubric_id, label: r.title || r.name }))}
                    onChangeCallback={(val) => {
                      setFieldValue('rubric_id', val);
                      const selected = state.rubrics.find(r => r.rubric_id == val);
                      setFieldValue('rubric_name', selected ? (selected.title || selected.name) : '');
                    }}
                    setFieldValue={setFieldValue} errors={errors} touched={touched}
                    openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} dropdownRef={el => dropdownRefs.current['rubric_id'] = el}
                  />
                )}
              </div>
            )}

            {/* Dates & Time — bound to independent state, not Formik, so title edits won't reset them */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={testStartDate}
                  onChange={(e) => setTestStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  value={testEndDate}
                  onChange={(e) => setTestEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Limit (mins)</label>
                <Field name="time_limit" type="number" className="mt-1 w-full border border-gray-300 rounded-md p-2" />
              </div>
            </div>

            {/* Questions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Questions</h3>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded mb-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className="rounded" />
                  <span>Select All</span>
                </label>
                <div className="text-sm">Selected: {state.noOfQuestions}</div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {state.filteredQuestions.map(q => (
                  <div key={q.question_id} className={`flex items-start space-x-3 p-3 border rounded ${q.isChecked ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <input
                      type="checkbox"
                      checked={q.isChecked}
                      onChange={(e) => handleQuestionSelect(q.question_id, e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: q.color_code }}>{q.question_level.question_level_type}</span>
                        <span className="text-xs text-gray-500">Marks: {q.default_weight_age}</span>
                      </div>
                      <p className="text-sm font-medium">{q.question}</p>
                    </div>
                  </div>
                ))}
                {state.filteredQuestions.length === 0 && <div className="text-center text-gray-500">No questions found for the selected filters.</div>}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Assessment'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditAssessment;