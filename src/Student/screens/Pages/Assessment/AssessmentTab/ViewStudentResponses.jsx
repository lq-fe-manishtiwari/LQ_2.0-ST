import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Info, ClipboardList, BookOpen } from 'lucide-react';
import { assessmentService } from '../Services/assessment.service';

const ViewStudentResponses = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState(null);
    const [mergedResponses, setMergedResponses] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [attempt, setAttempt] = useState(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [questionsData, responsesData] = await Promise.all([
                assessmentService.getAssessmentQuestions(id).catch(() => null),
                assessmentService.getAssessmentResponses(id).catch(() => null)
            ]);

            if (responsesData) {
                setAssessmentData({
                    id: responsesData.assessment_id,
                    title: responsesData.assessment_title
                });

                const allAttempts = responsesData.attempts || [];
                // Latest SUBMITTED attempt or the last attempt
                const latestAttempt = allAttempts.slice().reverse().find(a => a.status === 'SUBMITTED') || allAttempts[allAttempts.length - 1];

                setAttempt(latestAttempt);

                if (latestAttempt) {
                    // Normalize questionsData (could be array or { questions: [] })
                    let qMeta = Array.isArray(questionsData) ? questionsData : (questionsData?.questions || []);
                    const studentResponses = latestAttempt.responses || [];

                    // Resilient Merge Fallback: If metadata fails, use attempt responses
                    if (qMeta.length === 0 && studentResponses.length > 0) {
                        qMeta = studentResponses.map(r => ({
                            question_id: r.question_id,
                            question_text: r.question_text,
                            question_category: r.selected_option_id ? 'OBJECTIVE' : 'SUBJECTIVE',
                            marks: r.marks_obtained || 0,
                            options: []
                        }));
                    }

                    const merged = qMeta.map((q) => {
                        const studentResp = studentResponses.find(r => r.question_id === q.question_id) || {};

                        // Normalize question text across different API formats
                        const qText = q.question || q.question_text || q.text || studentResp.question_text || "No question text available";

                        return {
                            ...q,
                            display_text: qText,
                            student_response: studentResp
                        };
                    });
                    setMergedResponses(merged);
                }
            }
        } catch (error) {
            console.error('Error fetching assessment data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 font-medium tracking-tight">Loading assessment details...</p>
                </div>
            </div>
        );
    }

    if (!attempt || mergedResponses.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-slate-200">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Result Data Missing</h3>
                    <p className="text-slate-600 mb-6 font-medium">We couldn't load the questions or responses for this assessment review.</p>
                    <button
                        onClick={() => navigate('/my-assessment/assessment')}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = mergedResponses[currentQuestionIdx];
    const studentAns = currentQ?.student_response || {};

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header - Assessment Module Theme */}
            <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                                {assessmentData?.title || 'Assessment Review'}
                            </h1>
                            <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5 font-medium">
                                <span className="text-blue-600 font-bold uppercase tracking-wider">Results</span>
                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                <span>Score: {attempt.total_score || 0} / {attempt.max_marks || 0}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/my-assessment/assessment')}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow hover:shadow-lg text-sm"
                    >
                        Finish Review
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                        {/* Question Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Question {currentQuestionIdx + 1}
                                </h2>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                                    Type: {currentQ.question_category} • Marks: {currentQ.marks || 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border 
                                    ${studentAns.marks_obtained > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    Obtained: {studentAns.marks_obtained || 0} {studentAns.marks_obtained === 1 ? 'Mark' : 'Marks'}
                                </span>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-6 sm:p-10 flex-1">
                            <div className="text-xl text-slate-900 font-bold mb-10 leading-relaxed">
                                {currentQ.display_text}
                            </div>

                            {/* Options Area */}
                            <div className="space-y-4">
                                {currentQ.question_category === 'OBJECTIVE' ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {currentQ.options && currentQ.options.length > 0 ? (
                                            currentQ.options.map((opt) => {
                                                const isSelected = studentAns.selected_option_id === opt.option_id;
                                                const isCorrectOpt = opt.is_correct === true || opt.is_answer === true;

                                                let borderClass = 'border-slate-200';
                                                let bgClass = 'bg-white';
                                                let textClass = 'text-slate-900';
                                                let icon = null;

                                                if (isSelected) {
                                                    if (isCorrectOpt || studentAns.is_correct) {
                                                        borderClass = 'border-blue-500 bg-blue-50';
                                                        icon = <CheckCircle2 className="w-5 h-5 text-blue-500" />;
                                                    } else {
                                                        borderClass = 'border-red-500 bg-red-50';
                                                        icon = <XCircle className="w-5 h-5 text-red-500" />;
                                                    }
                                                } else if (isCorrectOpt) {
                                                    borderClass = 'border-emerald-500 border-dashed bg-emerald-50/20';
                                                    textClass = 'text-emerald-700';
                                                    icon = <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase">Correct</span>;
                                                }

                                                return (
                                                    <div
                                                        key={opt.option_id}
                                                        className={`flex items-center p-5 border-2 rounded-xl transition-all ${borderClass} ${bgClass}`}
                                                    >
                                                        <span className={`text-base font-bold flex-1 ${textClass}`}>
                                                            {opt.option_text || opt.text || "Option"}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            {isSelected && <span className="text-[10px] font-bold text-slate-400 uppercase italic">Your Answer</span>}
                                                            {icon}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-6 text-slate-700">
                                                <div className="flex items-center gap-2 mb-3 font-bold text-blue-600">
                                                    <Info className="w-4 h-4" />
                                                    Response Details:
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Answer ID</p>
                                                        <p className="font-mono font-bold text-slate-900">{studentAns.selected_option_id || 'N/A'}</p>
                                                    </div>
                                                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Accuracy</p>
                                                        <p className={`font-bold ${studentAns.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                                                            {studentAns.is_correct ? 'Correct' : 'Incorrect'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Subjective View */
                                    <div className="space-y-8">
                                        <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 sm:p-8">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/50">
                                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Submitted Answer:</h4>
                                                <span className="text-[10px] text-slate-400 font-medium italic">Read-only mode</span>
                                            </div>
                                            <div className="text-slate-900 leading-[1.8] font-medium text-lg whitespace-pre-wrap min-h-[150px] font-serif">
                                                {studentAns.text_response || 'No response recorded by candidate.'}
                                            </div>
                                        </div>

                                        {currentQ.explanation && (
                                            <div className="bg-emerald-50 border-2 border-emerald-100/50 rounded-2xl p-6 sm:p-8">
                                                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">Reference Explanation:</h4>
                                                <div className="text-emerald-900 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {currentQ.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="bg-slate-50 px-6 py-5 border-t border-slate-200 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-50 font-bold border-2 border-slate-200 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                PREV
                            </button>
                            <div className="hidden md:flex flex-col items-center">
                                <div className="flex gap-1.5">
                                    {mergedResponses.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentQuestionIdx === i ? 'bg-blue-600 w-4' : 'bg-slate-300'}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.min(mergedResponses.length - 1, prev + 1))}
                                disabled={currentQuestionIdx === mergedResponses.length - 1}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold shadow-lg shadow-blue-100 transition-all border-2 border-blue-600"
                            >
                                NEXT
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-28">
                        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-blue-600" />
                                Nav Palette
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-3 mb-8 max-h-[450px] overflow-y-auto blue-scrollbar pr-2">
                                {mergedResponses.map((res, idx) => {
                                    const isCurrent = currentQuestionIdx === idx;
                                    const isAnswered = res.student_response?.response_id;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIdx(idx)}
                                            className={`w-12 h-12 rounded-xl text-sm font-bold transition-all border-2
                                                ${isCurrent ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' :
                                                    isAnswered ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' :
                                                        'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200 hover:text-slate-600'}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => navigate('/my-assessment/assessment')}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                                >
                                    Exit Review
                                </button>
                                <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Accuracy</span>
                                        <span className="text-xs font-bold text-blue-600">{Math.round(((attempt.total_score || 0) / (attempt.max_marks || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${((attempt.total_score || 0) / (attempt.max_marks || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStudentResponses;
