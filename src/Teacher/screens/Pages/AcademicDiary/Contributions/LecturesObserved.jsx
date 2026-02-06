import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, UserX, Edit, ChevronDown, Loader2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import SweetAlert from "react-bootstrap-sweetalert";

const Input = ({ label, type = "text", value, onChange, required = false }) => (
    <div>
        <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required={required}
        />
    </div>
);

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled, loading, required = false }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => !disabled && !loading && setOpen(!open)}
                className={`h-10 border rounded-lg px-3 flex justify-between items-center cursor-pointer transition-all text-sm
          ${disabled || loading
                        ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-300 hover:border-blue-500 text-gray-700"}`}
            >
                <span className={`truncate pr-2 ${value ? "text-gray-900" : "text-gray-400"}`}>
                    {loading ? "Loading..." : value || placeholder}
                </span>
                {loading ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : (
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                )}
            </div>

            {open && !disabled && !loading && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {options.map((opt, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                            {opt.label || opt}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs text-gray-400 italic font-medium">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const LecturesObservedForm = ({ onClose, onSave, initialData, collegeId }) => {
    const [formData, setFormData] = useState({
        observation_date: "",
        program_id: "",
        programName: "",
        batch_id: "",
        batchName: "",
        academic_year_id: "",
        yearName: "",
        semester_id: "",
        semesterName: "",
        division_id: "",
        divisionName: "",
        subject_id: "",
        subjectName: "",
        remarks: ""
    });

    const [programs, setPrograms] = useState([]);
    const [batches, setBatches] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState({
        programs: false,
        batches: false,
        subjects: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                observation_date: initialData.observation_date || "",
                program_id: initialData.academic_year_details?.program_id || "",
                programName: initialData.academic_year_details?.program_name || "",
                batch_id: initialData.academic_year_details?.batch_id || "",
                batchName: initialData.academic_year_details?.batch_name || "",
                academic_year_id: initialData.academic_year_id || "",
                yearName: initialData.academic_year_details?.name || "",
                semester_id: initialData.semester_id || "",
                semesterName: initialData.semester_details?.name || "",
                division_id: initialData.division_id || "",
                divisionName: initialData.division_details?.division_name || "",
                subject_id: initialData.subject_id || "",
                subjectName: initialData.subject_details?.name || "",
                remarks: initialData.remarks || ""
            });
        }
    }, [initialData]);

    // Load Programs on mount
    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(prev => ({ ...prev, programs: true }));
            try {
                const res = await listOfBooksService.getProgramByCollegeId(collegeId);
                setPrograms(res || []);
            } catch (err) {
                console.error("Error fetching programs:", err);
            } finally {
                setLoading(prev => ({ ...prev, programs: false }));
            }
        };
        if (collegeId) fetchPrograms();
    }, [collegeId]);

    // Load Batches when Program changes
    useEffect(() => {
        if (!formData.program_id) {
            setBatches([]);
            return;
        }
        setLoading(prev => ({ ...prev, batches: true }));
        listOfBooksService.getBatchByProgramId([formData.program_id]).then((data) => {
            setBatches(data || []);
            setLoading(prev => ({ ...prev, batches: false }));
        });
    }, [formData.program_id]);

    // Load Academic Years from selected Batch
    useEffect(() => {
        const batch = batches.find((b) => b.batch_id === formData.batch_id);
        const ayData = batch?.academic_years || [];
        setAcademicYears(ayData);
    }, [formData.batch_id, batches]);

    // Extract Semesters from Academic Year
    useEffect(() => {
        const ay = academicYears.find((a) => a.academic_year_id === formData.academic_year_id);
        if (!ay) {
            setSemesters([]);
            return;
        }

        const uniqueSemesters = [];
        const seen = new Set();
        ay.semester_divisions.forEach((sd) => {
            if (!seen.has(sd.semester_id)) {
                seen.add(sd.semester_id);
                uniqueSemesters.push({
                    semester_id: sd.semester_id,
                    semester_name: sd.name || sd.semester_name,
                    divisions: sd.divisions || [],
                });
            }
        });
        setSemesters(uniqueSemesters);
    }, [formData.academic_year_id, academicYears]);

    // Load Divisions and Subjects from selected Semester
    useEffect(() => {
        const sem = semesters.find((s) => s.semester_id === formData.semester_id);
        setDivisions(sem?.divisions || []);

        if (formData.academic_year_id && formData.semester_id) {
            setLoading(prev => ({ ...prev, subjects: true }));
            listOfBooksService.getSubjectsByAcademicYearAndSemester(formData.academic_year_id, formData.semester_id)
                .then(res => {
                    if (res.success) {
                        setSubjects(res.data || []);
                    }
                })
                .finally(() => setLoading(prev => ({ ...prev, subjects: false })));
        } else {
            setSubjects([]);
        }
    }, [formData.semester_id, semesters, formData.academic_year_id]);

    // When editing, trigger cascading loads after initialData is set
    useEffect(() => {
        if (initialData && formData.program_id && programs.length > 0) {
            // Trigger batch loading
            setLoading(prev => ({ ...prev, batches: true }));
            listOfBooksService.getBatchByProgramId([formData.program_id]).then((data) => {
                setBatches(data || []);
                setLoading(prev => ({ ...prev, batches: false }));
            });
        }
    }, [initialData, formData.program_id, programs]);

    // When batches are loaded and we have a batch_id from initialData, load academic years
    useEffect(() => {
        if (initialData && formData.batch_id && batches.length > 0) {
            const batch = batches.find((b) => b.batch_id === formData.batch_id);
            const ayData = batch?.academic_years || [];
            setAcademicYears(ayData);
        }
    }, [initialData, formData.batch_id, batches]);

    // When academic years are loaded and we have academic_year_id, load semesters
    useEffect(() => {
        if (initialData && formData.academic_year_id && academicYears.length > 0) {
            const ay = academicYears.find((a) => a.academic_year_id === formData.academic_year_id);
            if (ay) {
                const uniqueSemesters = [];
                const seen = new Set();
                ay.semester_divisions.forEach((sd) => {
                    if (!seen.has(sd.semester_id)) {
                        seen.add(sd.semester_id);
                        uniqueSemesters.push({
                            semester_id: sd.semester_id,
                            semester_name: sd.name || sd.semester_name,
                            divisions: sd.divisions || [],
                        });
                    }
                });
                setSemesters(uniqueSemesters);
            }
        }
    }, [initialData, formData.academic_year_id, academicYears]);

    // When semesters are loaded and we have semester_id, load divisions and subjects
    useEffect(() => {
        if (initialData && formData.semester_id && semesters.length > 0) {
            const sem = semesters.find((s) => s.semester_id === formData.semester_id);
            setDivisions(sem?.divisions || []);

            if (formData.academic_year_id) {
                setLoading(prev => ({ ...prev, subjects: true }));
                listOfBooksService.getSubjectsByAcademicYearAndSemester(formData.academic_year_id, formData.semester_id)
                    .then(res => {
                        if (res.success) {
                            setSubjects(res.data || []);
                        }
                    })
                    .finally(() => setLoading(prev => ({ ...prev, subjects: false })));
            }
        }
    }, [initialData, formData.semester_id, semesters, formData.academic_year_id]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="flex justify-between items-center mb-5 sm:mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-transparent">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {initialData ? "Edit Record" : "Add Observation"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-600 active:bg-gray-200"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-2">
                    <Input
                        label="Date"
                        type="date"
                        value={formData.observation_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, observation_date: e.target.value }))}
                        required
                    />
                    <CustomSelect
                        label="Program"
                        placeholder="Select Program"
                        value={formData.programName}
                        options={programs.map(p => ({ label: p.program_name, value: p.program_id }))}
                        loading={loading.programs}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            program_id: opt.value,
                            programName: opt.label,
                            batch_id: "", batchName: "", academic_year_id: "", yearName: "",
                            semester_id: "", semesterName: "", division_id: "", divisionName: "",
                            subject_id: "", subjectName: ""
                        }))}
                        required
                    />
                    <CustomSelect
                        label="Batch"
                        placeholder="Select Batch"
                        value={formData.batchName}
                        disabled={!formData.program_id}
                        loading={loading.batches}
                        options={batches.map(b => ({ label: b.batch_name, value: b.batch_id }))}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            batch_id: opt.value,
                            batchName: opt.label,
                            academic_year_id: "", yearName: "", semester_id: "", semesterName: "",
                            division_id: "", divisionName: "", subject_id: "", subjectName: ""
                        }))}
                        required
                    />
                    <CustomSelect
                        label="Academic Year"
                        placeholder="Select Year"
                        value={formData.yearName}
                        disabled={!formData.batch_id}
                        options={academicYears.map(ay => ({ label: ay.name, value: ay.academic_year_id }))}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            academic_year_id: opt.value,
                            yearName: opt.label,
                            semester_id: "", semesterName: "", division_id: "", divisionName: "",
                            subject_id: "", subjectName: ""
                        }))}
                        required
                    />
                    <CustomSelect
                        label="Semester"
                        placeholder="Select Semester"
                        value={formData.semesterName}
                        disabled={!formData.academic_year_id}
                        options={semesters.map(s => ({ label: s.semester_name, value: s.semester_id }))}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            semester_id: opt.value,
                            semesterName: opt.label,
                            division_id: "", divisionName: "", subject_id: "", subjectName: ""
                        }))}
                        required
                    />
                    <CustomSelect
                        label="Division"
                        placeholder="Select Division"
                        value={formData.divisionName}
                        disabled={!formData.semester_id}
                        options={divisions.map(d => ({ label: d.division_name, value: d.division_id }))}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            division_id: opt.value,
                            divisionName: opt.label
                        }))}
                        required
                    />
                    <CustomSelect
                        label="Paper / Subject"
                        placeholder="Select Subject"
                        value={formData.subjectName}
                        disabled={!formData.semester_id}
                        loading={loading.subjects}
                        options={subjects.map(s => ({ label: s.name || s.subject_name, value: s.subject_id || s.id }))}
                        onChange={(opt) => setFormData(prev => ({
                            ...prev,
                            subject_id: opt.value,
                            subjectName: opt.label
                        }))}
                        required
                    />
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Remarks</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            rows="3"
                            placeholder="Enter observation remarks..."
                        ></textarea>
                    </div>

                    <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-2 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-all active:scale-95">Cancel</button>
                        <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95">Save Observation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LecturesObserved = () => {
    const userProfile = useUserProfile();
    const userId = userProfile.getUserId();
    const collegeId = userProfile.getCollegeId();

    const [alert, setAlert] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    const fetchRecords = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await listOfBooksService.getLectureObservedByUserId(userId, 0, 50);
            setRecords(data.content || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile.isLoaded && userId) {
            fetchRecords();
        }
    }, [userProfile.isLoaded, userId]);

    const handleSave = async (formData) => {
        try {
            if (!userId) {
                setAlert(
                    <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                        User information is missing.
                    </SweetAlert>
                );
                return;
            }

            const payload = {
                college_id: Number(collegeId),
                user_id: userId,
                observation_date: formData.observation_date,
                academic_year_id: formData.academic_year_id,
                semester_id: formData.semester_id,
                division_id: formData.division_id,
                subject_id: formData.subject_id,
                remarks: formData.remarks
            };

            if (editRecord) {
                await listOfBooksService.updateLectureObserved(editRecord.lecture_observed_id, payload);
                setAlert(
                    <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                        Record updated successfully!
                    </SweetAlert>
                );
            } else {
                await listOfBooksService.saveLectureObserved(payload);
                setAlert(
                    <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                        Record saved successfully!
                    </SweetAlert>
                );
            }
            setShowForm(false);
            setEditRecord(null);
            fetchRecords();
        } catch (err) {
            console.error("Error saving lecture observation:", err);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    {err.message || "Failed to save record."}
                </SweetAlert>
            );
        }
    };

    const handleDelete = (id) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                title="Are you sure?"
                onConfirm={async () => {
                    try {
                        await listOfBooksService.deleteLectureObserved(id);
                        setAlert(
                            <SweetAlert success title="Deleted!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                                Record has been deleted.
                            </SweetAlert>
                        );
                        fetchRecords();
                    } catch (err) {
                        setAlert(
                            <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                                Failed to delete record.
                            </SweetAlert>
                        );
                    }
                }}
                onCancel={() => setAlert(null)}
                focusCancelBtn
                confirmBtnCssClass="btn-confirm"
                cancelBtnCssClass="btn-cancel"
            >
                You won't be able to revert this!
            </SweetAlert>
        );
    };

    if (!userProfile.isLoaded) {
        return <div className="p-5 text-center text-gray-500">Loading profile...</div>;
    }

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
                <UserX className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-600">No Teacher Selected</p>
                <p className="text-sm mt-1 max-w-sm">
                    User information is unavailable.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 flex flex-col transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Lectures Observed</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                >
                    <Plus size={18} /> Record New Observation
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 italic">No records available</p>
                    <p className="text-xs text-gray-400 mt-1">Click the button above to add your first observation</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700 w-32">Date</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700 min-w-[150px]">Program</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700 min-w-[120px]">Batch</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Semester</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Division</th>
                                <th className="border-b px-6 py-3 text-left font-semibold text-gray-700 min-w-[200px]">Paper</th>
                                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">Remarks</th>
                                <th className="border-b px-4 py-3 text-center font-semibold text-gray-700 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((rec) => (
                                <tr key={rec.lecture_observed_id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-4 py-3 text-gray-700 font-medium">
                                        {rec.observation_date || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {rec.academic_year_details?.program_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {rec.academic_year_details?.batch_name || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                            {rec.academic_year_details?.class_year_name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                            {rec.semester_details?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                            {rec.division_details?.division_name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-gray-900 block truncate max-w-[250px]" title={rec.subject_details?.name}>
                                            {rec.subject_details?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 italic truncate max-w-[200px]" title={rec.remarks}>
                                        {rec.remarks || "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const fullRecord = await listOfBooksService.getLectureObservedById(rec.lecture_observed_id);
                                                        setEditRecord(fullRecord);
                                                        setShowForm(true);
                                                    } catch (error) {
                                                        console.error('Error fetching record:', error);
                                                        setAlert(
                                                            <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                                                                Failed to load record details.
                                                            </SweetAlert>
                                                        );
                                                    }
                                                }}
                                                className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                                title="Edit"
                                            >
                                                <Edit size={16} strokeWidth={2} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rec.lecture_observed_id)}
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} strokeWidth={2} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <LecturesObservedForm
                    onClose={() => { setShowForm(false); setEditRecord(null); }}
                    onSave={handleSave}
                    initialData={editRecord}
                    collegeId={collegeId}
                />
            )}
            {alert}
        </div>
    );
};

export default LecturesObserved;
