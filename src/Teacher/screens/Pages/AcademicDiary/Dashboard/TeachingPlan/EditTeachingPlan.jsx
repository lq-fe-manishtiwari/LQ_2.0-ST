'use client';

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Save, X, Loader2 } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { api } from "@/_services/api";
import AttendanceFilters from "../../../Attendance/Components/AttendanceFilters";
import { teachingPlanService } from "../../Services/teachingPlan.service";

export default function EditTeachingPlan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [allocations, setAllocations] = useState([]);
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
        levelOfSubject: "",
        objectives: [""],
        courseOutcomes: [{ coNumber: "CO1", description: "" }],
        teachingModules: []
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
    }, []);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id || id === 'undefined') {
                console.error("Invalid teaching plan ID:", id);
                return;
            }
            setFetching(true);
            try {
                const plan = await teachingPlanService.GetTeachingPlanById(id);
                if (plan) {
                    console.log("Fetched plan for edit:", plan);

                    // Map plan data to form state
                    setFormData({
                        department: plan.department || "Exam Department",
                        levelOfSubject: plan.level_of_subject || "",
                        objectives: plan.objectives?.map(obj => typeof obj === 'string' ? obj : obj.objective) || [""],
                        courseOutcomes: plan.course_outcome?.map((desc, idx) => ({
                            coNumber: `CO${idx + 1}`,
                            description: desc
                        })) || [{ coNumber: "CO1", description: "" }],
                        teachingModules: plan.modules?.map((m, idx) => ({
                            id: m.id || Date.now() + idx,
                            moduleName: m.module_name || "",
                            unitName: m.topic_name || "",
                            coNumbers: m.co || [],
                            startingMonth: m.month || "",
                            week: m.week || "",
                            lectureHours: m.lecture_hour || "",
                            preClassActivity: m.pre_class_activity || "",
                            instructionalTechnique: m.instructional_technique || "",
                            postClassActivity: m.post_class_activity || ""
                        })) || []
                    });

                    setFilters({
                        academicYear: plan.academic_year_id?.toString() || "",
                        semester: plan.semester_id?.toString() || "",
                        paper: plan.subject_id?.toString() || "",
                        teacher: plan.teacher_id?.toString() || "",
                        program: plan.program_id?.toString() || ""

                    });
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
                setAlert(
                    <SweetAlert
                        danger
                        title="Error"
                        onConfirm={() => navigate("/teacher/academic-diary/teaching-plan")}
                    >
                        Teaching plan not found or could not be loaded.
                    </SweetAlert>
                );
            } finally {
                setFetching(false);
            }
        };

        fetchPlan();
    }, [id, navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...formData.objectives];
        newObjectives[index] = value;
        setFormData(prev => ({ ...prev, objectives: newObjectives }));
    };

    const addObjective = () => {
        setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ""] }));
    };

    const removeObjective = (index) => {
        const newObjectives = formData.objectives.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, objectives: newObjectives.length ? newObjectives : [""] }));
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
        const newModules = formData.teachingModules.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        );
        setFormData(prev => ({ ...prev, teachingModules: newModules }));
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
    };

    const removeModule = (id) => {
        const newModules = formData.teachingModules.filter(m => m.id !== id);
        setFormData(prev => ({ ...prev, teachingModules: newModules.length ? newModules : [formData.teachingModules[0]] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;

            // 1. Save objectives to get IDs (Same logic as Add for consistency)
            const objectiveIds = [];
            for (const objText of formData.objectives) {
                if (!objText.trim()) continue;

                const objPayload = {
                    academic_year_id: Number(filters.academicYear),
                    semester_id: Number(filters.semester),
                    subject_id: Number(filters.paper),
                    objective: objText,
                    college_id: collegeId
                };

                try {
                    const objResult = await teachingPlanService.saveObjective(objPayload);
                    if (objResult && objResult.id) {
                        objectiveIds.push(objResult.id);
                    }
                } catch (err) {
                    console.error("Error saving objective during edit:", objText, err);
                }
            }

            // 2. Map form data to final TP API structure
            const payload = {
                academic_year_id: Number(filters.academicYear),
                semester_id: Number(filters.semester),
                subject_id: Number(filters.paper),
                teacher_id: Number(teacherId),
                department_id: 1, // Placeholder
                objective_id: objectiveIds,
                course_outcome: formData.courseOutcomes.map(co => co.description),
                college_id: collegeId,
                modules: formData.teachingModules.map(m => ({
                    module_id: 0, // Placeholder
                    topic_id: 0,   // Placeholder
                    co: m.coNumbers,
                    month: m.startingMonth,
                    week: Number(m.week),
                    lecture_hour: Number(m.lectureHours),
                    pre_class_activity: m.preClassActivity,
                    post_class_activity: m.postClassActivity,
                    instructional_technique: m.instructionalTechnique
                }))
            };

            await teachingPlanService.UpdateTeachingPlan(id, payload);

            setAlert(
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => navigate("/teacher/academic-diary/teaching-plan")}
                >
                    Teaching plan updated successfully.
                </SweetAlert>
            );
        } catch (error) {
            console.error("Error updating teaching plan:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error!"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to update teaching plan. Please ensure all required fields are correctly filled.
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

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading plan details...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-gray-50 min-h-screen">
            {alert}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/teacher/academic-diary/teaching-plan")}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Teaching Plan</h1>
                        <p className="text-sm text-gray-500">Update your comprehensive teaching plan</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/teacher/academic-diary/teaching-plan")}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Updating..." : "Update Plan"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-20">
                {/* Note about academic selection */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-700 font-medium">
                                Academic selections (Program, Paper, etc.) cannot be changed once a plan is created. Create a new plan if you need to change these.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Academic Context (Read-only for Edit) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h2 className="text-lg font-semibold text-blue-900">Academic Context</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Program</p>
                            <p className="text-sm font-semibold text-gray-700">{filters.program || "Loading..."}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                            <p className="text-sm font-semibold text-gray-700">{filters.paper || "Loading..."}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Year / Sem</p>
                            <p className="text-sm font-semibold text-gray-700">
                                {filters.academicYear && filters.semester ? `${filters.academicYear} / ${filters.semester}` : "Loading..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                        <h2 className="text-lg font-semibold text-indigo-900">Course Details</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="e.g. Computer Science"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Level of Paper</label>
                            <select
                                value={formData.levelOfSubject}
                                onChange={(e) => handleInputChange('levelOfSubject', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="UG">UG</option>
                                <option value="PG">PG</option>
                                <option value="Integrated">Integrated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Objectives */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-emerald-900">Objectives</h2>
                        <button
                            type="button"
                            onClick={addObjective}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <Plus size={14} /> Add Objective
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {formData.objectives.map((obj, idx) => (
                            <div key={idx} className="flex gap-3 items-center group">
                                <span className="text-sm font-medium text-gray-400 w-6">{idx + 1}.</span>
                                <input
                                    type="text"
                                    value={obj}
                                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder={`Enter objective ${idx + 1}`}
                                    required
                                />
                                {formData.objectives.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeObjective(idx)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Outcomes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-amber-900">Course Outcomes (CO)</h2>
                        <button
                            type="button"
                            onClick={addCO}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <Plus size={14} /> Add CO
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {formData.courseOutcomes.map((co, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 items-center group">
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={co.coNumber}
                                        onChange={(e) => handleCOChange(idx, 'coNumber', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-center bg-gray-50"
                                        placeholder="CO1"
                                        required
                                    />
                                </div>
                                <div className="col-span-9">
                                    <input
                                        type="text"
                                        value={co.description}
                                        onChange={(e) => handleCOChange(idx, 'description', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Describe the outcome..."
                                        required
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {formData.courseOutcomes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCO(idx)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teaching Modules / Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-rose-900">Teaching Plan Table</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <Plus size={14} /> Add Row
                        </button>
                    </div>
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full min-w-[1200px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[180px]">Module / Unit</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[120px]">Outcome</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[150px]">Timeline</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[100px]">Hours</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Methodology</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[60px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {formData.teachingModules.map((m, idx) => (
                                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 space-y-2">
                                            <input
                                                type="text"
                                                value={m.moduleName}
                                                onChange={(e) => handleModuleChange(m.id, 'moduleName', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                placeholder="Module Name"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={m.unitName}
                                                onChange={(e) => handleModuleChange(m.id, 'unitName', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50/50 italic text-gray-600"
                                                placeholder="Unit Topic"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.courseOutcomes.map(co => (
                                                    <button
                                                        key={co.coNumber}
                                                        type="button"
                                                        onClick={() => handleModuleCOToggle(m.id, co.coNumber)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${m.coNumbers.includes(co.coNumber)
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {co.coNumber}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 space-y-2">
                                            <select
                                                value={m.startingMonth}
                                                onChange={(e) => handleModuleChange(m.id, 'startingMonth', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white font-medium"
                                                required
                                            >
                                                <option value="">Month</option>
                                                {months.map(mon => <option key={mon} value={mon}>{mon}</option>)}
                                            </select>
                                            <input
                                                type="number"
                                                value={m.week}
                                                onChange={(e) => handleModuleChange(m.id, 'week', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none"
                                                placeholder="Week (1-4)"
                                                min="1" max="4"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <input
                                                type="number"
                                                value={m.lectureHours}
                                                onChange={(e) => handleModuleChange(m.id, 'lectureHours', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none font-semibold text-blue-600 text-center"
                                                placeholder="Hrs"
                                                min="1"
                                                required
                                            />
                                        </td>
                                        <td className="px-4 py-4 space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 ml-1">Pre-Class</span>
                                                    <textarea
                                                        value={m.preClassActivity}
                                                        onChange={(e) => handleModuleChange(m.id, 'preClassActivity', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none resize-none h-16"
                                                        placeholder="Activity"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 ml-1">Instructional</span>
                                                    <textarea
                                                        value={m.instructionalTechnique}
                                                        onChange={(e) => handleModuleChange(m.id, 'instructionalTechnique', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none resize-none h-16"
                                                        placeholder="Technique"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 ml-1">Post-Class</span>
                                                    <textarea
                                                        value={m.postClassActivity}
                                                        onChange={(e) => handleModuleChange(m.id, 'postClassActivity', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none resize-none h-16"
                                                        placeholder="Activity"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {formData.teachingModules.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeModule(m.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
    );
}