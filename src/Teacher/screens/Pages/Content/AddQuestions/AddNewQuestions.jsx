'use client';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { List, Edit3, ArrowLeft, X, HelpCircle } from "lucide-react";
import ObjectiveQuestion from "./ObjectiveQuestion";
import SubjectiveQuestion from "./SubjectiveQuestion";

const AddNewQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { question: questionToEdit, filters: questionFilters } = location.state || {};
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalHeading, setModalHeading] = useState('');

  const tabs = [
    { name: "Objective", icon: <List size={18} /> },
    // { name: "Subjective", icon: <Edit3 size={18} /> },
  ];

  const validationSchema = Yup.object().shape({
    program: Yup.string().trim().required('Please select the program'),
    class: Yup.string().trim().required('Please select the Class'),
    subject: Yup.string().trim().required('Please select the Subject'),
    chapter: Yup.string().trim().required('Please select the Chapter'),
    category: Yup.string().trim().required('Please select the Category'),
    questionType: Yup.string().trim().required('Please select the Question Type'),
    questionLevel: Yup.string().trim().required('Please select the Question Level'),
    question: Yup.string().trim().required('Please enter the Question'),
    defaultMarks: Yup.number().required('Please enter Default Marks').min(1),
  });

  const [initialValues, setInitialValues] = useState({
    program: "",
    class: "",
    subject: "",
    chapter: "",
    topic: "",
    courseOutcomes: "",
    bloomsLevel: "",
    category: activeTabIndex === 0 ? "Objective Question" : "Subjective Question",
    noOfOptions: "4",
    questionType: "General",
    questionLevel: "Basic",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    defaultMarks: "",
  });

  useEffect(() => {
    if (questionToEdit) {
      const stripHtml = (html) => html ? String(html).replace(/<[^>]+>/gm, '') : '';

      setInitialValues(prevValues => {
        const newValues = { ...prevValues };

        // Fields from the question object itself
        newValues.question = questionToEdit.question || "";
        newValues.option1 = stripHtml(questionToEdit.option1);
        newValues.option2 = stripHtml(questionToEdit.option2);
        newValues.option3 = stripHtml(questionToEdit.option3);
        newValues.option4 = stripHtml(questionToEdit.option4);
        newValues.answer = questionToEdit.answer ? `Option ${questionToEdit.answer}` : "";
        newValues.questionLevel = questionToEdit.question_level_type || "Basic";
        newValues.defaultMarks = questionToEdit.default_weightage || "";
        newValues.subject = questionToEdit.subject_name || "";
        newValues.chapter = questionToEdit.module_name || "";
        newValues.topic = questionToEdit.unit_name || "";

        // Fields from the filters passed from the previous screen
        if (questionFilters) {
          if (questionFilters.program && questionFilters.program.length > 0) {
            newValues.program = questionFilters.program[0];
          }
          if (questionFilters.classDataId && questionFilters.classDataId.length > 0) {
            newValues.class = questionFilters.classDataId[0];
          }
          // The subject, chapter, and topic from filters can be a fallback
          if (!newValues.subject && questionFilters.gradeDivisionId && questionFilters.gradeDivisionId.length > 0) {
            newValues.subject = questionFilters.gradeDivisionId[0];
          }
          if (!newValues.chapter && questionFilters.chapter) {
            newValues.chapter = questionFilters.chapter;
          }
          if (!newValues.topic && questionFilters.topic) {
            newValues.topic = questionFilters.topic;
          }
        }

        return newValues;
      });
    }
  }, [questionToEdit, questionFilters, activeTabIndex]);

  // Navigate Back
  const goBack = () => {
    navigate(-1);
  };

  // Modal Helpers
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div> */}
                <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center sm:text-left text-blue-700">{questionToEdit ? 'Edit Question' : 'Add New Question'}</h1>
              </div>

             {/* Right Circular Close Button */}
             <button
              onClick={goBack}
              className="w-10 h-10 mt-3 sm:mt-0 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-5 h-5" />
            </button>
            </div>

            {/* Tabs: Objective / Subjective */}
            <div className="flex gap-3 mt-6 border-b border-gray-200">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setActiveTabIndex(index)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg transition-all
                    ${activeTabIndex === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={(values, { setSubmitting, resetForm }) => {
                console.log('Submitting:', values);
                setTimeout(() => {
                  openSuccessModal(true, 'Question added successfully!');
                  resetForm();
                  setSubmitting(false);
                }, 1000);
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
                <Form onSubmit={handleSubmit} className="space-y-8">
                  {/* Tab Content */}
                  <div className="tab-content">
                    {activeTabIndex === 0 ? (
                      <ObjectiveQuestion
                        formData={values}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        isEdit={!!questionToEdit}
                        question_id={questionToEdit?.question_id}
                        questionData={questionToEdit}
                        onSaveSuccess={handleSuccessConfirm}
                      />
                    ) : (
                      <SubjectiveQuestion formData={values} handleChange={handleChange} errors={errors} touched={touched} />
                    )}
                  </div>

                  {/* Submit Button */}
               
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">{modalHeading}</h3>
              <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSuccessConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-amber-600">{modalHeading}</h3>
              <button onClick={() => setShowWarningModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSuccessConfirm}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewQuestion;