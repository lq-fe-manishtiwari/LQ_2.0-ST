import React, { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import RubricBuilder from './RubricBuilder';
import RubricAssessmentView from '../../AssessmentTab/RubricAssessmentView';
import { RUBRIC_TYPES } from './RubricType';
import { RubricService } from '../Service/rubric.service';
import { mapRubricToApiPayload } from '../Rubrics/RubricMapper';

const RubricMain = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [rubrics, setRubrics] = useState([]);
    const [activeRubric, setActiveRubric] = useState(null);
    const [editorMode, setEditorMode] = useState('edit');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const [alert, setAlert] = useState(null);

    const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
    const collegeId = activeCollege?.id;

    useEffect(() => {
        fetchRubrics();
    }, []);

    const fetchRubrics = async () => {
        if (!collegeId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await RubricService.getRubricsByCollegeId(collegeId);

            const formattedRubrics = (response || []).map(rubric => {
                let internalIdType = RUBRIC_TYPES.ANALYTIC;
                if (rubric.rubric_type === 'HOLISTIC') internalIdType = RUBRIC_TYPES.HOLISTIC;
                else if (rubric.rubric_type === 'SINGLE_POINT') internalIdType = RUBRIC_TYPES.SINGLE_POINT;
                else if (rubric.rubric_type === 'DEVELOPMENTAL') internalIdType = RUBRIC_TYPES.DEVELOPMENTAL;

                return {
                    id: rubric.rubric_id,
                    title: rubric.rubric_name || 'Untitled Rubric',
                    type: internalIdType,
                    programName: rubric.program_name || 'N/A',
                    subjectName: rubric.subject_name || 'N/A',
                    bloomsLevel: null,
                    coMapping: [],
                    criteria: rubric.criteria || [],
                    levels: rubric.performance_levels || [],
                    performance_levels: rubric.performance_levels || [],
                    items: rubric.portfolios || [],
                    portfolios: rubric.portfolios || [],
                    cells: rubric.cells || [],
                };
            });

            setRubrics(formattedRubrics);
        } catch (error) {
            setError('Failed to load rubrics');
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    confirmBtnCssClass="bg-red-600 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to load rubrics.
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRubric = async (rubricData) => {
        try {
            const rubricWithCollegeId = {
                ...rubricData,
                collegeId: collegeId
            };

            const payload = mapRubricToApiPayload(rubricWithCollegeId);

            // ✅ API returns rubric_id — support both rubric_id and id
            const rubricId = activeRubric?.rubric_id || activeRubric?.id;

            if (activeTab === 'edit' && rubricId) {
                console.log(`PUT /admin/rubric/${rubricId}`, payload);
                await RubricService.updateRubric(rubricId, payload);
                setAlert(
                    <SweetAlert
                        success
                        title="Success"
                        confirmBtnCssClass="bg-green-600 text-white px-5 py-2 rounded-lg"
                        onConfirm={() => { setAlert(null); setActiveTab('list'); fetchRubrics(); }}
                    >
                        Rubric updated successfully!
                    </SweetAlert>
                );
            } else {
                await RubricService.saveRubric(payload);
                setAlert(
                    <SweetAlert
                        success
                        title="Success"
                        confirmBtnCssClass="bg-green-600 text-white px-5 py-2 rounded-lg"
                        onConfirm={() => { setAlert(null); setActiveTab('list'); fetchRubrics(); }}
                    >
                        Rubric saved successfully!
                    </SweetAlert>
                );
            }

            setActiveRubric(null);
        } catch (error) {
            console.error('Save/Update rubric error:', error);
            setAlert(
                <SweetAlert
                    warning
                    title="Warning"
                    confirmBtnCssClass="bg-orange-500 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    {`Failed to ${activeTab === 'edit' ? 'update' : 'save'} rubric: ${error?.message || ''}`}
                </SweetAlert>
            );
        }
    };

    const handleEdit = async (rubric) => {
        setLoading(true);
        try {
            const fullRubric = await RubricService.getRubricById(rubric.id);
            setActiveRubric(fullRubric);
            setEditorMode('edit');
            setActiveTab('edit');
        } catch (error) {
            setAlert(
                <SweetAlert
                    warning
                    title="Warning"
                    confirmBtnCssClass="bg-orange-500 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to fetch rubric details
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (rubric) => {
        setLoading(true);
        try {
            const fullRubric = await RubricService.getRubricById(rubric.id);
            setActiveRubric(fullRubric);
            setActiveTab('premium-view');
        } catch (error) {
            setAlert(
                <SweetAlert
                    warning
                    title="Warning"
                    confirmBtnCssClass="bg-orange-500 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to fetch rubric details
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (rubric) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                cancelBtnText="Cancel"
                confirmBtnCssClass="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                cancelBtnCssClass="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 ml-3"
                title="Delete Rubric"
                onConfirm={() => handleConfirmDelete(rubric.id)}
                onCancel={() => setAlert(null)}
            >
                Are you sure you want to delete the rubric <b>"{rubric.title}"</b>? This action cannot be undone.
            </SweetAlert>
        );
    };

    const handleConfirmDelete = async (id) => {
        setLoading(true);
        try {
            await RubricService.deleteRubric(id);
            setAlert(
                <SweetAlert
                    success
                    title="Deleted!"
                    confirmBtnCssClass="bg-green-600 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    Rubric deleted successfully!
                </SweetAlert>
            );
            await fetchRubrics();
        } catch (error) {
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    confirmBtnCssClass="bg-red-600 text-white px-5 py-2 rounded-lg"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to delete rubric
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Rubric Assessment</h1>
                        <p className="text-slate-500 text-[11px]">Create, Manage, and Evaluate using advanced rubrics.</p>
                    </div>
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200 justify-center md:justify-start min-w-max mx-auto">
                            {['create', 'list'].map((tab) => (
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
                            {loading ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-600 font-medium">Loading rubrics...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                        ⚠️
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Rubrics</h3>
                                    <p className="text-slate-500 mb-8">{error}</p>
                                    <button
                                        onClick={fetchRubrics}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : rubrics.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                        📊
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
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 tracking-widest">
                                                    Rubric Title
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 tracking-widest">
                                                    Paper
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 tracking-widest">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 tracking-widest">
                                                    Bloom's Level
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 tracking-widest">
                                                    CO Mapping
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 tracking-widest">
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
                                                        <div className="text-[11px] font-semibold text-slate-700">{rubric.subjectName}</div>
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
                                                            <span className="text-[14px] text-slate-400 font-bold">-</span>
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
                                                                <span className="text-[14px] text-slate-400 font-bold">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleView(rubric)}
                                                                className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-full transition-all"
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(rubric)}
                                                                className="text-orange-500 hover:text-orange-700 p-1.5 hover:bg-orange-50 rounded-full transition-all"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(rubric)}
                                                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <RubricBuilder
                            initialData={activeRubric}
                            onSave={handleSaveRubric}
                        />
                    )}

                    {activeTab === 'premium-view' && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px]">
                            <RubricAssessmentView
                                isOpen={true}
                                isInline={true}
                                onClose={() => setActiveTab('list')}
                                rubricData={activeRubric}
                                isPreview={true}
                            />
                        </div>
                    )}
                </main>
            </div>

            {alert}
        </div>
    );
};

export default RubricMain;