import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { feedbackService } from "@/_services/feedbackService";
import SweetAlert from "react-bootstrap-sweetalert";

export default function FillFeedbackForm() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({});
    const [userProfile, setUserProfile] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        loadUserProfile();
        loadForm();
    }, [formId]);

    const loadUserProfile = () => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }
    };

    const loadForm = async () => {
        setLoading(true);
        try {
            const response = await feedbackService.getFeedbackFormById(formId);
            const formData = response?.data || response;
            setForm(formData);

            // Initialize answers object with correct field names
            const initialAnswers = {};
            formData.sections?.forEach(section => {
                section.questions?.forEach(question => {
                    // Use feedback_question_id from API response
                    const qId = question.feedback_question_id;
                    initialAnswers[qId] = {
                        questionId: qId,
                        answerText: null,
                        answerValue: null,
                        answerJson: null
                    };
                });
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error loading form:', error);
            alert('Failed to load feedback form');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, type, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                ...(type === 'text' && { answerText: value }),
                ...(type === 'value' && { answerValue: value }),
                ...(type === 'json' && { answerJson: value })
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userProfile) {
            alert('User profile not found. Please login again.');
            return;
        }

        // Validate required questions
        const unansweredRequired = [];
        form.sections?.forEach(section => {
            section.questions?.forEach(question => {
                if (question.required) {
                    const answer = answers[question.feedback_question_id];
                    const isEmpty = !answer.answerText && !answer.answerValue && !answer.answerJson;
                    if (isEmpty) {
                        unansweredRequired.push(question.label);
                    }
                }
            });
        });

        if (unansweredRequired.length > 0) {
            alert(`Please answer all required questions:\n- ${unansweredRequired.join('\n- ')}`);
            return;
        }

        setSubmitting(true);
        try {
            const submissionData = {
                feedback_form_id: parseInt(formId),
                user_id: userProfile?.user?.user_id || userProfile?.userId,
                user_type: userProfile?.user?.user_type || userProfile?.userType,
                answers: Object.values(answers).map(a => ({
                    question_id: a.questionId,
                    answer_text: a.answerText,
                    answer_value: a.answerValue,
                    answer_json: a.answerJson
                }))
            };

            console.log('Submitting feedback:', submissionData);
            await feedbackService.submitFeedbackResponse(submissionData);
            setShowSuccessAlert(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(error?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestion = (question) => {
        const questionId = question.feedback_question_id;
        const answer = answers[questionId] || {};

        // Use 'type' field from API response
        switch (question.type) {
            case 'text':
                const textConfig = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const textType = textConfig?.textType || 'long';
                const maxLength = textConfig?.maxLength || 500;

                if (textType === 'short') {
                    return (
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your answer..."
                            value={answer.answerText || ''}
                            onChange={(e) => handleAnswerChange(questionId, 'text', e.target.value)}
                            maxLength={maxLength}
                            required={question.required}
                        />
                    );
                } else {
                    return (
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="4"
                            placeholder="Enter your answer..."
                            value={answer.answerText || ''}
                            onChange={(e) => handleAnswerChange(questionId, 'text', e.target.value)}
                            maxLength={maxLength}
                            required={question.required}
                        />
                    );
                }

            case 'rating':
                const config = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const maxRating = config?.maxRating || 5;
                const ratingMode = config?.ratingMode || 'numeric';
                const labels = config?.labels || [];

                if (ratingMode === 'labels' && labels.length > 0) {
                    return (
                        <div className="space-y-2">
                            {labels.map((label, index) => (
                                <label key={index} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`rating-${questionId}`}
                                        value={index + 1}
                                        checked={answer.answerValue === index + 1}
                                        onChange={(e) => handleAnswerChange(questionId, 'value', parseInt(e.target.value))}
                                        required={question.required}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    );
                } else if (ratingMode === 'stars') {
                    return (
                        <div className="flex gap-2">
                            {[...Array(maxRating)].map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAnswerChange(questionId, 'value', index + 1)}
                                    className="text-3xl focus:outline-none"
                                >
                                    {answer.answerValue > index ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                    );
                } else {
                    return (
                        <div className="flex gap-3">
                            {[...Array(maxRating)].map((_, index) => (
                                <label key={index} className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`rating-${questionId}`}
                                        value={index + 1}
                                        checked={answer.answerValue === index + 1}
                                        onChange={(e) => handleAnswerChange(questionId, 'value', parseInt(e.target.value))}
                                        required={question.required}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700 font-medium">{index + 1}</span>
                                </label>
                            ))}
                        </div>
                    );
                }

            case 'radio':
                const radioConfig = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const radioOptions = radioConfig?.options || [];
                return (
                    <div className="space-y-2">
                        {radioOptions.map((option, index) => (
                            <label key={index} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`radio-${questionId}`}
                                    value={option}
                                    checked={answer.answerText === option}
                                    onChange={(e) => handleAnswerChange(questionId, 'text', e.target.value)}
                                    required={question.required}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                const checkboxConfig = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const checkboxOptions = checkboxConfig?.options || [];
                const selectedOptions = answer.answerJson ? JSON.parse(answer.answerJson) : [];

                const handleCheckboxChange = (option, checked) => {
                    let updated = [...selectedOptions];
                    if (checked) {
                        updated.push(option);
                    } else {
                        updated = updated.filter(o => o !== option);
                    }
                    handleAnswerChange(questionId, 'json', JSON.stringify(updated));
                };

                return (
                    <div className="space-y-2">
                        {checkboxOptions.map((option, index) => (
                            <label key={index} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option)}
                                    onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return <p className="text-gray-500">Unsupported question type</p>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Form not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.form_name}</h1>
                <p className="text-gray-600 text-sm">Code: {form.code}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span><i className="bi bi-calendar-event mr-1"></i>Start: {form.start_date}</span>
                    <span><i className="bi bi-calendar-x mr-1"></i>End: {form.end_date}</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {form.sections?.map((section, sectionIndex) => (
                    <div key={section.feedback_section_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {sectionIndex + 1}. {section.title || 'General'}
                        </h2>

                        <div className="space-y-6">
                            {section.questions?.map((question, questionIndex) => (
                                <div key={question.feedback_question_id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <label className="block mb-3">
                                        <span className="text-gray-800 font-medium">
                                            {questionIndex + 1}. {question.label}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                    </label>
                                    {renderQuestion(question)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Submit Button */}
                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle"></i>
                                Submit Feedback
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Success Alert */}
            {showSuccessAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => {
                        setShowSuccessAlert(false);
                        navigate('../my-submitted');
                    }}
                    confirmBtnCssClass="btn-confirm"
                >
                    Feedback submitted successfully!
                </SweetAlert>
            )}
        </div>
    );
}
