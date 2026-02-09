import React, { useState, useEffect } from 'react';
import { Settings, Eye, FileText, ChevronDown, ChevronRight, X, Maximize2, Download } from 'lucide-react';

const RubricAssessmentView = ({ isOpen, onClose, assessmentData = null }) => {
    if (!isOpen || !assessmentData) return null;

    // Extract rubric data from assessment
    const rubric = assessmentData?.rubric;
    const rubricType = rubric?.rubric_type || 'SINGLE_POINT';
    const assessmentStatus = assessmentData?.status || 'DRAFT';

    // Determine if the assessment is graded (for future use)
    const isGraded = assessmentStatus === 'Graded' || assessmentStatus === 'Completed';

    // Build display data from API response
    const displayData = {
        title: assessmentData?.title || 'Assessment',
        rubricName: rubric?.rubric_name || 'Rubric',
        description: rubric?.description || 'No description provided',
        type: rubricType,
        category: rubric?.rubric_category || 'STANDARD',
        scoringType: rubric?.scoring_type || 'POINTS',
        totalPoints: rubric?.total_points || 0,
        criteria: rubric?.criteria || [],
        performanceLevels: rubric?.performance_levels || [],
        cells: rubric?.cells || [],
        portfolios: rubric?.portfolios || [],
        subjectName: assessmentData?.subject_name || rubric?.subject_name || 'N/A',
        mode: assessmentData?.mode || 'ONLINE',
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
            default:
                return rubricType;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
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
                                    <div className="text-xl font-bold text-blue-600">{displayData.totalPoints || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic View Based on Type */}
                    {rubricType === 'SINGLE_POINT' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Criteria & Feedback</h4>
                            </div>

                            {displayData.criteria.length > 0 ? (
                                <div className="space-y-4">
                                    {displayData.criteria.map((criterion, idx) => (
                                        <div key={criterion.criterion_id || idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                                                {criterion.criterion_order || idx + 1}
                                                            </span>
                                                            <h5 className="text-base font-bold text-slate-900">{criterion.criterion_name}</h5>
                                                        </div>
                                                        {criterion.criterion_description && (
                                                            <p className="text-sm text-slate-600 ml-8">{criterion.criterion_description}</p>
                                                        )}
                                                    </div>
                                                    {criterion.weight_percentage !== null && (
                                                        <div className="ml-4 px-3 py-1 bg-white rounded-lg border border-blue-200">
                                                            <div className="text-[10px] uppercase text-slate-500 font-bold">Weight</div>
                                                            <div className="text-sm font-bold text-blue-700">{criterion.weight_percentage}%</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Feedback Fields */}
                                            {criterion.feedback_fields && criterion.feedback_fields.length > 0 && (
                                                <div className="p-6">
                                                    <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Feedback Fields</h6>
                                                    <div className="space-y-2">
                                                        {criterion.feedback_fields.map((field, fieldIdx) => (
                                                            <div key={field.feedback_field_id || fieldIdx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded bg-white border border-slate-300">
                                                                    <span className="text-xs font-bold text-slate-600">{field.field_order || fieldIdx + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-semibold text-slate-900">{field.field_name}</div>
                                                                    <div className="text-xs text-slate-500">{field.field_type || 'STANDARD_FEEDBACK'}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Course Outcomes & Bloom's Levels */}
                                            {(criterion.course_outcome_ids?.length > 0 || criterion.blooms_level_ids?.length > 0) && (
                                                <div className="px-6 pb-6">
                                                    <div className="flex gap-4 flex-wrap">
                                                        {criterion.course_outcome_ids && criterion.course_outcome_ids.length > 0 && (
                                                            <div className="flex-1 min-w-[200px]">
                                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Course Outcomes</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {criterion.course_outcome_ids.map((id, i) => (
                                                                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                                                                            CO-{id}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {criterion.blooms_level_ids && criterion.blooms_level_ids.length > 0 && (
                                                            <div className="flex-1 min-w-[200px]">
                                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bloom's Levels</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {criterion.blooms_level_ids.map((id, i) => (
                                                                        <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded border border-purple-200">
                                                                            Level {id}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="text-slate-400 mb-2">
                                        <FileText className="w-12 h-12 mx-auto opacity-50" />
                                    </div>
                                    <p className="text-slate-500">No criteria defined for this rubric</p>
                                </div>
                            )}
                        </div>
                    )}

                    {rubricType === 'ANALYTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Criteria Breakdown</h4>
                            </div>

                            {displayData.criteria.length > 0 && displayData.performanceLevels.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Criteria</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Performance Levels</th>
                                                {isGraded && <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Score / Comments</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {displayData.criteria.map((criterion, idx) => {
                                                // Find cells for this criterion
                                                const criterionCells = displayData.cells.filter(
                                                    cell => cell.criterion_id === criterion.criterion_id
                                                );

                                                return (
                                                    <tr key={criterion.criterion_id || idx}>
                                                        <td className="px-6 py-4 align-top">
                                                            <div className="text-sm font-bold text-slate-900">{criterion.criterion_name}</div>
                                                            {criterion.criterion_description && (
                                                                <div className="text-xs text-slate-500 mt-1">{criterion.criterion_description}</div>
                                                            )}
                                                            {criterion.weight_percentage !== null && (
                                                                <div className="text-xs text-slate-500 mt-1">Weightage: {criterion.weight_percentage}%</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 align-top">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {displayData.performanceLevels.map((level) => {
                                                                    // Find the cell for this criterion and level
                                                                    const cell = criterionCells.find(
                                                                        c => c.performance_level_id === level.performance_level_id
                                                                    );

                                                                    return (
                                                                        <div
                                                                            key={level.performance_level_id}
                                                                            className="p-2 rounded border text-xs transition-all bg-white border-slate-100 text-slate-500"
                                                                        >
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className="font-bold text-slate-700">{level.level_name}</span>
                                                                                <span className="text-[10px] font-mono opacity-80">{cell?.points || 0} pts</span>
                                                                            </div>
                                                                            {cell?.description && (
                                                                                <div className="leading-tight opacity-90">{cell.description}</div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        {isGraded && (
                                                            <td className="px-6 py-4 align-top bg-slate-50/50">
                                                                <div className="flex flex-col items-center justify-center h-full">
                                                                    <div className="text-xs text-slate-400">Not graded yet</div>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="text-slate-400 mb-2">
                                        <FileText className="w-12 h-12 mx-auto opacity-50" />
                                    </div>
                                    <p className="text-slate-500">
                                        {displayData.criteria.length === 0 ? 'No criteria defined' : 'No performance levels defined'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {rubricType === 'HOLISTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Overall Assessment</h4>
                            </div>

                            {displayData.performanceLevels.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="space-y-3">
                                        {displayData.performanceLevels.map((level, idx) => (
                                            <div
                                                key={level.performance_level_id || idx}
                                                className="flex items-center p-4 rounded-lg border transition-all bg-white border-slate-100 opacity-80"
                                            >
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 bg-slate-100 text-slate-600">
                                                    {level.level_order || idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-sm text-slate-700">
                                                        {level.level_name}
                                                    </h5>
                                                    {level.description && (
                                                        <p className="text-sm text-slate-600">{level.description}</p>
                                                    )}
                                                    {level.min_score !== undefined && level.max_score !== undefined && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Score Range: {level.min_score} - {level.max_score}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="text-slate-400 mb-2">
                                        <FileText className="w-12 h-12 mx-auto opacity-50" />
                                    </div>
                                    <p className="text-slate-500">No performance levels defined for this rubric</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Portfolios section (if applicable) */}
                    {displayData.portfolios && displayData.portfolios.length > 0 && (
                        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Associated Portfolios</h4>
                            <div className="space-y-2">
                                {displayData.portfolios.map((portfolio, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700">
                                        {portfolio.name || `Portfolio ${idx + 1}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                    {isGraded && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RubricAssessmentView;