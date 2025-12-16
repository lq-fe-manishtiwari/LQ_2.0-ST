'use client';
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, HelpCircle } from "lucide-react";
import ObjectiveQuestion from "../../Content/QuestionsTab/ObjectiveQuestion";

const ContentObjectiveQuestionWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get question data from navigation state (for editing)
  const questionData = location.state?.question;
  const filters = location.state?.filters;
  const isEdit = !!questionData;
  const question_id = questionData?.id || questionData?.question_id;

  // Form data state
  const [formData, setFormData] = useState({
    program: questionData?.program_name || filters?.program?.[0] || '',
    class: questionData?.class_name || filters?.classDataId?.[0] || '',
    semester: questionData?.semester || filters?.semester || '',
    subject: questionData?.subject_name || filters?.gradeDivisionId?.[0] || '',
    chapter: questionData?.module_name || filters?.chapter || '',
    topic: questionData?.unit_name || filters?.topic || '',
    questionLevel: questionData?.question_level_type || 'Basic',
    noOfOptions: questionData?.option_count?.toString() || '4',
    question: questionData?.question || questionData?.question_text || '',
    option1: questionData?.option1 || '',
    option2: questionData?.option2 || '',
    option3: questionData?.option3 || '',
    option4: questionData?.option4 || '',
    option5: questionData?.option5 || '',
    answer: questionData?.answer ? `Option ${questionData.answer}` : '',
    defaultMarks: questionData?.default_weightage?.toString() || '1',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Navigate back to questions
  const goBack = () => {
    navigate("/teacher/assessments/questions");
  };

  // Handle successful save
  const handleSaveSuccess = () => {
    // Navigate back to questions list after successful save
    setTimeout(() => {
      goBack();
    }, 2000);
  };

  return (
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
              <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>
                {isEdit ? 'Edit Question' : 'Add New Question'}
              </h1>
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

          {/* Content Area */}
          <div className="flex-1">
            <ObjectiveQuestion
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
              isEdit={isEdit}
              question_id={question_id}
              questionData={questionData}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentObjectiveQuestionWrapper;