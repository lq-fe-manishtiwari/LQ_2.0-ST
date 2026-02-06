import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, BookOpen, Timer, CheckCircle2 } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";
import { assessmentService } from '../Services/assessment.service';
import { useUserProfile } from '@/contexts/UserProfileContext';

const TakeAssessment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { profile } = useUserProfile();

  // Get assessment data from navigation state
  const assessmentData = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [alert, setAlert] = useState(null);
  const [flagged, setFlagged] = useState(new Set());

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentMetadata, setAssessmentMetadata] = useState(null);

  // Assessment attempt tracking
  const [attemptId, setAttemptId] = useState(null);
  const [unsavedResponses, setUnsavedResponses] = useState({});
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const autoSaveIntervalRef = useRef(null);

  // Initialize assessment attempt
  useEffect(() => {
    if (profile?.student_id && id) {
      initializeAssessment();
    }
  }, [id, profile]);

  const initializeAssessment = async () => {
    try {
      // Start the assessment attempt
      const attemptData = {
        assessment_id: parseInt(id),
        student_id: profile.student_id
      };

      const attemptResponse = await assessmentService.startAssessmentAttempt(attemptData);

      if (attemptResponse?.attempt_id) {
        setAttemptId(attemptResponse.attempt_id);
        console.log('Assessment attempt started:', attemptResponse.attempt_id);

        // Load questions after attempt is started
        await loadQuestions();

        // Start auto-save interval
        startAutoSave();
      } else {
        console.error('Failed to start assessment attempt');
        alert('Failed to start assessment. Please try again.');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error initializing assessment:', error);
      alert('Error starting assessment. Please check your connection and try again.');
      navigate(-1);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions for assessment ID:', id);
      const response = await assessmentService.getAssessmentQuestions(id);

      console.log('Questions API Response:', response);

      if (response && response.questions) {
        console.log('Questions found:', response.questions.length);

        // Store assessment metadata
        setAssessmentMetadata({
          mode: response.mode,
          type: response.type,
          category: response.category,
          timeLimitMinutes: response.time_limit_minutes,
          testStartDatetime: response.test_start_datetime,
          testEndDatetime: response.test_end_datetime
        });

        // Set timer based on time_limit_minutes from response
        if (response.time_limit_minutes) {
          setTimeLeft(response.time_limit_minutes * 60);
        }

        // Map backend questions to UI format
        const mappedQuestions = response.questions.map((q, index) => ({
          id: q.question_id || index + 1,
          question: q.question || "No question text",
          questionDocument: q.question_document,
          category: q.question_category, // OBJECTIVE or SUBJECTIVE
          type: q.question_type, // SHORT_ANSWER, LONG_ANSWER, MCQ, etc.
          levelId: q.question_level_id,
          levelName: q.levelname,
          marks: q.default_marks,
          options: q.options || [],
          // Determine if this is a text input question
          isTextInput: q.question_category === 'SUBJECTIVE' ||
            q.question_type === 'SHORT_ANSWER' ||
            q.question_type === 'LONG_ANSWER'
        }));

        console.log('Mapped questions:', mappedQuestions.length);
        setQuestions(mappedQuestions);
      } else if (Array.isArray(response)) {
        console.log('Response is array, questions found:', response.length);
        // Fallback for old response format
        const mappedQuestions = response.map((q, index) => ({
          id: q.question_id || q.id || index + 1,
          question: q.text || q.question || "No question text",
          options: q.options || [],
          type: q.type || "multiple-choice",
          isTextInput: false
        }));
        setQuestions(mappedQuestions);
      } else {
        console.error('Unexpected response format:', response);
        console.log('Response has questions property?', response?.hasOwnProperty('questions'));
        console.log('Response type:', typeof response);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      console.error('Error details:', error.message, error.stack);
      // Show user-friendly error for backend 500 errors
      if (error.message?.includes('500')) {
        alert('Unable to load questions. The server is experiencing issues. Please contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save responses every 30 seconds
  const startAutoSave = () => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveUnsavedResponses();
    }, 30000); // 30 seconds
  };

  const saveUnsavedResponses = async () => {
    if (!attemptId || Object.keys(unsavedResponses).length === 0) {
      return;
    }

    try {
      const responses = Object.entries(unsavedResponses).map(([questionId, data]) => ({
        question_id: parseInt(questionId),
        selected_option_id: data.selected_option_id || null,
        text_response: data.text_response || null,
        time_spent_seconds: data.time_spent_seconds || 0
      }));

      await assessmentService.recordBatchResponses(attemptId, { responses });
      console.log('Auto-saved responses:', responses.length);

      // Clear unsaved responses after successful save
      setUnsavedResponses({});
    } catch (error) {
      console.error('Error auto-saving responses:', error);
      // Don't show alert for auto-save failures, just log it
    }
  };

  // Cleanup auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 0) return 0; // Don't start until initialized
        if (prev <= 1) {
          submitAssessment(true); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    // Track when user first interacts with question
    if (!questionStartTimes[questionId]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [questionId]: Date.now()
      }));
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Calculate time spent on this question
    const timeSpent = questionStartTimes[questionId]
      ? Math.floor((Date.now() - questionStartTimes[questionId]) / 1000)
      : 0;

    // Mark response as unsaved
    setUnsavedResponses(prev => ({
      ...prev,
      [questionId]: {
        selected_option_id: typeof answer === 'number' ? answer : null,
        text_response: typeof answer === 'string' ? answer : null,
        time_spent_seconds: timeSpent
      }
    }));
  };

  const handleFlagQuestion = (questionId) => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  const handleSubmitAssessment = () => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, Submit!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Submit Assessment?"
        onConfirm={() => submitAssessment(false)}
        onCancel={() => setAlert(null)}
      >
        Are you sure you want to submit your assessment?
      </SweetAlert>
    );
  };

  const submitAssessment = async (isAutoSubmit = false) => {
    setAlert(
      <SweetAlert
        loading
        title={isAutoSubmit ? "Submitting (Time up)..." : "Submitting..."}
        showConfirm={false}
      >
        Please wait while we secure your responses.
      </SweetAlert>
    );

    try {
      // Save any remaining unsaved responses first
      await saveUnsavedResponses();

      // Submit the assessment
      if (attemptId) {
        await assessmentService.submitAssessmentAttempt(attemptId);
        console.log('Assessment submitted successfully');

        // Clear auto-save interval
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }

        setAlert(
          <SweetAlert
            success
            title="Assessment Submitted!"
            onConfirm={() => navigate('/my-assessment/assessment')}
          >
            Your assessment has been successfully submitted.
          </SweetAlert>
        );
      } else {
        setAlert(
          <SweetAlert
            danger
            title="Error"
            onConfirm={() => setAlert(null)}
          >
            No active attempt found.
          </SweetAlert>
        );
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setAlert(
        <SweetAlert
          danger
          title="Submission Failed"
          onConfirm={() => setAlert(null)}
        >
          Failed to submit assessment. Please try again or contact support.
        </SweetAlert>
      );
    }
  };

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-slate-50">
      {alert}

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Fetching assessment questions...</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md mx-auto">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No questions found</h2>
            <p className="text-gray-600 mb-4">We couldn't find any questions for this assessment.</p>
            <p className="text-sm text-gray-500 mb-6">Please check browser console (F12) for details or contact your coordinator.</p>
            <button
              onClick={() => {
                console.log('Current questions state:', questions);
                console.log('Current loading state:', loading);
                navigate(-1);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                      {assessmentData.title || assessmentMetadata?.type || 'Assessment'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <span>{assessmentData.subject || assessmentMetadata?.category || 'General'} Assessment</span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full hidden sm:block"></span>
                      <span className="hidden sm:inline">{questions.length} Questions</span>
                      {assessmentMetadata?.mode && (
                        <>
                          <span className="w-1 h-1 bg-slate-400 rounded-full hidden sm:block"></span>
                          <span className="hidden sm:inline">{assessmentMetadata.mode}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                  <div className="bg-slate-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Time Remaining</p>
                    </div>
                    <p className={`text-lg sm:text-xl font-mono font-bold ${timeLeft < 600 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                  <button
                    onClick={handleSubmitAssessment}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4" />
                    Submit Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Enhanced Question Panel */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Question Header */}
                <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Question {currentQuestion + 1}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">of {questions.length} questions</p>
                    </div>
                    <button
                      onClick={() => handleFlagQuestion(currentQ.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm font-semibold transition-all duration-200 ${flagged.has(currentQ.id)
                        ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'
                        }`}
                    >
                      <Flag className="w-4 h-4" />
                      <span className="hidden sm:inline">{flagged.has(currentQ.id) ? 'Flagged' : 'Flag Question'}</span>
                      <span className="sm:hidden">{flagged.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-slate-900 text-lg sm:text-xl leading-relaxed font-medium flex-1">{currentQ.question}</p>
                      {currentQ.marks && (
                        <div className="ml-4 flex flex-col items-end gap-1">
                          <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                            {currentQ.marks} marks
                          </span>
                          {currentQ.levelName && (
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${currentQ.levelName.toLowerCase().includes('hard') ? 'bg-red-50 text-red-700' :
                              currentQ.levelName.toLowerCase().includes('medium') ? 'bg-yellow-50 text-yellow-700' :
                                'bg-blue-50 text-blue-700'
                              }`}>
                              {currentQ.levelName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Render based on question type */}
                  {currentQ.isTextInput ? (
                    /* Subjective Question - Text Area */
                    <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Your Answer:
                      </label>
                      <textarea
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={currentQ.type === 'LONG_ANSWER' ? 10 : 6}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 placeholder-slate-400 resize-y"
                      />
                      <p className="text-xs text-slate-500">
                        {answers[currentQ.id]?.length || 0} characters
                      </p>
                    </div>
                  ) : (
                    /* Objective Question - Multiple Choice */
                    <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                      {currentQ.options.map((option, index) => (
                        <label
                          key={option.option_id || index}
                          className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${answers[currentQ.id] === option.option_id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className="relative">
                            <input
                              type="radio"
                              name={`question-${currentQ.id}`}
                              value={option.option_id}
                              checked={answers[currentQ.id] === option.option_id}
                              onChange={(e) => handleAnswerChange(currentQ.id, parseInt(e.target.value))}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === option.option_id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                              }`}>
                              {answers[currentQ.id] === option.option_id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-slate-900 text-base sm:text-lg font-medium flex-1">{option.option_text}</span>
                          {answers[currentQ.id] === option.option_id && (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Navigation */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 text-sm sm:text-base"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="text-center order-first sm:order-none">
                      <p className="text-sm text-slate-600">
                        Progress: {currentQuestion + 1} / {questions.length}
                      </p>
                      <div className="w-32 h-2 bg-slate-200 rounded-full mt-2">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === questions.length - 1}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Question Navigator */}
            <div className="w-full lg:w-96 order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Question Navigator</h3>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="text-center p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Answered</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-700">{answeredCount}</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-lg sm:rounded-xl border border-amber-200">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Flagged</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-700">{flaggedCount}</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Remaining</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-700">{questions.length - answeredCount}</p>
                    </div>
                  </div>

                  {/* Enhanced Question Grid */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Quick Navigation</p>
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                      {questions.map((q, index) => (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestion(index)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-sm font-bold transition-all duration-200 ${index === currentQuestion
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : answers[q.id]
                              ? flagged.has(q.id)
                                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200'
                              : flagged.has(q.id)
                                ? 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-slate-200'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Legend */}
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <p className="font-semibold text-slate-700 mb-3">Legend</p>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded"></div>
                      <span className="text-slate-600 font-medium">Answered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-amber-100 border-2 border-amber-300 rounded"></div>
                      <span className="text-slate-600 font-medium">Answered & Flagged</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                      <span className="text-slate-600 font-medium">Flagged</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-100 border-2 border-slate-200 rounded"></div>
                      <span className="text-slate-600 font-medium">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-slate-600 font-medium">Current Question</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TakeAssessment;