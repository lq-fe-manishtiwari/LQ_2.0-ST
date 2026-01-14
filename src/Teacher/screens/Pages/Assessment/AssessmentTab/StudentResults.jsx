import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download, 
  Award,
  Target,
  TrendingUp,
  MessageSquare,
  Code
} from 'lucide-react';

const StudentResults = () => {
  const navigate = useNavigate();
  const { studentId, assessmentId } = useParams();
  const [studentResult, setStudentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockResult = {
      student: {
        id: studentId,
        name: "John Doe",
        studentId: "ST001",
        email: "john.doe@example.com"
      },
      assessment: {
        id: assessmentId,
        title: "Unit Test 1 - Algebra & Geometry",
        subject: "Mathematics",
        totalMarks: 27,
        passingMarks: 14
      },
      submission: {
        submittedAt: "2024-01-15 14:30:00",
        timeTaken: "45 minutes",
        status: "completed"
      },
      results: {
        totalMarks: 27,
        obtainedMarks: 22,
        percentage: 81.5,
        grade: "A",
        status: "Passed",
        feedback: "Excellent work! Keep it up."
      },
      questions: [
        {
          id: 1,
          type: "mcq",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          studentAnswer: "4",
          marks: 2,
          maxMarks: 2,
          isCorrect: true,
          feedback: "Correct!"
        },
        {
          id: 2,
          type: "text",
          question: "Explain the concept of Object-Oriented Programming.",
          studentAnswer: "Object-Oriented Programming is a programming paradigm based on the concept of objects which contain data and code. The main principles include encapsulation, inheritance, and polymorphism.",
          marks: 8,
          maxMarks: 10,
          feedback: "Good explanation, but could include more details about abstraction."
        },
        {
          id: 3,
          type: "coding",
          question: "Write a function to find the factorial of a number.",
          studentAnswer: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)",
          uploadedFile: "factorial_solution.py",
          marks: 12,
          maxMarks: 15,
          feedback: "Good recursive solution! Consider adding input validation."
        }
      ]
    };

    setStudentResult(mockResult);
    setLoading(false);
  }, [studentId, assessmentId]);

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'text': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'coding': return <Code className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

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
          <p className="text-slate-600 font-medium">Loading student results...</p>
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
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Student Results</h1>
                  <p className="text-slate-600 text-sm sm:text-base">{studentResult.assessment.title}</p>
                </div>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="px-4 sm:px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{studentResult.student.name}</h2>
                <p className="text-slate-600">ID: {studentResult.student.studentId}</p>
                <p className="text-slate-600">{studentResult.student.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className={`px-6 py-3 rounded-xl text-sm font-bold border-2 ${getGradeColor(studentResult.results.grade)}`}>
                Grade: {studentResult.results.grade}
              </span>
              <span className={`px-6 py-3 rounded-xl text-sm font-bold border-2 ${
                studentResult.results.status === 'Passed' 
                  ? 'text-emerald-700 bg-emerald-100 border-emerald-200' 
                  : 'text-red-700 bg-red-100 border-red-200'
              }`}>
                {studentResult.results.status}
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
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{studentResult.results.percentage}%</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Score</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2">{studentResult.results.obtainedMarks}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Marks Obtained</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{studentResult.results.totalMarks}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Total Marks</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">{studentResult.submission.timeTaken}</div>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">Time Taken</p>
          </div>
        </div>

        {/* Questions Analysis */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Question-wise Analysis</h3>
            <p className="text-slate-600 mt-1">Detailed breakdown of each question</p>
          </div>

          <div className="p-4 sm:p-8">
            <div className="space-y-6">
              {studentResult.questions.map((question, index) => (
                <div key={question.id} className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getQuestionIcon(question.type)}
                      <div>
                        <h4 className="font-bold text-slate-900">Question {index + 1}</h4>
                        <p className="text-sm text-slate-600 capitalize">{question.type} Question</p>
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

                  {question.type === 'mcq' && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-slate-800 mb-2">Options:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-sm ${
                            option === question.correctAnswer ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            option === question.studentAnswer && option !== question.correctAnswer ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {option}
                            {option === question.correctAnswer && <CheckCircle className="w-4 h-4 inline ml-2" />}
                            {option === question.studentAnswer && option !== question.correctAnswer && <XCircle className="w-4 h-4 inline ml-2" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h5 className="font-semibold text-slate-800 mb-2">Student Answer:</h5>
                    {question.type === 'coding' ? (
                      <div>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto mb-2">
                          <code>{question.studentAnswer}</code>
                        </pre>
                        {question.uploadedFile && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="w-4 h-4" />
                            <span>Uploaded file: {question.uploadedFile}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{question.studentAnswer}</p>
                    )}
                  </div>

                  {question.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
        {studentResult.results.feedback && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-6 sm:mt-8">
            <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Overall Feedback</h3>
            </div>
            <div className="p-4 sm:p-8">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800">{studentResult.results.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;