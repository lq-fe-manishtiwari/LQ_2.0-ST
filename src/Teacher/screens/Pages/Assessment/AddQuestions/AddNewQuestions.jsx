'use client';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { List, Edit3, X } from "lucide-react";
import ObjectiveQuestion from "./ObjectiveQuestion";
import SubjectiveQuestion from "./SubjectiveQuestion";
import { QuestionsService } from "../Services/questions.service";

const AddNewQuestions = () => {
  const navigate = useNavigate();
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const currentCollegeId = activeCollege?.id || "";

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [bloomsLevels, setBloomsLevels] = useState([]);

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalHeading, setModalHeading] = useState('');

  const tabs = [
    { name: "Objective", icon: <List size={18} /> },
    { name: "Subjective", icon: <Edit3 size={18} /> },
  ];

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const [levels, blooms] = await Promise.all([
          QuestionsService.getAllQuestionLevels(),
          QuestionsService.getAllBloomsLevels()
        ]);
        setQuestionLevels(levels || []);
        setBloomsLevels(blooms || []);
      } catch (err) {
        console.error("Levels load fail:", err);
        setQuestionLevels([
          { id: 1, question_level_type: "Basic" },
          { id: 2, question_level_type: "Intermediate" },
          { id: 3, question_level_type: "Advanced" },
        ]);
        setBloomsLevels([
          { id: 1, blooms_level_type: "Remember" },
          { id: 2, blooms_level_type: "Understand" },
          { id: 3, blooms_level_type: "Apply" },
          { id: 4, blooms_level_type: "Analyze" },
          { id: 5, blooms_level_type: "Evaluate" },
          { id: 6, blooms_level_type: "Create" },
        ]);
      }
    };
    loadLevels();
  }, []);

  const validationSchema = Yup.object({
    common: Yup.object({
      programId: Yup.number().required('Program required'),
      paperId: Yup.number().required('Paper required'),
      moduleId: Yup.number().required('Module required'),
      unitId: Yup.number().required('Unit required'),
      questionType: Yup.string().nullable(),
    }),
    questions: Yup.array().of(
      Yup.object({
        question: Yup.string().required('Question required'),
        defaultMarks: Yup.number().min(1).required('Marks required'),
      })
    ).min(1),
  });

  const initialValues = {
    common: {
      collegeId: currentCollegeId,
      programId: "",
      program: "",
      paperId: "",
      paper: "",
      academicYearId: "",
      academicYear: "",
      batchId: "",
      batch: "",
      semesterId: "",
      semester: "",
      divisionId: "",
      division: "",
      moduleId: "",
      module: "",
      unitId: "",
      unit: "",
      questionType: "",
      courseOutcomeId: "",
      courseOutcome: "",
      bloomsLevelId: "",
      bloomsLevel: ""
    },
    questions: [
      {
        courseOutcome: [],  // array of numbers
        bloomsLevel: "",
        questionLevel: "",
        defaultMarks: "",
        question: "",
        modelAnswer: "",
        noOfOptions: 4,
        answer: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        optionE: "",
        questionImagesNames: ""
      }
    ]
  };

  const goBack = () => navigate("/teacher/assessments/questions");

  const openSuccessModal = (show = true, content = '') => {
    setShowSuccessModal(show);
    setModalHeading('Success');
    setModalContent(content);
  };

  const openWarningModal = (show = true, content = '') => {
    setShowWarningModal(show);
    setModalHeading('Warning');
    setModalContent(content);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    goBack();
  };

  const getQuestionLevelId = (levelName) => {
    if (!levelName || !questionLevels.length) return null;

    const level = questionLevels.find(
      l => l.question_level_type?.toLowerCase() === levelName.toLowerCase()
    );

    return level?.question_level_id || null;
  };

  const getBloomsLevelId = (levelName) => {
    if (!levelName || !bloomsLevels.length) return null;

    const level = bloomsLevels.find(
      l => l.level_name?.toLowerCase() === levelName.toLowerCase()
    );

    return level?.blooms_level_id || null;
  };

  const buildOptions = (q) => {
    const count = Number(q.noOfOptions || 4);
    const labels = ['A', 'B', 'C', 'D', 'E'];
    const options = labels.slice(0, count).map((label) => ({
      option_text: q[`option${label}`]?.trim() || "",
      is_correct: q.answer === label,
    }));
    return options.filter(opt => opt.option_text); // remove empty
  };

  const buildObjectiveBulkPayload = (values) => {
    const { common, questions } = values;
    return {
      college_id: Number(common.collegeId),
      program_id: Number(common.programId),
      program_name: common.program,
      questions: questions.map((q) => ({
        subject_id: Number(common.paperId),
        module_id: Number(common.moduleId),
        unit_id: Number(common.unitId),
        question: q.question?.trim(),
        question_category: "OBJECTIVE",
        question_type: "MCQ",
        question_level_id: getQuestionLevelId(q.questionLevel),
        blooms_level_id: getBloomsLevelId(values.common.bloomsLevel),
        course_outcome_ids: values.common.courseOutcomeId ? [Number(values.common.courseOutcomeId)] : [],
        default_marks: Number(q.defaultMarks) || 1,
        options: buildOptions(q),
        is_active: true,
      })),
    };
  };

  const buildSubjectiveBulkPayload = (values) => {
    const { common, questions } = values;
    return {
      college_id: Number(common.collegeId),
      program_id: Number(common.programId),
      program_name: common.program,
      questions: questions.map((q) => ({
        subject_id: Number(common.paperId),
        module_id: Number(common.moduleId),
        unit_id: Number(common.unitId),
        question: q.question?.trim(),
        question_category: "SUBJECTIVE",
        question_type: q.questionType || "SHORT_ANSWER",
        question_level_id: getQuestionLevelId(q.questionLevel),
        blooms_level_id: getBloomsLevelId(values.common.bloomsLevel),
        course_outcome_ids: values.common.courseOutcomeId ? [Number(values.common.courseOutcomeId)] : [],
        default_marks: Number(q.defaultMarks) || 5,
        model_answer: q.modelAnswer?.trim(),
        is_active: true,
      })),
    };
  };

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    const validQuestions = values.questions.filter(q => q.question?.trim());
    if (!validQuestions.length) {
      openWarningModal(true, "Please add at least one valid question.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = activeTabIndex === 0
        ? buildObjectiveBulkPayload(values)
        : buildSubjectiveBulkPayload(values);

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await QuestionsService.saveQuestionsBulk(payload);
      if (response && response.success !== false) {
        openSuccessModal(true, response.message || "Questions saved successfully!");
        resetForm();
      } else {
        throw new Error(response?.message || "Failed to save questions");
      }
    } catch (err) {
      console.error("Save failed:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to save questions";
      openWarningModal(true, errorMsg);

      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-blue-700">Add New Question</h1>
            <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-blue-600 hover:shadow-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3 mt-6 border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button key={tab.name} type="button" onClick={() => setActiveTabIndex(index)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg ${activeTabIndex === index ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {tab.icon}{tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form className="space-y-8">
                {activeTabIndex === 0 ? (
                  <ObjectiveQuestion formData={values} setFieldValue={setFieldValue} errors={errors} touched={touched} questionLevels={questionLevels} bloomsLevels={bloomsLevels} />
                ) : (
                  <SubjectiveQuestion formData={values} setFieldValue={setFieldValue} errors={errors} touched={touched} questionLevels={questionLevels} bloomsLevels={bloomsLevels} />
                )}
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button type="submit" disabled={isSubmitting} className={`flex items-center px-8 py-3 rounded-lg font-medium text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Submit Question'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Success & Warning Modals */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">{modalHeading}</h3>
              <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end"><button onClick={handleSuccessConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">OK</button></div>
          </div>
        </div>
      )}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-amber-600">{modalHeading}</h3>
              <button onClick={() => setShowWarningModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end"><button onClick={() => setShowWarningModal(false)} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">OK</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewQuestions;