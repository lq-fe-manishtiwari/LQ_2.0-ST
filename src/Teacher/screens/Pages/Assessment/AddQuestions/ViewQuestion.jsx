'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, CheckCircle2, ChevronLeft } from 'lucide-react';
import { QuestionsService } from '../Services/questions.service';

export default function ViewQuestion() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();

    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        const loadQuestion = async () => {
            try {
                const rawQuestion = state?.question;
                const q = rawQuestion?.questions?.[0] || rawQuestion;

                if (!q && id) {
                    const fetched = await QuestionsService.getQuestionById(id);
                    setQuestion(fetched);
                } else {
                    setQuestion(q);
                }
            } catch (err) {
                console.error("Load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuestion();
    }, [id, state]);

    const goBack = () => navigate('/teacher/assessments/questions');

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!question) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
                <p className="text-xl text-red-500 font-semibold mb-6">Question not found</p>
                <button onClick={goBack} className="flex items-center text-blue-600 hover:underline">
                    <ChevronLeft className="w-5 h-5" /> Back to list
                </button>
            </div>
        );
    }

    const isObjective = (question.question_category || '').toUpperCase() === 'OBJECTIVE';

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">View Question Details</h2>
                        <p className="text-blue-100 text-sm">ID: {question.question_id || question.id || 'N/A'}</p>
                    </div>
                    <button onClick={goBack} className="p-2 hover:bg-blue-500 rounded-full transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8 text-gray-800">
                    {/* Metadata Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Type</span>
                            <span className="font-semibold text-gray-700">{question.question_category || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Level</span>
                            <span className="font-semibold text-gray-700">{question.question_level_name || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Marks</span>
                            <span className="font-bold text-blue-600">{question.default_marks || 0}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Bloom's</span>
                            <span className="font-semibold text-gray-700">{question.blooms_level?.level_name || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Academic Context */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                        <div><span className="text-blue-400 mr-2">Program:</span> <span className="font-medium text-blue-900">{question.program_name || 'N/A'}</span></div>
                        <div><span className="text-blue-400 mr-2">Subject:</span> <span className="font-medium text-blue-900">{question.subject_name || 'N/A'}</span></div>
                        <div><span className="text-blue-400 mr-2">Module:</span> <span className="font-medium text-blue-900">{question.module_name || 'N/A'}</span></div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-4 py-1 bg-slate-50">Question</h3>
                        <div className="text-lg md:text-xl leading-relaxed text-gray-700 whitespace-pre-wrap">
                            {question.question}
                        </div>
                    </div>

                    {/* Answer Section */}
                    <div className="space-y-6 pt-6 border-t">
                        {isObjective ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-l-4 border-green-500 pl-4 py-1 bg-slate-50 text-green-700">Options</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {question.options?.map((opt, idx) => {
                                        const letter = String.fromCharCode(65 + idx);
                                        const isCorrect = opt.is_correct || opt.correct;
                                        return (
                                            <div key={idx} className={`p-4 rounded-lg border flex items-center justify-between ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {letter}
                                                    </span>
                                                    <span className={isCorrect ? 'font-semibold text-green-900' : 'text-gray-600'}>
                                                        {opt.option_text}
                                                    </span>
                                                </div>
                                                {isCorrect && <CheckCircle2 className="text-green-500 w-6 h-6" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 text-indigo-700">Model Answer</h3>
                                <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 whitespace-pre-wrap leading-relaxed italic">
                                    {question.model_answer || 'No model answer provided.'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t flex justify-end">
                    <button onClick={goBack} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
