import React, { useState, useEffect } from 'react';
import { FileText, X, Download } from 'lucide-react';
import { RUBRIC_TYPES } from '../Settings/Rubrics/RubricType';
import { calculateRubricScore } from '../Settings/Rubrics/RubricScoringUtils';
const RubricAssessmentView = ({
    isOpen,
    onClose,
    assessmentType = RUBRIC_TYPES.ANALYTIC,
    status = 'Pending',
    rubricData = null,
    isPreview = false,
    isInline = false
}) => {
    const [activeRubricType, setActiveRubricType] = useState(assessmentType);

    // Update local state when props change
    useEffect(() => {
        if (isOpen || isInline) {
            // Normalize Type Mapping from API (e.g., "SINGLE_POINT" -> RUBRIC_TYPES.SINGLE_POINT)
            const getNormalizedType = (type) => {
                if (!type) return RUBRIC_TYPES.ANALYTIC;
                const t = type.toUpperCase();
                if (t === 'ANALYTIC' || t.includes('ANALYTIC')) return RUBRIC_TYPES.ANALYTIC;
                if (t === 'HOLISTIC' || t.includes('HOLISTIC')) return RUBRIC_TYPES.HOLISTIC;
                if (t === 'SINGLE_POINT' || t.includes('SINGLE')) return RUBRIC_TYPES.SINGLE_POINT;
                if (t === 'DEVELOPMENTAL' || t.includes('DEVELOPMENTAL')) return RUBRIC_TYPES.DEVELOPMENTAL;
                return type;
            };

            const type = getNormalizedType(rubricData?.rubric_type || rubricData?.type || assessmentType);
            setActiveRubricType(type);
        }
    }, [isOpen, isInline, assessmentType, rubricData]);

    if (!isOpen && !isInline) return null;

    const isGraded = !isPreview && (status === 'Graded' || status === 'Completed');

    // --- EXACT MAPPING LOGIC FROM RubricEvaluation.jsx ---
    const selectedRubric = rubricData || {};

    const getCriteria = () => {
        return selectedRubric.criteria || [];
    };

    const getPerformanceLevels = () => {
        return selectedRubric.levels || selectedRubric.performance_levels || [];
    };

    const getItems = () => {
        return selectedRubric.items || selectedRubric.portfolios || [];
    };

    // ✅ Group flat performance_levels by criterion_id (for API response format)
    const getLevelsForCriterion = (criterionId) => {
        const allLevels = getPerformanceLevels();
        // If performance_levels is a flat array with criterion_id (API format)
        const flatFiltered = allLevels.filter(l => l.criterion_id === criterionId);
        if (flatFiltered.length > 0) return flatFiltered;
        // Fallback: check if criterion has nested levels
        const criterion = getCriteria().find(c => (c.criterion_id || c.id) === criterionId);
        return criterion?.levels || criterion?.performance_levels || [];
    };

    // ✅ Get cell description for a specific criterion + level (from cells array)
    const getCellDescription = (criterionId, levelId) => {
        const cells = selectedRubric.cells || [];
        const cell = cells.find(c => c.criterion_id === criterionId && c.level_id === levelId);
        return cell?.cell_description || '';
    };

    // ✅ Get unique performance level names (columns) from flat array
    const getUniqueLevelNames = () => {
        const allLevels = getPerformanceLevels();
        const seen = new Set();
        return allLevels
            .filter(l => { if (seen.has(l.level_name)) return false; seen.add(l.level_name); return true; })
            .sort((a, b) => (a.level_order || 0) - (b.level_order || 0));
    };

    const maxScore = () => {
        // Prioritize max marks from response/question context if available
        if (selectedRubric.max_marks || selectedRubric.total_marks || selectedRubric.maxMarks || selectedRubric.question_max_marks) {
            return parseFloat(selectedRubric.max_marks || selectedRubric.total_marks || selectedRubric.maxMarks || selectedRubric.question_max_marks);
        }

        if (activeRubricType === RUBRIC_TYPES.ANALYTIC) {
            const criteria = getCriteria();
            return criteria.reduce((sum, c) => {
                const levels = c.levels || c.performance_levels || [];
                return sum + Math.max(...levels.map(l => l.score || l.points || 0), 0);
            }, 0);
        }
        if (activeRubricType === RUBRIC_TYPES.HOLISTIC) {
            const performanceLevels = getPerformanceLevels();
            return Math.max(...performanceLevels.map(l => l.score || l.points || 0), 0);
        }
        if (activeRubricType === RUBRIC_TYPES.DEVELOPMENTAL) {
            return getItems().length;
        }
        return selectedRubric.total_points || selectedRubric.totalPoints || 0;
    };

    const calculateTotal = () => {
        const scores = selectedRubric.scores || {};
        const obtainedScore = selectedRubric.obtainedScore || 0;

        if (activeRubricType === RUBRIC_TYPES.ANALYTIC) {
            const criteria = getCriteria();
            const totalMarks = maxScore();

            // Check if we have sufficient data to use the advanced scoring formula
            // (weights summing to 100 approx)
            try {
                const calcCriteriaList = criteria.map(c => {
                    const weight = c.weight_percentage || c.weight || 0;

                    let selectedPoints = 0;
                    const cId = c.criterion_id || c.id;
                    if (c.obtainedScore !== undefined) selectedPoints = c.obtainedScore;
                    else if (scores[cId] !== undefined) selectedPoints = scores[cId];

                    const levels = c.levels || c.performance_levels || [];
                    const maxCriterionPoints = Math.max(...levels.map(l => l.score || l.points || 0), 0);

                    const percentage = maxCriterionPoints > 0 ? (selectedPoints / maxCriterionPoints) * 100 : 0;

                    return {
                        criteriaWeight: weight,
                        selectedLevelPercentage: percentage
                    };
                });

                // Use the utility function
                return calculateRubricScore(totalMarks, calcCriteriaList);

            } catch (error) {
                console.warn("Rubric scoring calculation fallback due to:", error.message);
                // Fallback to simple sum if weights setup is invalid
                if (criteria.some(c => c.obtainedScore !== undefined)) {
                    return criteria.reduce((sum, c) => sum + (c.obtainedScore || 0), 0);
                }
                return Object.values(scores).reduce((a, b) => a + b, 0);
            }
        }
        if (activeRubricType === RUBRIC_TYPES.DEVELOPMENTAL) {
            const items = getItems();
            if (items.some(i => i.status === 'Yes' || i.is_achieved)) {
                return items.filter(i => i.status === 'Yes' || i.is_achieved).length;
            }
            return Object.values(scores).filter(v => v === 1).length;
        }
        return scores['holistic'] || obtainedScore || 0;
    };

    const content = (
        <div className={`bg-white shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 ${isInline ? 'h-full border border-gray-100 rounded-xl' : 'h-full sm:max-h-[95vh] sm:max-w-[1200px] sm:rounded-2xl'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-6 border-b border-gray-100 ${isInline ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="flex justify-between items-end w-full">
                    <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${activeRubricType === RUBRIC_TYPES.ANALYTIC ? 'bg-blue-100 text-blue-700' :
                            activeRubricType === RUBRIC_TYPES.HOLISTIC ? 'bg-indigo-100 text-indigo-700' :
                                activeRubricType === RUBRIC_TYPES.DEVELOPMENTAL ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-purple-100 text-purple-700'
                            }`}>
                            {activeRubricType}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedRubric.rubric_name || selectedRubric.title || 'Untitled Rubric'}</h2>
                    </div>
                    {/* Close button for non-inline mode */}
                    {!isInline && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-500 hover:text-red-500 ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white relative">
                {/* Total Score Display - Right-aligned as in Evaluation */}
                {(activeRubricType === RUBRIC_TYPES.ANALYTIC || activeRubricType === RUBRIC_TYPES.HOLISTIC || activeRubricType === RUBRIC_TYPES.DEVELOPMENTAL) && (
                    <div className="flex justify-end mb-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL SCORE</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {calculateTotal()} <span className="text-sm text-slate-300">/ {maxScore()}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 space-y-6">
                    {activeRubricType === RUBRIC_TYPES.ANALYTIC && (() => {
                        const criteria = getCriteria();
                        const uniqueLevels = getUniqueLevelNames();

                        return (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                <table className="w-full border-collapse">
                                    {/* Table Header — Level Names */}
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-r border-slate-200 min-w-[160px]">
                                                Criteria
                                            </th>
                                            <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 border-b border-r border-slate-200 min-w-[80px]">
                                                Weight
                                            </th>
                                            {uniqueLevels.map(level => (
                                                <th
                                                    key={level.level_id}
                                                    className="text-center px-4 py-3 text-sm font-bold text-slate-700 border-b border-r border-slate-200 min-w-[160px] last:border-r-0"
                                                >
                                                    <div>{level.level_name}</div>
                                                    <div className="text-xs font-normal text-blue-600 mt-0.5">{level.points} pts</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Table Body — One row per criterion */}
                                    <tbody>
                                        {criteria.map((criterion, rowIdx) => {
                                            const criterionId = criterion.criterion_id || criterion.id;
                                            const levels = getLevelsForCriterion(criterionId)
                                                .sort((a, b) => (a.level_order || 0) - (b.level_order || 0));

                                            return (
                                                <tr
                                                    key={criterionId}
                                                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                                >
                                                    {/* Criterion Name + Weight */}
                                                    <td className="px-4 py-4 border-b border-r border-slate-200 align-top">
                                                        <div className="font-semibold text-slate-800 text-sm">
                                                            {criterion.criterion_name || criterion.name}
                                                        </div>
                                                        {criterion.criterion_description && (
                                                            <div className="text-xs text-slate-500 mt-1">{criterion.criterion_description}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 border-b border-r border-slate-200 text-center align-top">
                                                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                                            {criterion.weight_percentage || 0}%
                                                        </span>
                                                    </td>

                                                    {/* One cell per performance level */}
                                                    {uniqueLevels.map(uniqueLevel => {
                                                        // Find the matching level for this criterion
                                                        const matchedLevel = levels.find(
                                                            l => l.level_name === uniqueLevel.level_name
                                                        );

                                                        const desc = matchedLevel
                                                            ? (getCellDescription(criterionId, matchedLevel.level_id) || matchedLevel.description || '')
                                                            : '';

                                                        const isSelected = isGraded && matchedLevel && (
                                                            (selectedRubric.scores && selectedRubric.scores[criterionId] === (matchedLevel.score || matchedLevel.points)) ||
                                                            (criterion.obtainedScore === (matchedLevel.score || matchedLevel.points))
                                                        );

                                                        return (
                                                            <td
                                                                key={uniqueLevel.level_id}
                                                                className={`px-4 py-4 border-b border-r border-slate-200 last:border-r-0 align-top text-sm ${isSelected
                                                                    ? 'bg-blue-50 ring-inset ring-2 ring-blue-400'
                                                                    : ''
                                                                    }`}
                                                            >
                                                                {matchedLevel ? (
                                                                    <>
                                                                        <div className="text-slate-700 leading-relaxed">{desc || <span className="text-slate-300 italic text-xs">—</span>}</div>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <span className="text-xs font-bold text-slate-400">{matchedLevel.points ?? matchedLevel.score ?? 0} pts</span>
                                                                            {isSelected && (
                                                                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">✓ Selected</span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-slate-200 italic text-xs">N/A</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}

                    {activeRubricType === RUBRIC_TYPES.HOLISTIC && (
                        <div className="space-y-3">
                            {getPerformanceLevels()
                                .sort((a, b) => (b.score || b.points || 0) - (a.score || a.points || 0))
                                .map((level) => {
                                    const levelScore = level.score || level.points || 0;
                                    const levelLabel = level.level_name || level.label || 'Level';
                                    const levelDesc = level.description || '';
                                    const levelId = level.level_id || level.id || levelLabel;

                                    const isSelected = isGraded && (
                                        (selectedRubric.scores && selectedRubric.scores['holistic'] === levelScore) ||
                                        (selectedRubric.obtainedScore === levelScore)
                                    );

                                    return (
                                        <div
                                            key={levelId}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200 shadow-sm'
                                                : 'border-slate-100 bg-white'
                                                }`}
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 ${isSelected ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-300'
                                                }`}>
                                                {levelScore}
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`font-bold text-lg ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>
                                                    {levelLabel}
                                                </h4>
                                                <p className="text-slate-500 text-sm">{levelDesc}</p>
                                                {level.image_url && (
                                                    <div className="mt-2 w-32 h-20 rounded overflow-hidden border border-slate-100">
                                                        <img src={level.image_url} alt={levelLabel} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {activeRubricType === RUBRIC_TYPES.SINGLE_POINT && getCriteria().map((criterion) => (
                        <div key={criterion.criterion_id || criterion.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                            <div className="mb-4 text-center">
                                <h4 className="font-bold text-lg text-slate-800 mb-2">{criterion.criterion_name || criterion.name}</h4>
                                <div className="inline-block bg-white px-6 py-3 rounded-xl border border-blue-100 text-blue-700 font-semibold text-sm shadow-sm max-w-2xl">
                                    Standard: {criterion.criterion_description || criterion.standard || 'N/A'}
                                </div>
                            </div>

                            {/* Dynamic Feedback Fields from API Mapping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {(criterion.feedback_fields && criterion.feedback_fields.length > 0) ? (
                                    criterion.feedback_fields.map((field) => (
                                        <div key={field.feedback_field_id || field.id} className="bg-white/70 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[120px] border-dashed">
                                            <span className="font-bold text-xs uppercase tracking-widest mb-3 text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                {field.field_name}
                                            </span>
                                            <div className="text-sm text-slate-400 italic text-center leading-relaxed">
                                                {isGraded ? (selectedRubric.comments?.[`${criterion.criterion_id || criterion.id}_${field.field_name.toLowerCase().replace(/\s+/g, '_')}`] || 'No feedback recorded.') : 'Feedback visible after evaluation'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="bg-white/50 p-4 rounded-lg border border-slate-100 italic text-slate-400 text-sm flex flex-col items-center justify-center min-h-[100px] border-dashed">
                                            <span className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-300">Areas for Improvement</span>
                                            {isGraded && selectedRubric.comments?.[`${criterion.criterion_id || criterion.id}_improvement`] || ''}
                                        </div>
                                        <div className="bg-white/50 p-4 rounded-lg border border-slate-100 italic text-slate-400 text-sm flex flex-col items-center justify-center min-h-[100px] border-dashed">
                                            <span className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-300">Exceeds Expectations</span>
                                            {isGraded && selectedRubric.comments?.[`${criterion.criterion_id || criterion.id}_exceeds`] || ''}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {activeRubricType === RUBRIC_TYPES.DEVELOPMENTAL && (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3 mb-4 transition-all">
                                <span className="text-2xl">🌱</span>
                                <div>
                                    <h4 className="font-bold text-emerald-900">Portfolio Progress Tracker</h4>
                                    <p className="text-sm text-emerald-700">Required and achieved developmental milestones.</p>
                                </div>
                            </div>
                            {getItems().map((item) => {
                                const itemId = item.portfolio_id || item.id;
                                const itemLabel = item.portfolio_name || item.label || 'Item';
                                const itemRequired = item.is_required || item.required || false;

                                const isAchieved = isGraded && (
                                    (selectedRubric.scores && selectedRubric.scores[itemId] === 1) ||
                                    (item.status === 'Yes' || item.is_achieved)
                                );

                                return (
                                    <div key={itemId}
                                        className={`flex items-center p-4 rounded-xl border-2 transition-all ${isAchieved ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all ${isAchieved ? 'bg-emerald-500 border-emerald-500 rotate-0' : 'border-slate-300 bg-white -rotate-90'
                                            }`}>
                                            {isAchieved && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            )}
                                        </div>
                                        <div className="grow">
                                            <p className={`font-bold text-base ${isAchieved ? 'text-emerald-900' : 'text-slate-700'}`}>{itemLabel}</p>
                                            {itemRequired && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded tracking-wider uppercase">Required Outcome</span>}
                                        </div>
                                        {item.image_url && (
                                            <div className="w-12 h-12 rounded border border-slate-100 overflow-hidden">
                                                <img src={item.image_url} alt={itemLabel} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isInline) return content;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            {content}
        </div>
    );
};

export default RubricAssessmentView;
