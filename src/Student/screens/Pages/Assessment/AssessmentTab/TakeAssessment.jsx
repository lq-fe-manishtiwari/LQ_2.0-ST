import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, BookOpen, Timer, CheckCircle2 } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";

const TakeAssessment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds
  const [alert, setAlert] = useState(null);
  const [flagged, setFlagged] = useState(new Set());

  const questions = [
    {
      id: 1,
      question: "What is the value of x in the equation 2x + 5 = 15?",
      options: ["x = 5", "x = 10", "x = 7.5", "x = 2.5"],
      type: "multiple-choice"
    },
    {
      id: 2,
      question: "Solve for y: 3y - 7 = 14",
      options: ["y = 7", "y = 21", "y = 5", "y = 3"],
      type: "multiple-choice"
    },
    {
      id: 3,
      question: "What is the area of a triangle with base 8 cm and height 6 cm?",
      options: ["48 cm²", "24 cm²", "14 cm²", "32 cm²"],
      type: "multiple-choice"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitAssessment();
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
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
        onConfirm={() => {
          setAlert(null);
          navigate(`/my-assessment/assessment/result/${id}`);
        }}
        onCancel={() => setAlert(null)}
      >
        Are you sure you want to submit your assessment? You cannot change answers after submission.
      </SweetAlert>
    );
  };

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-slate-50">
      {alert}
      
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Unit Test 1 - Algebra & Geometry</h1>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-1">
                  <span>Mathematics Assessment</span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full hidden sm:block"></span>
                  <span className="hidden sm:inline">{questions.length} Questions</span>
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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm font-semibold transition-all duration-200 ${
                    flagged.has(currentQ.id) 
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
                <p className="text-slate-900 text-lg sm:text-xl leading-relaxed font-medium">{currentQ.question}</p>
              </div>

              {/* Enhanced Options */}
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                      answers[currentQ.id] === option
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQ.id] === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {answers[currentQ.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-900 text-base sm:text-lg font-medium flex-1">{option}</span>
                    {answers[currentQ.id] === option && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </label>
                ))}
              </div>

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
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-sm font-bold transition-all duration-200 ${
                        index === currentQuestion
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
    </div>
  );
};

export default TakeAssessment;