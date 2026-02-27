import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileDown, Info, ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from 'react-bootstrap-sweetalert';
import { collegeService } from '../../Academics/Services/college.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { contentService } from '../../Academics/Services/content.service.js';
import { COService } from '../../Assessment/Settings/Service/co.service.js';
import { QuestionsService } from '../../Assessment/Services/questions.service.js';
import { useUserProfile } from "../../../../../contexts/UserProfileContext.jsx";

export default function BulkUploadQuestions({ onClose, onSuccess }) {
    const { userID, userRole } = useUserProfile();
    const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
    const collegeId = activeCollege?.id;

    const [step, setStep] = useState(1); // 1: Filters & Download, 2: Upload & Preview

    // Data Options
    const [programOptions, setProgramOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);
    const [academicYearOptions, setAcademicYearOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [moduleOptions, setModuleOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [coOptions, setCoOptions] = useState([]);

    // Selected Values
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedCO, setSelectedCO] = useState(null);
    const [selectedLevel, setSelectedQuestionLevel] = useState(null);
    const [selectedBloomLevel, setSelectedBloomLevel] = useState("Remember");
    const [levelOptions, setQuestionLevelOptions] = useState([]);
    const [bloomLevelOptions, setBloomLevelOptions] = useState([]);
    const [selectedQuestionType, setSelectedQuestionType] = useState('Objective');
    const [selectedSubjectiveType, setSelectedSubjectiveType] = useState('SHORT_ANSWER');

    const subjectiveTypeOptions = [
        { value: 'SHORT_ANSWER', label: 'Short Answer' },
        { value: 'LONG_ANSWER', label: 'Long Answer' },
        { value: 'ESSAY', label: 'Essay' },
    ];

    // File & Upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Parsed Questions for Preview
    const [previewQuestions, setPreviewQuestions] = useState([]);

    // UI State
    const [loading, setLoading] = useState({
        programs: false,
        batches: false,
        subjects: false,
        modules: false,
        units: false,
        cos: false,
        levels: false
    });
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);

    // SweetAlert
    const [alert, setAlert] = useState(null);

    // --- 1. Initial Data Fetching ---

    useEffect(() => {
        fetchPrograms();
        fetchLevels();

        // Click outside handler for dropdowns
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(prev => ({ ...prev, programs: true }));
            let data = [];
            if (userRole === "SUPERADMIN") {
                data = await collegeService.getAllProgramByCollegeId(collegeId);
            } else {
                data = await collegeService.getProgrambyUserIdandCollegeId(userID, collegeId);
            }
            setProgramOptions(data || []);
        } catch (err) {
            console.error("Error fetching programs:", err);
            setError("Failed to load programs.");
        } finally {
            setLoading(prev => ({ ...prev, programs: false }));
        }
    };

    const fetchLevels = async () => {
        try {
            setLoading(prev => ({ ...prev, levels: true }));
            const [qLevels, bLevels] = await Promise.all([
                contentService.getAllQuestionLevel(),
                QuestionsService.getAllBloomsLevels()
            ]);
            setQuestionLevelOptions(Array.isArray(qLevels) ? qLevels : []);
            setBloomLevelOptions(Array.isArray(bLevels) ? bLevels : []);
        } catch (err) {
            console.error("Error fetching levels:", err);
        } finally {
            setLoading(prev => ({ ...prev, levels: false }));
        }
    };

    // --- 2. Cascading Dropdown Logic ---

    // Program Select -> Fetch Batch
    useEffect(() => {
        if (!selectedProgram) {
            setBatchOptions([]);
            setSelectedBatch(null);
            return;
        }
        const fetchBatches = async () => {
            try {
                setLoading(prev => ({ ...prev, batches: true }));
                const res = await batchService.getBatchByProgramId(selectedProgram.program_id);
                const data = Array.isArray(res) ? res : (res.data || []);
                // Ensure unique batches
                const uniqueBatches = [];
                const seen = new Set();
                data.forEach(b => {
                    if (!seen.has(b.batch_id)) {
                        seen.add(b.batch_id);
                        uniqueBatches.push(b);
                    }
                });
                setBatchOptions(uniqueBatches);
            } catch (err) {
                console.error("Error fetching batches:", err);
            } finally {
                setLoading(prev => ({ ...prev, batches: false }));
            }
        };
        fetchBatches();
        // Reset subsequent selections
        setSelectedBatch(null);
        setSelectedAcademicYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setSelectedModule(null);
        setSelectedUnit(null);
        setSelectedCO(null);
    }, [selectedProgram]);

    // Batch Select -> Populate Academic Year
    useEffect(() => {
        if (!selectedBatch) {
            setAcademicYearOptions([]);
            setSelectedAcademicYear(null);
            return;
        }

        if (selectedBatch.academic_years && Array.isArray(selectedBatch.academic_years)) {
            setAcademicYearOptions(selectedBatch.academic_years);
        } else {
            // Fallback or fetch if structure differs
            setAcademicYearOptions([]);
        }
        setSelectedAcademicYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setSelectedModule(null);
        setSelectedUnit(null);
        setSelectedCO(null);
    }, [selectedBatch]);

    // Academic Year Select -> Populate Semester
    useEffect(() => {
        if (!selectedAcademicYear) {
            setSemesterOptions([]);
            setSelectedSemester(null);
            return;
        }

        const divisions = selectedAcademicYear.semester_divisions || (selectedAcademicYear.program_class_year?.semester_divisions);

        if (divisions && Array.isArray(divisions)) {
            // Extract unique semesters from divisions
            const uniqueSemesters = [];
            const seen = new Set();
            divisions.forEach(sd => {
                if (!seen.has(sd.semester_id)) {
                    seen.add(sd.semester_id);
                    uniqueSemesters.push({
                        semester_id: sd.semester_id,
                        semester_name: sd.name || sd.semester_name || `Semester ${sd.semester_number}`,
                    });
                }
            });
            setSemesterOptions(uniqueSemesters);
        } else {
            setSemesterOptions([]);
        }

        setSelectedSemester(null);
        setSelectedSubject(null);
        setSelectedModule(null);
        setSelectedUnit(null);
        setSelectedCO(null);
    }, [selectedAcademicYear]);


    // Semester Select -> Fetch Subjects
    useEffect(() => {
        if (!selectedAcademicYear || !selectedSemester) {
            setSubjectOptions([]);
            setSelectedSubject(null);
            return;
        }
        const fetchSubjects = async () => {
            try {
                setLoading(prev => ({ ...prev, subjects: true }));
                const res = await contentService.getSubjectsByAcademicYearAndSemester(
                    selectedAcademicYear.academic_year_id,
                    selectedSemester.semester_id
                );
                if (res.success && Array.isArray(res.data)) {
                    setSubjectOptions(res.data);
                } else {
                    setSubjectOptions([]);
                }
            } catch (err) {
                console.error("Error fetching subjects:", err);
            } finally {
                setLoading(prev => ({ ...prev, subjects: false }));
            }
        };
        fetchSubjects();
        setSelectedSubject(null);
        setSelectedModule(null);
        setSelectedUnit(null);
        setSelectedCO(null);
    }, [selectedSemester]);

    useEffect(() => {
        if (!selectedSubject) {
            setModuleOptions([]);
            setCoOptions([]);
            setSelectedModule(null);
            setSelectedCO(null);
            return;
        }

        const fetchModulesAndCos = async () => {
            setLoading(prev => ({ ...prev, modules: true, cos: true }));

            // 1. Fetch Modules
            try {
                const modRes = await contentService.getModulesbySubject(selectedSubject.subject_id || selectedSubject.id);
                const mods = modRes?.modules || modRes || [];
                setModuleOptions(Array.isArray(mods) ? mods : []);
            } catch (err) {
                console.error("Error fetching modules:", err);
                setModuleOptions([]);
            } finally {
                setLoading(prev => ({ ...prev, modules: false }));
            }

            try {
                const subjectId = selectedSubject.subject_id || selectedSubject.id;
                console.log("Fetching COs for subject ID:", subjectId, "Full Subject:", selectedSubject);
                const coRes = await COService.getAllCOByCourseId(subjectId);
                console.log("CO Response Raw:", JSON.stringify(coRes));

                const coArray = Array.isArray(coRes) ? coRes : (Array.isArray(coRes?.data) ? coRes.data : []);

                const mappedCOs = coArray.map(co => ({
                    ...co,
                    id: co.course_outcome_id,
                    name: co.outcome_code || co.outcome_title,
                    label: co.outcome_code || co.outcome_title || co.name,
                    displayKey: co.outcome_code || co.outcome_title || co.name
                }));
                console.log("Mapped COs:", mappedCOs);
                setCoOptions(mappedCOs);
            } catch (err) {
                console.error("Error fetching COs:", err);
                setCoOptions([]);
            } finally {
                setLoading(prev => ({ ...prev, cos: false }));
            }
        };
        fetchModulesAndCos();
        setSelectedModule(null);
        setSelectedUnit(null);
        setSelectedCO(null);
    }, [selectedSubject]);

    useEffect(() => {
        if (!selectedModule) {
            setUnitOptions([]);
            setSelectedUnit(null);
            return;
        }
        setUnitOptions(selectedModule.units || []);
        setSelectedUnit(null);
    }, [selectedModule]);

    const handleDownloadTemplate = () => {
        const isObjective = selectedQuestionType === 'Objective';

        // Headers
        let headers = [];
        if (isObjective) {
            headers = [
                "QUESTION",
                "OPTION 1", "OPTION 2", "OPTION 3", "OPTION 4", "OPTION 5",
                "ANSWER (Option Number)",
                "DEFAULT MARKS"
            ];
        } else {
            headers = [
                "QUESTION",
                "MODEL ANSWER (Optional)",
                "DEFAULT MARKS"
            ];
        }

        const worksheet = XLSX.utils.aoa_to_sheet([headers]);
        const workbook = XLSX.utils.book_new();


        const sheetName = isObjective ? "Objective_Template" : "Subjective_Template";
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const fileName = `Question_Upload_Template_${isObjective ? 'Objective' : 'Subjective'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            setError("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }

        setError(null);
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length < 2) {
                    setError("File appears to be empty or missing headers.");
                    setParsedData([]);
                    return;
                }

                const headers = data[0].map(h => String(h).trim().toUpperCase());
                const rows = data.slice(1);

                if (!headers.includes("QUESTION")) {
                    setError("Invalid template. 'QUESTION' column is missing.");
                    setParsedData([]);
                    return;
                }

                const parsed = rows.map((row, idx) => {
                    const rowObj = {};
                    headers.forEach((h, i) => {
                        rowObj[h] = row[i];
                    });
                    return { ...rowObj, _id: idx };
                }).filter(r => r.QUESTION);

                setParsedData(parsed);

            } catch (err) {
                console.error(err);
                setError("Failed to parse file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const validateData = () => {
        if (!parsedData || parsedData.length === 0) return "No data found in file.";
        if (!selectedUnit) return "Please select a Unit.";
        if (!selectedLevel) return "Please select a Question Level.";

        return null; // Valid
    };

    const handleUpload = async () => {
        if (!selectedFile || parsedData.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const isObjective = selectedQuestionType === 'Objective';

            const questionsPayload = parsedData.map(item => {

                const baseQuestion = {
                    subject_id: selectedSubject.subject_id || selectedSubject.id,
                    module_id: selectedModule.module_id || selectedModule.id,
                    unit_id: selectedUnit.unit_id || selectedUnit.id,
                    question: item["QUESTION"] || item["Question"],
                    question_category: isObjective ? "OBJECTIVE" : "SUBJECTIVE",
                    question_type: isObjective ? "MCQ" : (selectedSubjectiveType || "SHORT_ANSWER"),
                    question_level_id: selectedLevel.question_level_id || selectedLevel.id,
                    blooms_level_id: selectedBloomLevel?.blooms_level_id || selectedBloomLevel?.id || null,
                    course_outcome_ids: selectedCO ? [selectedCO.course_outcome_id || selectedCO.id] : [],
                    default_marks: parseFloat(item["DEFAULT MARKS"] || item["DEFAULT_MARKS"] || 1),
                    is_active: true
                };

                if (isObjective) {
                    // Handle Options
                    const options = [];
                    const answerKey = String(item["ANSWER (OPTION NUMBER)"] || item["ANSWER (Option Number)"] || item["ANSWER"] || "").trim().toUpperCase(); // e.g., "1", "A", "Option 1"

                    const isCorrect = (optIndex, optLabel) => {
                        return answerKey === String(optIndex) ||
                            answerKey === optLabel ||
                            answerKey === `OPTION ${optIndex}` ||
                            answerKey === `OPTION ${optLabel}`;
                    };

                    const opt1 = item["OPTION 1"];
                    if (opt1) options.push({ option_text: opt1, is_correct: isCorrect(1, 'A') });

                    const opt2 = item["OPTION 2"];
                    if (opt2) options.push({ option_text: opt2, is_correct: isCorrect(2, 'B') });

                    const opt3 = item["OPTION 3"];
                    if (opt3) options.push({ option_text: opt3, is_correct: isCorrect(3, 'C') });

                    const opt4 = item["OPTION 4"];
                    if (opt4) options.push({ option_text: opt4, is_correct: isCorrect(4, 'D') });

                    const opt5 = item["OPTION 5"];
                    if (opt5) options.push({ option_text: opt5, is_correct: isCorrect(5, 'E') });

                    return {
                        ...baseQuestion,
                        options: options
                    };
                } else {
                    // Subjective
                    return {
                        ...baseQuestion,
                        model_answer: item["MODEL ANSWER (Optional)"] || ""
                    };
                }
            });

            // Final Payload
            const finalPayload = {
                college_id: collegeId,
                program_id: selectedProgram.id || selectedProgram.program_id,
                program_name: selectedProgram.program_name || selectedProgram.name, // Ensure name is sent
                questions: questionsPayload
            };

            console.log("Uploading Payload:", JSON.stringify(finalPayload, null, 2));

            await QuestionsService.saveQuestionsBulk(finalPayload);

            setAlert(
                <SweetAlert success title="Success!" onConfirm={() => {
                    setAlert(null);
                    if (onSuccess) onSuccess();
                    onClose();
                }}>
                    Questions uploaded successfully.
                </SweetAlert>
            );

        } catch (err) {
            console.error("Upload failed", err);
            setError(err.message || "Upload failed. Please check your data.");
        } finally {
            setUploading(false);
        }
    };

    // --- Render Helpers ---

    const FilterDropdown = ({ label, value, options, onChange, placeholder, disabled, loading, displayKey = 'name', required = true }) => (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
            <div
                className={`relative border rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer transition-all
          ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300 hover:border-blue-500'}
          ${dropdownOpen === label ? 'ring-2 ring-blue-100 border-blue-500' : ''}
        `}
                onClick={(e) => {
                    if (!disabled) {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === label ? null : label);
                    }
                }}
            >
                <span className="truncate text-sm">
                    {loading ? "Loading..." : (value ? (value[displayKey] || value.label || "Selected") : placeholder)}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen === label ? 'rotate-180' : ''}`} />

                {dropdownOpen === label && !disabled && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[200] max-h-60 overflow-y-auto">
                        {options.length > 0 ? options.map((opt, idx) => (
                            <div
                                key={idx}
                                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt);
                                    setDropdownOpen(null);
                                }}
                            >
                                {opt[displayKey] || opt.label || opt.name || opt.co_code || opt.outcome_code || "Unknown"}
                            </div>
                        )) : (
                            <div className="px-3 py-2 text-sm text-gray-400 italic">No options</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]" ref={dropdownRef}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Bulk Upload Questions</h2>
                        <p className="text-sm text-gray-500 mt-1">Select filters to download the template, then upload the filled sheet.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-8">

                    {/* Step 1: Filters */}
                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">1</span>
                            Select Context
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FilterDropdown
                                label="Program"
                                value={selectedProgram}
                                options={programOptions}
                                onChange={setSelectedProgram}
                                placeholder="Select Program"
                                displayKey="program_name"
                                loading={loading.programs}
                            />

                            <FilterDropdown
                                label="Batch"
                                value={selectedBatch}
                                options={batchOptions}
                                onChange={setSelectedBatch}
                                placeholder="Select Batch"
                                displayKey="batch_name"
                                disabled={!selectedProgram}
                                loading={loading.batches}
                            />

                            <FilterDropdown
                                label="Academic Year"
                                value={selectedAcademicYear}
                                options={academicYearOptions}
                                onChange={setSelectedAcademicYear}
                                placeholder="Select Year"
                                displayKey="name"
                                disabled={!selectedBatch}
                            />

                            <FilterDropdown
                                label="Semester"
                                value={selectedSemester}
                                options={semesterOptions}
                                onChange={setSelectedSemester}
                                placeholder="Select Semester"
                                displayKey="semester_name"
                                disabled={!selectedAcademicYear}
                            />

                            <FilterDropdown
                                label="Paper (Subject)"
                                value={selectedSubject}
                                options={subjectOptions}
                                onChange={setSelectedSubject}
                                placeholder="Select Paper"
                                displayKey="name"
                                disabled={!selectedSemester}
                                loading={loading.subjects}
                            />

                            <FilterDropdown
                                label="Module"
                                value={selectedModule}
                                options={moduleOptions}
                                onChange={setSelectedModule}
                                placeholder="Select Module"
                                displayKey="module_name"
                                disabled={!selectedSubject}
                                loading={loading.modules}
                            />

                            <FilterDropdown
                                label="Unit"
                                value={selectedUnit}
                                options={unitOptions}
                                onChange={setSelectedUnit}
                                placeholder="Select Unit"
                                displayKey="unit_name"
                                disabled={!selectedModule}
                            />

                            <FilterDropdown
                                label="Course Outcome"
                                value={selectedCO}
                                options={coOptions}
                                onChange={setSelectedCO}
                                placeholder="Select CO"
                                displayKey="label"
                                disabled={!selectedSubject}
                                loading={loading.cos}
                                required={false}
                            />

                            <FilterDropdown
                                label="Question Level"
                                value={selectedLevel}
                                options={levelOptions}
                                onChange={setSelectedQuestionLevel}
                                placeholder="Select Difficulty"
                                displayKey="question_level_type"
                                loading={loading.levels}
                            />

                            <FilterDropdown
                                label="Bloom's Level"
                                value={selectedBloomLevel}
                                options={bloomLevelOptions}
                                onChange={setSelectedBloomLevel}
                                placeholder="Select Bloom's Level"
                                displayKey="level_name"
                                loading={loading.levels}
                                required={false}
                            />

                            <div>
                                <label className="text-sm font-semibold text-gray-700 block mb-1">Question Type <span className="text-red-500">*</span></label>
                                <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedQuestionType === 'Objective' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                        onClick={() => setSelectedQuestionType('Objective')}
                                    >
                                        Objective
                                    </button>
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedQuestionType === 'Subjective' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                        onClick={() => { setSelectedQuestionType('Subjective'); setSelectedSubjectiveType('SHORT_ANSWER'); }}
                                    >
                                        Subjective
                                    </button>
                                </div>
                            </div>

                            {/* Subjective Sub-Type — shown only when Subjective is selected */}
                            {selectedQuestionType === 'Subjective' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Question Sub-Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedSubjectiveType}
                                        onChange={(e) => setSelectedSubjectiveType(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {subjectiveTypeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                        </div>

                        <div className="mt-6 flex flex-col items-end gap-2">
                            {(!selectedProgram || !selectedBatch || !selectedAcademicYear || !selectedSemester || !selectedSubject || !selectedModule || !selectedUnit || !selectedLevel) && (
                                <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">
                                    * Please select all mandatory fields above to enable template download
                                </p>
                            )}
                            <button
                                onClick={handleDownloadTemplate}
                                disabled={!selectedProgram || !selectedBatch || !selectedAcademicYear || !selectedSemester || !selectedSubject || !selectedModule || !selectedUnit || !selectedLevel}
                                className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 text-blue-600 font-medium rounded-lg shadow-sm transition-colors
                                ${(!selectedProgram || !selectedBatch || !selectedAcademicYear || !selectedSemester || !selectedSubject || !selectedModule || !selectedUnit || !selectedLevel)
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                                        : 'hover:bg-blue-50'
                                    }
                            `}
                                title={(!selectedProgram || !selectedBatch || !selectedAcademicYear || !selectedSemester || !selectedSubject || !selectedModule || !selectedUnit || !selectedLevel) ? "Please select mandatory filters first" : "Download Template"}
                            >
                                <FileDown className="w-4 h-4" />
                                Download {selectedQuestionType} Template
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">2</span>
                            Upload & Verify
                        </h3>

                        {!selectedFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer bg-white group relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="font-medium text-gray-700">Click to upload your filled sheet</p>
                                <p className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                            <FileDown className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB • {parsedData.length} records found</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setSelectedFile(null); setParsedData([]); }} className="text-gray-400 hover:text-red-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Preview Stats / Errors */}
                                {error && (
                                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        {error}
                                    </div>
                                )}

                                {parsedData.length > 0 && !error && (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                                <tr>
                                                    <th className="px-4 py-2">#</th>
                                                    <th className="px-4 py-2">Question</th>
                                                    <th className="px-4 py-2">Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {parsedData.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                                                        <td className="px-4 py-2 text-gray-800 font-medium truncate max-w-xs">{row.QUESTION}</td>
                                                        <td className="px-4 py-2 text-gray-600">{row["DEFAULT MARKS"] || row["DEFAULT_MARKS"] || 1}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {parsedData.length > 10 && (
                                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100 text-center">
                                                And {parsedData.length - 10} more questions...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || parsedData.length === 0 || uploading}
                        className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2
                    ${(!selectedFile || parsedData.length === 0 || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                    >
                        {uploading ? (
                            <>Processing...</>
                        ) : (
                            <>Upload {parsedData.length} Questions</>
                        )}
                    </button>
                </div>
            </div>

            {alert}
        </div>
    );
}
