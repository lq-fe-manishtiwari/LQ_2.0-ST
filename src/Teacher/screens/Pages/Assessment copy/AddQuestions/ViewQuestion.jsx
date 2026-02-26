import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { QuestionsService } from '../Services/questions.service';

export default function ViewQuestion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    if (location.state?.question) {
      // Use passed question data
      setQuestion(location.state.question);
      setLoading(false);
    } else if (id) {
      // Fallback to API call
      fetchQuestion();
    }
  }, [id, location.state]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await QuestionsService.getQuestionById(id);
      setQuestion(response);
    } catch (error) {
      console.error('Error fetching question:', error);
      alert('Failed to load question');
    } finally {
      setLoading(false);
    }
  };



  const handleCancel = () => {
    navigate('/admin-assessment/questions');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Question not found</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
          View Question
        </h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {question.type === 'RUBRIC' || question.rubric ? (
        <RubricQuestionView question={question} />
      ) : question.questions && question.questions.length > 0 ? (
        <div className="space-y-6">
          {question.questions.map((qItem, index) => {
            const fullQuestionData = {
              ...qItem.question_details,
              program_name: qItem.question_details?.program_name || question.program_name, // Fallback if needed
              subject_name: qItem.question_details?.subject_name || question.subject_name || question.subject?.subject_name,
              module_name: qItem.question_details?.module_name || question.module_name,
              unit_name: qItem.question_details?.unit_name || question.unit_name,
              marks_override: qItem.marks_override // Use override marks if available
            };

            return (
              <div key={qItem.mapping_id || index} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="mb-2 font-bold text-gray-400 text-sm uppercase tracking-wider">
                  Question {qItem.question_order || index + 1}
                </div>
                {fullQuestionData.question_category === 'OBJECTIVE' ? (
                  <ObjectiveQuestionView question={fullQuestionData} />
                ) : (
                  <SubjectiveQuestionView question={fullQuestionData} />
                )}
              </div>
            );
          })}
        </div>
      ) : question.question_category === 'OBJECTIVE' ? (
        <ObjectiveQuestionView question={question} />
      ) : (
        <SubjectiveQuestionView question={question} />
      )}
    </div>
  );
}

// Rubric Question View Component
const RubricQuestionView = ({ question }) => {
  const { rubric } = question; // The user's JSON has 'rubric' object at top level or inside? The JSON shows it at top level. 
  if (!rubric) return <div>No Rubric Data Available</div>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold">Rubric Details</h3>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {rubric.rubric_type}
        </span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          {question.category || 'SUBJECTIVE'}
        </span>
      </div>

      <div className="space-y-6">
        {/* Rubric Info */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h4 className="font-bold text-indigo-900 text-lg mb-2">{rubric.rubric_name}</h4>
          {rubric.description && <p className="text-indigo-800 text-sm mb-4">{rubric.description}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block font-semibold text-indigo-600">Subject:</span>
              <span className="text-indigo-900">{rubric.subject_name}</span>
            </div>
            <div>
              <span className="block font-semibold text-indigo-600">Type:</span>
              <span className="text-indigo-900">{rubric.rubric_category}</span>
            </div>
            <div>
              <span className="block font-semibold text-indigo-600">Scoring:</span>
              <span className="text-indigo-900">{rubric.scoring_type}</span>
            </div>
          </div>
        </div>

        {/* Holistic Levels */}
        {rubric.rubric_type === 'HOLISTIC' && rubric.performance_levels && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Performance Levels</h4>
            <div className="grid gap-3">
              {rubric.performance_levels.sort((a, b) => a.level_order - b.level_order).map((level) => (
                <div key={level.level_id} className="border rounded-lg p-4 flex gap-4 items-start bg-gray-50">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0">
                    {level.points}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">{level.level_name}</h5>
                    <p className="text-gray-600 text-sm mt-1">{level.description}</p>
                    {level.image_url && (
                      <img src={level.image_url} alt={level.level_name} className="mt-2 h-20 w-auto rounded border" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytic Criteria */}
        {rubric.rubric_type === 'ANALYTIC' && rubric.criteria && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Criteria</h4>
            <div className="space-y-4">
              {rubric.criteria.map((c) => (
                <div key={c.criterion_id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h5 className="font-bold text-gray-900">{c.criterion_name}</h5>
                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">Weight: {c.weight_percentage}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{c.criterion_description}</p>

                  {/* Levels for this criteria */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {rubric.performance_levels?.sort((a, b) => b.points - a.points).map((l) => (
                      <div key={l.level_id} className="p-2 border rounded bg-white text-xs">
                        <div className="font-bold mb-1 flex justify-between">
                          <span>{l.level_name}</span>
                          <span>{l.points} pts</span>
                        </div>
                        <p className="text-gray-500 line-clamp-3">
                          {rubric.cells?.find(row => row.criterion_id === c.criterion_id && row.level_id === l.level_id)?.cell_description || l.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developmental Portfolios */}
        {rubric.rubric_type === 'DEVELOPMENTAL' && rubric.portfolios && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Portfolios / Milestones</h4>
            <div className="grid gap-3">
              {rubric.portfolios.sort((a, b) => a.portfolio_order - b.portfolio_order).map((portfolio) => (
                <div key={portfolio.portfolio_id} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-900">{portfolio.portfolio_name}</h5>
                    <p className="text-gray-600 text-sm">{portfolio.portfolio_description}</p>
                  </div>
                  {portfolio.is_required && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Objective Question View Component
const ObjectiveQuestionView = ({ question }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold">Objective Question</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {question.question_type}
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {question.default_marks} Marks
        </span>
      </div>

      <div className="space-y-6">
        {/* Question Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm font-semibold text-gray-600">Program:</span>
            <p className="text-gray-800">{question.program_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Subject:</span>
            <p className="text-gray-800">{question.subject_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Module:</span>
            <p className="text-gray-800">{question.module_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Unit:</span>
            <p className="text-gray-800">{question.unit_name || 'N/A'}</p>
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question
          </label>
          <div className="w-full border rounded px-3 py-3 bg-gray-50 min-h-[80px]">
            {question.question}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${option.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${option.is_correct ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-gray-800">{option.option_text}</span>
                {option.is_correct && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <span className="text-sm font-semibold text-blue-700">Question Level:</span>
            <p className="text-blue-800">{question.question_level_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-blue-700">Bloom's Level:</span>
            <p className="text-blue-800">{question.blooms_level_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-blue-700">Status:</span>
            <p className="text-blue-800">{question.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subjective Question View Component
const SubjectiveQuestionView = ({ question }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold">Subjective Question</h3>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {question.question_type}
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {question.default_marks} Marks
        </span>
      </div>

      <div className="space-y-6">
        {/* Question Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm font-semibold text-gray-600">Program:</span>
            <p className="text-gray-800">{question.program_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Subject:</span>
            <p className="text-gray-800">{question.subject_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Module:</span>
            <p className="text-gray-800">{question.module_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600">Unit:</span>
            <p className="text-gray-800">{question.unit_name || 'N/A'}</p>
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question
          </label>
          <div className="w-full border rounded px-3 py-3 bg-gray-50 min-h-[80px]">
            {question.question}
          </div>
        </div>

        {/* Model Answer */}
        {question.model_answer && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model Answer
            </label>
            <div className="w-full border rounded px-3 py-3 bg-gray-50 min-h-[100px]">
              {question.model_answer}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
          <div>
            <span className="text-sm font-semibold text-purple-700">Question Level:</span>
            <p className="text-purple-800">{question.question_level_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-purple-700">Bloom's Level:</span>
            <p className="text-purple-800">{question.blooms_level_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-purple-700">Status:</span>
            <p className="text-purple-800">{question.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};