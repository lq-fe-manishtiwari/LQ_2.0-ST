import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Save,
  Eye,
  Code,
  MessageSquare
} from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";

const CheckPapers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentData = location.state?.assessmentData;
  const assessmentId = assessmentData?.id;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for student submissions
  useEffect(() => {
    const mockSubmissions = [
      {
        id: 1,
        studentName: "John Doe",
        studentId: "ST001",
        submittedAt: "2024-01-15 14:30:00",
        status: "submitted",
        totalMarks: 0,
        questions: [
          {
            id: 1,
            type: "mcq",
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
            studentAnswer: "4",
            marks: 0,
            maxMarks: 2,
            isCorrect: true
          },
          {
            id: 2,
            type: "text",
            question: "Explain the concept of Object-Oriented Programming.",
            studentAnswer: "Object-Oriented Programming is a programming paradigm based on the concept of objects...",
            marks: 0,
            maxMarks: 10
          },
          {
            id: 3,
            type: "coding",
            question: "Write a function to find the factorial of a number.",
            studentAnswer: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)",
            uploadedFile: "factorial_solution.py",
            marks: 0,
            maxMarks: 15
          }
        ]
      },
      {
        id: 2,
        studentName: "Jane Smith",
        studentId: "ST002",
        submittedAt: "2024-01-15 14:25:00",
        status: "submitted",
        totalMarks: 0,
        questions: [
          {
            id: 1,
            type: "mcq",
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
            studentAnswer: "3",
            marks: 0,
            maxMarks: 2,
            isCorrect: false
          },
          {
            id: 2,
            type: "text",
            question: "Explain the concept of Object-Oriented Programming.",
            studentAnswer: "OOP is about creating objects and classes. It includes inheritance, polymorphism...",
            marks: 0,
            maxMarks: 10
          },
          {
            id: 3,
            type: "coding",
            question: "Write a function to find the factorial of a number.",
            studentAnswer: "def factorial(n):\n    result = 1\n    for i in range(1, n+1):\n        result *= i\n    return result",
            uploadedFile: "my_factorial.py",
            marks: 0,
            maxMarks: 15
          }
        ]
      }
    ];
    setStudentSubmissions(mockSubmissions);
    if (mockSubmissions.length > 0) {
      setSelectedStudent(mockSubmissions[0]);
    }
  }, []);

  const handleMarksChange = (questionId, newMarks) => {
    setMarks(prev => ({
      ...prev,
      [`${selectedStudent.id}_${questionId}`]: newMarks
    }));
  };

  const handleFeedbackChange = (questionId, newFeedback) => {
    setFeedback(prev => ({
      ...prev,
      [`${selectedStudent.id}_${questionId}`]: newFeedback
    }));
  };

  const getCurrentQuestion = () => {
    return selectedStudent?.questions[currentQuestionIndex];
  };

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'text': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'coding': return <Code className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const saveMarks = async () => {
    setLoading(true);
    try {
      // API call to save marks
      console.log('Saving marks:', marks);
      console.log('Saving feedback:', feedback);

      setAlert(
        <SweetAlert
          success
          title="Marks Saved!"
          onConfirm={() => setAlert(null)}
        >
          Marks and feedback have been saved successfully.
        </SweetAlert>
      );
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
        >
          Failed to save marks. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const questionKey = selectedStudent ? `${selectedStudent.id}_${currentQuestion?.id}` : '';

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      {alert}
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
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Check Papers</h1>
                  <p className="text-slate-600 text-sm sm:text-base">{assessmentData?.title}</p>
                </div>
              </div>
              <button
                onClick={saveMarks}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Students ({studentSubmissions.length})</h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {studentSubmissions.map((student) => (
                    <div key={student.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-all duration-200">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setCurrentQuestionIndex(0);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedStudent?.id === student.id
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{student.studentName}</p>
                            <p className="text-xs text-slate-600">{student.studentId}</p>
                          </div>
                        </div>
                      </button>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => {
                            navigate(
                              `/teacher/assessments/student-results/${student.id}/${assessmentData?.id}`
                            );
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Questions</h3>
              </div>
              <div className="p-4">
                {selectedStudent && (
                  <div className="space-y-2">
                    {selectedStudent.questions.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${currentQuestionIndex === index
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {getQuestionIcon(question.type)}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">Q{index + 1}</p>
                            <p className="text-xs text-slate-600 capitalize">{question.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-600">
                              {marks[`${selectedStudent.id}_${question.id}`] || 0}/{question.maxMarks}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className="lg:col-span-2">
            {selectedStudent && currentQuestion && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getQuestionIcon(currentQuestion.type)}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Question {currentQuestionIndex + 1}
                        </h3>
                        <p className="text-slate-600 text-sm capitalize">{currentQuestion.type} Question</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">
                        Max Marks: {currentQuestion.maxMarks}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Question */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Question:</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{currentQuestion.question}</p>
                  </div>

                  {/* MCQ Options */}
                  {currentQuestion.type === 'mcq' && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Options:</h4>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-2 ${option === currentQuestion.correctAnswer
                                ? 'bg-green-50 border-green-300 text-green-800'
                                : option === currentQuestion.studentAnswer
                                  ? currentQuestion.isCorrect
                                    ? 'bg-green-50 border-green-300 text-green-800'
                                    : 'bg-red-50 border-red-300 text-red-800'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {option === currentQuestion.correctAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {option === currentQuestion.studentAnswer && !currentQuestion.isCorrect && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Answer */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Student Answer:</h4>
                    {currentQuestion.type === 'mcq' ? (
                      <div className={`p-4 rounded-lg ${currentQuestion.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        <div className="flex items-center gap-2">
                          {currentQuestion.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-semibold">{currentQuestion.studentAnswer}</span>
                          <span className="text-sm">
                            ({currentQuestion.isCorrect ? 'Correct' : 'Incorrect'})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-slate-700 text-sm">
                          {currentQuestion.studentAnswer}
                        </pre>
                        {currentQuestion.uploadedFile && (
                          <div className="mt-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600">{currentQuestion.uploadedFile}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Marks Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-900 mb-2">
                        Marks (Max: {currentQuestion.maxMarks})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={currentQuestion.maxMarks}
                        value={marks[questionKey] || (currentQuestion.type === 'mcq' && currentQuestion.isCorrect ? currentQuestion.maxMarks : 0)}
                        onChange={(e) => handleMarksChange(currentQuestion.id, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={currentQuestion.type === 'mcq'}
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-2">Feedback (Optional)</label>
                    <textarea
                      value={feedback[questionKey] || ''}
                      onChange={(e) => handleFeedbackChange(currentQuestion.id, e.target.value)}
                      placeholder="Add feedback for the student..."
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(selectedStudent.questions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === selectedStudent.questions.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPapers;