'use client';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { List, Edit3, ArrowLeft, X, HelpCircle } from "lucide-react";
import ObjectiveQuestion from "./ObjectiveQuestion";
import SubjectiveQuestion from "./SubjectiveQuestion";

const AddNewQuestion = () => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalHeading, setModalHeading] = useState('');

  const tabs = [
    { name: "Objective", icon: <List size={18} /> },
    { name: "Subjective", icon: <Edit3 size={18} /> },
  ];

  const validationSchema = Yup.object().shape({
    grade: Yup.string().trim().required('Please select the Grade'),
    class: Yup.string().trim().required('Please select the Class'),
    subject: Yup.string().trim().required('Please select the Subject'),
    chapter: Yup.string().trim().required('Please select the Chapter'),
    category: Yup.string().trim().required('Please select the Category'),
    questionType: Yup.string().trim().required('Please select the Question Type'),
    questionLevel: Yup.string().trim().required('Please select the Question Level'),
    question: Yup.string().trim().required('Please enter the Question'),
    defaultMarks: Yup.number().required('Please enter Default Marks').min(1),
  });

  const initialValues = {
    grade: "",
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
  };

  // Navigate Back
  const goBack = () => {
    navigate("/teacher/assessments/questions");
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
        <div className="max-w-7xl mx-auto h-full">

          {/* Main Container */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>Add New Question</h1>
              </div>

             {/* Right Circular Close Button */}
             <button
              onClick={goBack}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all hover:opacity-90 shadow-md"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-5 h-5" />
            </button>
            </div>

            {/* Tabs: Objective / Subjective */}
            <div className="flex gap-3 mb-6">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setActiveTabIndex(index)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all shadow-sm
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

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full">
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
                <Form onSubmit={handleSubmit} className="h-full flex flex-col">
                  {/* Tab Content */}
                  <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-4xl">
                      {activeTabIndex === 0 ? (
                        <ObjectiveQuestion formData={values} handleChange={handleChange} errors={errors} touched={touched} />
                      ) : (
                        <SubjectiveQuestion formData={values} handleChange={handleChange} errors={errors} touched={touched} />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-all ${
                        isSubmitting
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Question</span>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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