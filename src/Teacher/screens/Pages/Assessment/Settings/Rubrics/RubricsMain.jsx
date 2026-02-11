import React, { useState } from 'react';
import RubricBuilder from './RubricsBuilder';
import RubricEvaluation from './RubricsEvaluation';
import { SAMPLE_RUBRICS, RUBRIC_TYPES } from './RubricsType';
import { RubricService } from '../Service/rubrics.service';
import { mapRubricToApiPayload } from '../Rubrics/RubricsMapper';

const RubricMain = () => {
    const [activeTab, setActiveTab] = useState('list'); // Start with list to show data
    const [rubrics, setRubrics] = useState(SAMPLE_RUBRICS);
    const [evaluatingRubricId, setEvaluatingRubricId] = useState(null);

    const handleSaveRubric = async (rubricData) => {
        console.log('RUBRIC FROM BUILDER 👉', rubricData);
        try {
            const payload = mapRubricToApiPayload(rubricData);
            await RubricService.saveRubric(payload);
            alert('Rubric saved successfully');
            setActiveTab('list');
        } catch (error) {
            console.error(error);
            alert('Failed to save rubric');
        }
    };

    const handleEvaluate = (id) => {
        setEvaluatingRubricId(id);
        setActiveTab('evaluate');
    };

    return (
        <div className="min-h-screen bg-gray-50  font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Rubric Assessment</h1>
                        <p className="text-slate-500 text-[11px]">Create, Manage, and Evaluate using advanced rubrics.</p>
                    </div>
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200 justify-center md:justify-start min-w-max mx-auto">
                            {['create', 'list', 'evaluate'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>


                <main>
                    {activeTab === 'create' && <RubricBuilder onSave={handleSaveRubric} />}

                    {activeTab === 'list' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {rubrics.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                        ðŸ“Š
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Rubrics Created Yet</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Get started by creating your first assessment rubric. You can define criteria, levels, and map them to course outcomes.</p>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                    >
                                        + Create New Rubric
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500   tracking-widest">
                                                    Rubric Title
                                                </th>

                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500   tracking-widest">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500   tracking-widest">
                                                    Bloom's Level
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500   tracking-widest">
                                                    CO Mapping
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-right text-[10px] font-bold text-slate-500   tracking-widest">
                                                    Actions
                                                </th>

                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rubrics.map((rubric) => (
                                                <tr key={rubric.id} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-[13px] font-bold text-slate-900">{rubric.title}</div>
                                                        <div className="text-[10px] text-slate-500">
                                                            {rubric.type === RUBRIC_TYPES.ANALYTIC ? `${rubric.criteria.length} Criteria` :
                                                                rubric.type === RUBRIC_TYPES.HOLISTIC ? `${rubric.levels.length} Levels` :
                                                                    rubric.type === RUBRIC_TYPES.DEVELOPMENTAL ? `${rubric.items.length} Items` :
                                                                        'Qualitative'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${rubric.type === RUBRIC_TYPES.ANALYTIC ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                            rubric.type === RUBRIC_TYPES.HOLISTIC ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                rubric.type === RUBRIC_TYPES.DEVELOPMENTAL ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}>
                                                            {rubric.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {rubric.bloomsLevel ? (
                                                            <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                                {rubric.bloomsLevel}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic">Not Set</span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {rubric.coMapping && rubric.coMapping.length > 0 ? (
                                                                rubric.coMapping.map(co => (
                                                                    <span key={co} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                                        {co}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">None</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => handleEvaluate(rubric.id)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded text-[11px] transition-all font-bold"
                                                        >
                                                            Evaluate
                                                        </button>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'evaluate' && <RubricEvaluation rubrics={rubrics} initialRubricId={evaluatingRubricId} />}
                </main>
            </div>
        </div>
    );
};

export default RubricMain;