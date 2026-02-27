import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

const RubricEvaluator = ({ rubric, onMarksChange }) => {
    const [selections, setSelections] = useState({}); // { criterionId: levelId }
    const [comments, setComments] = useState({}); // { criterionId_improvement: text }
    const [expandedCriteria, setExpandedCriteria] = useState({});

    useEffect(() => {
        // Initial calculation or reset if needed
    }, [rubric]);

    const toggleExpand = (criterionId) => {
        setExpandedCriteria(prev => ({
            ...prev,
            [criterionId]: !prev[criterionId]
        }));
    };

    const handleLevelSelect = (criterionId, level) => {
        const newSelections = {
            ...selections,
            [criterionId]: level.level_id || level.id
        };
        setSelections(newSelections);

        calculateScore(newSelections, comments);
    };

    const handleCommentChange = (criterionId, text) => {
        const newComments = {
            ...comments,
            [`${criterionId}_improvement`]: text
        };
        setComments(newComments);
        calculateScore(selections, newComments);
    };

    const calculateScore = (currentSelections, currentComments) => {
        let totalScore = 0;
        let feedbackParts = [];

        rubric.criteria.forEach(criterion => {
            const selectedLevelId = currentSelections[criterion.id || criterion.criteria_id];
            if (selectedLevelId) {
                const level = criterion.levels.find(l => (l.level_id || l.id) === selectedLevelId);
                if (level) {
                    totalScore += Number(level.points || level.score || 0);
                    feedbackParts.push(`${criterion.criteria_name}: ${level.level_name} (${level.points} pts)`);
                }
            }
        });

        // Determine final score based on scoring strategy (summation for now, can be average)
        // Assuming 'SUMMATION' based on standard rubric types

        // Generate feedback string
        const feedbackString = feedbackParts.join('\n');

        if (onMarksChange) {
            onMarksChange(totalScore, feedbackString, currentSelections, currentComments);
        }
    };

    if (!rubric || !rubric.criteria) {
        return <div className="p-4 text-gray-500 italic">No rubric criteria available.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Rubric Evaluation</h3>
                <p className="text-sm text-gray-500">{rubric.rubric_title}</p>
            </div>

            <div className="divide-y divide-gray-100">
                {rubric.criteria.map((criterion, index) => {
                    const isExpanded = expandedCriteria[criterion.id] !== false; // Default expanded
                    const selectedLevelId = selections[criterion.id || criterion.criteria_id];

                    return (
                        <div key={criterion.id || index} className="p-4 sm:p-6 transition-colors hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => toggleExpand(criterion.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900 text-base">{criterion.criteria_name}</h4>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{criterion.criteria_description || criterion.description}</p>
                                </div>
                                {selectedLevelId && (
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4">
                                        Selected
                                    </span>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {criterion.levels.map((level) => {
                                            const isSelected = selectedLevelId === (level.level_id || level.id);
                                            return (
                                                <div
                                                    key={level.level_id || level.id}
                                                    onClick={() => handleLevelSelect(criterion.id || criterion.criteria_id, level)}
                                                    className={`
                            cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 relative
                            ${isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]'
                                                            : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                                                        }
                          `}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                            {level.level_name}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                                                            {level.points || level.score} pts
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>
                                                        {level.level_description || level.description}
                                                    </p>
                                                    {isSelected && (
                                                        <div className="absolute top-[-8px] right-[-8px] bg-white rounded-full">
                                                            <CheckCircle className="w-5 h-5 text-indigo-600 fill-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Optional Feedback Input per Criterion */}
                                    <div className="mt-3">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Feedback / Improvement Areas (Optional)</label>
                                        <textarea
                                            value={comments[`${criterion.id || criterion.criteria_id}_improvement`] || ''}
                                            onChange={(e) => handleCommentChange(criterion.id || criterion.criteria_id, e.target.value)}
                                            placeholder="Add specific feedback for this criterion..."
                                            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none h-20"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500 italic">
                    * Select a level for each criterion to calculate the total score.
                </span>
                <div className="text-right">
                    <span className="block text-xs uppercase font-bold text-gray-500">Total Score</span>
                    <span className="text-2xl font-bold text-indigo-700">
                        {Object.values(selections).reduce((acc, levelId) => {
                            // Find points for this levelId across all criteria
                            let points = 0;
                            rubric.criteria.forEach(c => {
                                const level = c.levels.find(l => (l.level_id || l.id) === levelId);
                                if (level) points = Number(level.points || level.score || 0);
                            });
                            return acc + points;
                        }, 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RubricEvaluator;
