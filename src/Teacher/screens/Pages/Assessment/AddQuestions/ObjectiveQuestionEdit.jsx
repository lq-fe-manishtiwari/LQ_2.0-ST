import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ObjectiveQuestionEdit({
    question = {},
    questionLevels = [],
    bloomsLevels = [],
    setQuestion = () => { },
    submitting = false,
    onSave = () => { },
}) {
    if (!question || Object.keys(question).length === 0) {
        return (
            <div className="p-10 border border-amber-300 bg-amber-50 rounded-xl text-amber-800">
                <p className="font-medium text-lg">Question data is missing or failed to load.</p>
            </div>
        );
    }

    const updateField = (field, value) => {
        setQuestion({ ...question, [field]: value });
    };

    const updateOption = (letter, value) => {
        updateField(`option${letter}`, value);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-50 border rounded-xl p-6 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                                className="w-full border rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={question.bloomsLevel || ''}
                                onChange={(e) => {
                                    const selected = bloomsLevels.find(b => b.level_name === e.target.value);
                                    setQuestion({
                                        ...question,
                                        bloomsLevel: e.target.value,
                                        blooms_level_id: selected?.blooms_level_id || null
                                    });
                                }}
                            >
                                <option value="">Select Level</option>
                                {bloomsLevels.map((b) => (
                                    <option key={b.blooms_level_id} value={b.level_name}>{b.level_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Level</label>
                        <div className="relative">
                            <select
                                className="w-full border rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={question.questionLevel || ''}
                                onChange={(e) => {
                                    const selected = questionLevels.find(l => l.question_level_type === e.target.value);
                                    setQuestion({
                                        ...question,
                                        questionLevel: e.target.value,
                                        question_level_id: selected?.question_level_id || null
                                    });
                                }}
                            >
                                <option value="">Select Level</option>
                                {questionLevels.map((l) => (
                                    <option key={l.question_level_id} value={l.question_level_type}>{l.question_level_type}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Marks <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                            value={question.defaultMarks || ''}
                            onChange={(e) => updateField('defaultMarks', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Options (Mark correct answer)</label>
                    <div className="space-y-4">
                        {['A', 'B', 'C', 'D', 'E'].slice(0, Number(question.noOfOptions || 4)).map((letter) => (
                            <div key={letter} className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={question.answer === letter}
                                    onChange={() => updateField('answer', letter)}
                                    className="mt-3 w-5 h-5 text-blue-600"
                                />
                                <span className="mt-2 font-bold text-gray-400 w-4">{letter}</span>
                                <textarea
                                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                    value={question[`option${letter}`] || ''}
                                    onChange={(e) => updateOption(letter, e.target.value)}
                                    placeholder={`Option ${letter}...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        onClick={onSave}
                        disabled={submitting}
                        className={`px-12 py-3 rounded-lg text-white font-bold shadow-md transition ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {submitting ? 'Updating...' : 'Update Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}
