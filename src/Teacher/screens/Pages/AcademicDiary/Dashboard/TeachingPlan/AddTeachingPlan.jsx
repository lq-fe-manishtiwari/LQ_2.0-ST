import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Save, X } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { api } from "@/_services/api";
import AttendanceFilters from "../../../Attendance/Components/AttendanceFilters";
import { teachingPlanService } from "../../Services/teachingPlan.service";
import { settingsService } from "../../Services/settings.service";
import { contentService } from "../../../Content/services/content.service";

export default function AddTeachingPlan() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [loadingObjectives, setLoadingObjectives] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [allocations, setAllocations] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [modules, setModules] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedModuleUnits, setSelectedModuleUnits] = useState({});
    const [teacherId, setTeacherId] = useState(null);

    // Form State
    const [filters, setFilters] = useState({
        program: "",
        batch: "",
        academicYear: "",
        semester: "",
        division: "",
        paper: ""
    });

    const [formData, setFormData] = useState({
        department: "",
        department_id: null,
        levelOfSubject: "",
        selectedObjectives: [],
        courseOutcomes: [{ coNumber: "CO1", description: "" }],
        teachingModules: [
            {
                id: Date.now(),
                moduleName: "",
                unitName: "",
                coNumbers: [],
                startingMonth: "",
                week: "",
                lectureHours: "",
                preClassActivity: "",
                instructionalTechnique: "",
                postClassActivity: ""
            }
        ]
    });


    useEffect(() => {
        const loadProfileAndAllocations = async () => {
            setLoadingAllocations(true);
            try {
                const userProfileStr = localStorage.getItem("userProfile");
                if (userProfileStr) {
                    const profile = JSON.parse(userProfileStr);
                    const tid = profile.teacher_id;
                    setTeacherId(tid);

                    if (tid) {
                        const response = await api.getTeacherAllocatedPrograms(tid);
                        if (response?.success) {
                            const data = response.data;
                            const allAllocations = [
                                ...(data.class_teacher_allocation || []),
                                ...(data.normal_allocation || [])
                            ];

                            setAllocations(allAllocations);

                            // ✅ Auto-set department from allocation
                            if (allAllocations.length > 0 && allAllocations[0].department) {
                                setFormData(prev => ({
                                    ...prev,
                                    department: allAllocations[0].department.department_name,
                                    department_id: allAllocations[0].department.department_id // future use
                                }));
                            }
                        }

                    }
                }
            } catch (error) {
                console.error("Error loading profile/allocations:", error);
            } finally {
                setLoadingAllocations(false);
            }
        };

        loadProfileAndAllocations();
        loadObjectives();
    }, []);

    // Load modules and units when paper is selected
    useEffect(() => {
        if (filters.paper) {
            loadModulesAndUnits();
        } else {
            setModules([]);
            setUnits([]);
            setSelectedModuleUnits({});
        }
    }, [filters.paper]);

    const loadModulesAndUnits = async () => {
        setLoadingModules(true);
        try {
            const subjectId = parseInt(filters.paper);

            if (!subjectId) {
                setModules([]);
                setUnits([]);
                setSelectedModuleUnits({});
                return;
            }

            const response = await contentService.getModulesbySubject(subjectId);

            if (!response) {
                setModules([]);
                setUnits([]);
                setSelectedModuleUnits({});
                return;
            }

            let modulesData = [];
            let allUnits = [];

            if (response && response.modules && Array.isArray(response.modules)) {
                modulesData = response.modules.map(item => ({
                    id: item.module_id,
                    name: item.module_name
                }));

                allUnits = response.modules.flatMap(module =>
                    (module.units || []).map(unit => ({
                        id: unit.unit_id,
                        name: unit.unit_name,
                        moduleId: module.module_id
                    }))
                );
            }
            else if (Array.isArray(response)) {
                modulesData = response.map(item => ({
                    id: item.module_id,
                    name: item.module_name
                }));

                allUnits = response.flatMap(module =>
                    (module.units || []).map(unit => ({
                        id: unit.unit_id,
                        name: unit.unit_name,
                        moduleId: module.module_id
                    }))
                );
            }

            setModules(modulesData);
            setUnits(allUnits);

            const resetUnits = {};
            formData.teachingModules.forEach(row => {
                resetUnits[row.id] = [];
            });
            setSelectedModuleUnits(resetUnits);

        } catch (error) {
            console.error('Error loading modules and units:', error);
            setModules([]);
            setUnits([]);
            setSelectedModuleUnits({});
        } finally {
            setLoadingModules(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleObjectiveToggle = (objectiveId) => {
        setFormData(prev => ({
            ...prev,
            selectedObjectives: prev.selectedObjectives.includes(objectiveId)
                ? prev.selectedObjectives.filter(id => id !== objectiveId)
                : [...prev.selectedObjectives, objectiveId]
        }));
    };

    const handleCOChange = (index, field, value) => {
        const newCOs = [...formData.courseOutcomes];
        newCOs[index][field] = value;
        setFormData(prev => ({ ...prev, courseOutcomes: newCOs }));
    };

    const addCO = () => {
        const nextCO = `CO${formData.courseOutcomes.length + 1}`;
        setFormData(prev => ({
            ...prev,
            courseOutcomes: [...prev.courseOutcomes, { coNumber: nextCO, description: "" }]
        }));
    };

    const removeCO = (index) => {
        const newCOs = formData.courseOutcomes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, courseOutcomes: newCOs.length ? newCOs : [{ coNumber: "CO1", description: "" }] }));
    };

    const handleModuleChange = (id, field, value) => {
        if (field === 'moduleName') {
            const newModules = formData.teachingModules.map(m =>
                m.id === id ? { ...m, [field]: value, unitName: '' } : m
            );
            setFormData(prev => ({ ...prev, teachingModules: newModules }));

            const selectedModule = modules.find(m => m.name === value);

            if (selectedModule) {
                const moduleUnits = units.filter(u => u.moduleId === selectedModule.id);
                setSelectedModuleUnits(prev => ({
                    ...prev,
                    [id]: moduleUnits
                }));
            } else {
                setSelectedModuleUnits(prev => ({
                    ...prev,
                    [id]: []
                }));
            }
        } else {
            const newModules = formData.teachingModules.map(m =>
                m.id === id ? { ...m, [field]: value } : m
            );
            setFormData(prev => ({ ...prev, teachingModules: newModules }));
        }
    };

    const handleModuleCOToggle = (moduleId, coNumber) => {
        const newModules = formData.teachingModules.map(m => {
            if (m.id === moduleId) {
                const cos = m.coNumbers.includes(coNumber)
                    ? m.coNumbers.filter(c => c !== coNumber)
                    : [...m.coNumbers, coNumber];
                return { ...m, coNumbers: cos };
            }
            return m;
        });
        setFormData(prev => ({ ...prev, teachingModules: newModules }));
    };

    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            teachingModules: [
                ...prev.teachingModules,
                {
                    id: Date.now(),
                    moduleName: "",
                    unitName: "",
                    coNumbers: [],
                    startingMonth: "",
                    week: "",
                    lectureHours: "",
                    preClassActivity: "",
                    instructionalTechnique: "",
                    postClassActivity: ""
                }
            ]
        }));

        setSelectedModuleUnits(prev => ({
            ...prev,
            [Date.now()]: []
        }));
    };

    const removeModule = (id) => {
        const newModules = formData.teachingModules.filter(m => m.id !== id);
        setFormData(prev => ({ ...prev, teachingModules: newModules.length ? newModules : [formData.teachingModules[0]] }));

        setSelectedModuleUnits(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    const loadObjectives = async () => {
        setLoadingObjectives(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;

            if (collegeId) {
                const response = await settingsService.getAllObjectivebyCollegeId(collegeId);
                setObjectives(response || []);
            } else {
                setObjectives([]);
            }
        } catch (error) {
            console.error('Error loading objectives:', error);
            setObjectives([]);
        } finally {
            setLoadingObjectives(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!filters.program || !filters.paper) {
            setAlert(
                <SweetAlert
                    warning
                    title="Incomplete Selection"
                    onConfirm={() => setAlert(null)}
                >
                    Please select Program and Paper before saving.
                </SweetAlert>
            );
            return;
        }

        setLoading(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;

            const payload = {
                academic_year_id: Number(filters.academicYear),
                semester_id: Number(filters.semester),
                subject_id: Number(filters.paper),
                teacher_id: Number(teacherId),
                department_id: Number(formData.department_id),
                objective_id: formData.selectedObjectives,
                course_outcome: formData.courseOutcomes.map(co => co.description),
                college_id: collegeId,
                modules: formData.teachingModules.map(m => {
                    const selectedModule = modules.find(mod => mod.name === m.moduleName);
                    const selectedUnit = units.find(unit => unit.name === m.unitName);

                    return {
                        module_id: selectedModule?.id || 0,
                        topic_id: selectedUnit?.id || 0,
                        co: m.coNumbers,
                        month: m.startingMonth,
                        week: Number(m.week),
                        lecture_hour: Number(m.lectureHours),
                        pre_class_activity: m.preClassActivity,
                        post_class_activity: m.postClassActivity,
                        instructional_technique: m.instructionalTechnique
                    };
                })
            };

            console.log("Saving Teaching Plan with payload:", payload);
            await teachingPlanService.PostTeachingPlan(payload);

            setAlert(
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => navigate("/teacher/academic-diary/teaching-plan")}
                >
                    Teaching plan created and objectives registered successfully.
                </SweetAlert>
            );
        } catch (error) {
            console.error("Error saving teaching plan:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error!"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to save teaching plan. Please ensure all required fields are filled.
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="p-6">
            {alert}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Add Teaching Plan</h2>
                <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                    onClick={() => navigate("/teacher/academic-diary/teaching-plan")}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Academic Selection */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Selection</h2>
                    <div className="p-0">
                        <AttendanceFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            allocations={allocations}
                            loadingAllocations={loadingAllocations}
                            showPaperFilter={true}
                            showTimeSlotFilter={false}
                            showActiveFilters={false}
                        />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                readOnly
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Level of Paper <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.levelOfSubject}
                                onChange={(e) => handleInputChange('levelOfSubject', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Objectives */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Objectives <span className="text-red-500">*</span>
                    </h2>
                    {loadingObjectives ? (
                        <p className="text-gray-500">Loading objectives...</p>
                    ) : (
                        <div className="space-y-2">
                            {objectives.map((obj) => (
                                <label key={obj.teaching_plan_objective_id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedObjectives.includes(obj.teaching_plan_objective_id)}
                                        onChange={() => handleObjectiveToggle(obj.teaching_plan_objective_id)}
                                        className="mt-1"
                                    />
                                    <span className="text-sm text-gray-700">{obj.objective}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Course Outcomes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Course Outcomes <span className="text-red-500">*</span>
                        </h2>
                        <button
                            type="button"
                            onClick={addCO}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add CO
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.courseOutcomes.map((co, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="w-24">
                                    <input
                                        type="text"
                                        value={co.coNumber}
                                        onChange={(e) => handleCOChange(idx, 'coNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="CO1"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={co.description}
                                        onChange={(e) => handleCOChange(idx, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe the outcome..."
                                        required
                                    />
                                </div>
                                {formData.courseOutcomes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeCO(idx)}
                                        className="text-red-600 hover:text-red-800 p-2"
                                        title="Remove CO"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teaching Plan Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Teaching Plan Details</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Row
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1200px]">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>Module</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>Unit</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>CO</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>Module Starting Month</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '80px' }}>Week</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>No. of Lecture Hours</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '220px' }}>Pre Class Activity</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '220px' }}>Instructional Technique</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '220px' }}>Post Class Activity</th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-white tracking-wider whitespace-nowrap" style={{ minWidth: '80px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {formData.teachingModules.map((m, idx) => (
                                    <tr key={m.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            {loadingModules ? (
                                                <div className="text-sm text-gray-500">Loading modules...</div>
                                            ) : (
                                                <select
                                                    value={m.moduleName}
                                                    onChange={(e) => handleModuleChange(m.id, 'moduleName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select Module</option>
                                                    {modules.map((module) => (
                                                        <option key={module.id} value={module.name}>
                                                            {module.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            {loadingModules ? (
                                                <div className="text-sm text-gray-500">Loading units...</div>
                                            ) : (
                                                <select
                                                    value={m.unitName}
                                                    onChange={(e) => handleModuleChange(m.id, 'unitName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={!m.moduleName}
                                                >
                                                    <option value="">Select Unit</option>
                                                    {(selectedModuleUnits[m.id] || []).map((unit) => (
                                                        <option key={unit.id} value={unit.name}>
                                                            {unit.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="relative">
                                                <select
                                                    value={m.coNumbers.length > 0 ? m.coNumbers[0] : ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleModuleCOToggle(m.id, e.target.value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select CO</option>
                                                    {formData.courseOutcomes.map((co) => (
                                                        <option key={co.coNumber} value={co.coNumber}>
                                                            {co.coNumber}
                                                        </option>
                                                    ))}
                                                </select>
                                                {m.coNumbers.length > 1 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {m.coNumbers.slice(1).map((coNum) => (
                                                            <span key={coNum} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                                {coNum}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleModuleCOToggle(m.id, coNum)}
                                                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <select
                                                value={m.startingMonth}
                                                onChange={(e) => handleModuleChange(m.id, 'startingMonth', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Month</option>
                                                {months.map((month) => (
                                                    <option key={month} value={month}>
                                                        {month}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="number"
                                                value={m.week}
                                                onChange={(e) => handleModuleChange(m.id, 'week', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Week"
                                                min="1"
                                                max="52"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="number"
                                                value={m.lectureHours}
                                                onChange={(e) => handleModuleChange(m.id, 'lectureHours', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Hours"
                                                min="1"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={m.preClassActivity}
                                                onChange={(e) => handleModuleChange(m.id, 'preClassActivity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Pre Class Activity"
                                                style={{ minWidth: '200px' }}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={m.instructionalTechnique}
                                                onChange={(e) => handleModuleChange(m.id, 'instructionalTechnique', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Instructional Technique"
                                                style={{ minWidth: '200px' }}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={m.postClassActivity}
                                                onChange={(e) => handleModuleChange(m.id, 'postClassActivity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Post Class Activity"
                                                style={{ minWidth: '200px' }}
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {formData.teachingModules.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeModule(m.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Remove Row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/teacher/academic-diary/teaching-plan")}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Teaching Plan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}