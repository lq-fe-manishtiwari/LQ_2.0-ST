import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { feedbackService } from "@/_services/feedbackService";

export default function ViewSubmission() {
    const { responseId } = useParams();
    const navigate = useNavigate();
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubmission();
    }, [responseId]);

    const loadSubmission = async () => {
        setLoading(true);
        try {
            const result = await feedbackService.getMySubmission(responseId);
            const responseData = result?.data || result;
            setResponse(responseData);
        } catch (error) {
            console.error('Error loading submission:', error);
            alert('Failed to load submission');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const renderAnswer = (answer) => {
        const questionType = answer.question_type;
        const config = answer.question_config || {};

        if (questionType === 'text') {
            return (
                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{answer.answer_text || 'No answer provided'}</p>
                </div>
            );
        } else if (questionType === 'rating') {
            const maxRating = config.maxRating || 5;
            const ratingMode = config.ratingMode || 'numeric';

            if (ratingMode === 'stars') {
                return (
                    <div className="flex gap-2">
                        {[...Array(maxRating)].map((_, index) => (
                            <span key={index} className="text-3xl">
                                {answer.answer_value > index ? '⭐' : '☆'}
                            </span>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">{answer.answer_value}</span>
                        <span className="text-gray-400 text-sm">/ {maxRating}</span>
                    </div>
                );
            }
        } else if (questionType === 'radio') {
            return (
                <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                    <p className="text-gray-800 font-medium">{answer.answer_text}</p>
                </div>
            );
        } else if (questionType === 'checkbox') {
            const selected = answer.answer_json ? JSON.parse(answer.answer_json) : [];
            return (
                <div className="space-y-2">
                    {selected.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <i className="bi bi-check-circle-fill text-green-600"></i>
                            <span className="text-gray-800">{option}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return <p className="text-gray-500">No answer</p>;
    };

    // Group answers by teacher
    const groupAnswersByTeacher = () => {
        if (!response?.answers) return [];

        const grouped = {};
        response.answers.forEach(answer => {
            const teacherId = answer.teacher_id || 'general';
            const teacherName = answer.teacher_name || 'General Questions';
            const subjectName = answer.subject_name || '';

            const key = `${teacherId}_${answer.subject_id || 'general'}`;

            if (!grouped[key]) {
                grouped[key] = {
                    teacherId,
                    teacherName,
                    subjectName,
                    answers: []
                };
            }
            grouped[key].answers.push(answer);
        });

        return Object.values(grouped);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!response) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Submission not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{response.form_name}</h1>
                        <p className="text-sm text-gray-600">
                            <i className="bi bi-person mr-1"></i>
                            Submitted by: {response.user_name}
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        Submitted
                    </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                        <i className="bi bi-calendar-check mr-1"></i>
                        {response.submitted_at ? new Date(response.submitted_at).toLocaleString() : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Answers - Grouped by Teacher */}
            <div className="space-y-4">
                {groupAnswersByTeacher().map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Teacher/Subject Header */}
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {group.teacherName}
                            </h2>
                            {group.subjectName && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <i className="bi bi-book mr-1"></i>
                                    {group.subjectName}
                                </p>
                            )}
                        </div>

                        {/* Questions for this teacher */}
                        <div className="space-y-6">
                            {group.answers.map((answer, index) => (
                                <div key={answer.answer_id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <h3 className="text-gray-800 font-medium mb-3">
                                        {index + 1}. {answer.question_label}
                                    </h3>
                                    {renderAnswer(answer)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Back Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => navigate('../my-submitted')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                    <i className="bi bi-arrow-left mr-2"></i>
                    Back to My Submissions
                </button>
            </div>
        </div>
    );
}
