import React, { useState, useEffect } from 'react';
import { Settings, Eye, FileText, ChevronDown, ChevronRight, X, Maximize2, Download } from 'lucide-react';

const RubricAssessmentView = ({ isOpen, onClose, assessmentData = null }) => {
    if (!isOpen || !assessmentData) return null;

    // Extract rubric data from assessment
    const rubric = assessmentData.rubric;
    // Fallback: if rubric is null, check if assessment has a type and title to display basic info
    const rubricType = rubric?.rubric_type || 'STANDARD';
    const assessmentStatus = assessmentData.status || 'DRAFT';

    // Determine if the assessment is graded (for future use)
    const isGraded = assessmentStatus === 'Graded' || assessmentStatus === 'Completed';

    // Build display data from API response
    const displayData = {
        title: assessmentData.title || 'Assessment',
        rubricName: rubric?.rubric_name || 'No Rubric Attached',
        description: rubric?.description || '',
        type: rubricType,
        category: rubric?.rubric_category || assessmentData.category || 'STANDARD',
        scoringType: rubric?.scoring_type || 'POINTS',
        totalPoints: rubric?.total_points || assessmentData.total_marks || 0,
        criteria: rubric?.criteria || [],
        performanceLevels: rubric?.performance_levels || [],
        cells: rubric?.cells || [],
        portfolios: rubric?.portfolios || [],
        subjectName: assessmentData.subject_name || rubric?.subject_name || 'N/A',
        mode: assessmentData.mode || 'ONLINE',
    };

    // Get rubric type display name
    const getRubricTypeDisplay = () => {
        switch (rubricType) {
            case 'SINGLE_POINT':
                return 'Single Point Rubric';
            case 'ANALYTIC':
                return 'Analytic Rubric';
            case 'HOLISTIC':
                return 'Holistic Rubric';
            case 'DEVELOPMENTAL':
                return 'Developmental Rubric';
            default:
                return 'Standard Assessment';
        }
    };

    // Helper to sort levels if needed (assuming order comes from API, but good to be safe)
    const sortedLevels = [...displayData.performanceLevels].sort((a, b) => a.level_order - b.level_order);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Rubric Assessment View
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {isGraded ? "Graded Evaluation Result" : "Assessment Reference Rubric"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                            ${isGraded ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {assessmentStatus}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-500 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">

                    {/* Rubric Details Header Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider 
                                        ${rubricType === 'ANALYTIC' ? 'bg-purple-100 text-purple-700' :
                                            rubricType === 'HOLISTIC' ? 'bg-orange-100 text-orange-700' :
                                                rubricType === 'SINGLE_POINT' ? 'bg-blue-100 text-blue-700' :
                                                    rubricType === 'DEVELOPMENTAL' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-green-100 text-green-700'}`}>
                                        {getRubricTypeDisplay()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                                        ${displayData.category === 'STANDARD' ? 'bg-gray-100 text-gray-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {displayData.category}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{displayData.title}</h3>
                                <p className="text-slate-600 text-sm mb-2">
                                    <span className="font-semibold">Rubric:</span> {displayData.rubricName}
                                </p>
                                {displayData.description && (
                                    <p className="text-slate-500 text-sm max-w-2xl">{displayData.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Subject</div>
                                    <div className="text-sm font-bold text-slate-700">{displayData.subjectName}</div>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Total Points</div>
                                    <div className="text-xl font-bold text-blue-600">{displayData.totalPoints || '0'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic View Based on Type */}

                    {/* SINGLE POINT RUBRIC */}
                    {rubricType === 'SINGLE_POINT' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Criteria & Feedback</h4>
                            </div>

                            {displayData.criteria.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {displayData.criteria.map((criterion, idx) => (
                                        <div key={criterion.criterion_id || idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-600 border border-blue-200 text-sm font-bold shadow-sm">
                                                                {criterion.criterion_order || idx + 1}
                                                            </span>
                                                            <h5 className="text-lg font-bold text-slate-900">{criterion.criterion_name}</h5>
                                                        </div>
                                                        {criterion.criterion_description && (
                                                            <p className="text-sm text-slate-600 ml-11">{criterion.criterion_description}</p>
                                                        )}
                                                    </div>
                                                    {criterion.weight_percentage !== null && (
                                                        <div className="ml-4 px-3 py-1 bg-white rounded-lg border border-blue-200 shadow-sm">
                                                            <div className="text-[10px] uppercase text-slate-500 font-bold">Weight</div>
                                                            <div className="text-sm font-bold text-blue-700">{criterion.weight_percentage}%</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Feedback Fields */}
                                            {criterion.feedback_fields && criterion.feedback_fields.length > 0 && (
                                                <div className="p-6 bg-white">
                                                    <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <span className="w-8 h-px bg-slate-200"></span>
                                                        Feedback Areas
                                                        <span className="w-full h-px bg-slate-200"></span>
                                                    </h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {criterion.feedback_fields.map((field, fieldIdx) => (
                                                            <div key={field.feedback_field_id || fieldIdx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                                                                        {field.field_order || fieldIdx + 1}
                                                                    </div>
                                                                    <div className="font-semibold text-slate-800">{field.field_name}</div>
                                                                </div>
                                                                <div className="text-xs text-slate-500 ml-9">{field.field_type || 'Standard Feedback'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyRubricState />
                            )}
                        </div>
                    )}

                    {/* ANALYTIC RUBRIC */}
                    {rubricType === 'ANALYTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Criteria Breakdown</h4>
                            </div>

                            {displayData.criteria.length > 0 ? ( // Logic to handle empty levels is inside table
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="overflow-x-auto pb-2">
                                        <table className="min-w-full divide-y divide-gray-200 border-collapse table-fixed">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-64 sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                        Criteria
                                                    </th>
                                                    {sortedLevels.length > 0 ? (
                                                        sortedLevels.map((level) => (
                                                            <th key={level.level_id} className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[180px] border-r border-gray-100 last:border-r-0">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-slate-800 text-sm mb-1">{level.level_name}</span>
                                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono border border-blue-100">
                                                                        {level.points} pts
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        ))
                                                    ) : (
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-full">
                                                            No Levels Defined
                                                        </th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {displayData.criteria.map((criterion, idx) => (
                                                    <tr key={criterion.criterion_id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 text-left align-top bg-white sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                            <div className="font-bold text-slate-900 mb-1">{criterion.criterion_name}</div>
                                                            {criterion.criterion_description && (
                                                                <div className="text-xs text-slate-500 leading-relaxed mb-2">{criterion.criterion_description}</div>
                                                            )}
                                                            {criterion.weight_percentage !== null && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                                                    Weight: {criterion.weight_percentage}%
                                                                </span>
                                                            )}
                                                        </td>
                                                        {sortedLevels.length > 0 ? (
                                                            sortedLevels.map((level) => {
                                                                const cell = displayData.cells.find(
                                                                    c => c.criterion_id === criterion.criterion_id && c.level_id === level.level_id
                                                                );
                                                                return (
                                                                    <td key={level.level_id} className="px-4 py-4 align-top border-r border-gray-50 last:border-r-0">
                                                                        {cell ? (
                                                                            <div className="h-full p-3 rounded-lg bg-slate-50/50 border border-slate-100 text-sm text-slate-600">
                                                                                {cell.cell_description || '-'}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                                                                                -
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })
                                                        ) : (
                                                            <td className="px-6 py-4 text-center text-slate-400 italic">No levels</td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <EmptyRubricState />
                            )}
                        </div>
                    )}

                    {/* HOLISTIC RUBRIC */}
                    {rubricType === 'HOLISTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Performance Levels</h4>
                            </div>

                            {displayData.performanceLevels.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="grid grid-cols-1 divide-y divide-gray-100">
                                        {sortedLevels.map((level, idx) => (
                                            <div key={level.level_id || idx} className="p-6 hover:bg-slate-50 transition-colors flex gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-200">
                                                        <span className="text-xl font-bold">{level.points}</span>
                                                        <span className="text-[10px] uppercase font-bold opacity-80">Pts</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-lg font-bold text-slate-900 mb-2">{level.level_name}</h5>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{level.description || "No description provided."}</p>
                                                    {level.image_url && (
                                                        <div className="mt-4">
                                                            <img
                                                                src={level.image_url}
                                                                alt={level.level_name}
                                                                className="h-32 w-auto rounded-lg border border-gray-200 object-cover"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyRubricState message="No performance levels defined" />
                            )}
                        </div>
                    )}

                    {/* DEVELOPMENTAL RUBRIC */}
                    {rubricType === 'DEVELOPMENTAL' && (
                        <div className="space-y-6">
                            {/* Portfolios Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Required Portfolios</h4>
                                </div>
                                {displayData.portfolios.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayData.portfolios.map((portfolio, idx) => (
                                            <div key={portfolio.portfolio_id || idx} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                                                <div className="flex items-start gap-4 relaitve z-10">
                                                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold border border-pink-100">
                                                        {portfolio.portfolio_order || idx + 1}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 mb-1">{portfolio.portfolio_name}</h5>
                                                        {portfolio.portfolio_description && (
                                                            <p className="text-xs text-slate-500">{portfolio.portfolio_description}</p>
                                                        )}
                                                        <div className="mt-3 flex gap-2">
                                                            {portfolio.is_required && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded">Required</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500 text-sm">No specific portfolios required.</p>
                                    </div>
                                )}
                            </div>

                            {/* Reuse Analytic View if criteria exist for Developmental */}
                            {displayData.criteria.length > 0 && (
                                <div className="space-y-4 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Development Criteria</h4>
                                    </div>
                                    {/* Simplified list for developmental if no levels, or grid if levels exist */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            {/* Reuse logic or simplifed view */}
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Criterion</th>
                                                        {sortedLevels.map(l => <th key={l.level_id} className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{l.level_name}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {displayData.criteria.map((c, i) => (
                                                        <tr key={i}>
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{c.criterion_name}</td>
                                                            {sortedLevels.map(l => {
                                                                const cell = displayData.cells.find(cell => cell.criterion_id === c.criterion_id && cell.level_id === l.level_id);
                                                                return (
                                                                    <td key={l.level_id} className="px-6 py-4 text-center text-xs text-slate-600">
                                                                        {cell?.cell_description || '-'}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                    {displayData.criteria.length === 0 && (<tr><td colSpan={100} className="p-4 text-center text-slate-400">No criteria</td></tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {rubricType === 'STANDARD' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="text-slate-400 mb-2">
                                <FileText className="w-12 h-12 mx-auto opacity-50" />
                            </div>
                            <p className="text-slate-500 mb-2">Standard Assessment</p>
                            <p className="text-xs text-slate-400">Total Marks: {displayData.totalPoints}</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 z-20">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        Close
                    </button>
                    {isGraded && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper component for empty states
const EmptyRubricState = ({ message = "No criteria defined for this rubric" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-slate-400 mb-2">
            <FileText className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-slate-500">{message}</p>
    </div>
);

export default RubricAssessmentView;