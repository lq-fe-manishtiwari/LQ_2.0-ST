import React, { useState, useEffect } from 'react';
import { Check, Info, Star, Award, MessageSquare, Target, ClipboardCheck } from 'lucide-react';

const RubricEvaluator = ({ rubric, onMarksChange, initialSelections = {} }) => {
    const [selections, setSelections] = useState(initialSelections); // { criterionId: levelId }
    const [comments, setComments] = useState({}); // For single point/general comments

    useEffect(() => {
        if (!rubric) return;

        let total = 0;
        const feedbackLines = [];

        if (rubric.rubric_type === 'HOLISTIC') {
            const selectedLevel = (rubric.performance_levels || []).find(l => l.level_id === selections.holistic);
            if (selectedLevel) {
                total = selectedLevel.points || 0;
                feedbackLines.push(`${selectedLevel.level_name}: ${selectedLevel.description}`);
            }
        } else if (rubric.rubric_type === 'SINGLE_POINT') {
            (rubric.criteria || []).forEach(criterion => {
                const isMet = selections[criterion.criterion_id] === 'COMPLETE';
                if (isMet) {
                    // Single Point usually has a base point or is binary
                    total += criterion.points || (rubric.total_points / (rubric.criteria?.length || 1)) || 0;
                }
                const imp = comments[`${criterion.criterion_id}_improvement`];
                const exc = comments[`${criterion.criterion_id}_exceeds`];
                if (imp) feedbackLines.push(`${criterion.criterion_name} (Improvement): ${imp}`);
                if (exc) feedbackLines.push(`${criterion.criterion_name} (Exceeds): ${exc}`);
            });
        } else if (rubric.rubric_type === 'DEVELOPMENTAL') {
            (rubric.criteria || rubric.portfolios || []).forEach(item => {
                const itemId = item.criterion_id || item.id;
                if (selections[itemId] === 1) {
                    total += 1; // binary progress
                    feedbackLines.push(`Achieved: ${item.criterion_name || item.name}`);
                }
            });
        } else {
            // Analytic
            (rubric.criteria || []).forEach(criterion => {
                const selectedLevelId = selections[criterion.criterion_id];
                const selectedLevel = (rubric.performance_levels || []).find(l => l.level_id === selectedLevelId);

                if (selectedLevel) {
                    const weight = (criterion.weight_percentage || 100) / 100;
                    total += (selectedLevel.points || 0) * weight;
                    feedbackLines.push(`${criterion.criterion_name} (${selectedLevel.level_name}): ${selectedLevel.description}`);
                }
            });
        }

        onMarksChange?.(total, feedbackLines.join('\n'));
    }, [selections, comments, rubric]);

    if (!rubric) return <div className="p-10 text-center text-slate-400 italic">No rubric configuration found.</div>;

    const handleLevelSelect = (criterionId, levelId) => {
        setSelections(prev => ({ ...prev, [criterionId]: levelId }));
    };

    const handleCommentChange = (id, text) => {
        setComments(prev => ({ ...prev, [id]: text }));
    };

    const maxScore = () => {
        if (rubric.rubric_type === 'ANALYTIC') {
            return (rubric.criteria || []).reduce((sum, c) => {
                const levels = rubric.performance_levels || [];
                const maxLevelPoints = Math.max(...levels.map(l => l.points || 0), 0);
                return sum + (maxLevelPoints * ((c.weight_percentage || 100) / 100));
            }, 0);
        }
        return rubric.total_points || 0;
    };

    const calculateCurrentTotal = () => {
        let total = 0;
        if (rubric.rubric_type === 'HOLISTIC') {
            const selectedLevel = (rubric.performance_levels || []).find(l => l.level_id === selections.holistic);
            total = selectedLevel?.points || 0;
        } else if (rubric.rubric_type === 'SINGLE_POINT') {
            (rubric.criteria || []).forEach(c => {
                if (selections[c.criterion_id] === 'COMPLETE') total += c.points || (rubric.total_points / (rubric.criteria?.length || 1)) || 0;
            });
        } else if (rubric.rubric_type === 'DEVELOPMENTAL') {
            Object.values(selections).forEach(v => { if (v === 1) total += 1; });
        } else {
            (rubric.criteria || []).forEach(c => {
                const sl = (rubric.performance_levels || []).find(l => l.level_id === selections[c.criterion_id]);
                if (sl) total += (sl.points || 0) * ((c.weight_percentage || 100) / 100);
            });
        }
        return total.toFixed(1);
    };

    const renderAnalytic = () => (
        <div className="space-y-8">
            {(rubric.criteria || []).map(criterion => (
                <div key={criterion.criterion_id} className="group">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800">{criterion.criterion_name}</h4>
                            <p className="text-xs text-slate-500">{criterion.criterion_description}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Weight: {criterion.weight_percentage}%
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(rubric.performance_levels || []).sort((a, b) => b.points - a.points).map(level => {
                            const isSelected = selections[criterion.criterion_id] === level.level_id;
                            const cell = (rubric.cells || []).find(c => c.criterion_id === criterion.criterion_id && c.level_id === level.level_id);

                            return (
                                <button
                                    key={level.level_id}
                                    onClick={() => handleLevelSelect(criterion.criterion_id, level.level_id)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all relative group/btn ${isSelected
                                        ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100'
                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {level.level_name}
                                        </span>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-400'
                                            }`}>
                                            {level.points} pts
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed italic">
                                        {cell?.cell_description || level.description || 'No detailed criteria provided for this level.'}
                                    </p>
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-lg animate-in zoom-in-50">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderHolistic = () => (
        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
            {(rubric.performance_levels || []).sort((a, b) => b.points - a.points).map(level => {
                const isSelected = selections.holistic === level.level_id;
                return (
                    <button
                        key={level.level_id}
                        onClick={() => handleLevelSelect('holistic', level.level_id)}
                        className={`w-full flex items-center gap-6 p-6 rounded-2xl border-2 transition-all group ${isSelected
                            ? 'border-orange-500 bg-orange-50 shadow-md ring-4 ring-orange-100'
                            : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 transition-transform duration-300 ${isSelected
                            ? 'bg-orange-500 text-white shadow-lg scale-110'
                            : 'bg-white border-2 border-slate-100 text-slate-300 group-hover:border-orange-200 group-hover:text-orange-200'
                            }`}>
                            {level.points}
                        </div>
                        <div className="text-left flex-1">
                            <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>
                                {level.level_name}
                            </h4>
                            <p className="text-slate-500 text-sm italic">{level.description}</p>
                        </div>
                        {isSelected && <Check className="w-6 h-6 text-orange-500" />}
                    </button>
                );
            })}
        </div>
    );

    const renderSinglePoint = () => (
        <div className="space-y-6">
            {(rubric.criteria || []).map(criterion => {
                const isMet = selections[criterion.criterion_id] === 'COMPLETE';
                return (
                    <div key={criterion.criterion_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">{criterion.criterion_name}</h4>
                                <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5 tracking-wider">Evaluation Protocol</div>
                            </div>
                            <button
                                onClick={() => handleLevelSelect(criterion.criterion_id, isMet ? null : 'COMPLETE')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all ${isMet
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Target className={`w-4 h-4 ${isMet ? 'text-blue-200' : 'text-slate-400'}`} />
                                {isMet ? 'Standard Achieved' : 'Achieved?'}
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 border-l-4 border-l-blue-500">
                                <span className="text-[10px] font-bold text-blue-600 uppercase mb-1 block tracking-wider">The Standard</span>
                                <p className="text-sm text-slate-700 italic leading-relaxed">
                                    {criterion.criterion_description || criterion.standard || 'No standard description available.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">
                                        <MessageSquare className="w-3 h-3 text-red-400" />
                                        Areas for Improvement
                                    </label>
                                    <textarea
                                        className="w-full h-24 p-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-400 transition-all text-sm bg-slate-50/30"
                                        placeholder="Note what needs work..."
                                        value={comments[`${criterion.criterion_id}_improvement`] || ''}
                                        onChange={(e) => handleCommentChange(`${criterion.criterion_id}_improvement`, e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">
                                        <Award className="w-3 h-3 text-green-400" />
                                        Evidence of Excellence
                                    </label>
                                    <textarea
                                        className="w-full h-24 p-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all text-sm bg-slate-50/30"
                                        placeholder="Note student strengths..."
                                        value={comments[`${criterion.criterion_id}_exceeds`] || ''}
                                        onChange={(e) => handleCommentChange(`${criterion.criterion_id}_exceeds`, e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderDevelopmental = () => (
        <div className="space-y-4 max-w-2xl mx-auto">
            {(rubric.criteria || rubric.portfolios || []).map(item => {
                const itemId = item.criterion_id || item.id;
                const isSelected = selections[itemId] === 1;
                return (
                    <div
                        key={itemId}
                        onClick={() => handleLevelSelect(itemId, isSelected ? 0 : 1)}
                        className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-5 transition-all duration-300 ${isSelected
                            ? 'bg-emerald-500 border-emerald-500 rotate-0 shadow-lg'
                            : 'bg-white border-slate-200 -rotate-90 group-hover:border-emerald-300'
                            }`}>
                            {isSelected && <Check className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                {item.criterion_name || item.name}
                            </h4>
                            <p className="text-xs text-slate-500 italic mt-0.5">{item.criterion_description || 'Progress indicator'}</p>
                        </div>
                        {item.is_required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded uppercase tracking-widest border border-red-200">
                                Required
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="rubric-evaluator-container">
            {/* Rubric Info Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${rubric.rubric_type === 'ANALYTIC' ? 'bg-blue-100 text-blue-600' :
                        rubric.rubric_type === 'HOLISTIC' ? 'bg-orange-100 text-orange-600' :
                            rubric.rubric_type === 'SINGLE_POINT' ? 'bg-indigo-100 text-indigo-600' :
                                'bg-emerald-100 text-emerald-600'
                        }`}>
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900">{rubric.rubric_name}</h2>
                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded uppercase tracking-widest">
                                {rubric.rubric_type}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                            Evaluate student performance across organized criteria and standards.
                        </p>
                    </div>
                </div>

                <div className="text-center md:text-right px-8 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[150px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Points</div>
                    <div className="flex items-baseline justify-center md:justify-end gap-1">
                        <span className="text-3xl font-black text-blue-600">{calculateCurrentTotal()}</span>
                        <span className="text-sm font-bold text-slate-300">/ {maxScore()}</span>
                    </div>
                </div>
            </div>

            {/* Evaluator Layouts */}
            <div className="evaluator-workspace pb-10">
                {rubric.rubric_type === 'ANALYTIC' && renderAnalytic()}
                {rubric.rubric_type === 'HOLISTIC' && renderHolistic()}
                {rubric.rubric_type === 'SINGLE_POINT' && renderSinglePoint()}
                {rubric.rubric_type === 'DEVELOPMENTAL' && renderDevelopmental()}
            </div>


        </div>
    );
};

export default RubricEvaluator;
