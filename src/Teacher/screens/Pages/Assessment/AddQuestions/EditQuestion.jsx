'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import ObjectiveQuestionEdit from './ObjectiveQuestionEdit';
import SubjectiveQuestionEdit from './SubjectiveQuestionEdit';
import { QuestionsService } from '../Services/questions.service';

export default function EditQuestion() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();

    console.log("Navigation state received:", state);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formValues, setFormValues] = useState(null);
    const [questionLevels, setQuestionLevels] = useState([]);
    const [bloomsLevels, setBloomsLevels] = useState([]);

    useEffect(() => {
        if (formValues) return; // prevent re-run after success

        const loadData = async () => {
            try {
                const [levelsRes, bloomsRes] = await Promise.all([
                    QuestionsService.getAllQuestionLevels(),
                    QuestionsService.getAllBloomsLevels(),
                ]);

                setQuestionLevels(levelsRes || []);
                setBloomsLevels(bloomsRes || []);

                const rawQuestion = state?.question;
                const q = rawQuestion?.questions?.[0] || rawQuestion;

                if (!q) {
                    // If no question in state, try fetching by ID
                    if (id) {
                        const fetched = await QuestionsService.getQuestionById(id);
                        processQuestion(fetched);
                    } else {
                        throw new Error("No question data provided");
                    }
                } else {
                    processQuestion(q);
                }

            } catch (err) {
                console.error("Load error:", err);
                alert("Failed to load question: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        const processQuestion = (q) => {
            const isObjective = (q.question_category || '').toUpperCase() === 'OBJECTIVE';

            const common = {
                collegeId: q.college_id || '',
                programId: q.program_id || '',
                program: q.program_name || 'N/A',
                paperId: q.subject_id || '',
                paper: q.subject_name || 'N/A',
                moduleId: q.module_id || '',
                module: q.module_name || 'N/A',
                unitId: q.unit_id || '',
                unit: q.unit_name || 'N/A',
                batchId: q.batch_id || '',
                divisionId: q.division_id || '',
                questionType: q.question_type || (isObjective ? 'MCQ' : 'SHORT_ANSWER'),
            };

            const singleQuestion = {
                question: q.question || '',
                defaultMarks: q.default_marks ?? (isObjective ? 1 : 5),
                questionLevel: q.question_level_name || '',
                question_level_id: q.question_level_id || null,
                bloomsLevel: q.blooms_level_name || (q.blooms_level?.level_name) || '',
                blooms_level_id: q.blooms_level?.blooms_level_id || null,
                courseOutcome: q.course_outcomes || [],
                modelAnswer: q.model_answer || '',
                noOfOptions: q.options?.length || 4,
                answer: q.options
                    ?.find(opt => opt.is_correct === true || opt.correct === true)
                    ?.option_text?.trim()
                    ?.charAt(0)
                    ?.toUpperCase() || '',
                optionA: q.options?.[0]?.option_text || '',
                optionB: q.options?.[1]?.option_text || '',
                optionC: q.options?.[2]?.option_text || '',
                optionD: q.options?.[3]?.option_text || '',
                optionE: q.options?.[4]?.option_text || '',
                questionImagesNames: '',
            };

            setFormValues({
                common,
                questions: [singleQuestion],
                questionId: q.question_id || q.id,
                isEdit: true,
            });
        };

        loadData();
    }, [id, state, formValues]);

    const handleUpdate = async () => {
        if (!formValues?.questions?.[0]?.question?.trim()) {
            alert("Question text is required");
            return;
        }

        setSubmitting(true);

        try {
            const q = formValues.questions[0];
            const common = formValues.common;

            const payload = {
                question_id: formValues.questionId,
                college_id: Number(common.collegeId),
                program_id: Number(common.programId),
                subject_id: Number(common.paperId),
                module_id: Number(common.moduleId),
                unit_id: Number(common.unitId),
                batch_id: common.batchId ? Number(common.batchId) : null,
                division_id: common.divisionId ? Number(common.divisionId) : null,
                question: q.question.trim(),
                question_category: common.questionType.includes('MCQ') || common.questionType === 'TRUE_FALSE'
                    ? 'OBJECTIVE'
                    : 'SUBJECTIVE',
                question_type: common.questionType || (q.modelAnswer?.trim() ? 'ESSAY' : 'SHORT_ANSWER'),
                question_level_id: q.question_level_id,
                blooms_level_id: q.blooms_level_id,
                course_outcome_ids: (q.courseOutcome || []).map(co => co.course_outcome_id || co.id).filter(Boolean),
                default_marks: Number(q.defaultMarks),
                is_active: true,
            };

            if (payload.question_category === 'OBJECTIVE') {
                payload.options = [
                    { option_text: q.optionA?.trim() || '', is_correct: q.answer === 'A' },
                    { option_text: q.optionB?.trim() || '', is_correct: q.answer === 'B' },
                    { option_text: q.optionC?.trim() || '', is_correct: q.answer === 'C' },
                    { option_text: q.optionD?.trim() || '', is_correct: q.answer === 'D' },
                    { option_text: q.optionE?.trim() || '', is_correct: q.answer === 'E' },
                ].filter(o => o.option_text);
            } else {
                payload.model_answer = q.modelAnswer?.trim() || '';
            }

            const response = await QuestionsService.updateQuestion(payload.question_id, payload);

            if (response?.success !== false) {
                alert("Question updated successfully!");
                navigate('/teacher/assessments/questions');
            } else {
                throw new Error(response?.message || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Update failed: " + (err.message || "Unknown"));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!formValues || !formValues.questions?.[0]) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600 p-8">
                <div className="text-center max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">Question data missing</h2>
                    <button
                        onClick={() => navigate('/teacher/assessments/questions')}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Questions
                    </button>
                </div>
            </div>
        );
    }

    const isObjective = formValues.common.questionType?.includes('MCQ') ||
        formValues.common.questionType === 'TRUE_FALSE' ||
        formValues.common.questionType === 'OBJECTIVE'; // Fallback

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Edit Question</h1>
                    <button
                        onClick={() => navigate('/teacher/assessments/questions')}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <X className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {isObjective ? (
                    <ObjectiveQuestionEdit
                        question={formValues.questions[0]}
                        questionLevels={questionLevels}
                        bloomsLevels={bloomsLevels}
                        setQuestion={(updater) => {
                            setFormValues(prev => ({
                                ...prev,
                                questions: [
                                    typeof updater === 'function' ? updater(prev.questions[0]) : updater,
                                ],
                            }));
                        }}
                        submitting={submitting}
                        onSave={handleUpdate}
                    />
                ) : (
                    <SubjectiveQuestionEdit
                        question={formValues.questions[0]}
                        questionLevels={questionLevels}
                        bloomsLevels={bloomsLevels}
                        setQuestion={(updater) => {
                            setFormValues(prev => ({
                                ...prev,
                                questions: [
                                    typeof updater === 'function' ? updater(prev.questions[0]) : updater,
                                ],
                            }));
                        }}
                        submitting={submitting}
                        onSave={handleUpdate}
                    />
                )}
            </div>
        </div>
    );
}
