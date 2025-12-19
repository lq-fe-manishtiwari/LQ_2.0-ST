import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../../services/AddContent.service.js';
import { getTeacherAllocatedPrograms } from '../../../../../../_services/api.js';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext.jsx';
export const useContentData = (formData) => {
    const [options, setOptions] = useState({
        programs: [], academicSemesters: [], batches: [], allBatches: [], subjects: [], modules: [], units: [],
        contentTypes: [], contentLevels: [], quizzes: []
    });

    const [loading, setLoading] = useState({ uploading: false });
    const [allocationData, setAllocationData] = useState(null);
    const { getTeacherId } = useUserProfile();

    // Data loading functions with useCallback (defined first)
    const loadPrograms = useCallback(async () => {
        try {
            // Get teacher ID from current user
            const teacherId = getTeacherId();
            console.log("Loading programs for teacher ID:", teacherId);

            if (!teacherId) {
                console.error("Teacher ID not found");
                return;
            }

            // Call API to get teacher allocated programs
            const response = await getTeacherAllocatedPrograms(teacherId);

            if (response.success && response.data) {
                // Store all allocation data for later use
                setAllocationData(response.data);

                const allAllocations = [
                    ...(response.data.class_teacher_allocation || []),
                    ...(response.data.normal_allocation || [])
                ];

                // Extract unique programs from allocations
                const programMap = new Map();

                allAllocations.forEach(allocation => {
                    if (allocation.program) {
                        const program = allocation.program;
                        if (!programMap.has(program.program_id)) {
                            programMap.set(program.program_id, {
                                label: program.program_name,
                                value: String(program.program_id),
                                full: program,
                                allocations: [] // Will store all allocations for this program
                            });
                        }
                        // Add allocation to program
                        programMap.get(program.program_id).allocations.push(allocation);
                    }
                });

                const programs = Array.from(programMap.values());
                setOptions(prev => ({ ...prev, programs }));
            }
        } catch (err) {
            console.error("Error loading programs:", err);
        }
    }, [getTeacherId]);

    // Load semesters, batches, and academic years based on selected program
    const loadProgramRelatedData = useCallback(() => {
        if (!formData.selectedProgram || !allocationData) return null;

        const selectedProgramId = parseInt(formData.selectedProgram);
        const allAllocations = [
            ...(allocationData.class_teacher_allocation || []),
            ...(allocationData.normal_allocation || [])
        ];

        // Filter allocations for selected program
        const programAllocations = allAllocations.filter(allocation =>
            allocation.program && allocation.program.program_id === selectedProgramId
        );


        // Extract ALL academic year + semester combinations (including duplicates with different batches)
        const academicSemesterMap = new Map();
        const allBatches = [];

        programAllocations.forEach((allocation, index) => {
            // Create unique combinations including batch info
            if (allocation.academic_year && allocation.semester && allocation.batch) {
                const displayId = `${allocation.academic_year_id}-${allocation.semester_id}`;

                if (!academicSemesterMap.has(displayId)) {
                    academicSemesterMap.set(displayId, {
                        label: `${allocation.academic_year.name} - ${allocation.semester.name}`,
                        value: displayId,
                        academicYearId: allocation.academic_year_id,
                        semesterId: allocation.semester_id,
                        full: {
                            academicYear: allocation.academic_year,
                            semester: allocation.semester
                        },
                        allocations: [] // Store all allocations for this academic year-semester
                    });
                }

                // Add this allocation to the academic year-semester group
                academicSemesterMap.get(displayId).allocations.push(allocation);

                // Collect all batches
                allBatches.push({
                    label: allocation.batch.batch_name,
                    value: String(allocation.batch.batch_id),
                    full: allocation.batch,
                    academicSemesterId: displayId // Link batch to academic year-semester
                });
            }
        });

        const academicSemesters = Array.from(academicSemesterMap.values());

        setOptions(prev => ({
            ...prev,
            academicSemesters,
            allBatches, // Store all batches with their academic year-semester links
            batches: [], // Will be populated based on academic year-semester selection
            subjects: [], // Reset dependent options
            modules: [],
            units: []
        }));

        return {
            academicSemesters,
            allBatches
        };
    }, [formData.selectedProgram, allocationData]);

    // Load batches based on selected academic year-semester
    const loadBatchesForAcademicSemester = useCallback(() => {
        if (!formData.selectedAcademicSemester || !options.allBatches) return;

        // Filter batches for the selected academic year-semester
        const relevantBatches = options.allBatches.filter(batch =>
            batch.academicSemesterId === formData.selectedAcademicSemester
        );

        // Remove duplicates
        const batchMap = new Map();
        relevantBatches.forEach(batch => {
            if (!batchMap.has(batch.value)) {
                batchMap.set(batch.value, batch);
            }
        });

        const batches = Array.from(batchMap.values());

        setOptions(prev => ({
            ...prev,
            batches,
            subjects: [], // Reset dependent options
            modules: [],
            units: []
        }));

        // Auto-select batch if only one option
        if (batches.length === 1) {
            return batches[0].value;
        }

        return null;
    }, [formData.selectedAcademicSemester, options.allBatches]);

    const loadContentTypes = useCallback(async () => {
        try {
            const res = await contentService.getContentTypes();
            const contentTypes = Array.isArray(res) ? res.map(ct => ({
                label: ct.content_type_name,
                value: String(ct.content_type_id),
                full: ct
            })) : [
                { label: "File", value: "1", full: { content_type_id: 1, content_type_name: "File" } },
                { label: "External Link", value: "4", full: { content_type_id: 4, content_type_name: "External Link" } }
            ];
            setOptions(prev => ({ ...prev, contentTypes }));
        } catch (err) {
            console.error("Error loading content types:", err);
            // Fallback to default options based on actual API structure
            setOptions(prev => ({
                ...prev, contentTypes: [
                    { label: "File", value: "1", full: { content_type_id: 1, content_type_name: "File" } },
                    { label: "External Link", value: "4", full: { content_type_id: 4, content_type_name: "External Link" } }
                ]
            }));
        }
    }, []);

    const loadContentLevels = useCallback(async () => {
        try {
            const res = await contentService.getContentLevel();
            const contentLevels = Array.isArray(res) ? res.map(level => ({
                label: level.content_level_name || level.name || level.label,
                value: level.content_level_id || level.value || level.level_name?.toLowerCase().replace(/\s+/g, '_')
            })) : [
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" }
            ];
            setOptions(prev => ({ ...prev, contentLevels }));
        } catch (err) {
            console.error("Error loading content levels:", err);
            // Fallback to default options
            setOptions(prev => ({
                ...prev, contentLevels: [
                    { label: "Beginner", value: "beginner" },
                    { label: "Intermediate", value: "intermediate" },
                    { label: "Advanced", value: "advanced" }
                ]
            }));
        }
    }, []);


    const loadSubjects = useCallback(async () => {
        if (!formData.selectedAcademicSemester || !allocationData) return;
        try {
            setLoading(prev => ({ ...prev, subjects: true }));

            // Parse academic year and semester IDs from selectedAcademicSemester
            const [academicYearId, semesterId] = formData.selectedAcademicSemester.split('-').map(id => parseInt(id));

            if (!academicYearId || !semesterId) {
                setOptions(prev => ({ ...prev, subjects: [] }));
                return;
            }

            const teacherId = getTeacherId();
            if (!teacherId) {
                console.warn('No teacher ID found');
                return;
            }

            // Use the same API as ObjectiveQuestion.jsx
            const response = await contentService.getTeacherSubjectsAllocated(teacherId, academicYearId, semesterId);

            if (Array.isArray(response)) {
                const subjects = response.map(subjectInfo => ({
                    label: subjectInfo.subject_name || subjectInfo.name,
                    value: String(subjectInfo.subject_id || subjectInfo.id),
                    full: subjectInfo
                })).filter(s => s.label && s.value);

                const uniqueSubjects = Array.from(new Map(subjects.map(s => [s.label, s])).values());
                setOptions(prev => ({ ...prev, subjects: uniqueSubjects }));
            } else {
                setOptions(prev => ({ ...prev, subjects: [] }));
            }
        } catch (err) {
            console.error("Error loading subjects:", err);
            setOptions(prev => ({ ...prev, subjects: [] }));
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    }, [formData.selectedAcademicSemester, allocationData, getTeacherId]);

    const loadModulesAndUnits = useCallback(async () => {
        if (!formData.selectedSubject) return;
        try {
            setLoading(prev => ({ ...prev, modules: true, units: true }));
            const res = await contentService.getModulesAndUnitsBySubjectId(formData.selectedSubject);

            const modules = res?.modules ? res.modules.map(m => ({
                label: m.name || m.module_name,
                value: String(m.module_id || m.id),
                units: m.units || []
            })) : [];

            setOptions(prev => ({ ...prev, modules, units: [] }));
        } catch (err) {
            console.error("Error loading modules:", err);
        } finally {
            setLoading(prev => ({ ...prev, modules: false, units: false }));
        }
    }, [formData.selectedSubject]);

    const loadQuizzes = useCallback(async () => {
        if (!formData.selectedModule || options.modules.length === 0) {
            setOptions(prev => ({ ...prev, quizzes: [] }));
            return;
        }
        try {
            console.log("Loading quizzes for module:", formData.selectedModule);
            setLoading(prev => ({ ...prev, quizzes: true }));

            const selectedModule = options.modules.find(m => String(m.value) === String(formData.selectedModule));
            let unitIds = [];
            if (formData.selectedUnit) {
                unitIds = [formData.selectedUnit];
            } else if (selectedModule?.units) {
                unitIds = selectedModule.units.map(u => String(u.unit_id || u.id));
            }

            if (unitIds.length === 0) {
                setOptions(prev => ({ ...prev, quizzes: [] }));
                return;
            }

            const res = await contentService.getQuizzesByModuleAndUnits(formData.selectedModule, unitIds, 0, 1000);

            let quizzesArray = [];
            if (res?.content && Array.isArray(res.content)) {
                quizzesArray = res.content;
            } else if (Array.isArray(res?.data)) {
                quizzesArray = res.data;
            } else if (Array.isArray(res)) {
                quizzesArray = res;
            }

            const formattedQuizzes = quizzesArray.map(quiz => ({
                label: quiz.quiz_name || quiz.title || quiz.name,
                value: String(quiz.quiz_id || quiz.id),
                full: quiz
            }));

            setOptions(prev => ({ ...prev, quizzes: formattedQuizzes }));
        } catch (err) {
            console.error("Error loading quizzes:", err);
            setOptions(prev => ({ ...prev, quizzes: [] }));
        } finally {
            setLoading(prev => ({ ...prev, quizzes: false }));
        }
    }, [formData.selectedModule, formData.selectedUnit, options.modules]);

    const updateUnitsForModule = useCallback((moduleId) => {
        const selectedModule = options.modules.find(m => m.value === moduleId);
        const units = selectedModule?.units?.map(u => ({
            label: u.name || u.unit_name,
            value: String(u.unit_id || u.id),
            full: u
        })) || [];
        setOptions(prev => ({ ...prev, units }));
    }, [options.modules]);

    // Load initial data (after functions are defined)
    useEffect(() => {
        loadPrograms();
        loadContentTypes();
        loadContentLevels();
    }, [loadPrograms, loadContentTypes, loadContentLevels]);

    // Load dependent data when selections change
    useEffect(() => {
        if (formData.selectedProgram && allocationData) {
            loadProgramRelatedData();
        }
    }, [formData.selectedProgram, allocationData]);

    useEffect(() => {
        if (formData.selectedAcademicSemester && options.allBatches) {
            loadBatchesForAcademicSemester();
        }
    }, [formData.selectedAcademicSemester]);

    useEffect(() => {
        if (formData.selectedAcademicSemester && allocationData) {
            loadSubjects();
        }
    }, [formData.selectedAcademicSemester, allocationData]);

    useEffect(() => {
        if (formData.selectedSubject) {
            loadModulesAndUnits();
        }
    }, [formData.selectedSubject]);

    useEffect(() => {
        if (formData.selectedModule) {
            loadQuizzes();
        }
    }, [loadQuizzes]);

    return {
        options,
        loading,
        setLoading,
        updateUnitsForModule,
        loadProgramRelatedData,
        loadBatchesForAcademicSemester
    };
};