import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { feedbackService } from "@/_services/feedbackService";
import { StudentService } from "../../Profile/Student.Service";
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
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [teacherSubjectPairs, setTeacherSubjectPairs] = useState([]);
    const [studentContext, setStudentContext] = useState(null);

    useEffect(() => {
        loadUserProfile();
        loadForm();
    }, [formId]);

    useEffect(() => {
        if (form && userProfile?.user?.user_type === 'STUDENT') {
            loadTeacherMappings();
        }
    }, [form, userProfile]);

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
        } catch (error) {
            console.error('Error loading form:', error);
            alert('Failed to load feedback form');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const loadTeacherMappings = async () => {
        try {
            const studentId = userProfile?.student_id;

            if (!studentId) {
                console.warn('loadTeacherMappings: studentId not found, skipping.');
                return;
            }

            // Step 1: Always fetch student history
            const history = await StudentService.getStudentHistory(studentId);

            if (!history || history.length === 0) {
                console.warn('loadTeacherMappings: No student history found.');
                return;
            }

            // Step 2: Resolve academicYearId & semesterId
            // Prefer form's target values; fall back to latest history record
            const formAcademicYearId = form?.target_academic_year_id;
            const formSemesterId = form?.target_semester_id;

            let resolvedAcademicYearId = null;
            let resolvedSemesterId = null;
            let resolvedDivisionId = null;

            if (formAcademicYearId && formSemesterId) {
                // Try to find exact matching history record
                const matchingRecord = history.find(
                    h => h.academic_year_id === formAcademicYearId && h.semester_id === formSemesterId
                );

                if (matchingRecord) {
                    resolvedAcademicYearId = matchingRecord.academic_year_id;
                    resolvedSemesterId = matchingRecord.semester_id;
                    resolvedDivisionId = matchingRecord.division_id;
                } else {
                    // Form has target values but no matching history — use form values + latest history's division
                    resolvedAcademicYearId = formAcademicYearId;
                    resolvedSemesterId = formSemesterId;
                    resolvedDivisionId = history[0]?.division_id;
                }
            } else {
                // Form has no target values — use latest history record
                const latestHistory = history[0];
                resolvedAcademicYearId = latestHistory?.academic_year_id;
                resolvedSemesterId = latestHistory?.semester_id;
                resolvedDivisionId = latestHistory?.division_id;
            }

            if (!resolvedAcademicYearId || !resolvedSemesterId || !resolvedDivisionId) {
                console.warn('loadTeacherMappings: Could not resolve academicYearId, semesterId or divisionId.');
                return;
            }

            // Store context for submission payload
            setStudentContext({
                academicYearId: resolvedAcademicYearId,
                semesterId: resolvedSemesterId,
                divisionId: resolvedDivisionId
            });

            // Step 3: Fetch teacher mappings
            const response = await feedbackService.getStudentTeacherMappings(
                studentId,
                resolvedAcademicYearId,
                resolvedSemesterId,
                resolvedDivisionId
            );
            const mappings = response?.data || response || [];
            setTeacherSubjects(mappings);

            const pairs = [];
            mappings.forEach(subject => {
                if (subject.teachers && subject.teachers.length > 0) {
                    subject.teachers.forEach(teacher => {
                        pairs.push({
                            teacher_id: teacher.teacher_id,
                            teacher_name: teacher.teacher_name,
                            subject_id: subject.subject_id,
                            subject_name: subject.subject_name
                        });
                    });
                }
            });
            setTeacherSubjectPairs(pairs);

        } catch (error) {
            console.error('Error loading teacher mappings:', error);
        }
    };

    const handleAnswerChange = (uniqueQuestionId, originalQuestionId, type, value, teacherId, subjectId) => {
        setAnswers(prev => ({
            ...prev,
            [uniqueQuestionId]: {
                questionId: originalQuestionId,
                teacherId: teacherId || null,
                subjectId: subjectId || null,
                answerText: type === 'text' ? value : (prev[uniqueQuestionId]?.answerText || null),
                answerValue: type === 'value' ? value : (prev[uniqueQuestionId]?.answerValue || null),
                answerJson: type === 'json' ? value : (prev[uniqueQuestionId]?.answerJson || null)
            }
        }));
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile) {
        setErrorMessage('User profile not found. Please login again.');
        setShowErrorAlert(true);
        return;
    }

    // Validate required questions only for visible teacher-subject pairs
    const unansweredRequired = [];

    if (teacherSubjectPairs.length > 0) {
        // Validate general sections once
        form.sections?.filter(s => s.is_general).forEach(section => {
            section.questions?.forEach(question => {
                if (question.required) {
                    const uniqueQuestionId = question.feedback_question_id;
                    const answer = answers[uniqueQuestionId];
                    const isEmpty = !answer || 
                        (!answer.answerText && !answer.answerValue && !answer.answerJson);
                    if (isEmpty) {
                        unansweredRequired.push(
                            `General - ${section.title}: ${question.label}`
                        );
                    }
                }
            });
        });

        // Validate teacher-subject specific sections
        teacherSubjectPairs.forEach(pair => {
            form.sections?.filter(s => !s.is_general).forEach(section => {
                section.questions?.forEach(question => {
                    if (question.required) {
                        const uniqueQuestionId = `${pair.teacher_id}_${pair.subject_id}_${question.feedback_question_id}`;
                        const answer = answers[uniqueQuestionId];
                        const isEmpty = !answer || 
                            (!answer.answerText && !answer.answerValue && !answer.answerJson);
                        if (isEmpty) {
                            unansweredRequired.push(
                                `${pair.teacher_name} - ${pair.subject_name}: ${question.label}`
                            );
                        }
                    }
                });
            });
        });
    } else {
        form.sections?.forEach(section => {
            section.questions?.forEach(question => {
                if (question.required) {
                    const answer = answers[question.feedback_question_id];
                    const isEmpty = !answer || 
                        (!answer.answerText && !answer.answerValue && !answer.answerJson);
                    if (isEmpty) {
                        unansweredRequired.push(section.title ? `${section.title}: ${question.label}` : question.label);
                    }
                }
            });
        });
    }

    if (unansweredRequired.length > 0) {
        setErrorMessage(
            `Please answer all required questions:\n\n${unansweredRequired.join('\n')}`
        );
        setShowErrorAlert(true);
        return;
    }

    setSubmitting(true);

    try {
        // Group answers per teacher + subject
        const grouped = {};

        Object.values(answers).forEach(a => {
            const key = `${a.teacherId || 0}_${a.subjectId || 0}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({
                question_id: a.questionId,
                answer_text: a.answerText,
                answer_value: a.answerValue,
                answer_json: a.answerJson
            });
        });

        // Convert grouped answers to array of payload objects
        const payloadList = Object.entries(grouped).map(([key, ansArray]) => {
            const [teacherId, subjectId] = key.split('_').map(Number);
            return {
                feedback_form_id: parseInt(formId),
                user_id: userProfile?.user?.user_id || userProfile?.userId,
                user_type: userProfile?.user?.user_type || userProfile?.userType,
                teacher_id: teacherId,
                subject_id: subjectId,
                ...(studentContext && {
                    academic_year_id: studentContext.academicYearId,
                    semester_id: studentContext.semesterId,
                    division_id: studentContext.divisionId
                }),
                answers: ansArray
            };
        });

        // Submit bulk
        await feedbackService.submitFeedbackResponseBulk(payloadList);

        setShowSuccessAlert(true);

    } catch (error) {
        console.error('Error submitting feedback:', error);
        setErrorMessage(error?.message || 'Failed to submit feedback');
        setShowErrorAlert(true);
    } finally {
        setSubmitting(false);
    }
};

    const renderQuestion = (question, uniqueQuestionId, teacherId, subjectId) => {
        const answer = answers[uniqueQuestionId] || {};

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
                            onChange={(e) => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
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
                            onChange={(e) => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
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
                                        name={`rating-${uniqueQuestionId}`}
                                        value={index + 1}
                                        checked={answer.answerValue === index + 1}
                                        onChange={(e) => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', parseInt(e.target.value), teacherId, subjectId)}
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
                                    onClick={() => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', index + 1, teacherId, subjectId)}
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
                                        name={`rating-${uniqueQuestionId}`}
                                        value={index + 1}
                                        checked={answer.answerValue === index + 1}
                                        onChange={(e) => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', parseInt(e.target.value), teacherId, subjectId)}
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
                                    name={`radio-${uniqueQuestionId}`}
                                    value={option}
                                    checked={answer.answerText === option}
                                    onChange={(e) => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
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
                    handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'json', JSON.stringify(updated), teacherId, subjectId);
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
                <h1 className="text-3xl font-bold mb-4 text-center">{form.form_name}</h1>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <i className="bi bi-hash"></i>
                        <span>Code: <span className="font-semibold">{form.code}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="bi bi-calendar-event"></i>
                        <span>Start: <span className="font-semibold">{form.start_date}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="bi bi-calendar-x"></i>
                        <span>End: <span className="font-semibold">{form.end_date}</span></span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* General Sections - Rendered only once if there are teacher mappings */}
                {teacherSubjectPairs.length > 0 && form.sections?.filter(s => s.is_general).map((section, sectionIndex) => (
                    <div key={section.feedback_section_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {sectionIndex + 1}. {section.title || 'General Feedback'}
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
                                    {renderQuestion(question, question.feedback_question_id)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {teacherSubjectPairs.length > 0 ? (
                    teacherSubjectPairs.map((pair, pairIndex) => (
                        <div key={pairIndex} className="mb-6">
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r-lg">
                                <div className="flex items-center gap-3">
                                    <i className="bi bi-person-badge text-blue-600 text-xl"></i>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{pair.teacher_name}</h3>
                                        <p className="text-sm text-gray-600">{pair.subject_name}</p>
                                    </div>
                                </div>
                            </div>

                            {form.sections?.filter(s => !s.is_general).map((section, sectionIndex) => (
                                <div key={section.feedback_section_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        {sectionIndex + 1}. {section.title || 'Teacher Feedback'}
                                    </h2>

                                    <div className="space-y-6">
                                        {section.questions?.map((question, questionIndex) => {
                                            const uniqueQuestionId = `${pair.teacher_id}_${pair.subject_id}_${question.feedback_question_id}`;
                                            return (
                                                <div key={uniqueQuestionId} className="border-b border-gray-100 pb-6 last:border-0">
                                                    <label className="block mb-3">
                                                        <span className="text-gray-800 font-medium">
                                                            {questionIndex + 1}. {question.label}
                                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                                        </span>
                                                    </label>
                                                    {renderQuestion(question, uniqueQuestionId, pair.teacher_id, pair.subject_id)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    form.sections?.map((section, sectionIndex) => (
                        <div key={section.feedback_section_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                {sectionIndex + 1}. {section.title || 'Feedback'}
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
                                        {renderQuestion(question, question.feedback_question_id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

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

            {showErrorAlert && (
                <SweetAlert
                    error
                    title="Error!"
                    onConfirm={() => setShowErrorAlert(false)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {errorMessage}
                </SweetAlert>
            )}
        </div>
    );
}
