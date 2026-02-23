import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
// Mapped imports to ensure functionality
import { listOfBooksService } from "../../AcademicDiary/Services/listOfBooks.service";
import { contentService } from "../../Content/services/content.service";

// Create service aliases to match user's code structure while using existing services
const collegeService = {
    getProgramByCollegeId: (id) => listOfBooksService.getProgramByCollegeId(id),
    getSUbjectbyProgramID: (id) => contentService.getSubjectbyProgramId(id)
};

const batchService = {
    getBatchByProgramId: (ids) => listOfBooksService.getBatchByProgramId(Array.isArray(ids) ? ids[0] : ids)
};

const MultiSelect = ({ label, value = [], onChange, options = [], placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const isSelected = value.some(id => id === option.value);
        let newValue;
        if (isSelected) {
            newValue = value.filter(id => id !== option.value);
        } else {
            newValue = [...value, option.value];
        }
        onChange(newValue);
        setOpen(false);
    };

    const handleSelectAll = () => {
        if (value.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(opt => opt.value));
        }
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative flex-1">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block ml-0.5">{label}</label>
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={`min-h-[48px] h-auto border-2 rounded-2xl px-4 py-1.5 flex justify-between items-center cursor-pointer transition-all
          ${disabled
                        ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white border-slate-100 hover:border-blue-400 text-slate-700"}`}
            >
                <div className="flex-1 pr-2">
                    {value.length > 0 ? (
                        <div className="flex flex-wrap gap-1 py-1">
                            {options
                                .filter(opt => value.includes(opt.value))
                                .map(opt => (
                                    <span
                                        key={opt.value}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                                    >
                                        {opt.label}
                                        <X
                                            size={12}
                                            className="cursor-pointer hover:text-blue-900"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(opt);
                                            }}
                                        />
                                    </span>
                                ))}
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </div>

            {open && !disabled && (
                <div className="absolute z-50 mt-2 w-full bg-white border-2 border-slate-100 rounded-2xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                    {options.length > 0 && (
                        <div
                            onClick={handleSelectAll}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex items-center gap-2"
                        >
                            Select All
                        </div>
                    )}
                    {options.map((opt) => {
                        const isSelected = value.some(id => id === opt.value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors mx-2 rounded-xl flex items-center gap-3
                  ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                    {options.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-slate-400 font-medium italic">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AssessmentMultiSelectFilter = ({ filters, setFilters, includeSubject = false, includeModule = false }) => {
    const [programs, setPrograms] = useState([]);
    const [batches, setBatches] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
                const collegeId = activeCollege?.id || activeCollege?.college_id; // Robust check

                let programsData = [];
                if (collegeId) {
                    programsData = await collegeService.getProgramByCollegeId(collegeId);
                }

                setPrograms((programsData || []).map(p => ({
                    label: p.program_name || p.name,
                    value: p.program_id || p.id,
                    ...p
                })));

                if (filters.program.length === 0 && programsData && programsData.length > 0) {
                    const firstId = programsData[0].program_id || programsData[0].id;
                    setFilters(prev => ({ ...prev, program: [firstId] }));
                }
            } catch (error) {
                console.error('Error loading programs:', error);
            }
        };
        loadPrograms();
    }, []);

    useEffect(() => {
        if (filters.program.length !== 1) {
            // setBatches([]); // User code had this, but maybe better to act more like original? No, follow user code.
            setBatches([]);
            return;
        }

        const programId = filters.program[0];

        batchService.getBatchByProgramId([programId]).then((data) => {
            const batchData = Array.isArray(data) ? data : (data?.data || []);
            setBatches(batchData.map(b => ({
                label: b.batch_name || b.name,
                value: b.batch_id || b.id,
                ...b
            })));

            if (filters.batch.length === 0 && batchData.length > 0) {
                const firstId = batchData[0].batch_id || batchData[0].id;
                setFilters(prev => ({ ...prev, batch: [firstId] }));
            }
        });
    }, [filters.program]);

    useEffect(() => {
        if (filters.batch.length !== 1) {
            setAcademicYears([]);
            return;
        }

        const selectedBatch = batches.find(b => b.value === filters.batch[0]);
        if (!selectedBatch) return;

        const ayData = selectedBatch.academic_years || [];

        setAcademicYears(ayData.map(y => ({
            label: y.name || y.academic_year,
            value: y.academic_year_id || y.id,
            ...y
        })));

        if (filters.academicYear.length === 0 && ayData.length > 0) {
            const firstId = ayData[0].academic_year_id || ayData[0].id;
            setFilters(prev => ({ ...prev, academicYear: [firstId] }));
        }
    }, [filters.batch, batches]);

    useEffect(() => {
        if (filters.academicYear.length !== 1) {
            setSemesters([]);
            return;
        }

        const selectedAY = academicYears.find(y => y.value === filters.academicYear[0]);
        if (!selectedAY) return;

        const uniqueSemesters = [];
        const seen = new Set();

        if (selectedAY.semester_divisions) {
            selectedAY.semester_divisions.forEach(sd => {
                if (!seen.has(sd.semester_id)) {
                    seen.add(sd.semester_id);
                    uniqueSemesters.push({
                        semester_id: sd.semester_id || sd.id,
                        semester_name: sd.name || sd.semester_name,
                    });
                }
            });
        }

        setSemesters(uniqueSemesters.map(s => ({
            label: s.semester_name || s.name,
            value: s.semester_id || s.id,
            ...s
        })));

        if (filters.semester.length === 0 && uniqueSemesters.length > 0) {
            const firstId = uniqueSemesters[0].semester_id || uniqueSemesters[0].id;
            setFilters(prev => ({ ...prev, semester: [firstId] }));
        }
    }, [filters.academicYear, academicYears]);

    // Load subjects when includeSubject is true
    useEffect(() => {
        if (!includeSubject || filters.program.length !== 1) {
            setSubjects([]);
            return;
        }

        const loadSubjects = async () => {
            try {
                // User code used 'getSUbjectbyProgramID' typo, carefully mapped in my service alias
                const res = await collegeService.getSUbjectbyProgramID(filters.program[0]);
                const subjectsData = Array.isArray(res) ? res : (res?.data || []);
                setSubjects(subjectsData.map(s => ({
                    label: s.subject_name || s.name,
                    value: s.subject_id || s.id,
                    ...s
                })));
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        };

        loadSubjects();
    }, [filters.program, includeSubject]);

    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            <div className="w-full">
                <MultiSelect
                    label="Program"
                    value={filters.program}
                    placeholder="Select Programs"
                    options={programs}
                    onChange={(val) =>
                        setFilters({
                            ...filters,
                            program: val,
                            batch: [],
                            academicYear: [],
                            semester: [],
                            subject: [],
                            status: []
                        })
                    }
                />
            </div>

            <div className="w-full">
                <MultiSelect
                    label="Batch"
                    value={filters.batch}
                    placeholder="Select Batches"
                    disabled={filters.program.length !== 1}
                    options={batches}
                    onChange={(val) =>
                        setFilters(prev => ({
                            ...prev,
                            batch: val,
                            academicYear: [],
                            semester: [],
                            subject: [],
                            status: []
                        }))
                    }
                />
            </div>

            <div className="w-full">
                <MultiSelect
                    label="Academic Year"
                    value={filters.academicYear}
                    placeholder="Select Years"
                    disabled={filters.batch.length !== 1}
                    options={academicYears}
                    onChange={(val) =>
                        setFilters(prev => ({
                            ...prev,
                            academicYear: val,
                            semester: [],
                            subject: [],
                            status: []
                        }))
                    }
                />
            </div>

            <div className="w-full">
                <MultiSelect
                    label="Semester"
                    value={filters.semester}
                    placeholder="Select Semesters"
                    disabled={filters.academicYear.length !== 1}
                    options={semesters}
                    onChange={(val) =>
                        setFilters(prev => ({
                            ...prev,
                            semester: val,
                            subject: [],
                            status: []
                        }))
                    }
                />
            </div>

            {includeSubject && (
                <div className="w-full">
                    <MultiSelect
                        label="Subject"
                        value={filters.subject}
                        placeholder="Select Subjects"
                        disabled={filters.program.length !== 1}
                        options={subjects}
                        onChange={(val) =>
                            setFilters(prev => ({
                                ...prev,
                                subject: val
                            }))
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default AssessmentMultiSelectFilter;
