// ObjectiveQuestionEdit.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ObjectiveQuestionEdit({
  question = {},           // ← important default value
  questionLevels = [],
  bloomsLevels = [],
  setQuestion = () => {},
  submitting = false,
  onSave = () => {},
}) {
  // Early return if no real data arrived
  if (!question || Object.keys(question).length === 0) {
    console.warn("ObjectiveQuestionEdit received empty/missing question prop");
    return (
      <div className="p-10 border border-amber-300 bg-amber-50 rounded-xl text-amber-800">
        <p className="font-medium text-lg">Question data is missing or failed to load.</p>
        <p className="mt-3">Please go back and try again.</p>
      </div>
    );
  }

  const updateField = (field, value) => {
    setQuestion({
  ...question,
  [field]: value,
});

  };

  const updateOption = (letter, value) => {
    updateField(`option${letter}`, value);
  };

  const setCorrectAnswer = (letter) => {
    updateField('answer', letter);
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
            rows={5}
            value={question.question || ''}
            onChange={(e) => updateField('question', e.target.value)}
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
                onChange={(e) => updateField('bloomsLevel', e.target.value)}
              >
                <option value="">Select Bloom's Level</option>
                {bloomsLevels.map((b) => (
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
                onChange={(e) => updateField('questionLevel', e.target.value)}
              >
                <option value="">Select Level</option>
                {questionLevels.map((l) => (
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
              onChange={(e) => updateField('defaultMarks', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Options</label>
          <div className="space-y-4">
            {['A', 'B', 'C', 'D', 'E']
              .slice(0, Number(question.noOfOptions || 4))
              .map((letter) => (
                <div key={letter} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">
                    {letter}
                  </div>
                  <textarea
                    className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                    value={question[`option${letter}`] || ''}
                    onChange={(e) => updateOption(letter, e.target.value)}
                    placeholder={`Option ${letter}...`}
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={question.answer === letter}
                      onChange={() => setCorrectAnswer(letter)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Correct</span>
                  </label>
                </div>
              ))}
          </div>
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