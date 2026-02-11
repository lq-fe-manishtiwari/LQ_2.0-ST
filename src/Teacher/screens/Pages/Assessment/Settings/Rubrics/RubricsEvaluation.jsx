import React, { useState, useEffect } from 'react';
import { RUBRIC_TYPES } from './RubricsType';

const RubricEvaluation = ({ rubrics, initialRubricId }) => {
    const [selectedRubricId, setSelectedRubricId] = useState(initialRubricId || (rubrics.length > 0 ? rubrics[0].id : null));
    const [scores, setScores] = useState({});
    const [comments, setComments] = useState({});

    useEffect(() => {
        if (initialRubricId) {
            setSelectedRubricId(initialRubricId);
            setScores({});
            setComments({});
        }
    }, [initialRubricId]);

    const selectedRubric = rubrics.find(r => r.id === parseInt(selectedRubricId));

    if (!selectedRubric) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-3">ðŸ“</div>
                <h2 className="text-xl font-bold text-slate-800">Ready to Evaluate?</h2>
                <p className="text-slate-500 mt-1 text-sm">Please create a rubric first or select one from the list.</p>
            </div>

        );
    }

    // --- Evaluation Logic ---
    const handleScore = (criterionId, score) => {
        setScores(prev => ({ ...prev, [criterionId]: score }));
    };

    const handleComment = (id, text) => {
        setComments(prev => ({ ...prev, [id]: text }));
    };

    const calculateTotal = () => {
        if (selectedRubric.type === RUBRIC_TYPES.ANALYTIC) {
            return Object.values(scores).reduce((a, b) => a + b, 0);
        }
        if (selectedRubric.type === RUBRIC_TYPES.DEVELOPMENTAL) {
            // Simple scoring: 1 point per checked item
            return Object.values(scores).filter(v => v === 1).length;
        }

        return scores['holistic'] || 0;
    };

    const maxScore = () => {
        if (selectedRubric.type === RUBRIC_TYPES.ANALYTIC) {
            return selectedRubric.criteria.reduce((sum, c) => sum + Math.max(...c.levels.map(l => l.score)), 0);
        }
        if (selectedRubric.type === RUBRIC_TYPES.HOLISTIC) {
            return Math.max(...selectedRubric.levels.map(l => l.score));
        }
        if (selectedRubric.type === RUBRIC_TYPES.DEVELOPMENTAL) {
            return selectedRubric.items.length;
        }

        return 0; // Single point & Reflective are qualitative
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-140px)]">
            {/* Helper / Student Work Side */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 order-2 lg:order-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
                    <h3 className="font-bold text-slate-400 text-xs   tracking-wider mb-4">Select Assessment</h3>
                    <select
                        className="w-full p-2 border border-blue-200 rounded-lg bg-blue-50/50 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => {
                            setSelectedRubricId(e.target.value);
                            setScores({});
                            setComments({});
                        }}
                        value={selectedRubricId || ''}
                    >
                        {rubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                    </select>

                    <div className="mt-8">
                        <h4 className="font-bold text-slate-800 mb-2">Student Submission</h4>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 flex items-center justify-center text-slate-400 text-sm italic">
                            (Placeholder: Student document or link would appear here)
                        </div>
                    </div>
                </div>
            </div>

            {/* Grading Side */}
            <div className="w-full lg:w-2/3 flex flex-col order-1 lg:order-2 h-auto lg:h-[80vh] lg:overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
                <div className="flex justify-between items-end mb-4 pb-3 border-b border-gray-100">
                    <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold   tracking-wider ${selectedRubric.type === RUBRIC_TYPES.ANALYTIC ? 'bg-blue-100 text-blue-700' :
                            selectedRubric.type === RUBRIC_TYPES.HOLISTIC ? 'bg-indigo-100 text-indigo-700' :
                                selectedRubric.type === RUBRIC_TYPES.DEVELOPMENTAL ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-purple-100 text-purple-700'
                            }`}>
                            {selectedRubric.type}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedRubric.title}</h2>
                    </div>
                    {(selectedRubric.type === RUBRIC_TYPES.ANALYTIC || selectedRubric.type === RUBRIC_TYPES.HOLISTIC || selectedRubric.type === RUBRIC_TYPES.DEVELOPMENTAL) && (
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold  ">Total Score</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {calculateTotal()} <span className="text-sm text-slate-300">/ {maxScore()}</span>
                            </div>
                        </div>
                    )}
                </div>


                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* ANALYTIC */}
                    {selectedRubric.type === RUBRIC_TYPES.ANALYTIC && selectedRubric.criteria.map((criterion) => (
                        <div key={criterion.id} className="mb-8">
                            <div className="flex justify-between mb-4">
                                <h4 className="font-bold text-lg text-slate-800">{criterion.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {criterion.levels.sort((a, b) => b.score - a.score).map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => handleScore(criterion.id, level.score)}
                                        className={`p-3 rounded-lg border-2 text-left transition-all relative ${scores[criterion.id] === level.score
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                            : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold text-sm ${scores[criterion.id] === level.score ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {level.label}
                                            </span>
                                            <span className="bg-white px-2 py-0.5 rounded text-xs font-bold border border-slate-200 shadow-sm">
                                                {level.score} pts
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{level.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* HOLISTIC */}
                    {selectedRubric.type === RUBRIC_TYPES.HOLISTIC && (
                        <div className="space-y-3">
                            {selectedRubric.levels.sort((a, b) => b.score - a.score).map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => handleScore('holistic', level.score)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${scores['holistic'] === level.score
                                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                        : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 ${scores['holistic'] === level.score ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-300'
                                        }`}>
                                        {level.score}
                                    </div>
                                    <div className="text-left">
                                        <h4 className={`font-bold text-lg ${scores['holistic'] === level.score ? 'text-orange-900' : 'text-slate-700'}`}>
                                            {level.label}
                                        </h4>
                                        <p className="text-slate-500 text-sm">{level.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* SINGLE POINT */}
                    {selectedRubric.type === RUBRIC_TYPES.SINGLE_POINT && selectedRubric.criteria.map((criterion) => (
                        <div key={criterion.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="mb-4 text-center">
                                <h4 className="font-bold text-lg text-slate-800 mb-1">{criterion.name}</h4>
                                <div className="inline-block bg-white px-4 py-2 rounded-lg border border-blue-100 text-blue-700 font-medium text-sm shadow-sm">
                                    Target: {criterion.standard}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400   tracking-wider mb-2">Areas for Improvement</label>
                                    <textarea
                                        className="w-full h-32 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:outline-none text-sm"
                                        placeholder="Feedback on what needs work..."
                                        onChange={(e) => handleComment(`${criterion.id}_improvement`, e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400   tracking-wider mb-2">Exceeds Expectations</label>
                                    <textarea
                                        className="w-full h-32 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-200 focus:border-green-400 focus:outline-none text-sm"
                                        placeholder="Feedback on what was done well..."
                                        onChange={(e) => handleComment(`${criterion.id}_exceeds`, e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* DEVELOPMENTAL */}
                    {selectedRubric.type === RUBRIC_TYPES.DEVELOPMENTAL && (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3 mb-4">
                                <span className="text-2xl">ðŸŒ±</span>
                                <div>
                                    <h4 className="font-bold text-emerald-900">Portfolio Progress Tracker</h4>
                                    <p className="text-sm text-emerald-700">Mark the items achieved by the student in their 4-year growth journey.</p>
                                </div>
                            </div>
                            {selectedRubric.items.map((item) => (
                                <div key={item.id}
                                    className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${scores[item.id] === 1 ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                    onClick={() => handleScore(item.id, scores[item.id] === 1 ? 0 : 1)}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all ${scores[item.id] === 1 ? 'bg-emerald-500 border-emerald-500 rotate-0' : 'border-slate-300 bg-white -rotate-90'
                                        }`}>
                                        {scores[item.id] === 1 && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </div>
                                    <div className="grow">
                                        <p className={`font-bold text-base ${scores[item.id] === 1 ? 'text-emerald-900' : 'text-slate-700'}`}>{item.label}</p>
                                        {item.required && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black   rounded tracking-wider">Required Outcome</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}



                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md active:scale-95 transition-all"

                        onClick={() => {
                            const result = {
                                rubricId: selectedRubric.id,
                                rubricTitle: selectedRubric.title,
                                scores: scores,
                                comments: comments,
                                totalScore: calculateTotal(),
                                maxScore: maxScore(),
                                timestamp: new Date().toISOString()
                            };
                            console.log('Evaluation Published:', result);
                            alert(`Evaluation for "${selectedRubric.title}" published!\n\nTotal Score: ${result.totalScore}/${result.maxScore}\n\nCheck console for full data object.`);
                        }}
                    >
                        Publish Evaluation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RubricEvaluation;