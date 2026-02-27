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
      console.error("Error loading submission:", error);
      alert("Failed to load submission");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const renderAnswer = (answer) => {
    const questionType = answer.question_type;

    if (questionType === "text") {
      return (
        <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {answer.answer_text || "No answer provided"}
          </p>
        </div>
      );
    }

    if (questionType === "rating") {
      return (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-xl">
            {answer.answer_value ?? "—"}
          </div>
          <span className="text-gray-600">/ 5</span>
        </div>
      );
    }

    if (questionType === "radio") {
      return (
        <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
          <p className="text-gray-800 font-medium">{answer.answer_text || "—"}</p>
        </div>
      );
    }

    if (questionType === "checkbox") {
      let selected = [];
      try {
        selected = answer.answer_json ? JSON.parse(answer.answer_json) : [];
      } catch (e) {
        console.warn("Failed to parse checkbox answer_json", e);
      }
      return (
        <div className="space-y-2">
          {selected.length > 0 ? (
            selected.map((option, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-green-600 text-lg"></i>
                <span className="text-gray-800">{option}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No options selected</p>
          )}
        </div>
      );
    }

    // Fallback for any unexpected type
    return (
      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
        <p className="text-gray-800">
          {answer.answer_value != null
            ? answer.answer_value
            : answer.answer_text || "No response recorded"}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Submission not found</p>
      </div>
    );
  }

  if (!response.sections?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        This submission has no sections or questions.
      </div>
    );
  }

  // Flatten all answers from all sections
  const allAnswers = response.sections.flatMap((section) => section.answers || []);

  // General answers (no teacher/subject)
  const generalAnswers = allAnswers.filter((a) => !a.teacher_id && !a.subject_id);

  // Teacher/subject specific answers
  const teacherAnswers = allAnswers.filter((a) => a.teacher_id && a.subject_id);

  // Group by teacher → subject
  const groupedByTeacherSubject = {};

  teacherAnswers.forEach((ans) => {
    const teacherKey = ans.teacher_name || `Teacher #${ans.teacher_id}`;
    const subjectKey = ans.subject_name || `Subject #${ans.subject_id}`;

    if (!groupedByTeacherSubject[teacherKey]) {
      groupedByTeacherSubject[teacherKey] = {};
    }
    if (!groupedByTeacherSubject[teacherKey][subjectKey]) {
      groupedByTeacherSubject[teacherKey][subjectKey] = [];
    }

    groupedByTeacherSubject[teacherKey][subjectKey].push(ans);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {response.form_name || "Feedback Submission"}
            </h1>
            <p className="text-gray-600">
              <i className="bi bi-person mr-1.5"></i>
              Submitted by: <span className="font-medium">{response.user_name}</span>
            </p>
          </div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <i className="bi bi-check-circle mr-1.5"></i>
            Submitted
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <div>
            <i className="bi bi-calendar-check mr-1.5"></i>
            {response.submitted_at
              ? new Date(response.submitted_at).toLocaleString()
              : "N/A"}
          </div>
          <div>
            <i className="bi bi-book mr-1.5"></i>
            {response.program_name} • {response.class_year_name} • {response.semester_name}
          </div>
        </div>
      </div>

      {/* General Section */}
      {generalAnswers.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
            General Feedback
          </h2>
          <div className="space-y-6">
            {generalAnswers.map((answer, idx) => (
              <div
                key={answer.answer_id}
                className="pb-5 border-b last:border-0 last:pb-0"
              >
                <h3 className="text-gray-800 font-medium mb-3">
                  {idx + 1}. {answer.question_label}
                </h3>
                {renderAnswer(answer)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher + Subject Sections */}
      {Object.keys(groupedByTeacherSubject).length > 0 ? (
        Object.entries(groupedByTeacherSubject).map(([teacherName, subjects]) => (
          <div key={teacherName} className="mb-10">
            {/* Teacher header */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg mb-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <i className="bi bi-person-badge-fill text-blue-700 text-2xl"></i>
                {teacherName}
              </h2>
            </div>

            {/* Subjects under this teacher */}
            {Object.entries(subjects).map(([subjectName, answers]) => (
              <div
                key={subjectName}
                className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-5 border-b pb-2">
                  {subjectName}
                </h3>

                <div className="space-y-6">
                  {answers.map((answer, qIndex) => (
                    <div
                      key={answer.answer_id}
                      className="pb-5 border-b last:border-0 last:pb-0"
                    >
                      <p className="text-gray-800 font-medium mb-3">
                        {qIndex + 1}. {answer.question_label}
                      </p>
                      {renderAnswer(answer)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        !generalAnswers.length && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">No answers recorded in this submission.</p>
          </div>
        )
      )}

      {/* Navigation */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition border border-gray-300"
        >
          <i className="bi bi-arrow-left"></i>
          Back
        </button>
      </div>
    </div>
  );
}