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

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalHeading, setModalHeading] = useState('');

  const openSuccessModal = (content = '') => {
    setModalHeading('Success');
    setModalContent(content);
    setShowSuccessModal(true);
  };

  const openWarningModal = (content = '') => {
    setModalHeading('Warning');
    setModalContent(content);
    setShowWarningModal(true);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/admin-assessment/questions');
  };

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
        if (!rawQuestion) throw new Error("No question in navigation state");

        const q = rawQuestion.questions?.[0] || rawQuestion;
        if (!q?.question_id) throw new Error("Invalid question object");

        const isObjective = (q.question_category || '').toUpperCase() === 'OBJECTIVE';

        const common = {
          collegeId: q.college_id || 16,
          programId: q.program_id || '',
          program: q.program_name || 'N/A',
          paperId: q.subject_id || '',
          paper: q.subject_name || 'N/A',
          moduleId: q.module_id || '',
          module: q.module_name || 'N/A',
          unitId: q.unit_id || '',
          unit: q.unit_name || 'N/A',
          questionType: q.question_type || (isObjective ? 'MCQ' : 'SHORT_ANSWER'),
        };

        const singleQuestion = {
          question: q.question || '',
          defaultMarks: q.default_marks ?? (isObjective ? 1 : 5),
          questionLevel: q.question_level_name || '',
          question_level_id: q.question_level_id || null,
          bloomsLevel: q.blooms_level?.level_name || '',
          blooms_level_id: q.blooms_level?.blooms_level_id || null,
          courseOutcome: q.course_outcomes || [],
          modelAnswer: q.model_answer || '',
          noOfOptions: q.options?.length || 4,
          answer: (() => {
            const correctIndex = (q.options || []).findIndex(opt => opt.is_correct === true);
            return correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '';
          })(),
          optionA: q.options?.[0]?.option_text || '',
          optionB: q.options?.[1]?.option_text || '',
          optionC: q.options?.[2]?.option_text || '',
          optionD: q.options?.[3]?.option_text || '',
          optionE: q.options?.[4]?.option_text || '',
          questionImagesNames: '',
        };

        const prepared = {
          common,
          questions: [singleQuestion],
          questionId: q.question_id,
          isEdit: true,
        };

        console.log("Setting formValues:", prepared);
        setFormValues(prepared);
      } catch (err) {
        console.error("Load error:", err);
        openWarningModal("Failed to load question: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, state]);

  const handleUpdate = async () => {
    if (!formValues?.questions?.[0]?.question?.trim()) {
      openWarningModal("Question text is required.");
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
        question: q.question.trim(),
        question_category: common.questionType.includes('MCQ') || common.questionType === 'TRUE_FALSE'
          ? 'OBJECTIVE'
          : 'SUBJECTIVE',
        question_type: common.questionType || (q.modelAnswer.trim() ? 'ESSAY' : 'SHORT_ANSWER'),
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
        openSuccessModal(response?.message || "Question updated successfully!");
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      openWarningModal("Update failed: " + (err.message || "Unknown error"));
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
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-80 border">
            {JSON.stringify(formValues, null, 2) || 'null'}
          </pre>
          <button
            onClick={() => navigate('/admin-assessment/questions')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  const isObjective = formValues.common.questionType?.includes('MCQ') ||
    formValues.common.questionType === 'TRUE_FALSE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Edit Question</h1>
          <button
            onClick={() => navigate('/admin-assessment/questions')}
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
                  typeof updater === 'function'
                    ? updater(prev.questions[0])
                    : updater,
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
            setQuestion={(newQuestion) => {
              console.log("Updating question state:", newQuestion);
              setFormValues(prev => ({
                ...prev,
                questions: [newQuestion],
              }));
            }}
            submitting={submitting}
            onSave={handleUpdate}
          />
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">{modalHeading}</h3>
              <button onClick={handleSuccessConfirm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end">
              <button
                onClick={handleSuccessConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-amber-600">{modalHeading}</h3>
              <button onClick={() => setShowWarningModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}