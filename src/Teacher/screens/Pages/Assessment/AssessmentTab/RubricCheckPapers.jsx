import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    FileText,
    Save,
    ClipboardCheck
} from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";
import { RubricService } from '../Settings/Service/rubrics.service';
import { AssessmentService } from '../Services/assessment.service';
import RubricEvaluator from '../Components/RubricEvaluator';

const RubricCheckPapers = () => {
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

    // Rubric States
    const [activeRubric, setActiveRubric] = useState(null);
    const [isRubricLoading, setIsRubricLoading] = useState(false);


    useEffect(() => {
        const fetchRubric = async () => {
            if (!assessmentId) return;

            try {
                setIsRubricLoading(true);
                const rubric = await RubricService.getRubricByAssessmentId(assessmentId);
                console.log("Fetched Rubric from API:", rubric);

                if (rubric) {
                    setActiveRubric(rubric);
                } else {
                    console.warn("No rubric returned from API");

                }
            } catch (error) {
                console.error("Failed to fetch rubric:", error);
                // Fallback: try to finding it in assessmentData as backup
                if (assessmentData?.rubric) {
                    console.log("Falling back to assessmentData.rubric");
                    setActiveRubric(assessmentData.rubric);
                }
            } finally {
                setIsRubricLoading(false);
            }
        };

        fetchRubric();
    }, [assessmentId, assessmentData]);

    const [rubricData, setRubricData] = useState({}); // { questionResponseId: { selections, comments } }

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
                    studentId: attempt.roll_number || attempt.admission_number || "N/A",
                    submittedAt: attempt.end_time || attempt.start_time,
                    status: attempt.status,
                    totalMarks: attempt.total_score || 0,
                    questions: (attempt.responses || []).map(ans => {
                        const isMcq = ans.selected_option_id !== null;
                        return {
                            id: ans.response_id, // QuestionResponseId
                            questionId: ans.question_id, // Question ID
                            type: isMcq ? 'mcq' : 'text',
                            question: ans.question_text || "Question text not available",
                            studentAnswer: isMcq ? `Option ID: ${ans.selected_option_id}` : ans.text_response,
                            marks: ans.marks_obtained || 0,
                            maxMarks: 0 // Not provided in response
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

    const handleRubricChange = (questionId, totalScore, rubricFeedback, selections, comments) => {
        handleMarksChange(questionId, totalScore);
        setFeedback(prev => ({
            ...prev,
            [`${selectedStudent.id}_${questionId}`]: rubricFeedback
        }));

        setRubricData(prev => ({
            ...prev,
            [`${selectedStudent.id}_${questionId}`]: { selections, comments }
        }));
    };

    const getCurrentQuestion = () => {
        return selectedStudent?.questions[currentQuestionIndex];
    };

    const getQuestionIcon = (type) => {
        return <FileText className="w-5 h-5 text-blue-600" />;
    };

    const saveMarks = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            // Construct payload
            const questionEvaluations = selectedStudent.questions.map(q => {
                const key = `${selectedStudent.id}_${q.id}`;
                const rData = rubricData[key];

                let rubricEntries = [];
                if (rData && rData.selections) {
                    rubricEntries = Object.entries(rData.selections).map(([criterionId, levelId]) => {
                        if (criterionId === 'holistic') return null;
                        return {
                            criterion_id: criterionId,
                            level_id: levelId,
                            feedback: rData.comments?.[`${criterionId}_improvement`]
                                ? `Improvement: ${rData.comments[`${criterionId}_improvement`]}`
                                : ""
                        };
                    }).filter(Boolean);
                }

                return {
                    question_response_id: q.id,
                    rubric_entries: rubricEntries,
                    marks_obtained: marks[key] !== undefined ? marks[key] : q.marks,
                    feedback: feedback[key] || "" // General feedback from rubric summary
                };
            });

            const payload = {
                evaluations: [
                    {
                        attempt_id: selectedStudent.id,
                        evaluation_data: {
                            overall_remarks: "Rubric Evaluation",
                            question_evaluations: questionEvaluations
                        }
                    }
                ]
            };

            await AssessmentService.evaluateBulk(payload);

            setAlert(
                <SweetAlert
                    success
                    title="Saved!"
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
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
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
                                        Rubric Assessment Grading
                                    </h1>
                                    <p className="text-white/80 text-sm sm:text-base">{assessmentData?.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={saveMarks}
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg sm:rounded-xl hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                            <div className="bg-indigo-50 px-4 sm:px-6 py-4 border-b border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
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
                                                ? 'bg-indigo-100 border-2 border-indigo-400 shadow-md'
                                                : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedStudent?.id === student.id ? 'bg-indigo-600' : 'bg-indigo-100'
                                                    }`}>
                                                    <User className={`w-5 h-5 ${selectedStudent?.id === student.id ? 'text-white' : 'text-indigo-600'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-900 text-sm">{student.studentName}</p>
                                                    <p className="text-xs text-slate-600">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question & Answer + Rubric Evaluation */}
                    <div className="lg:col-span-3">
                        {selectedStudent && currentQuestion && (
                            <div className="space-y-6">
                                {/* Question Navigation Pills */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {selectedStudent.questions.map((question, index) => {
                                            const key = `${selectedStudent.id}_${question.id}`;
                                            const marksObtained = marks[key] !== undefined ? marks[key] : question.marks;

                                            return (
                                                <button
                                                    key={question.id}
                                                    onClick={() => setCurrentQuestionIndex(index)}
                                                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${currentQuestionIndex === index
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    <span>Question {index + 1}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentQuestionIndex === index ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                                                        }`}>
                                                        {marksObtained}/{question.maxMarks || 0}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Question & Answer Display */}
                                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getQuestionIcon(currentQuestion.type)}
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        Question {currentQuestionIndex + 1}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm mt-1">
                                                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Max Marks: {currentQuestion.maxMarks || 0}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                            Obtained: {marks[`${selectedStudent.id}_${currentQuestion.id}`] !== undefined ? marks[`${selectedStudent.id}_${currentQuestion.id}`] : currentQuestion.marks}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Question */}
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                <span className="text-indigo-600">📝</span> Question:
                                            </h4>
                                            <p className="text-slate-700 bg-indigo-50 p-4 rounded-lg border border-indigo-100">{currentQuestion.question}</p>
                                        </div>

                                        {/* Student Answer */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <span className="text-blue-600">✍️</span> Student's Answer:
                                                </h4>
                                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                    Score: {marks[`${selectedStudent.id}_${currentQuestion.id}`] !== undefined ? marks[`${selectedStudent.id}_${currentQuestion.id}`] : currentQuestion.marks} / {currentQuestion.maxMarks}
                                                </span>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                <pre className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                                                    {currentQuestion.studentAnswer}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Rubric Evaluation Section */}
                                        {activeRubric && (
                                            <div className="mt-8">
                                                {/* Debug Info - Remove after fixing */}
                                                <div className="p-2 mb-4 bg-yellow-100 text-xs font-mono text-yellow-800 rounded hidden">
                                                    Rubric Type: {activeRubric.rubric_type} <br />
                                                    Criteria Count: {activeRubric.criteria?.length} <br />
                                                    Portfolios Count: {activeRubric.portfolios?.length}
                                                </div>

                                                {isRubricLoading ? (
                                                    <div className="py-10 text-center animate-pulse text-indigo-400 font-medium">
                                                        Loading evaluation criteria...
                                                    </div>
                                                ) : (
                                                    <RubricEvaluator
                                                        rubric={activeRubric}
                                                        onMarksChange={(totalScore, rubricFeedback, selections, comments) => {
                                                            handleRubricChange(currentQuestion.id, totalScore, rubricFeedback, selections, comments);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Navigation */}
                                        <div className="flex justify-between pt-4 border-t border-slate-200">
                                            <button
                                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                disabled={currentQuestionIndex === 0}
                                                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentQuestionIndex(Math.min(selectedStudent.questions.length - 1, currentQuestionIndex + 1))}
                                                disabled={currentQuestionIndex === selectedStudent.questions.length - 1}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
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

export default RubricCheckPapers;
