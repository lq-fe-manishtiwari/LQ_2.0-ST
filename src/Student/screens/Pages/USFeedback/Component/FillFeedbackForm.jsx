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
    const [mappingsLoading, setMappingsLoading] = useState(false);
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
        // Only run when BOTH form and student profile are ready
        if (
            !form ||
            !userProfile ||
            !userProfile.student_id ||
            userProfile?.user?.user_type !== 'STUDENT'
        ) {
            return;
        }

        loadTeacherMappings();
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
        setMappingsLoading(true);
        try {
            const studentId = userProfile?.student_id;
            if (!studentId) {
                console.warn('No student_id found');
                return;
            }

            const history = await StudentService.getStudentHistory(studentId);
            if (!history?.length) {
                console.warn('No student history found');
                return;
            }

            // Resolve academic year, semester, division
            const formAcademicYearId = form?.target_academic_year_id;
            const formSemesterId = form?.target_semester_id;

            let resolvedAcademicYearId = null;
            let resolvedSemesterId = null;
            let resolvedDivisionId = null;

            if (formAcademicYearId && formSemesterId) {
                const matchingRecord = history.find(
                    h => h.academic_year_id === formAcademicYearId && h.semester_id === formSemesterId
                );

                if (matchingRecord) {
                    resolvedAcademicYearId = matchingRecord.academic_year_id;
                    resolvedSemesterId = matchingRecord.semester_id;
                    resolvedDivisionId = matchingRecord.division_id;
                } else {
                    resolvedAcademicYearId = formAcademicYearId;
                    resolvedSemesterId = formSemesterId;
                    resolvedDivisionId = history[0]?.division_id;
                }
            } else {
                const latest = history[0];
                resolvedAcademicYearId = latest?.academic_year_id;
                resolvedSemesterId = latest?.semester_id;
                resolvedDivisionId = latest?.division_id;
            }

            if (!resolvedAcademicYearId || !resolvedSemesterId || !resolvedDivisionId) {
                console.warn('Could not resolve academic context');
                return;
            }

            setStudentContext({
                academicYearId: resolvedAcademicYearId,
                semesterId: resolvedSemesterId,
                divisionId: resolvedDivisionId
            });

            // Fetch mappings
            const response = await feedbackService.getStudentTeacherMappings(
                studentId,
                resolvedAcademicYearId,
                resolvedSemesterId,
                resolvedDivisionId
            );

            const mappings = response?.data || response || [];

            // Build unique pairs
            const newPairs = [];
            const seen = new Set();

            mappings.forEach(subject => {
                if (subject.teachers?.length > 0) {
                    subject.teachers.forEach(teacher => {
                        const key = `${teacher.teacher_id}_${subject.subject_id}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            newPairs.push({
                                teacher_id: teacher.teacher_id,
                                teacher_name: teacher.teacher_name,
                                subject_id: subject.subject_id,
                                subject_name: subject.subject_name
                            });
                        }
                    });
                }
            });

            // Replace (not append) to prevent duplicates/stale data
            setTeacherSubjectPairs(() => newPairs);
            setTeacherSubjects(() => mappings);

        } catch (error) {
            console.error('Error loading teacher mappings:', error);
        } finally {
            setMappingsLoading(false);
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

        const unansweredRequired = [];

        // Validate general sections
        form.sections?.filter(s => s.is_general).forEach(section => {
            section.questions?.forEach(question => {
                if (question.required) {
                    const id = question.feedback_question_id;
                    const ans = answers[id];
                    if (!ans || (!ans.answerText && !ans.answerValue && !ans.answerJson)) {
                        unansweredRequired.push(`General - ${section.title || 'Section'}: ${question.label}`);
                    }
                }
            });
        });

        // Validate teacher-subject sections
        teacherSubjectPairs.forEach(pair => {
            form.sections?.filter(s => !s.is_general).forEach(section => {
                section.questions?.forEach(question => {
                    if (question.required) {
                        const id = `${pair.teacher_id}_${pair.subject_id}_${question.feedback_question_id}`;
                        const ans = answers[id];
                        if (!ans || (!ans.answerText && !ans.answerValue && !ans.answerJson)) {
                            unansweredRequired.push(`${pair.teacher_name} - ${pair.subject_name}: ${question.label}`);
                        }
                    }
                });
            });
        });

        if (unansweredRequired.length > 0) {
            setErrorMessage(`Please answer all required questions:\n\n${unansweredRequired.join('\n')}`);
            setShowErrorAlert(true);
            return;
        }

        setSubmitting(true);

        try {
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

            const payloadList = Object.entries(grouped).map(([key, ansArray]) => {
                const [teacherId, subjectId] = key.split('_').map(Number);
                return {
                    feedback_form_id: parseInt(formId),
                    user_id: userProfile?.user?.user_id || userProfile?.userId,
                    user_type: userProfile?.user?.user_type || userProfile?.userType,
                    teacher_id: teacherId === 0 ? null : teacherId,
                    subject_id: subjectId === 0 ? null : subjectId,
                    ...(studentContext && {
                        academic_year_id: studentContext.academicYearId,
                        semester_id: studentContext.semesterId,
                        division_id: studentContext.divisionId
                    }),
                    answers: ansArray
                };
            });

            await feedbackService.submitFeedbackResponseBulk(payloadList);

            setShowSuccessAlert(true);
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage(error?.message || 'Failed to submit feedback');
            setShowErrorAlert(true);
        } finally {
            setSubmitting(false);
        }
    };

    // ──────────────────────────────────────────────
    //               renderQuestion (unchanged)
    // ──────────────────────────────────────────────
    const renderQuestion = (question, uniqueQuestionId, teacherId, subjectId) => {
        const answer = answers[uniqueQuestionId] || {};

        switch (question.type) {
            case 'text':
                const textConfig = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const textType = textConfig?.textType || 'long';
                const maxLength = textConfig?.maxLength || 500;

                return textType === 'short' ? (
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer..."
                        value={answer.answerText || ''}
                        onChange={e => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
                        maxLength={maxLength}
                        required={question.required}
                    />
                ) : (
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        placeholder="Enter your answer..."
                        value={answer.answerText || ''}
                        onChange={e => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
                        maxLength={maxLength}
                        required={question.required}
                    />
                );

            case 'rating':
                const config = typeof question.config === 'string' ? JSON.parse(question.config) : question.config;
                const maxRating = config?.maxRating || 5;
                const ratingMode = config?.ratingMode || 'numeric';
                const labels = config?.labels || [];

                if (ratingMode === 'labels' && labels.length > 0) {
                    return (
                        <div className="space-y-2">
                            {labels.map((label, idx) => (
                                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`rating-${uniqueQuestionId}`}
                                        value={idx + 1}
                                        checked={answer.answerValue === idx + 1}
                                        onChange={e => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', parseInt(e.target.value), teacherId, subjectId)}
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
                        <div className="flex gap-1">
                            {[...Array(maxRating)].map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', idx + 1, teacherId, subjectId)}
                                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                                >
                                    {answer.answerValue > idx ? '★' : '☆'}
                                </button>
                            ))}
                        </div>
                    );
                } else {
                    return (
                        <div className="flex flex-wrap gap-4">
                            {[...Array(maxRating)].map((_, idx) => (
                                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`rating-${uniqueQuestionId}`}
                                        value={idx + 1}
                                        checked={answer.answerValue === idx + 1}
                                        onChange={e => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'value', parseInt(e.target.value), teacherId, subjectId)}
                                        required={question.required}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700 font-medium">{idx + 1}</span>
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
                        {radioOptions.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`radio-${uniqueQuestionId}`}
                                    value={option}
                                    checked={answer.answerText === option}
                                    onChange={e => handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'text', e.target.value, teacherId, subjectId)}
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
                const selected = answer.answerJson ? JSON.parse(answer.answerJson) : [];

                const toggleOption = (option, checked) => {
                    let updated = [...selected];
                    if (checked) {
                        updated.push(option);
                    } else {
                        updated = updated.filter(o => o !== option);
                    }
                    handleAnswerChange(uniqueQuestionId, question.feedback_question_id, 'json', JSON.stringify(updated), teacherId, subjectId);
                };

                return (
                    <div className="space-y-2">
                        {checkboxOptions.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={e => toggleOption(option, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return <p className="text-gray-500 italic">Unsupported question type</p>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Form not found or inaccessible</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 pb-12">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
                <h1 className="text-3xl font-bold mb-4 text-center">{form.form_name}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <i className="bi bi-hash"></i>
                        Code: <span className="font-semibold">{form.code || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="bi bi-calendar-event"></i>
                        Start: <span className="font-semibold">{form.start_date || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="bi bi-calendar-x"></i>
                        End: <span className="font-semibold">{form.end_date || '—'}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General sections – once only */}
                {form.sections
                    ?.filter(s => s.is_general === true || s.is_general === 1)
                    .map((section, idx) => (
                        <div
                            key={`gen-${section.feedback_section_id}`}
                            className="bg-white rounded-xl shadow border border-gray-200 p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-5 pb-2 border-b">
                                {idx + 1}. {section.title || "General Feedback"}
                            </h2>
                            <div className="space-y-7">
                                {section.questions?.map((q, qIdx) => (
                                    <div key={q.feedback_question_id} className="pb-6 border-b last:border-0 last:pb-0">
                                        <label className="block mb-3">
                                            <span className="text-gray-800 font-medium">
                                                {qIdx + 1}. {q.label}
                                                {q.required && <span className="text-red-500 ml-1.5">*</span>}
                                            </span>
                                            {q.description && (
                                                <p className="text-sm text-gray-500 mt-1.5">{q.description}</p>
                                            )}
                                        </label>
                                        {renderQuestion(q, q.feedback_question_id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                {/* Teacher-Subject blocks */}
                {teacherSubjectPairs.length > 0 ? (
                    mappingsLoading ? (
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your assigned teachers and subjects...</p>
                        </div>
                    ) : (
                        teacherSubjectPairs.map((pair) => (
                            <div key={`${pair.teacher_id}-${pair.subject_id}`} className="space-y-6 mb-10">
                                {/* Teacher-Subject Header */}
                                <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 text-blue-700 p-3.5 rounded-full">
                                            <i className="bi bi-person-badge-fill text-2xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{pair.teacher_name}</h3>
                                            <p className="text-gray-700 mt-1">{pair.subject_name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sections for this pair */}
                                {form.sections
                                    ?.filter(s => !(s.is_general === true || s.is_general === 1))
                                    .map((section) => (
                                        <div
                                            key={`sec-${pair.teacher_id}-${pair.subject_id}-${section.feedback_section_id}`}
                                            className="bg-white rounded-xl shadow border border-gray-200 p-6"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800 mb-5">
                                                {section.title || "Feedback for this subject"}
                                            </h3>

                                            <div className="space-y-7">
                                                {section.questions?.map((q, qIdx) => {
                                                    const uid = `${pair.teacher_id}_${pair.subject_id}_${q.feedback_question_id}`;
                                                    return (
                                                        <div key={uid} className="pb-6 border-b last:border-0 last:pb-0">
                                                            <label className="block mb-3">
                                                                <span className="text-gray-800 font-medium">
                                                                    {qIdx + 1}. {q.label}
                                                                    {q.required && <span className="text-red-500 ml-1.5">*</span>}
                                                                </span>
                                                            </label>
                                                            {renderQuestion(q, uid, pair.teacher_id, pair.subject_id)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))
                    )
                ) : (
                    // No teacher-subject pairs → show all sections as normal
                    form.sections?.map((section, idx) => (
                        <div
                            key={`fallback-${section.feedback_section_id}`}
                            className="bg-white rounded-xl shadow border border-gray-200 p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-5 pb-2 border-b">
                                {idx + 1}. {section.title || "Feedback"}
                            </h2>
                            <div className="space-y-7">
                                {section.questions?.map((q, qIdx) => (
                                    <div key={q.feedback_question_id} className="pb-6 border-b last:border-0 last:pb-0">
                                        <label className="block mb-3">
                                            <span className="text-gray-800 font-medium">
                                                {qIdx + 1}. {q.label}
                                                {q.required && <span className="text-red-500 ml-1.5">*</span>}
                                            </span>
                                        </label>
                                        {renderQuestion(q, q.feedback_question_id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-12 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={submitting || mappingsLoading}
                        className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting || mappingsLoading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Submitting...
                            </>
                        ) : (
                            "Submit Feedback"
                        )}
                    </button>
                </div>
            </form>

            {/* Alerts */}
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
                    title="Error"
                    onConfirm={() => setShowErrorAlert(false)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {errorMessage}
                </SweetAlert>
            )}
        </div>
    );
}