import React, { useState, useRef } from 'react';
import {
    RUBRIC_TYPES,
    INITIAL_ANALYTIC_STATE,
    INITIAL_HOLISTIC_STATE,
    INITIAL_SINGLE_POINT_STATE,
    INITIAL_DEVELOPMENTAL_STATE,
    BLOOMS_LEVELS,
    CO_MAPPING
} from './RubricsType';

const RubricBuilder = ({ onSave }) => {

    const [showSetup, setShowSetup] = useState(true);
    const [rubricType, setRubricType] = useState(RUBRIC_TYPES.ANALYTIC);

    // Ensure all bloom's are arrays
    const [rubricData, setRubricData] = useState({
        ...INITIAL_ANALYTIC_STATE,
        scoringType: 'Points',
        includeMetadata: true,
        bloomsLevel: Array.isArray(INITIAL_ANALYTIC_STATE.bloomsLevel) ? INITIAL_ANALYTIC_STATE.bloomsLevel : [],
        coMapping: Array.isArray(INITIAL_ANALYTIC_STATE.coMapping) ? INITIAL_ANALYTIC_STATE.coMapping : [],
    });

    const [studentView, setStudentView] = useState(true);
    const fileInputRef = useRef(null);

    const handleSetupComplete = (isEnhanced) => {
        setRubricData(prev => ({
            ...prev,
            includeMetadata: isEnhanced,
            criteria: prev.criteria ? prev.criteria.map(c => ({ ...c, bloomsLevel: [], coMapping: [], poMapping: [] })) : prev.criteria,
            items: prev.items ? prev.items.map(i => ({ ...i, bloomsLevel: [], coMapping: [], poMapping: [] })) : prev.items,
            prompts: prev.prompts ? prev.prompts.map(p => ({ ...p, bloomsLevel: [], coMapping: [], poMapping: [] })) : prev.prompts
        }));
        setShowSetup(false);
    };


    const updateField = (field, value) => {
        setRubricData({ ...rubricData, [field]: value });
    };

    const handleTypeChange = (type) => {
        setRubricType(type);
        let newState;
        if (type === RUBRIC_TYPES.ANALYTIC) newState = INITIAL_ANALYTIC_STATE;
        else if (type === RUBRIC_TYPES.HOLISTIC) newState = INITIAL_HOLISTIC_STATE;
        else if (type === RUBRIC_TYPES.SINGLE_POINT) newState = INITIAL_SINGLE_POINT_STATE;
        else if (type === RUBRIC_TYPES.DEVELOPMENTAL) newState = INITIAL_DEVELOPMENTAL_STATE;


        // Ensure arrays
        setRubricData({
            ...newState,
            id: Date.now(),
            scoringType: rubricData.scoringType,
            includeMetadata: rubricData.includeMetadata,
            bloomsLevel: Array.isArray(newState.bloomsLevel) ? newState.bloomsLevel : [],
            coMapping: Array.isArray(newState.coMapping) ? newState.coMapping : [],
            poMapping: Array.isArray(newState.poMapping) ? newState.poMapping : [],
        });
    };


    const handleDownloadTemplate = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rubricData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${rubricData.title || "rubric_template"}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoadTemplate = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target.result);
                if (loadedData.type) {
                    setRubricType(loadedData.type);
                    setRubricData(loadedData);
                    if (loadedData.includeMetadata !== undefined) setShowSetup(false);
                } else {
                    alert("Invalid rubric template format.");
                }
            } catch (err) {
                alert("Failed to parse rubric template.");
            }
        };
        reader.readAsText(file);
    };

    const handleImageUpload = (e, criterionId, levelId) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            if (rubricType === RUBRIC_TYPES.ANALYTIC) {
                const updatedCriteria = rubricData.criteria.map(c => {
                    if (c.id === criterionId) {
                        const updatedLevels = c.levels.map(l => l.id === levelId ? { ...l, image: base64 } : l);
                        return { ...c, levels: updatedLevels };
                    } return c;
                });
                setRubricData({ ...rubricData, criteria: updatedCriteria });
            }
            if (rubricType === RUBRIC_TYPES.HOLISTIC) {
                const updatedLevels = rubricData.levels.map(l => l.id === levelId ? { ...l, image: base64 } : l);
                setRubricData({ ...rubricData, levels: updatedLevels });
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Analytic Handlers ---
    const addAnalyticCriterion = () => {
        const newCriterion = { id: Date.now(), name: 'New Criterion', weight: 1, bloomsLevel: [], coMapping: [], levels: [...rubricData.criteria[0].levels.map(l => ({ ...l, id: Date.now() + Math.random(), image: null }))] };
        setRubricData({ ...rubricData, criteria: [...rubricData.criteria, newCriterion] });
    };
    const updateAnalyticCriterion = (id, field, value) => {
        const updated = rubricData.criteria.map(c => c.id === id ? { ...c, [field]: value } : c);
        setRubricData({ ...rubricData, criteria: updated });
    };
    const toggleCriterionCO = (criterionId, co) => {
        const criterion = rubricData.criteria.find(c => c.id === criterionId);
        const currentCOs = criterion.coMapping || [];
        const updatedCOs = currentCOs.includes(co) ? currentCOs.filter(c => c !== co) : [...currentCOs, co];
        updateAnalyticCriterion(criterionId, 'coMapping', updatedCOs);
    };
    const toggleCriterionPO = (criterionId, po) => {
        const criterion = rubricData.criteria.find(c => c.id === criterionId);
        const currentPOs = criterion.poMapping || [];
        const updatedPOs = currentPOs.includes(po) ? currentPOs.filter(p => p !== po) : [...currentPOs, po];
        updateAnalyticCriterion(criterionId, 'poMapping', updatedPOs);
    };
    const toggleCriterionBloom = (criterionId, bloom) => {
        const criterion = rubricData.criteria.find(c => c.id === criterionId);
        const currentBlooms = Array.isArray(criterion.bloomsLevel) ? criterion.bloomsLevel : (criterion.bloomsLevel ? [criterion.bloomsLevel] : []);
        const updatedBlooms = currentBlooms.includes(bloom) ? currentBlooms.filter(b => b !== bloom) : [...currentBlooms, bloom];
        updateAnalyticCriterion(criterionId, 'bloomsLevel', updatedBlooms);
    };

    const updateAnalyticLevel = (criterionId, levelId, field, value) => {
        const updatedCriteria = rubricData.criteria.map(c => {
            if (c.id === criterionId) {
                const updatedLevels = c.levels.map(l => l.id === levelId ? { ...l, [field]: value } : l);
                return { ...c, levels: updatedLevels };
            } return c;
        });
        setRubricData({ ...rubricData, criteria: updatedCriteria });
    };
    const addAnalyticLevel = (criterionId) => {
        const updatedCriteria = rubricData.criteria.map(c => {
            if (c.id === criterionId) {
                const newLevel = { id: Date.now(), score: 0, label: 'New Level', description: '', image: null };
                return { ...c, levels: [...c.levels, newLevel] };
            } return c;
        });
        setRubricData({ ...rubricData, criteria: updatedCriteria });
    };
    const deleteAnalyticLevel = (criterionId, levelId) => {
        const updatedCriteria = rubricData.criteria.map(c => {
            if (c.id === criterionId) {
                return { ...c, levels: c.levels.filter(l => l.id !== levelId) };
            } return c;
        });
        setRubricData({ ...rubricData, criteria: updatedCriteria });
    };

    // --- Other Handlers ---
    const addHolisticLevel = () => setRubricData({ ...rubricData, levels: [...rubricData.levels, { id: Date.now(), score: 0, label: 'New', description: '', image: null }] });
    const updateHolisticLevel = (id, field, val) => setRubricData({ ...rubricData, levels: rubricData.levels.map(l => l.id === id ? { ...l, [field]: val } : l) });

    const addSinglePointCriterion = () => setRubricData({ ...rubricData, criteria: [...rubricData.criteria, { id: Date.now(), name: 'New', standard: '', bloomsLevel: [], coMapping: [] }] });
    const updateSinglePointCriterion = (id, field, val) => setRubricData({ ...rubricData, criteria: rubricData.criteria.map(c => c.id === id ? { ...c, [field]: val } : c) });
    const toggleSinglePointCO = (id, co) => {
        const c = rubricData.criteria.find(x => x.id === id);
        const updated = (c.coMapping || []).includes(co) ? c.coMapping.filter(x => x !== co) : [...(c.coMapping || []), co];
        updateSinglePointCriterion(id, 'coMapping', updated);
    };
    const toggleSinglePointPO = (id, po) => {
        const c = rubricData.criteria.find(x => x.id === id);
        const updated = (c.poMapping || []).includes(po) ? c.poMapping.filter(x => x !== po) : [...(c.poMapping || []), po];
        updateSinglePointCriterion(id, 'poMapping', updated);
    };
    const toggleSinglePointBloom = (id, bloom) => {
        const c = rubricData.criteria.find(x => x.id === id);
        const current = Array.isArray(c.bloomsLevel) ? c.bloomsLevel : (c.bloomsLevel ? [c.bloomsLevel] : []);
        const updated = current.includes(bloom) ? current.filter(x => x !== bloom) : [...current, bloom];
        updateSinglePointCriterion(id, 'bloomsLevel', updated);
    };


    const addDevelopmentalItem = () => {
        const newItem = { id: Date.now(), label: 'New Portfolio Item', required: true, bloomsLevel: [], coMapping: [] };
        setRubricData({ ...rubricData, items: [...rubricData.items, newItem] });
    };

    const updateDevelopmentalItem = (id, field, val) => {
        const updated = rubricData.items.map(item => item.id === id ? { ...item, [field]: val } : item);
        setRubricData({ ...rubricData, items: updated });
    };

    const deleteDevelopmentalItem = (id) => {
        const filtered = rubricData.items.filter(item => item.id !== id);
        setRubricData({ ...rubricData, items: filtered });
    };

    const toggleDevelopmentalCO = (id, co) => {
        const updated = rubricData.items.map(item => {
            if (item.id === id) {
                const current = item.coMapping || [];
                const next = current.includes(co) ? current.filter(c => c !== co) : [...current, co];
                return { ...item, coMapping: next };
            }
            return item;
        });
        setRubricData({ ...rubricData, items: updated });
    };

    const toggleDevelopmentalBloom = (id, bloom) => {
        const updated = rubricData.items.map(item => {
            if (item.id === id) {
                const current = item.bloomsLevel || [];
                const next = current.includes(bloom) ? current.filter(b => b !== bloom) : [...current, bloom];
                return { ...item, bloomsLevel: next };
            }
            return item;
        });
        setRubricData({ ...rubricData, items: updated });
    };


    const calculateTotalPoints = () => {
        if (rubricType !== RUBRIC_TYPES.ANALYTIC) return 0;
        return rubricData.criteria.reduce((total, c) => {
            const maxScore = Math.max(...c.levels.map(l => l.score), 0);
            return total + (maxScore * (c.weight || 1));
        }, 0);
    };

    if (showSetup) {
        return (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
            <button
               onClick={() => handleSetupComplete(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-red-600 transition"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-6 sm:mb-8">
              Choose a option to generate the Rubric Assessment
            </h2>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
             onClick={() => handleSetupComplete(false)}
                className="px-6 sm:px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition shadow-md text-sm sm:text-base"
              >
                Standard Rubrics
              </button>

              <button
               onClick={() => handleSetupComplete(true)}
                className="px-6 sm:px-8 py-3 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition shadow-md text-sm sm:text-base"
              >
               Rubric with BL & CO
              </button>
            </div>
          </div>
        </div>
        );
    }


    // Helper common renderer for BL tag list
    const renderBloomSelector = (currentBlooms, toggleFunc) => (
        <div className="relative group">
            <div className="flex items-center gap-1">
                {(Array.isArray(currentBlooms) ? currentBlooms : (currentBlooms ? [currentBlooms] : [])).map(bl => (
                    <span key={bl} className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">{bl}</span>
                ))}
                <div className="relative">
                    <button className="text-xs font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-1 bg-white hover:text-purple-500 ml-1 whitespace-nowrap leading-none">+ BL</button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 shadow-xl rounded-lg p-2 hidden group-hover:block z-50">
                        {BLOOMS_LEVELS.map(bl => (
                            <div key={bl} onClick={() => toggleFunc(bl)} className={`cursor-pointer px-2 py-1 text-xs font-bold rounded hover:bg-slate-50 flex justify-between ${(Array.isArray(currentBlooms) ? currentBlooms : (currentBlooms ? [currentBlooms] : [])).includes(bl) ? 'text-purple-600' : 'text-slate-500'}`}>
                                {bl}{(Array.isArray(currentBlooms) ? currentBlooms : (currentBlooms ? [currentBlooms] : [])).includes(bl) && <span>âœ“</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOutcomeSelector = (currentOutcomes, options, label, colorClass, toggleFunc) => (
        <div className="relative group">
            <div className="flex items-center gap-1">
                {(currentOutcomes || []).map(item => (
                    <span key={item} className={`${colorClass.bg} ${colorClass.text} text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>{item}</span>
                ))}
                <div className="relative">
                    <button className={`text-xs font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-1 bg-white hover:${colorClass.hoverText} ml-1 whitespace-nowrap leading-none`}>+ {label}</button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 shadow-xl rounded-lg p-2 hidden group-hover:block z-50 max-h-48 overflow-y-auto">
                        {options.map(opt => (
                            <div key={opt} onClick={() => toggleFunc(opt)} className={`cursor-pointer px-2 py-1 text-xs font-bold rounded hover:bg-slate-50 flex justify-between ${(currentOutcomes || []).includes(opt) ? colorClass.text : 'text-slate-500'}`}>
                                {opt}{(currentOutcomes || []).includes(opt) && <span>âœ“</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden font-sans text-xs">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
                <div className="p-4 flex-grow overflow-y-auto">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Add Rubric </h2>


                    <div className="space-y-5">
                        {/* <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                            <span className="text-xs font-bold text-blue-400  tracking-wider block mb-1">Mode</span>
                            <div className="font-bold text-blue-800 text-sm flex items-center gap-2">{rubricData.includeMetadata ? "Enhanced (BL & CO)" : "Standard"}<button onClick={() => setShowSetup(true)} className="text-[10px] underline text-blue-500 ml-auto cursor-pointer">Change</button></div>
                        </div> */}
                        <div><label className="block text-xs font-bold text-slate-400  tracking-wider mb-2">Rubric Name</label><input type="text" value={rubricData.title} onChange={(e) => updateField('title', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>
                        <div><label className="block text-xs font-bold text-slate-400  tracking-wider mb-2">Description</label><textarea value={rubricData.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[20px]" /></div>
                        <div><label className="block text-xs font-bold text-slate-400  tracking-wider mb-2">Rubric Type</label><select value={rubricType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm cursor-pointer">{Object.values(RUBRIC_TYPES).map(type => (<option key={type} value={type}>{type}</option>))}</select></div>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-xs font-bold text-slate-500 ">Scoring Type</span><div className="flex items-center gap-2 cursor-pointer" onClick={() => updateField('scoringType', rubricData.scoringType === 'Points' ? 'Percentage' : 'Points')}><span className={`text-xs font-bold transition-colors ${rubricData.scoringType === 'Points' ? 'text-blue-600' : 'text-slate-400'}`}>PTS</span><div className={`w-10 h-5 bg-gray-200 rounded-full relative transition-all ${rubricData.scoringType === 'Percentage' ? 'bg-indigo-200' : 'bg-blue-200'}`}><div className={`w-5 h-5 rounded-full absolute top-0 shadow-sm border border-white transition-all transform ${rubricData.scoringType === 'Percentage' ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-blue-600'}`}></div></div><span className={`text-xs font-bold transition-colors ${rubricData.scoringType === 'Percentage' ? 'text-indigo-600' : 'text-slate-400'}`}>%</span></div></div>
                        {rubricType === RUBRIC_TYPES.ANALYTIC && rubricData.scoringType === 'Points' && (<div className="mt-8"><span className="text-4xl font-extrabold text-red-500">{calculateTotalPoints()}</span><span className="text-xl font-bold text-slate-400"> / 100</span><div className="mt-2 text-red-500 bg-red-50 p-2 rounded text-xs font-bold">Total points = 100</div></div>)}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
                    <button onClick={() => onSave(rubricData)} className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all text-[11px]  tracking-wider">Save Rubric</button>
                    <div className="flex gap-2">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleLoadTemplate} />
                        <button onClick={() => fileInputRef.current.click()} className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-500 font-bold border border-gray-200 transition-all text-[10px]">Load</button>
                        <button onClick={handleDownloadTemplate} className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-500 font-bold border border-gray-200 transition-all text-[10px] flex items-center justify-center gap-1">Download</button>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col h-full overflow-hidden relative">
                <div className="bg-blue-600 h-12 flex items-center justify-between px-4 shadow-sm z-10">
                    <h1 className="text-white text-base font-bold tracking-tight">Rubric Builder</h1>
                    <div className="flex items-center gap-3">
                        <div onClick={() => setStudentView(!studentView)} className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors ${studentView ? 'bg-blue-700 text-white shadow-inner' : 'bg-blue-500 text-blue-100'}`}>
                            <span className="text-[10px] font-bold  tracking-wider">Preview View</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${studentView ? 'bg-green-400' : 'bg-blue-300'}`}></div>
                        </div>
                    </div>
                </div>


                <div className="flex-grow overflow-y-auto p-3 md:p-4 bg-slate-50">

                    {rubricType === RUBRIC_TYPES.ANALYTIC && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left min-w-[1200px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-800 border-b-2 border-slate-200">
                                            <th className="p-4 text-xs font-bold  tracking-wider w-64">Assessment Criteria</th>
                                            {rubricData.includeMetadata && (
                                                <>
                                                    <th className="p-4 text-xs font-bold  tracking-wider w-44 text-center">Bloom's Level</th>
                                                    <th className="p-4 text-xs font-bold  tracking-wider w-44 text-center">CO Mapping</th>
                                                </>
                                            )}
                                            {rubricData.criteria[0]?.levels.map((level, idx) => (
                                                <th key={idx} className="p-4 text-xs font-bold  tracking-wider min-w-[200px] text-center">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <input className="bg-transparent border-none text-slate-800 text-center font-bold focus:ring-0 w-full" value={level.label} onChange={(e) => {
                                                            const val = e.target.value;
                                                            const updatedCriteria = rubricData.criteria.map(c => ({
                                                                ...c,
                                                                levels: c.levels.map((l, i) => i === idx ? { ...l, label: val } : l)
                                                            }));
                                                            setRubricData({ ...rubricData, criteria: updatedCriteria });
                                                        }} />
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            <input type="number" className="w-8 bg-transparent border-none text-slate-600 text-right font-bold focus:ring-0 p-0" value={level.score} onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                const updatedCriteria = rubricData.criteria.map(c => ({
                                                                    ...c,
                                                                    levels: c.levels.map((l, i) => i === idx ? { ...l, score: val } : l)
                                                                }));
                                                                setRubricData({ ...rubricData, criteria: updatedCriteria });
                                                            }} />
                                                            <span>({rubricData.scoringType === 'Percentage' ? '%' : 'pts'})</span>
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="p-4 w-16 text-center">
                                                <button onClick={() => {
                                                    const newLevelId = Date.now();
                                                    const updatedCriteria = rubricData.criteria.map(c => ({
                                                        ...c,
                                                        levels: [...c.levels, { id: newLevelId + Math.random(), score: 0, label: 'New Level', description: '', image: null }]
                                                    }));
                                                    setRubricData({ ...rubricData, criteria: updatedCriteria });
                                                }} className="bg-blue-600 text-white w-8 h-8 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center mx-auto" title="Add Level Column">
                                                    <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200">
                                        {rubricData.criteria.map((criterion) => (
                                            <tr key={criterion.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                                <td className="p-4 border-r border-slate-100">
                                                    <div className="flex flex-col gap-2">
                                                        <textarea className="font-bold text-slate-700 bg-transparent border-none focus:ring-1 focus:ring-blue-100 rounded text-sm w-full min-h-[60px] resize-none" value={criterion.name} onChange={(e) => updateAnalyticCriterion(criterion.id, 'name', e.target.value)} placeholder="Criterion Name..." />
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold ">Weight: <input type="number" className="w-10 bg-white border border-slate-200 rounded px-1 py-0.5 text-blue-600 focus:outline-none" value={criterion.weight || 0} onChange={(e) => updateAnalyticCriterion(criterion.id, 'weight', parseFloat(e.target.value))} /> %</div>
                                                    </div>
                                                </td>
                                                {rubricData.includeMetadata && (
                                                    <>
                                                        <td className="p-4 border-r border-slate-100">
                                                            <div className="relative group/ms">
                                                                <div className="w-full min-h-[40px] p-2 border border-slate-200 rounded text-[10px] font-bold bg-white flex flex-wrap gap-1 items-center cursor-pointer hover:border-purple-300 transition-colors">
                                                                    {(criterion.bloomsLevel || []).length > 0 ? (
                                                                        criterion.bloomsLevel.map(bl => (
                                                                            <span key={bl} className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 flex items-center gap-1">
                                                                                {bl}
                                                                                <button onClick={(e) => { e.stopPropagation(); toggleCriterionBloom(criterion.id, bl); }} className="hover:text-purple-800">Ã—</button>
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-slate-400 font-normal">Select Bloom's...</span>
                                                                    )}
                                                                </div>
                                                                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg hidden group-hover/ms:block max-h-48 overflow-y-auto p-1">
                                                                    {BLOOMS_LEVELS.map(bl => (
                                                                        <div
                                                                            key={bl}
                                                                            onClick={() => toggleCriterionBloom(criterion.id, bl)}
                                                                            className={`px-2 py-1.5 text-[10px] font-bold rounded cursor-pointer flex items-center justify-between hover:bg-slate-50 ${criterion.bloomsLevel?.includes(bl) ? 'text-purple-600 bg-purple-50' : 'text-slate-600'}`}
                                                                        >
                                                                            {bl}
                                                                            {criterion.bloomsLevel?.includes(bl) && <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 border-r border-slate-100">
                                                            <div className="relative group/co">
                                                                <div className="w-full min-h-[40px] p-2 border border-slate-200 rounded text-[10px] font-bold bg-white flex flex-wrap gap-1 items-center cursor-pointer hover:border-blue-300 transition-colors">
                                                                    {(criterion.coMapping || []).length > 0 ? (
                                                                        criterion.coMapping.map(co => (
                                                                            <span key={co} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                                                {co}
                                                                                <button onClick={(e) => { e.stopPropagation(); toggleCriterionCO(criterion.id, co); }} className="hover:text-blue-800">Ã—</button>
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-slate-400 font-normal">Select CO...</span>
                                                                    )}
                                                                </div>
                                                                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg hidden group-hover/co:block max-h-48 overflow-y-auto p-1">
                                                                    {CO_MAPPING.map(co => (
                                                                        <div
                                                                            key={co}
                                                                            onClick={() => toggleCriterionCO(criterion.id, co)}
                                                                            className={`px-2 py-1.5 text-[10px] font-bold rounded cursor-pointer flex items-center justify-between hover:bg-slate-50 ${criterion.coMapping?.includes(co) ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                                                                        >
                                                                            {co}
                                                                            {criterion.coMapping?.includes(co) && <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {criterion.levels.map((level) => (
                                                    <td key={level.id} className="p-4 border-r border-slate-100 relative group/cell">
                                                        <textarea className="w-full text-xs text-slate-500 bg-transparent border-none resize-none focus:ring-0 p-0 min-h-[100px] leading-relaxed" value={level.description} onChange={(e) => updateAnalyticLevel(criterion.id, level.id, 'description', e.target.value)} placeholder="Enter level details..." />
                                                        <div className="mt-1 flex justify-between items-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                            {level.image ? (
                                                                <div className="relative group/img w-full h-16">
                                                                    <img src={level.image} alt="Ref" className="w-full h-full object-cover rounded border border-slate-100" />
                                                                    <button onClick={() => updateAnalyticLevel(criterion.id, level.id, 'image', null)} className="absolute top-0 right-0 bg-black/50 text-white rounded-full p-0.5"><svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                                                </div>
                                                            ) : (
                                                                <label className="cursor-pointer text-slate-500 hover:text-blue-500 transition-colors">
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, criterion.id, level.id)} />
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                </label>
                                                            )}
                                                            <button onClick={() => deleteAnalyticLevel(criterion.id, level.id)} className="text-slate-500 hover:text-red-500 p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    </td>
                                                ))}
                                                <td className="p-4 text-center align-middle">
                                                    <button onClick={() => {
                                                        const updated = rubricData.criteria.filter(c => c.id !== criterion.id);
                                                        setRubricData({ ...rubricData, criteria: updated });
                                                    }} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50" title="Delete Criterion Row">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-start items-center">
                                <button onClick={addAnalyticCriterion} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 text-sm  tracking-wide">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Add Criterion Row
                                </button>
                            </div>

                        </div>
                    )}





                    {rubricType === RUBRIC_TYPES.SINGLE_POINT && (
                        <div className="space-y-6">
                            {rubricData.criteria.map((criterion, i) => (
                                <div key={criterion.id} className="bg-white rounded-lg shadow-sm border-2 border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                        <input className="bg-transparent font-bold text-slate-700 text-sm w-1/3 focus:outline-none" value={criterion.name} onChange={(e) => updateSinglePointCriterion(criterion.id, 'name', e.target.value)} placeholder="Criterion Name" />
                                        {rubricData.includeMetadata && (
                                            <div className="flex items-center gap-3">
                                                {renderBloomSelector(criterion.bloomsLevel, (bl) => toggleSinglePointBloom(criterion.id, bl))}
                                                {renderOutcomeSelector(criterion.coMapping, CO_MAPPING, 'CO', { bg: 'bg-blue-100', text: 'text-blue-700', hoverText: 'text-blue-500' }, (co) => toggleSinglePointCO(criterion.id, co))}
                                            </div>
                                        )}


                                        <span className="text-xs text-slate-400 font-mono">CRITERION {i + 1}</span>
                                    </div>
                                    <div className="flex flex-col md:grid md:grid-cols-12 min-h-[100px]">
                                        <div className="w-full md:col-span-3 border-r border-gray-100 bg-red-50/10 p-4 text-center text-sm text-slate-400 italic">(Feedback Space)</div>
                                        <div className="w-full md:col-span-6 border-r border-gray-100 p-4 relative"> <textarea className="w-full h-full text-sm text-center text-slate-800 font-medium bg-transparent border-none resize-none focus:ring-0 leading-relaxed" value={criterion.standard} onChange={(e) => updateSinglePointCriterion(criterion.id, 'standard', e.target.value)} placeholder="Define standard..." /> </div>
                                        <div className="w-full md:col-span-3 bg-green-50/10 p-4 text-center text-sm text-slate-400 italic">(Feedback Space)</div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addSinglePointCriterion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-slate-500 font-bold hover:border-blue-500">+ Add Criterion</button>
                        </div>
                    )}
                    {rubricType === RUBRIC_TYPES.DEVELOPMENTAL && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-800 border-b-2 border-slate-200">
                                            <th className="p-3 text-[10px] font-bold  tracking-wider w-16 text-center border-r border-slate-100">#</th>
                                            <th className="p-3 text-[10px] font-bold  tracking-wider border-r border-slate-100">Portfolio Item / Skill</th>
                                            <th className="p-3 text-[10px] font-bold  tracking-wider w-24 text-center border-r border-slate-100">Required</th>
                                            {rubricData.includeMetadata && (
                                                <>
                                                    <th className="p-3 text-[10px] font-bold  tracking-wider w-40 text-center border-r border-slate-100">Bloom's Level</th>
                                                    <th className="p-3 text-[10px] font-bold  tracking-wider w-40 text-center border-r border-slate-100">CO Mapping</th>
                                                </>
                                            )}
                                            <th className="p-3 text-[10px] font-bold  tracking-wider w-20 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rubricData.items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                                <td className="p-3 text-center border-r border-slate-100">
                                                    <span className="text-[11px] font-bold text-slate-400">{index + 1}</span>
                                                </td>
                                                <td className="p-3 border-r border-slate-100">
                                                    <textarea
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-100 rounded text-xs font-bold text-slate-700 resize-none py-1 h-8 min-h-[32px]"
                                                        value={item.label}
                                                        onChange={(e) => updateDevelopmentalItem(item.id, 'label', e.target.value)}
                                                        placeholder="Enter skill or requirement..."
                                                    />
                                                </td>
                                                <td className="p-3 text-center border-r border-slate-100">
                                                    <div className="flex justify-center">
                                                        <div
                                                            onClick={() => updateDevelopmentalItem(item.id, 'required', !item.required)}
                                                            className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${item.required ? 'bg-emerald-100' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${item.required ? 'right-0.5 bg-emerald-600' : 'left-0.5 bg-white shadow-sm'}`}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {rubricData.includeMetadata && (
                                                    <>
                                                        <td className="p-3 border-r border-slate-100">
                                                            <div className="flex justify-center">
                                                                {renderBloomSelector(item.bloomsLevel, (bl) => toggleDevelopmentalBloom(item.id, bl))}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 border-r border-slate-100">
                                                            <div className="flex justify-center">
                                                                {renderOutcomeSelector(item.coMapping, CO_MAPPING, 'CO', { bg: 'bg-blue-100', text: 'text-blue-700', hoverText: 'text-blue-500' }, (co) => toggleDevelopmentalCO(item.id, co))}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => deleteDevelopmentalItem(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-start">
                                <button onClick={addDevelopmentalItem} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 text-[11px]  tracking-wide">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Add Portfolio Item
                                </button>
                            </div>
                        </div>
                    )}

                    {rubricType === RUBRIC_TYPES.HOLISTIC && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {rubricData.includeMetadata && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400  tracking-widest">Global Mapping:</span>
                                    {renderBloomSelector(rubricData.bloomsLevel, (bl) => {
                                        const current = Array.isArray(rubricData.bloomsLevel) ? rubricData.bloomsLevel : (rubricData.bloomsLevel ? [rubricData.bloomsLevel] : []);
                                        const updated = current.includes(bl) ? current.filter(x => x !== bl) : [...current, bl];
                                        updateField('bloomsLevel', updated);
                                    })}
                                    {renderOutcomeSelector(rubricData.coMapping, CO_MAPPING, 'CO', { bg: 'bg-blue-100', text: 'text-blue-700', hoverText: 'text-blue-500' }, (co) => {
                                        const updated = (rubricData.coMapping || []).includes(co) ? rubricData.coMapping.filter(x => x !== co) : [...(rubricData.coMapping || []), co];
                                        updateField('coMapping', updated);
                                    })}

                                </div>
                            )}

                            {/* Holistic code remains mostly same, truncated for brevity unless user needs BL here too ?? */}
                            {/* Assuming Holistic does NOT need BL per level as it is global, but if needed, can apply same pattern */}
                            {rubricData.levels.sort((a, b) => b.score - a.score).map((level) => (
                                <div key={level.id} className="flex gap-4 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="w-24 shrink-0 bg-blue-50 rounded-lg p-3 text-center border border-blue-100"><label className="block text-xs text-blue-400 font-bold mb-1">SCORE</label><input type="number" className="w-full bg-transparent text-center font-bold text-2xl text-blue-700 border-none p-0 focus:ring-0" value={level.score} onChange={(e) => updateHolisticLevel(level.id, 'score', parseFloat(e.target.value))} /></div>
                                    <div className="grow"><input className="w-full font-bold text-lg text-slate-800 border-none focus:ring-0 p-0 mb-1 placeholder-slate-300" value={level.label} placeholder="Performance Level Label" onChange={(e) => updateHolisticLevel(level.id, 'label', e.target.value)} /><textarea className="w-full text-sm text-slate-500 border-none resize-none p-0 focus:ring-0 mb-2" value={level.description} placeholder="Describe quality..." onChange={(e) => updateHolisticLevel(level.id, 'description', e.target.value)} />
                                        {level.image ? (<div className="relative w-20 h-20 group/img"><img src={level.image} className="w-full h-full object-cover rounded" alt="Ref" /><button onClick={() => updateHolisticLevel(level.id, 'image', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>) : (<label className="cursor-pointer text-xs text-blue-500 font-bold hover:underline flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add Image<input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, null, level.id)} /></label>)}
                                    </div>
                                </div>
                            ))}
                            <button onClick={addHolisticLevel} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-slate-500 font-bold hover:border-blue-500 transition-all">+ Add Performance Level</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RubricBuilder;
