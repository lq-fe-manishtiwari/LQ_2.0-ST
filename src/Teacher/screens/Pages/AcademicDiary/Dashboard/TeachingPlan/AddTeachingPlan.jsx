import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Save, X } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { api } from "@/_services/api";
import AttendanceFilters from "../../../Attendance/Components/AttendanceFilters";
import { teachingPlanService } from "../../Services/teachingPlan.service";

export default function AddTeachingPlan() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
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
        department: "Exam Department",
        levelOfSubject: "",
        objectives: [""],
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
                    console.error("Error saving objective:", objText, err);

                }
            }

            const payload = {
                academic_year_id: Number(filters.academicYear),
                semester_id: Number(filters.semester),
                subject_id: Number(filters.paper),
                teacher_id: Number(teacherId),
                department_id: 1,
                objective_id: objectiveIds,
                course_outcome: formData.courseOutcomes.map(co => co.description),
                college_id: collegeId,
                modules: formData.teachingModules.map(m => ({
                    module_id: 0,
                    topic_id: 0,
                    co: m.coNumbers,
                    month: m.startingMonth,
                    week: Number(m.week),
                    lecture_hour: Number(m.lectureHours),
                    pre_class_activity: m.preClassActivity,
                    post_class_activity: m.postClassActivity,
                    instructional_technique: m.instructionalTechnique
                }))
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
                        <h1 className="text-2xl font-bold text-gray-900">Add Teaching Plan</h1>
                        <p className="text-sm text-gray-500">Create a new comprehensive teaching plan for your course</p>
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
                        {loading ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Saving..." : "Save Teaching Plan"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-20">
                {/* Academic Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h2 className="text-lg font-semibold text-blue-900">Academic Selection</h2>
                    </div>
                    <div className="p-6">
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
