import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Plus, Trash2 } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import Select from 'react-select';
import { api } from "@/_services/api";
import { teachingPlanService } from "../../Services/teachingPlan.service";
import { settingsService } from "../../Services/settings.service";
import { contentService } from "../../../Content/Services/content.service";

// Helper component for read-only fields
const ReadOnlyField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
        <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium text-sm shadow-sm">
            {value || 'N/A'}
        </div>
    </div>
);

export default function EditTeachingPlanTeacher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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

    const [displayData, setDisplayData] = useState({
        academicYear: "",
        semester: "",
        division: "",
        paper: ""
    });

    const [formData, setFormData] = useState({
        teacherId: '',
        teacherName: '',
        academicYear: '',
        academicYearId: '',
        semester: '',
        semesterId: '',
        division: '',
        divisionId: '',
        subject: '',
        subjectId: '',
        department: '',
        departmentId: '',
        levelOfSubject: '',
        selectedObjectives: [],
        courseOutcomes: [{ coNumber: 'CO1', coDescription: '' }],
        tableRows: [
            {
                id: Date.now(),
                module: '',
                moduleId: '',
                unit: '',
                unitId: '',
                co: [],
                moduleStartingMonth: '',
                week: '',
                noOfLectureHours: '',
                preClassActivity: '',
                instructionalTechniques: '',
                postClassActivity: ''
            }
        ]
    });

    useEffect(() => {
        const init = async () => {
            await loadObjectives();
            if (id) {
                await loadPlanData();
            }
        };
        init();
    }, [id]);

    const loadPlanData = async () => {
        setFetching(true);
        try {
            const response = await teachingPlanService.GetTeachingPlanById(id);
            if (response) {
                // Map API response to component state using enriched_modules
                const mappedData = {
                    teacherId: response.teacher_id?.toString() || '',
                    teacherName: response.teacher ? `${response.teacher.firstname} ${response.teacher.lastname}` : 'N/A',
                    academicYear: response.academic_year?.name || 'N/A',
                    academicYearId: response.academic_year_id || '',
                    semester: response.semester?.name || 'N/A',
                    semesterId: response.semester_id || '',
                    division: response.division?.division_name || response.division_name || 'N/A',
                    divisionId: response.division_id || '',
                    subject: response.subject?.name || 'N/A',
                    subjectId: response.subject_id || '',
                    department: response.department?.department_name || response.department?.name || 'N/A',
                    departmentId: response.department_id || '',
                    levelOfSubject: response.level_of_paper || '',
                    selectedObjectives: response.objective_id || [],
                    courseOutcomes: response.course_outcome?.map((desc, idx) => ({
                        coNumber: `CO${idx + 1}`,
                        coDescription: desc
                    })) || [{ coNumber: 'CO1', coDescription: '' }],
                    tableRows: response.enriched_modules?.map((mod, idx) => ({
                        id: mod.teaching_module_id || Date.now() + idx,
                        module: mod.module_name || '',
                        moduleId: mod.module_id || '',
                        unit: mod.unit_name || '',
                        unitId: mod.topic_id || '',
                        co: mod.co || [],
                        moduleStartingMonth: mod.month || '',
                        week: mod.week?.toString() || '',
                        noOfLectureHours: mod.lecture_hour?.toString() || '',
                        preClassActivity: mod.pre_class_activity || '',
                        instructionalTechniques: mod.instructional_technique || '',
                        postClassActivity: mod.post_class_activity || ''
                    })) || []
                };
                setFormData(mappedData);
                
                // After plan is loaded, fetch modules using the subjectId
                if (mappedData.subjectId) {
                    await loadModulesAndUnits(mappedData.subjectId);
                }
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    confirmBtnText="OK"
                    onConfirm={() => navigate("/teacher/academic-diary/teaching-plan")}
                >
                    Teaching plan not found or could not be loaded.
                </SweetAlert>
            );
        } finally {
            setFetching(false);
        }
    };

    const loadObjectives = async () => {
        setLoadingObjectives(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;
            if (collegeId) {
                const response = await settingsService.getAllObjectivebyCollegeId(collegeId);
                setObjectives(response || []);
            }
        } catch (error) {
            console.error('Error loading objectives:', error);
        } finally {
            setLoadingObjectives(false);
        }
    };

    const loadModulesAndUnits = async (subjectId) => {
        if (!subjectId) return;
        setLoadingModules(true);
        try {
            const response = await contentService.getModulesbySubject(subjectId);
            const mods = response.modules || (Array.isArray(response) ? response : []);
            const formattedModules = mods.map(m => ({ id: m.module_id, name: m.module_name }));
            const formattedUnits = mods.flatMap(m => (m.units || []).map(u => ({ id: u.unit_id, name: u.unit_name, moduleId: m.module_id })));
            
            setModules(formattedModules);
            setUnits(formattedUnits);
        } catch (error) {
            console.error('Error loading modules:', error);
        } finally {
            setLoadingModules(false);
        }
    };

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleObjectiveToggle = (objId) => {
        setFormData(prev => ({
            ...prev,
            selectedObjectives: prev.selectedObjectives.includes(objId)
                ? prev.selectedObjectives.filter(i => i !== objId)
                : [...prev.selectedObjectives, objId]
        }));
    };

    const handleCOChange = (index, field, value) => {
        const updated = [...formData.courseOutcomes];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, courseOutcomes: updated }));
    };

    const addCourseOutcome = () => {
        setFormData(prev => ({
            ...prev,
            courseOutcomes: [...prev.courseOutcomes, { coNumber: `CO${prev.courseOutcomes.length + 1}`, coDescription: '' }]
        }));
    };

    const handleTableRowChange = (rowId, field, value) => {
        setFormData(prev => ({
            ...prev,
            tableRows: prev.tableRows.map(row => row.id === rowId ? { ...row, [field]: value } : row)
        }));
    };

    const handleModuleChange = (rowId, selectedOption) => {
        const moduleName = selectedOption?.label || '';
        const moduleId = selectedOption?.value || '';
        
        handleTableRowChange(rowId, 'module', moduleName);
        handleTableRowChange(rowId, 'moduleId', moduleId);
        handleTableRowChange(rowId, 'unit', '');
        handleTableRowChange(rowId, 'unitId', '');
        
        if (moduleId) {
            const modUnits = units.filter(u => u.moduleId === moduleId);
            setSelectedModuleUnits(prev => ({ ...prev, [rowId]: modUnits }));
        } else {
            setSelectedModuleUnits(prev => ({ ...prev, [rowId]: [] }));
        }
    };

    const handleUnitChange = (rowId, selectedOption) => {
        const unitName = selectedOption?.label || '';
        const unitId = selectedOption?.value || '';
        
        handleTableRowChange(rowId, 'unit', unitName);
        handleTableRowChange(rowId, 'unitId', unitId);
    };

    const handleRowCOChange = (rowId, selectedOptions) => {
        const coValues = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
        handleTableRowChange(rowId, 'co', coValues);
    };

    const addTableRow = () => {
        const newId = Date.now();
        setFormData(prev => ({
            ...prev,
            tableRows: [...prev.tableRows, { 
                id: newId, 
                module: '', 
                moduleId: '',
                unit: '', 
                unitId: '',
                co: [], 
                moduleStartingMonth: '', 
                week: '', 
                noOfLectureHours: '', 
                preClassActivity: '', 
                instructionalTechniques: '', 
                postClassActivity: '' 
            }]
        }));
    };

    const removeTableRow = (id) => {
        if (formData.tableRows.length > 1) {
            setFormData(prev => ({ ...prev, tableRows: prev.tableRows.filter(r => r.id !== id) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const collegeId = userProfile.college_id;
            
            const payload = {
                academic_year_id: formData.academicYearId,
                semester_id: formData.semesterId,
                division_id: formData.divisionId,
                subject_id: formData.subjectId,
                teacher_id: parseInt(formData.teacherId),
                department_id: formData.departmentId,
                objective_id: formData.selectedObjectives,
                course_outcome: formData.courseOutcomes.map(co => co.coDescription).filter(d => d.trim()),
                college_id: collegeId,
                modules: formData.tableRows.map(row => ({
                    module_id: row.moduleId || modules.find(m => m.name === row.module)?.id,
                    topic_id: row.unitId || units.find(u => u.name === row.unit)?.id,
                    co: row.co,
                    month: row.moduleStartingMonth,
                    week: parseInt(row.week) || 0,
                    lecture_hour: parseInt(row.noOfLectureHours) || 0,
                    pre_class_activity: row.preClassActivity || '',
                    post_class_activity: row.postClassActivity || '',
                    instructional_technique: row.instructionalTechniques || ''
                }))
            };

            await teachingPlanService.UpdateTeachingPlan(id, payload);
            setAlert(
                <SweetAlert success title="Updated!" confirmBtnText="OK" onConfirm={() => navigate('/teacher/academic-diary/teaching-plan')}>
                    Teaching plan updated successfully.
                </SweetAlert>
            );
        } catch (error) {
            console.error('Error updating plan:', error);
            setAlert(<SweetAlert error title="Error!" confirmBtnText="OK" onConfirm={() => setAlert(null)}>Failed to update.</SweetAlert>);
        } finally {
            setLoading(false);
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // React-select custom styles
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '38px',
            fontSize: '0.875rem',
            borderColor: '#d1d5db',
            '&:hover': { borderColor: '#3b82f6' }
        }),
        menu: (base) => ({ ...base, fontSize: '0.875rem' }),
        option: (base) => ({ ...base, fontSize: '0.875rem' })
    };

    if (fetching) return <div className="p-6 text-center">Loading plan data...</div>;

    return (
        <div className="p-6">
            {alert}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-700">Edit Teaching Plan</h2>
                <button onClick={() => navigate('/teacher/academic-diary/teaching-plan')} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fixed Academic Selection */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Academic Selection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* <ReadOnlyField label="Teacher" value={formData.teacherName} /> */}
                        <ReadOnlyField label="Academic Year" value={formData.academicYear} />
                        <ReadOnlyField label="Semester" value={formData.semester} />
                        <ReadOnlyField label="Division" value={formData.division} />
                        <ReadOnlyField label="Paper" value={formData.subject} />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadOnlyField label="Department" value={formData.department} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Level of Paper</label>
                            <select 
                                value={formData.levelOfSubject} 
                                onChange={e => handleInputChange('levelOfSubject', e.target.value)} 
                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Objectives</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {objectives.map(obj => (
                            <label key={obj.teaching_plan_objective_id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-blue-600 rounded"
                                    checked={formData.selectedObjectives.includes(obj.teaching_plan_objective_id)} 
                                    onChange={() => handleObjectiveToggle(obj.teaching_plan_objective_id)} 
                                />
                                <span className="text-sm font-medium text-gray-700">{obj.objective}</span>
                            </label>
                        ))}
                        {objectives.length === 0 && <p className="text-gray-500 italic text-sm">No objectives found.</p>}
                    </div>
                </div>

                {/* Course Outcomes */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Course Outcomes</h3>
                        <button type="button" onClick={addCourseOutcome} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700 transition shadow-sm"><Plus size={16}/> Add CO</button>
                    </div>
                    <div className="space-y-3">
                        {formData.courseOutcomes.map((co, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <div className="w-20">
                                    <input type="text" value={co.coNumber} readOnly className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-bold text-blue-600 text-center"/>
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={co.coDescription} 
                                        onChange={e => handleCOChange(idx, 'coDescription', e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                        placeholder="Describe the course outcome..."
                                    />
                                </div>
                                {formData.courseOutcomes.length > 1 && (
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, courseOutcomes: prev.courseOutcomes.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 p-2 transition">
                                        <Trash2 size={18}/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teaching Plan Table */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-4 min-w-max border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Teaching Plan Details</h3>
                        <button type="button" onClick={addTableRow} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition shadow-sm"><Plus size={18}/> Add Row</button>
                    </div>
                    <table className="w-full border-collapse min-w-[1600px]">
                        <thead>
                            <tr className="bg-blue-600 text-white text-xs uppercase tracking-wider">
                                <th className="p-3 text-left w-48">Module</th>
                                <th className="p-3 text-left w-48">Unit</th>
                                <th className="p-3 text-left w-40">CO</th>
                                <th className="p-3 text-left w-32">Month</th>
                                <th className="p-3 text-left w-20">Week</th>
                                <th className="p-3 text-left w-20">Hours</th>
                                <th className="p-3 text-left w-48">Pre-Class</th>
                                <th className="p-3 text-left w-48">Technique</th>
                                <th className="p-3 text-left w-48">Post-Class</th>
                                <th className="p-3 text-center w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {formData.tableRows.map((row, idx) => {
                                const moduleOptions = modules.map(m => ({ value: m.id, label: m.name }));
                                const unitOptions = (selectedModuleUnits[row.id] || units.filter(u => u.moduleId === row.moduleId) || []).map(u => ({ value: u.id, label: u.name }));
                                const coOptions = formData.courseOutcomes.map(co => ({ value: co.coNumber, label: co.coNumber }));
                                const selectedModule = row.module ? { value: row.moduleId, label: row.module } : null;
                                const selectedUnit = row.unit ? { value: row.unitId, label: row.unit } : null;
                                const selectedCOs = row.co.map(c => ({ value: c, label: c }));

                                return (
                                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-2">
                                            <Select
                                                value={selectedModule}
                                                onChange={(opt) => handleModuleChange(row.id, opt)}
                                                options={moduleOptions}
                                                styles={selectStyles}
                                                placeholder="Select Module"
                                                isClearable
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                value={selectedUnit}
                                                onChange={(opt) => handleUnitChange(row.id, opt)}
                                                options={unitOptions}
                                                styles={selectStyles}
                                                placeholder="Select Unit"
                                                isDisabled={!row.module}
                                                isClearable
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                isMulti
                                                value={selectedCOs}
                                                onChange={(opts) => handleRowCOChange(row.id, opts)}
                                                options={coOptions}
                                                styles={selectStyles}
                                                placeholder="Select CO"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <select value={row.moduleStartingMonth} onChange={e => handleTableRowChange(row.id, 'moduleStartingMonth', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 ring-blue-500 outline-none">
                                                <option value="">Month</option>
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-2"><input type="number" min="1" max="52" value={row.week} onChange={e => handleTableRowChange(row.id, 'week', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-xs text-center focus:ring-1 ring-blue-500 outline-none" /></td>
                                        <td className="p-2"><input type="number" min="1" value={row.noOfLectureHours} onChange={e => handleTableRowChange(row.id, 'noOfLectureHours', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-xs text-center focus:ring-1 ring-blue-500 outline-none" /></td>
                                        <td className="p-2">
                                            <input 
                                                type="text"
                                                value={row.preClassActivity} 
                                                onChange={e => handleTableRowChange(row.id, 'preClassActivity', e.target.value)} 
                                                className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 ring-blue-500 outline-none" 
                                                placeholder="Pre-class activity"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="text"
                                                value={row.instructionalTechniques} 
                                                onChange={e => handleTableRowChange(row.id, 'instructionalTechniques', e.target.value)} 
                                                className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 ring-blue-500 outline-none" 
                                                placeholder="Instructional technique"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="text"
                                                value={row.postClassActivity} 
                                                onChange={e => handleTableRowChange(row.id, 'postClassActivity', e.target.value)} 
                                                className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 ring-blue-500 outline-none" 
                                                placeholder="Post-class activity"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button type="button" onClick={() => removeTableRow(row.id)} className="text-red-500 hover:text-red-700 transition-colors p-2" title="Remove row"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-8 border-t mt-12 mb-6">
                    <button 
                        type="button" 
                        onClick={() => navigate('/teacher/academic-diary/teaching-plan')} 
                        className="px-8 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Save size={20}/>}
                        Update Teaching Plan
                    </button>
                </div>
            </form>
        </div>
    );
}