// SubjectiveQuestionEdit.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SubjectiveQuestionEdit({
  question,
  questionLevels,
  bloomsLevels,
  setQuestion,
  submitting,
  onSave,
}) {
  const updateField = (field, value) => {
    setQuestion({
  ...question,
  [field]: value,
});

  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 border rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            value={question.question || ''}
            onChange={e => updateField('question', e.target.value)}
            placeholder="Enter question text..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bloom's Level</label>
            <div className="relative">
              <select
                className="w-full border rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={question.bloomsLevel || ''}
                onChange={e => updateField('bloomsLevel', e.target.value)}
              >
                <option value="">Select Bloom's Level</option>
                {bloomsLevels.map(b => (
                  <option key={b.blooms_level_id} value={b.level_name}>
                    {b.level_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Question Level</label>
            <div className="relative">
              <select
                className="w-full border rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={question.questionLevel || ''}
                onChange={e => updateField('questionLevel', e.target.value)}
              >
                <option value="">Select Level</option>
                {questionLevels.map(l => (
                  <option key={l.question_level_id} value={l.question_level_type}>
                    {l.question_level_type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question.defaultMarks || ''}
              onChange={e => updateField('defaultMarks', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Model Answer (optional)</label>
          <textarea
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={question.modelAnswer || ''}
            onChange={e => updateField('modelAnswer', e.target.value)}
            placeholder="Enter model / expected answer..."
          />
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onSave}
            disabled={submitting}
            className={`px-10 py-3 rounded-lg text-white font-medium transition ${
              submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Updating...' : 'Update Question'}
          </button>
        </div>
      </div>
    </div>
  );
}