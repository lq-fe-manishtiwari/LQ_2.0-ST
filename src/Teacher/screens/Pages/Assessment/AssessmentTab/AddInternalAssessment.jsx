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


import { contentService } from '../../Content/services/content.service';
import { contentService as addContentService } from '../../Content/services/AddContent.service.js';
import { getTeacherAllocatedPrograms } from '../../../../../_services/api.js';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { useAssessmentFormLogic } from '../hooks/useAssessmentFormLogic';
import { AssessmentService } from '../Services/assessment.service';
import { QuestionsService } from '../Services/questions.service.js';
import { RubricService } from '../Settings/Service/rubrics.service.js';

const AddInternalAssessment = ({ grade, nba, currentUser, showSuccessModal, showWarningModal, userRole, mode: propMode, assessmentData }) => {
  const { userID, userRole: contextUserRole, getTeacherId } = useUserProfile();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id;

  const [state, setState] = useState({
    grades: [],
    batches: [], // New
    academicYears: [], // New
    semesters: [], // New
    divisions: [],
    subjects: [],
    chapters: [],
    topics: [],
    questions: [],
    filteredQuestions: [],

    selectedGrade: '',
    selectedBatch: '', // New
    selectedAcademicYear: '', // New
    selectedSemester: '', // New
    selectedDivision: '',
    selectedSubject: '',
    selectedChapter: '',
    selectedTopic: '',

    selectedTestCategory: 'Objective',
    assessmentType: 'STANDARD_GENERAL',
    rubricType: '',
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
    mode: propMode || 'ONLINE', // Default mode from props
    rubrics: [], // Added for real rubrics
  });

  // Hook integration (for programs, academicSemesters, batches, subjects only)
  const formData = {
    selectedProgram: state.selectedGrade,
    selectedAcademicSemester: state.selectedAcademicYear && state.selectedSemester ? `${state.selectedAcademicYear}-${state.selectedSemester}` : '',
    selectedBatch: state.selectedBatch,
    selectedSubject: state.selectedSubject
  };

  const { options, loading: hookLoading } = useAssessmentFormLogic(formData);

  // ── Local states (ObjectiveQuestion.jsx approach) ──
  const [allocationData, setAllocationData] = useState(null);
  const [localDivisions, setLocalDivisions] = useState([]);
  const [localModules, setLocalModules] = useState([]);
  const [localUnits, setLocalUnits] = useState([]);

  // dropdown control
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const [hoveredType, setHoveredType] = useState(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState(null);

  // ── ObjectiveQuestion-style: load allocationData once ──
  useEffect(() => {
    const teacherId = getTeacherId();
    if (!teacherId) return;
    getTeacherAllocatedPrograms(teacherId).then(res => {
      if (res.success && res.data) setAllocationData(res.data);
    }).catch(console.error);
  }, []);

  // ── Divisions from allocationData (exact ObjectiveQuestion logic) ──
  useEffect(() => {
    if (!state.selectedGrade || !state.selectedBatch || !state.selectedSemester || !allocationData) {
      setLocalDivisions([]);
      return;
    }
    const progId = parseInt(state.selectedGrade);
    const batchId = parseInt(state.selectedBatch);
    const semId = parseInt(state.selectedSemester);
    const all = [...(allocationData.class_teacher_allocation || []), ...(allocationData.normal_allocation || [])];
    const map = new Map();
    all.filter(a =>
      (a.program?.program_id || a.program_id) === progId &&
      (a.batch?.batch_id || a.batch_id) === batchId &&
      (a.semester?.semester_id || a.semester_id) === semId
    ).forEach(a => {
      if (a.division) map.set(a.division.division_id, { id: String(a.division.division_id), name: a.division.division_name });
    });
    setLocalDivisions(Array.from(map.values()));
  }, [state.selectedGrade, state.selectedBatch, state.selectedSemester, allocationData]);

  // Fetch Programs (Grades) & Initialize Edit Mode
  useEffect(() => {
    const loadInitialData = async () => {
      if (!collegeId) return;

      // --- EDIT MODE INITIALIZATION ---
      if (assessmentData) {
        const ad = assessmentData;
        console.log("Initializing AddInternalAssessment in EDIT mode:", ad);

        setState(prev => ({
          ...prev,
          selectedGrade: ad.program_id,
          selectedBatch: ad.batch_id,
          selectedAcademicYear: ad.academic_year_id,
          selectedSemester: ad.semester_id,
          selectedDivision: ad.division_id,
          selectedSubject: ad.subject_id,
          selectedChapter: ad.module_id,
          selectedTopic: ad.unit_id,
          selectedTestCategory: ad.category ? (ad.category.charAt(0).toUpperCase() + ad.category.slice(1).toLowerCase()) : 'Objective',
          assessmentType: ad.type,
          testDate: ad.test_start_datetime ? new Date(ad.test_start_datetime) : prev.testDate,
          testLastDate: ad.test_end_datetime ? new Date(ad.test_end_datetime) : prev.testLastDate,
          timeLimit: ad.time_limit_minutes || '',
          mode: ad.mode || prev.mode,
          rubricType: ad.rubric_type || '',
          rubricId: ad.rubric_id || '',
          rubricName: ad.rubric_name || ''
        }));

        // Load Questions and Mark existing ones
        const qFilters = {
          college_id: collegeId,
          program_id: ad.program_id,
          subject_id: ad.subject_id,
          module_id: ad.module_id,
          unit_id: ad.unit_id,
        };
        if (ad.category && ad.category !== 'MIXED') qFilters.category = ad.category.toUpperCase();

        try {
          const qRes = await contentService.getAssessmentQuestionsByFilter(qFilters);
          const fetchedQs = Array.isArray(qRes) ? qRes : (qRes?.questions || []);
          const existingIds = new Set((ad.questions || []).map(q => q.question_id));

          const formatted = fetchedQs.map(q => {
            const levelName = q.question_level_name ? q.question_level_name.toUpperCase() : 'MEDIUM';
            return {
              ...q,
              question_id: q.question_id,
              question: q.question ? q.question.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "") : "",
              color_code: levelName === 'EASY' ? '#10b981' : levelName === 'MEDIUM' ? '#f59e0b' : '#ef4444',
              isChecked: existingIds.has(q.question_id),
              question_level: { question_level_type: levelName },
              default_weight_age: q.default_marks || q.default_weight_age || 1,
              option1: q.options?.[0]?.option_text || '',
              option2: q.options?.[1]?.option_text || '',
              option3: q.options?.[2]?.option_text || '',
              option4: q.options?.[3]?.option_text || '',
              objective_subjective_type: q.question_category === 'OBJECTIVE' ? 'Objective' : 'Subjective'
            };
          });

          const counts = formatted.reduce((acc, q) => {
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
            questions: formatted,
            filteredQuestions: formatted,
            noOfQuestions: counts.total,
            noOfEasy: counts.easy,
            noOfMedium: counts.medium,
            noOfHard: counts.hard
          }));
        } catch (err) {
          console.error("Error loading questions in edit:", err);
        }
      }
    };
    loadInitialData();
  }, [collegeId, userID, contextUserRole]);

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
    setState(prev => ({
      ...prev,
      selectedGrade: gradeId,
      selectedBatch: '',
      selectedAcademicYear: '',
      selectedSemester: '',
      selectedDivision: '',
      selectedSubject: '',
      selectedChapter: '',
      selectedTopic: '',
      questions: [], filteredQuestions: []
    }));

    setFieldValue('grade_id', gradeId);
    setFieldValue('batch_id', '');
    setFieldValue('academic_year_id', '');
    setFieldValue('semester_id', '');
    setFieldValue('grade_division', '');
    setFieldValue('subject_id', '');
    setFieldValue('chapter_id', '');
    setFieldValue('topic_id', '');
  };

  const handleBatchChange = (batchId, setFieldValue) => {
    setState(prev => ({
      ...prev,
      selectedBatch: batchId,
      selectedAcademicYear: '',
      selectedSemester: '',
      selectedDivision: ''
    }));
    setFieldValue('batch_id', batchId);
    setFieldValue('academic_year_id', '');
    setFieldValue('semester_id', '');
    setFieldValue('grade_division', '');
  };

  const handleAcademicSemesterChange = (val, setFieldValue) => {
    if (!val) {
      setFieldValue('academic_year_id', '');
      setFieldValue('semester_id', '');
      setState(prev => ({ ...prev, selectedAcademicYear: '', selectedSemester: '' }));
      return;
    }
    const [ayId, semId] = val.split('-');
    setFieldValue('academic_year_id', ayId);
    setFieldValue('semester_id', semId);
    setState(prev => ({ ...prev, selectedAcademicYear: ayId, selectedSemester: semId }));
  };

  const handleAcademicYearChange = (ayId, setFieldValue) => {
    setFieldValue('academic_year_id', ayId);
    setFieldValue('semester_id', '');
    setFieldValue('grade_division', '');

    // Filter Semesters
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
          grade_id: state.selectedGrade // legacy need?
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
      const divisionId = obj?.grade_division_id || divisionObjStr; // Handle both existing pattern and simple ID

      setState(prev => ({ ...prev, selectedDivision: divisionId }));
      setFieldValue('grade_division', divisionObjStr);
    }
  };

  const handleSubjectChange = (subjectId, setFieldValue) => {
    const subjectObj = options.subjects.find(s => String(s.value) === String(subjectId));
    setState(prev => ({
      ...prev,
      selectedSubject: subjectId,
      selectedSubjectName: subjectObj?.label || '',
      selectedChapter: '', selectedChapterName: '',
      selectedTopic: '', selectedTopicName: ''
    }));
    setFieldValue('subject_id', subjectId);
    setFieldValue('chapter_id', '');
    setFieldValue('topic_id', '');
    setLocalModules([]); setLocalUnits([]);
    // Load modules using same API as ObjectiveQuestion
    if (subjectId) {
      addContentService.getModulesAndUnits(subjectId)
        .then(res => {
          const modules = (res?.modules || []).map(m => ({
            id: String(m.module_id || m.id),
            name: m.module_name || m.name,
            units: m.units || []
          }));
          setLocalModules(modules);
        })
        .catch(console.error);
    }
  };

  const handleChapterChange = (chapterId, setFieldValue) => {
    const moduleObj = localModules.find(m => String(m.id) === String(chapterId));
    setState(prev => ({
      ...prev,
      selectedChapter: chapterId,
      selectedChapterName: moduleObj?.name || '',
      selectedTopic: '', selectedTopicName: ''
    }));
    setFieldValue('chapter_id', chapterId);
    setFieldValue('topic_id', '');
    // Units from module.units — same as ObjectiveQuestion
    const units = (moduleObj?.units || []).map(u => ({ id: String(u.unit_id || u.id), name: u.unit_name || u.name }));
    setLocalUnits(units);
    loadQuestions(setFieldValue, { selectedChapter: chapterId, selectedTopic: '' });
  };

  const handleTopicChange = (topicId, setFieldValue) => {
    const unitObj = localUnits.find(u => String(u.id) === String(topicId));
    setState(prev => ({
      ...prev,
      selectedTopic: topicId,
      selectedTopicName: unitObj?.name || ''
    }));
    setFieldValue('topic_id', topicId);
    loadQuestions(setFieldValue, { selectedTopic: topicId });
  };

  const handleCategoryChange = (category, setFieldValue) => {
    setState(prev => ({ ...prev, selectedTestCategory: category }));
    setFieldValue('test_category', category);
    loadQuestions(setFieldValue, { selectedTestCategory: category });
  };

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
    } else {
      console.log('⚠️ Missing data - Type:', type, 'College ID:', collegeId);
    }
  };

  const handleAssessmentTypeChange = (type, setFieldValue) => {
    console.log('📋 Assessment Type Changed:', type);
    setFieldValue('assessment_type', type);
    setState(prev => ({ ...prev, assessmentType: type }));
  };

  const loadQuestions = async (setFieldValue, overrides = {}) => {
    // Merge current state with overrides
    const currentGrade = state.selectedGrade;
    const currentSubject = overrides.selectedSubject !== undefined ? overrides.selectedSubject : state.selectedSubject;
    const currentChapter = overrides.selectedChapter !== undefined ? overrides.selectedChapter : state.selectedChapter;
    const currentTopic = overrides.selectedTopic !== undefined ? overrides.selectedTopic : state.selectedTopic;
    const currentCategory = overrides.selectedTestCategory !== undefined ? overrides.selectedTestCategory : state.selectedTestCategory;

    // We need at least Subject to be safe, but typically Module/Unit is selected
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

      if (currentCategory && currentCategory !== 'Mixed') {
        filters.category = currentCategory.toUpperCase();
      }

      const res = await contentService.getAssessmentQuestionsByFilter(filters);
      const fetchedQuestions = Array.isArray(res) ? res : (res?.questions || []);

      const formatted = fetchedQuestions.map(q => {
        // Map Options
        const opts = q.options || [];

        const levelName = q.question_level_name ? q.question_level_name.toUpperCase() : 'MEDIUM';

        return {
          ...q,
          assigned: false,
          question_id: q.question_id,
          question: q.question ? q.question.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "") : "",

          color_code: levelName === 'EASY' ? '#10b981' :
            levelName === 'MEDIUM' ? '#f59e0b' : '#ef4444',

          isChecked: false,
          question_level: { question_level_type: levelName },

          default_weight_age: q.default_marks || q.default_weight_age || 1,
          option1: opts[0]?.option_text || '',
          option2: opts[1]?.option_text || '',
          option3: opts[2]?.option_text || '',
          option4: opts[3]?.option_text || '',

          objective_subjective_type: q.question_category === 'OBJECTIVE' ? 'Objective' : 'Subjective' // For JSX check
        };
      });

      setState(prev => ({ ...prev, questions: formatted, filteredQuestions: formatted, loadingQuestions: false }));
    } catch (error) {
      console.error("Error loading questions", error);
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
  const ASSESSMENT_TYPE_MAP = {
    STANDARD_GENERAL: 'General',
    STANDARD_BL_CO: 'General with BL & CO',
    RUBRIC_STANDARD: 'Standard Rubric',
    RUBRIC_BL_CO: 'Rubric with BL & CO',
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
    batch_id: Yup.string().trim().required('Please select Batch'),
    academic_year_id: Yup.string().trim().required('Please select Academic Year'),
    semester_id: Yup.string().trim().required('Please select Semester'),
    grade_division: Yup.string().trim(), // Division is optional in some contexts or 'All'? User flow usually includes it. Let's make it optional if 'All' is default or strict if needed. AddInternal used to require it.
    // grade_division: Yup.string().trim().required('Please select the Division'), // strict
    subject_id: Yup.string().trim().required('Please select the Subject'),
    test_category: Yup.string().trim().required('Please select the Category'),
    assessment_type: Yup.string().required('Please select Assessment Type'),
    rubric_type: Yup.string().when('assessment_type', {
      is: (val) => val?.startsWith('RUBRIC'),
      then: (schema) => schema.required('Please select Rubric Type'),
      otherwise: (schema) => schema.notRequired(),
    }),

    test_date: Yup.date().required('Please select test date'),
    test_last_date: Yup.date().required('Please select test end date'),
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
        title: state.title || assessmentData?.title || '',
        grade_id: state.selectedGrade,
        batch_id: state.selectedBatch,
        academic_year_id: state.selectedAcademicYear,
        semester_id: state.selectedSemester,
        grade_division: state.selectedDivision ? JSON.stringify({ grade_division_id: state.selectedDivision, grade_id: state.selectedGrade }) : '',
        subject_id: state.selectedSubject,
        chapter_id: state.selectedChapter,
        topic_id: state.selectedTopic,
        test_category: state.selectedTestCategory,
        assessment_type: state.assessmentType,
        rubric_type: state.rubricType || assessmentData?.rubric_type || '',
        rubric_id: state.rubricId || assessmentData?.rubric_id || '',
        rubric_name: state.rubricName || assessmentData?.rubric_name || '',
        test_date: formatDateForInput(state.testDate),
        test_last_date: formatDateForInput(state.testLastDate),
        time_limit: state.timeLimit,
        int_ext_type: 'Internal',
        mode: state.mode,
      }}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          setSubmitting(true);

          const selectedSubjectObj = options.subjects.find(s => String(s.value) === String(values.subject_id));
          const selectedModuleObj = localModules.find(m => String(m.id) === String(values.chapter_id));
          const selectedTopicObj = localUnits.find(u => String(u.id) === String(values.topic_id));

          const selectedQuestions = state.filteredQuestions.filter(q => q.isChecked);
          const totalMarks = selectedQuestions.reduce((acc, q) => acc + (parseFloat(q.default_weight_age) || 1), 0);

          // grade_division is now a plain ID string (not JSON)
          let divisionId = null;
          if (values.grade_division && values.grade_division !== 'All') {
            divisionId = values.grade_division; // already plain ID
          }

          const payload = {
            college_id: parseInt(collegeId),
            mode: values.mode,
            academic_year_id: parseInt(values.academic_year_id),
            batch_id: parseInt(values.batch_id),
            program_id: parseInt(values.grade_id),
            semester_id: parseInt(values.semester_id),
            division_id: divisionId ? parseInt(divisionId) : null,

            subject_id: parseInt(values.subject_id),
            subject_name: selectedSubjectObj?.label || state.selectedSubjectName || '',

            module_id: values.chapter_id ? parseInt(values.chapter_id) : null,
            module_name: selectedModuleObj?.name || state.selectedChapterName || '',

            unit_id: values.topic_id ? parseInt(values.topic_id) : null,
            unit_name: selectedTopicObj?.name || state.selectedTopicName || '',

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
            category: values.test_category?.toUpperCase() || "OBJECTIVE",
            status: "DRAFT",

            test_start_datetime: moment(values.test_date).format("YYYY-MM-DDTHH:mm:ss"),
            test_end_datetime: moment(values.test_last_date).format("YYYY-MM-DDTHH:mm:ss"),
            time_limit_minutes: parseInt(values.time_limit),
            assessment_id: assessmentData ? parseInt(assessmentData.assessment_id || assessmentData.id) : undefined,

            rubric_id: values.rubric_id ? parseInt(values.rubric_id) : null,
            max_marks: totalMarks,
            min_marks: assessmentData?.min_marks || Math.ceil(totalMarks * 0.4) || 0,

            questions: selectedQuestions.map((q, index) => ({
              question_id: parseInt(q.question_id),
              marks_override: parseFloat(q.default_weight_age) || 1,
              question_order: index + 1
            }))
          };

          console.log(assessmentData ? "Updating Assessment Payload:" : "Creating Assessment Payload:", payload);
          if (assessmentData) {
            await AssessmentService.updateAssessment(assessmentData.assessment_id || assessmentData.id, payload);
            showSuccessModal && showSuccessModal(true, 'Assessment updated successfully!');
          } else {
            await AssessmentService.createAssessment(payload);
            showSuccessModal && showSuccessModal(true, 'Assessment created successfully!');
          }
          resetForm();
          setState(prev => ({ ...prev, questions: [], filteredQuestions: [] })); // Clear questions
        } catch (error) {
          console.error("Failed to create assessment:", error);
          showWarningModal && showWarningModal(true, 'Failed to create assessment');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => {

        const CustomDropdown = ({ fieldName, label, value, options, placeholder = '', required = false, onChangeCallback, setFieldValue, errors, touched, openDropdown, setOpenDropdown, dropdownRef }) => {
          // Helper to get option value
          const getOptValue = (opt) => {
            if (typeof opt === 'string') return opt;
            return opt.value ?? opt.grade_division_obj_str ?? opt.subject_id ?? opt.chapter_id ?? opt.topic_id ?? opt.class_id;
          };

          // Helper to get option label
          const getOptLabel = (opt) => {
            if (typeof opt === 'string') return opt;
            return opt.label ?? opt.name ?? opt.division?.name;
          };

          const selectedOption = options.find(opt => {
            return getOptValue(opt) == value;
          });

          return (
            <div ref={dropdownRef} className="relative">
              <label className="block font-medium mb-1 text-gray-700">
                {label.includes('*') ? (
                  <>
                    {label.replace('*', '')}
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  label
                )}
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
        const isRubricAssessment =
          values.assessment_type?.startsWith('RUBRIC');

        useEffect(() => {
          if (!isRubricAssessment) {
            setFieldValue('rubric_type', '');
            setFieldValue('rubric_name', '');
          }
        }, [values.assessment_type]);

        // Auto-calculate Test End Date
        useEffect(() => {
          if (values.test_date && values.time_limit) {
            const startDate = new Date(values.test_date);
            const limit = parseInt(values.time_limit);
            if (!isNaN(startDate.getTime()) && !isNaN(limit)) {
              const endDate = new Date(startDate.getTime() + limit * 60000);
              setFieldValue('test_last_date', formatDateForInput(endDate));
            }
          }
        }, [values.test_date, values.time_limit]);

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
                    setState(prev => ({ ...prev, title: e.target.value }));
                  }}
                  className={`w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 ${errors.title && touched.title ? 'text-red-600' : ''
                    }`}
                />
                {errors.title && touched.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Program, Batch, Academic Year/Semester */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="grade_id"
                label="Program*"
                value={values.grade_id}
                options={options.programs.map(p => ({ value: p.value, name: p.label }))}
                placeholder="Select Program"
                required
                onChangeCallback={(val) => {
                  handleGradeChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["grade_id"] = el}
              />

              <CustomDropdown
                fieldName="academic_year_id" // Using this field name but logic handles both
                label="Academic Year / Semester*"
                value={values.academic_year_id && values.semester_id ? `${values.academic_year_id}-${values.semester_id}` : ''}
                options={options.academicSemesters.map(ay => ({ value: ay.value, name: ay.label }))}
                placeholder="Select AY / Semester"
                required
                onChangeCallback={(val) => {
                  handleAcademicSemesterChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["academic_year_id"] = el}
              />

              <CustomDropdown
                fieldName="batch_id"
                label="Batch*"
                value={values.batch_id}
                options={options.batches.map(b => ({ value: b.value, name: b.label }))}
                placeholder="Select Batch"
                required
                onChangeCallback={(val) => {
                  handleBatchChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["batch_id"] = el}
              />
            </div>

            {/* Division, Subject */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="grade_division"
                label="Division"
                value={values.grade_division}
                options={[
                  { value: 'All', name: 'All Divisions' },
                  ...localDivisions.map(d => ({ value: d.id, name: d.name }))
                ]}
                placeholder="Select Division"
                onChangeCallback={(val) => {
                  setFieldValue('grade_division', val);
                  setState(prev => ({ ...prev, selectedDivision: val }));
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["grade_division"] = el}
              />

              <CustomDropdown
                fieldName="subject_id"
                label={userRole?.userRole === 'ADMIN' ? 'Paper*' : 'Subject*'}
                value={values.subject_id}
                options={options.subjects.map(s => ({ value: s.value, name: s.label }))}
                placeholder={userRole?.userRole === 'ADMIN' ? 'Select Paper' : 'Select Subject'}
                required
                onChangeCallback={(val) => {
                  handleSubjectChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["subject_id"] = el}
              />
            </div>

            {/* Subject, Module, Unit */}
            {/* Module, Unit, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomDropdown
                fieldName="chapter_id"
                label="Module"
                value={values.chapter_id}
                options={localModules.map(m => ({ value: m.id, name: m.name }))}
                placeholder="Select Module"
                onChangeCallback={(val) => {
                  handleChapterChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["chapter_id"] = el}
              />

              <CustomDropdown
                fieldName="topic_id"
                label="Unit"
                value={values.topic_id}
                options={localUnits.map(u => ({ value: u.id, name: u.name }))}
                placeholder="Select Unit"
                onChangeCallback={(val) => {
                  handleTopicChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["topic_id"] = el}
              />

              <CustomDropdown
                fieldName="test_category"
                label="Category*"
                value={values.test_category}
                options={['Objective', 'Subjective',]}
                placeholder="Select Category"
                required
                onChangeCallback={(val) => {
                  handleCategoryChange(val, setFieldValue);
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["test_category"] = el}
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
                              handleAssessmentTypeChange('STANDARD_GENERAL', setFieldValue);
                              setAssessmentOpen(false);
                            }}
                          >
                            General
                          </div>
                          <div
                            className="px-4 py-2 hover:bg-blue-50"
                            onClick={() => {
                              handleAssessmentTypeChange('STANDARD_BL_CO', setFieldValue);
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
                                handleAssessmentTypeChange('RUBRIC_STANDARD', setFieldValue);
                                setAssessmentOpen(false);
                              }}
                            >
                              Standard Rubric
                            </div>
                            <div
                              className="px-4 py-2 hover:bg-blue-50"
                              onClick={() => {
                                handleAssessmentTypeChange('RUBRIC_BL_CO', setFieldValue);
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
                label="Rubric Type*"
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
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["rubric_type"] = el}
              />
            )}
            {isRubricAssessment && values.rubric_type && (
              <CustomDropdown
                fieldName="rubric_id"
                label="Rubric Name*"
                value={values.rubric_id}
                options={state.rubrics.map(r => ({ value: r.rubric_id, label: r.rubric_name || r.title || r.name }))}
                placeholder="Select Rubric Name"
                required
                onChangeCallback={(val) => {
                  setFieldValue('rubric_id', val);
                  const selected = state.rubrics.find(r => r.rubric_id == val);
                  const rubricName = selected ? (selected.rubric_name || selected.title || selected.name) : '';
                  setFieldValue('rubric_name', rubricName);
                  setState(prev => ({ ...prev, rubricId: val, rubricName }));
                }}
                setFieldValue={setFieldValue} errors={errors} touched={touched}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                dropdownRef={el => dropdownRefs.current["rubric_id"] = el}
              />
            )}


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
                    onChange={(e) => {
                      handleChange(e);
                      setState(prev => ({ ...prev, testDate: new Date(e.target.value) }));
                    }}
                    className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${errors.test_date && touched.test_date
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
                  Time Limit (Minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    name="time_limit"
                    type="number"
                    placeholder="Enter minutes (e.g. 90)"
                    min="1"
                    max="999"
                    onChange={(e) => {
                      handleChange(e);
                      setState(prev => ({ ...prev, timeLimit: e.target.value }));
                    }}
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

            {/* Questions Section */}
            {
              state.questions.length > 0 && (
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
              )
            }

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
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
                    <span>{assessmentData ? 'Update Assessment' : 'Submit Assessment'}</span>
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

export default AddInternalAssessment;
