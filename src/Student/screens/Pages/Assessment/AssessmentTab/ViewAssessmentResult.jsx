import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download, 
  ArrowLeft, 
  Award, 
  Target, 
  TrendingUp, 
  Calendar,
  User,
  FileText
} from 'lucide-react';

const ViewAssessmentResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ViewAssessmentResult mounted with ID:', id);
    const mockResult = {
      id: id,
      assessmentTitle: 'Unit Test 1 - Algebra & Geometry',
      subject: 'Mathematics',
      totalQuestions: 25,
      correctAnswers: 20,
      wrongAnswers: 3,
      unanswered: 2,
      totalMarks: 100,
      obtainedMarks: 80,
      percentage: 80,
      grade: 'A',
      timeTaken: '75 minutes',
      submittedAt: '2024-01-15 14:30:00',
      status: 'Passed',
      questions: [
        {
          id: 1,
          question: "What is the value of x in the equation 2x + 5 = 15?",
          correctAnswer: "x = 5",
          userAnswer: "x = 5",
          isCorrect: true,
          marks: 4,
          maxMarks: 4,
          feedback: "Excellent! Perfect solution."
        },
        {
          id: 2,
          question: "Solve for y: 3y - 7 = 14",
          correctAnswer: "y = 7",
          userAnswer: "y = 21",
          isCorrect: false,
          marks: 0,
          maxMarks: 4,
          feedback: "Incorrect. Remember to add 7 to both sides first, then divide by 3."
        },
        {
          id: 3,
          question: "What is the area of a triangle with base 8 cm and height 6 cm?",
          correctAnswer: "24 cm²",
          userAnswer: null,
          isCorrect: false,
          marks: 0,
          maxMarks: 4,
          feedback: "Question not attempted. Formula: Area = (1/2) × base × height"
        }
      ],
      overallFeedback: "Good performance overall! Focus on algebraic operations for improvement."
    };
    
    console.log('Setting result data:', mockResult);
    setResult(mockResult);
    setLoading(false);
  }, [id]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'B': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'C': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'D': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'F': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-100 border border-slate-200 font-semibold transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Assessment Results</h1>
                  <p className="text-slate-600 text-sm sm:text-base">{result.assessmentTitle}</p>
                </div>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Result Info */}
          <div className="px-4 sm:px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{result.subject}</h2>
                <p className="text-slate-600">Assessment ID: {result.id}</p>
                <p className="text-slate-600">Submitted: {new Date(result.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className={`px-6 py-3 rounded-xl text-sm font-bold border-2 ${getGradeColor(result.grade)}`}>
                Grade: {result.grade}
              </span>
              <span className={`px-6 py-3 rounded-xl text-sm font-bold border-2 ${
                result.status === 'Passed' 
                  ? 'text-emerald-700 bg-emerald-100 border-emerald-200' 
                  : 'text-red-700 bg-red-100 border-red-200'
              }`}>
                {result.status}
              </span>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{result.percentage}%</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Score</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2">{result.correctAnswers}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Correct</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{result.wrongAnswers}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Wrong</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">{result.timeTaken}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Time Taken</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Assessment Details</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Total Questions:</span>
                  <span className="font-bold text-slate-900">{result.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Total Marks:</span>
                  <span className="font-bold text-slate-900">{result.totalMarks}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Obtained Marks:</span>
                  <span className="font-bold text-blue-600 text-lg">{result.obtainedMarks}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-600 font-medium">Submitted At:</span>
                  <span className="font-bold text-slate-900 text-sm">{new Date(result.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Performance Analysis</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-semibold">Accuracy Rate</span>
                    <span className="text-lg font-bold text-emerald-600">{Math.round((result.correctAnswers / result.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-semibold">Completion Rate</span>
                    <span className="text-lg font-bold text-blue-600">{Math.round(((result.totalQuestions - result.unanswered) / result.totalQuestions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${((result.totalQuestions - result.unanswered) / result.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Performance: {result.percentage >= 80 ? 'Excellent' : result.percentage >= 60 ? 'Good' : 'Needs Improvement'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question-wise Analysis */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Question-wise Analysis</h3>
            <p className="text-slate-600 mt-1">Detailed breakdown of each question</p>
          </div>

          <div className="p-4 sm:p-8">
            <div className="space-y-6">
              {result.questions.map((question, index) => (
                <div key={question.id} className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        question.isCorrect 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : question.userAnswer 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Question {index + 1}</h4>
                        <p className="text-sm text-slate-600">Multiple Choice</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">{question.marks}</span>
                        <span className="text-slate-500">/ {question.maxMarks}</span>
                      </div>
                      <div className={`text-sm font-semibold ${
                        question.marks === question.maxMarks ? 'text-emerald-600' :
                        question.marks >= question.maxMarks * 0.7 ? 'text-blue-600' :
                        question.marks >= question.maxMarks * 0.5 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {Math.round((question.marks / question.maxMarks) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-semibold text-slate-800 mb-2">Question:</h5>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{question.question}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">Correct Answer</p>
                      <p className="font-bold text-emerald-800 text-lg">{question.correctAnswer}</p>
                    </div>
                    <div className={`rounded-lg p-4 border ${
                      question.userAnswer 
                        ? question.isCorrect 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                        question.userAnswer 
                          ? question.isCorrect 
                            ? 'text-emerald-700' 
                            : 'text-red-700'
                          : 'text-slate-600'
                      }`}>Your Answer</p>
                      <p className={`font-bold text-lg ${
                        question.userAnswer 
                          ? question.isCorrect 
                            ? 'text-emerald-800' 
                            : 'text-red-800'
                          : 'text-slate-500'
                      }`}>
                        {question.userAnswer || 'Not Answered'}
                      </p>
                    </div>
                  </div>

                  {question.feedback && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="font-semibold text-blue-800 mb-1">Feedback:</h5>
                      <p className="text-blue-700 text-sm">{question.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        {result.overallFeedback && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-6 sm:mt-8">
            <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Overall Feedback</h3>
            </div>
            <div className="p-4 sm:p-8">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800">{result.overallFeedback}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAssessmentResult;