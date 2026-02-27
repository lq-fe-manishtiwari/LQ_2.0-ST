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
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";
import { AssessmentService } from '../Services/assessment.service';

const CheckPapers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentData = location.state?.assessmentData;
  const assessmentId = assessmentData?.id || assessmentData?.assessment_id;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assessmentId) return;

      try {
        setLoading(true);
        const response = await AssessmentService.getStudentSubmissions(assessmentId);
        console.log("Fetched submissions response:", response);

        const attemptsData = response?.attempts || [];

        const mappedSubmissions = attemptsData.map(attempt => ({
          id: attempt.attempt_id,
          studentName: attempt.student_name || "Unknown",
          studentId: attempt.roll_number || attempt.admission_number || "N/A", // Using roll/admission as display ID
          submittedAt: attempt.end_time || attempt.start_time,
          status: attempt.status,
          totalMarks: attempt.total_score || 0,
          maxMarks: attempt.max_marks || 0,
          questions: (attempt.responses || []).map(ans => {
            const isMcq = ans.selected_option_name !== null;
            return {
              id: ans.response_id, // questionResponseId for saving
              questionId: ans.question_id,
              type: isMcq ? 'mcq' : 'text', // Infer type
              question: ans.question_text || "Question text not available",
              options: [],
              correctAnswer: "",
              studentAnswer: isMcq
                ? ` ${ans.selected_option_name}` // Fallback since we don't have option text
                : ans.text_response,
              uploadedFile: null, // Not seen in example
              marks: ans.marks_obtained || 0,
              maxMarks: ans.max_marks || 0,
              isCorrect: ans.is_correct
            };
          })
        }));

        setStudentSubmissions(mappedSubmissions);
        if (mappedSubmissions.length > 0) {
          setSelectedStudent(mappedSubmissions[0]);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assessmentId]);

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
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const questionEvaluations = selectedStudent.questions.map(q => {
        const key = `${selectedStudent.id}_${q.id}`;
        return {
          question_response_id: q.id, // Assuming q.id IS the response id from our mapping
          marks_obtained: marks[key] !== undefined ? marks[key] : q.marks,
          feedback: feedback[key] || ""
        };
      });

      const payload = {
        evaluations: [
          {
            attempt_id: selectedStudent.id,
            evaluation_data: {
              overall_remarks: "Evaluated via Admin Dashboard", // Can add a field for this if needed
              question_evaluations: questionEvaluations
            }
          }
        ]
      };

      console.log('Saving marks payload:', payload);
      await AssessmentService.evaluateBulk(payload);

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
      console.error("Save error:", error);
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 border border-white/20 font-semibold transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <ClipboardCheck className="w-6 h-6" />
                    Student Evaluation
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base">{assessmentData?.title}</p>
                </div>
              </div>
              <button
                onClick={saveMarks}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg sm:rounded-xl hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
              <div className="bg-blue-50 px-4 sm:px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Students ({studentSubmissions.length})
                </h3>
              </div>
              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                <div className="space-y-2">
                  {studentSubmissions.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${selectedStudent?.id === student.id
                        ? 'bg-blue-100 border-2 border-blue-400 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedStudent?.id === student.id ? 'bg-blue-600' : 'bg-blue-100'
                          }`}>
                          <User className={`w-5 h-5 ${selectedStudent?.id === student.id ? 'text-white' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{student.studentName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-slate-600">{student.studentId}</p>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              {student.totalMarks} / {student.maxMarks} Marks
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Question & Evaluation Display */}
          <div className="lg:col-span-3">
            {selectedStudent && currentQuestion && (
              <div className="space-y-6">
                {/* Question Navigation Pills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6 z-10 backdrop-blur-sm bg-white/90">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {selectedStudent.questions.map((question, index) => {
                      const marksForQuestion = marks[`${selectedStudent.id}_${question.id}`] !== undefined
                        ? marks[`${selectedStudent.id}_${question.id}`]
                        : question.marks;

                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${currentQuestionIndex === index
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          Question {index + 1}
                          <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                            {marksForQuestion}/{question.maxMarks}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getQuestionIcon(currentQuestion.type)}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Question {currentQuestionIndex + 1}
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-600">Max Marks: {currentQuestion.maxMarks}</span>
                            <span className="text-slate-300">•</span>
                            <span className="capitalize text-slate-600">{currentQuestion.type}</span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700 font-medium">Obtained:</span>
                              <input
                                type="number"
                                min="0"
                                max={currentQuestion.maxMarks}
                                value={marks[`${selectedStudent.id}_${currentQuestion.id}`] !== undefined ? marks[`${selectedStudent.id}_${currentQuestion.id}`] : currentQuestion.marks}
                                onChange={(e) => handleMarksChange(currentQuestion.id, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-slate-300 rounded text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Question */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="text-blue-600">📝</span> Question Content:
                      </h4>
                      <div className="text-slate-700 bg-blue-50/50 p-6 rounded-xl border border-blue-100 leading-relaxed font-medium">
                        {currentQuestion.question}
                      </div>
                    </div>

                    {/* MCQ Options Rendering */}
                    {currentQuestion.type === 'mcq' && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Options & Answer Key:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isStudentAnswer = option === currentQuestion.studentAnswer;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-xl border-2 transition-all relative ${isCorrect
                                  ? 'bg-green-50 border-green-500 text-green-800'
                                  : isStudentAnswer
                                    ? 'bg-red-50 border-red-300 text-red-800'
                                    : 'bg-slate-50 border-slate-100 text-slate-500'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">{option}</span>
                                  <div className="flex items-center gap-2">
                                    {isCorrect && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-green-200 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="w-3 h-3" /> Correct
                                      </span>
                                    )}
                                    {isStudentAnswer && !isCorrect && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-red-200 px-2 py-0.5 rounded-full">
                                        <XCircle className="w-3 h-3" /> Student 選択
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Student Submission Display */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <span className="text-indigo-600">✍️</span> Student's Response:
                        </h4>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          Marks Obtained: {currentQuestion.marks} / {currentQuestion.maxMarks}
                        </span>
                      </div>
                      {currentQuestion.type === 'mcq' ? (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${currentQuestion.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                          }`}>
                          {currentQuestion.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                          <div>
                            <span className="font-bold block text-lg">{currentQuestion.studentAnswer}</span>
                            <span className="text-sm font-medium opacity-80">
                              {currentQuestion.isCorrect ? 'Correct Answer' : `Incorrect Answer (Correct: ${currentQuestion.correctAnswer})`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900 p-6 rounded-xl shadow-inner group relative">
                          <pre className="whitespace-pre-wrap text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto">
                            {currentQuestion.studentAnswer}
                          </pre>
                          {currentQuestion.uploadedFile && (
                            <div className="mt-4 flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 group-hover:border-white/20 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded">
                                  <Code className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-300">{currentQuestion.uploadedFile}</p>
                                  <p className="text-[10px] text-slate-500">Source Code Attachment</p>
                                </div>
                              </div>
                              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-2 transition-colors">
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>


                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all shadow-sm"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-lg">
                        {selectedStudent.questions.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentQuestionIndex ? 'w-6 bg-blue-600' : 'bg-slate-300'}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentQuestionIndex(Math.min(selectedStudent.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === selectedStudent.questions.length - 1}
                        className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        Next Question
                      </button>

                    </div>
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