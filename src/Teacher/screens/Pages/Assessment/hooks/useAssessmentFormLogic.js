import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../../Content/services/content.service';
import { ContentService } from '../../../../../Student/screens/Pages/Content/Service/Content.service';
import { getTeacherAllocatedPrograms } from '../../../../../_services/api';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';

export const useAssessmentFormLogic = (formData) => {
    const [options, setOptions] = useState({
        programs: [],
        academicSemesters: [],
        batches: [],
        allBatches: [],
        subjects: [],
        modules: [],
        units: [],
        divisions: [],
        allDivisions: []
    });

    const [loading, setLoading] = useState({
        programs: false,
        subjects: false,
        divisions: false
    });

    const [allocationData, setAllocationData] = useState(null);
    const { getTeacherId, userID } = useUserProfile();

    // Data loading functions with useCallback
    const loadPrograms = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, programs: true }));
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
        } finally {
            setLoading(prev => ({ ...prev, programs: false }));
        }
    }, [getTeacherId]);

    // Load semesters, batches, and academic years based on selected program
    // mimicking loadProgramRelatedData from useContentData
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
        const allDivisions = [];

        programAllocations.forEach((allocation) => {
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

                // Collect all divisions
                if (allocation.division) {
                    allDivisions.push({
                        label: allocation.division.division_name || allocation.division.name,
                        value: String(allocation.division.division_id || allocation.division.id),
                        full: allocation.division,
                        academicSemesterId: displayId,
                        batchId: String(allocation.batch.batch_id || allocation.batch.id)
                    });
                }
            }
        });

        const academicSemesters = Array.from(academicSemesterMap.values());

        setOptions(prev => ({
            ...prev,
            academicSemesters,
            allBatches, // Store all batches with their academic year-semester links
            allDivisions, // Store all divisions
            batches: [], // Will be populated based on academic year-semester selection
            divisions: [],
            subjects: [] // Reset dependent options
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
            subjects: [] // Reset dependent options
        }));

        // Auto-select batch if only one option
        // Note: returning value so component can update state if it wants to auto-select
        if (batches.length === 1) {
            return batches[0].value;
        }

        return null;
    }, [formData.selectedAcademicSemester, options.allBatches]);

    const loadDivisionsForBatch = useCallback(() => {
        if (!formData.selectedBatch || !options.allDivisions) return;

        const selectedBatchId = String(formData.selectedBatch);
        const selectedAySem = formData.selectedAcademicSemester;

        const relevantDivisions = options.allDivisions.filter(div =>
            div.batchId === selectedBatchId &&
            div.academicSemesterId === selectedAySem
        );

        const divMap = new Map();
        relevantDivisions.forEach(div => {
            if (!divMap.has(div.value)) divMap.set(div.value, div);
        });
        const divisions = Array.from(divMap.values());
        setOptions(prev => ({ ...prev, divisions }));

        if (divisions.length === 1) return divisions[0].value;
        return null;
    }, [formData.selectedBatch, formData.selectedAcademicSemester, options.allDivisions]);


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

            // Use the same API as ObjectiveQuestion.jsx/AddContent.jsx
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
            const res = await ContentService.getModulesAndUnits(formData.selectedSubject);

            const rawModules = Array.isArray(res?.data)
                ? res.data
                : (res?.data?.modules || res?.modules || []);

            const modules = rawModules.map(m => ({
                label: m.module_name || m.name,
                value: String(m.module_id || m.id),
                units: m.units || []
            }));

            setOptions(prev => ({ ...prev, modules, units: [] }));
        } catch (err) {
            console.error("Error loading modules:", err);
        } finally {
            setLoading(prev => ({ ...prev, modules: false, units: false }));
        }
    }, [formData.selectedSubject]);

    const updateUnitsForModule = useCallback((moduleId) => {
        const selectedModule = options.modules.find(m => m.value === String(moduleId));
        const units = selectedModule?.units?.map(u => ({
            label: u.name || u.unit_name,
            value: String(u.unit_id || u.id),
            full: u
        })) || [];
        setOptions(prev => ({ ...prev, units }));
    }, [options.modules]);


    // Load initial data
    useEffect(() => {
        loadPrograms();
    }, [loadPrograms]);

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
        if (formData.selectedBatch && options.allDivisions) {
            loadDivisionsForBatch();
        }
    }, [formData.selectedBatch, options.allDivisions]);

    useEffect(() => {
        if (formData.selectedSubject) {
            loadModulesAndUnits();
        }
    }, [formData.selectedSubject]);


    return {
        options,
        loading,
        setOptions,
        setOptions,
        loadProgramRelatedData,
        loadBatchesForAcademicSemester,
        loadDivisionsForBatch,
        updateUnitsForModule
    };
};
