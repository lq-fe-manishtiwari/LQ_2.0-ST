












import React, { useState, useEffect } from 'react';
import { Settings, Eye, FileText, ChevronDown, ChevronRight, X, Maximize2, Download } from 'lucide-react';

const RubricAssessmentView = ({ isOpen, onClose, assessmentType = 'ANALYTIC', status = 'Pending' }) => {
    const [activeRubricType, setActiveRubricType] = useState(assessmentType);

    // Update local state when props change
    useEffect(() => {
        if (isOpen) {
            setActiveRubricType(assessmentType || 'ANALYTIC');
        }
    }, [isOpen, assessmentType]);

    if (!isOpen) return null;

    const isGraded = status === 'Graded' || status === 'Completed';

    // Hardcoded Data for Different Rubric Types
    const RUBRIC_DATA = {
        ANALYTIC: {
            title: "Final Project Presentation",
            type: "Analytic Rubric",
            description: "Evaluation of the final capstone project presentation.",
            totalScore: 20,
            obtainedScore: 16,
            criteria: [
                {
                    id: 1,
                    name: "Technical Content",
                    weight: 1,
                    maxScore: 10,
                    obtainedScore: 8,
                    comments: "Strong technical depth, but missed some edge cases.",
                    levels: [
                        { score: 10, label: "Excellent", description: "Deep understanding, zero errors." },
                        { score: 8, label: "Good", description: "Good understanding, minor errors." }, // Selected
                        { score: 5, label: "Average", description: "Basic understanding, significant errors." },
                        { score: 2, label: "Poor", description: "Lacks technical depth." }
                    ]
                },
                {
                    id: 2,
                    name: "Communication Skill",
                    weight: 1,
                    maxScore: 5,
                    obtainedScore: 5,
                    comments: "Excellent delivery and pacing.",
                    levels: [
                        { score: 5, label: "Professional", description: "Clear, confident, professional." }, // Selected
                        { score: 3, label: "Adequate", description: "Mostly clear, lacks polish." },
                        { score: 1, label: "Needs Improv.", description: "Unclear delivery." }
                    ]
                },
                {
                    id: 3,
                    name: "Q&A Handling",
                    weight: 1,
                    maxScore: 5,
                    obtainedScore: 3,
                    comments: "Struggled with the database question.",
                    levels: [
                        { score: 5, label: "Expert", description: "Answered all questions perfectly." },
                        { score: 3, label: "Proficient", description: "Answered most questions well." }, // Selected
                        { score: 1, label: "Novice", description: "Failed to answer basic questions." }
                    ]
                }
            ]
        },
        HOLISTIC: {
            title: "Creative Writing Assignment",
            type: "Holistic Rubric",
            description: "Overall quality of the creative writing piece.",
            totalScore: 10,
            obtainedScore: 8,
            comments: "Great narrative flow, but watch out for grammar.",
            levels: [
                { id: 1, score: 10, label: "Exceptional", description: "Vivid imagery, strong voice, perfect grammar." },
                { id: 2, score: 8, label: "Strong", description: "Good imagery, clear voice, minor errors." }, // Selected
                { id: 3, score: 5, label: "Developing", description: "Some imagery, inconsistent voice, frequent errors." },
                { id: 4, score: 2, label: "Beginning", description: "Lacks imagery or voice, confusing structure." }
            ]
        },
        CHECKLIST: {
            title: "Lab Safety Procedures",
            type: "Checklist / Developmental",
            description: "Safety protocols compliance check.",
            totalScore: 5,
            obtainedScore: 4,
            items: [
                { id: 1, label: "Wearing Safety Goggles", status: "Yes", comments: "" },
                { id: 2, label: "Lab Coat Buttoned", status: "Yes", comments: "" },
                { id: 3, label: "Gloves Worn", status: "Yes", comments: "" },
                { id: 4, label: "Workstation Cleaned", status: "No", comments: "Left beakres on desk." },
                { id: 5, label: "Equipment Turned Off", status: "Yes", comments: "" }
            ]
        }
    };

    const data = RUBRIC_DATA[activeRubricType] || RUBRIC_DATA['ANALYTIC'];

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
                            {status}
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
                                        ${data.type.includes('Analytic') ? 'bg-purple-100 text-purple-700' :
                                            data.type.includes('Holistic') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {data.type}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{data.title}</h3>
                                <p className="text-slate-600 text-sm max-w-2xl">{data.description}</p>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Max Score</div>
                                    <div className="text-xl font-bold text-slate-400">{data.totalScore}</div>
                                </div>

                                {isGraded && (
                                    <>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="text-center">
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Obtained</div>
                                            <div className="text-3xl font-bold text-blue-600">{data.obtainedScore}</div>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="text-center">
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Grade</div>
                                            <div className="text-xl font-bold text-green-600">
                                                {Math.round((data.obtainedScore / data.totalScore) * 100)}%
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic View Based on Type */}
                    {activeRubricType === 'ANALYTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Criteria Breakdown</h4>
                            </div>

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
                                        {data.criteria.map((criterion, idx) => (
                                            <tr key={criterion.id}>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="text-sm font-bold text-slate-900">{criterion.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">Weightage: {criterion.weight}x</div>
                                                    <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                                                        Max: {criterion.maxScore} pts
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {criterion.levels.map((level) => {
                                                            // Determine if this level is selected (Only if graded)
                                                            const isSelected = isGraded && (level.score === criterion.obtainedScore ||
                                                                (criterion.levels.find(l => l.score === criterion.obtainedScore)?.label === level.label));

                                                            return (
                                                                <div
                                                                    key={level.score}
                                                                    className={`p-2 rounded border text-xs transition-all
                                                                        ${isSelected
                                                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 shadow-sm'
                                                                            : 'bg-white border-slate-100 text-slate-500'}`}
                                                                >
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{level.label}</span>
                                                                        <span className="text-[10px] font-mono opacity-80">{level.score} pts</span>
                                                                    </div>
                                                                    <div className="leading-tight opacity-90">{level.description}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                {isGraded && (
                                                    <td className="px-6 py-4 align-top bg-slate-50/50">
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            <div className="text-2xl font-bold text-blue-600 mb-1">{criterion.obtainedScore}</div>
                                                            <div className="text-xs text-slate-400 mb-3">out of {criterion.maxScore}</div>

                                                            {criterion.comments && (
                                                                <div className="w-full bg-white p-2 rounded border border-yellow-200 text-xs text-slate-600 italic relative">
                                                                    <div className="absolute -top-2 left-4 w-2 h-2 bg-white border-t border-l border-yellow-200 transform rotate-45"></div>
                                                                    "{criterion.comments}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeRubricType === 'HOLISTIC' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Overall Assessment</h4>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="space-y-3">
                                    {data.levels.map((level) => {
                                        const isSelected = isGraded && level.id === 2; // Hardcoded match for demo
                                        return (
                                            <div
                                                key={level.id}
                                                className={`flex items-center p-4 rounded-lg border transition-all
                                                    ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm transform scale-[1.01]' : 'bg-white border-slate-100 opacity-80'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4
                                                    ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    {level.score}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className={`font-bold text-sm ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                                                        {level.label}
                                                    </h5>
                                                    <p className="text-sm text-slate-600">{level.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {isGraded && data.comments && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h5 className="text-sm font-bold text-slate-700 mb-2">Evaluator Comments</h5>
                                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm italic border border-yellow-100 flex gap-3">
                                            <span className="text-2xl">â</span>
                                            <p>{data.comments}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeRubricType === 'CHECKLIST' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Compliance Checklist</h4>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation Item</th>
                                            {isGraded && <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>}
                                            {isGraded && <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{item.label}</div>
                                                </td>
                                                {isGraded && (
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                            ${item.status === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                )}
                                                {isGraded && (
                                                    <td className="px-6 py-4">
                                                        {item.comments ? (
                                                            <span className="text-sm text-slate-600">{item.comments}</span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No remarks</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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