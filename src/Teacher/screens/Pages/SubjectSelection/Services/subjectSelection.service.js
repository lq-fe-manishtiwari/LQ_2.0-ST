import { authHeader, handleResponse, AcademicAPI } from "@/_services/api";
// import { batchService } from "../../Academics/Services/batch.Service";

/**
 * Subject Selection Service
 * Handles all API calls related to subject selection management
 * Uses real Academic API endpoints with cascading filters
 */
class SubjectSelectionService {
    /**
     * Get all subject selections with optional filters
     */
    async getAllSubjectSelections(filters = {}) {
        try {
            // Subject selections are now managed through configurations
            // Return empty array as we're using config-based approach
            return [];
        } catch (error) {
            console.error("Error fetching subject selections:", error);
            throw error;
        }
    }

    /**
     * Create a new subject selection
     */
    async createSubjectSelection(data) {
        try {
            // TODO: Replace with actual API endpoint when available
            console.log("Creating subject selection with payload:", data);
            return {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error creating subject selection:", error);
            throw error;
        }
    }

    /**
     * Update an existing subject selection
     */
    async updateSubjectSelection(id, data) {
        try {
            // TODO: Replace with actual API endpoint
            console.log("Updating subject selection:", id, data);
            return { id, ...data };
        } catch (error) {
            console.error("Error updating subject selection:", error);
            throw error;
        }
    }

    /**
     * Delete a subject selection
     */
    async deleteSubjectSelection(id) {
        try {
            // TODO: Replace with actual API endpoint
            console.log("Deleting subject selection:", id);
            return { success: true };
        } catch (error) {
            console.error("Error deleting subject selection:", error);
            throw error;
        }
    }

    /**
     * Get programs from localStorage (college_programs)
     * This is set when user selects/activates a college
     */
    getPrograms() {
        try {
            const storedPrograms = localStorage.getItem("college_programs");
            if (storedPrograms) {
                const parsedPrograms = JSON.parse(storedPrograms);
                return Promise.resolve(Array.isArray(parsedPrograms) ? parsedPrograms : []);
            }
            return Promise.resolve([]);
        } catch (error) {
            console.error("Error fetching programs from localStorage:", error);
            return Promise.resolve([]);
        }
    }

    /**
     * Get batches by program ID using Academic batch service
     * @param {string} programId - Program ID
     */
    async getBatchesByProgramId(programId) {
        // /: /api/batches/{id}
        const requestOptions = { method: 'GET', headers: authHeader() };
        return fetch(`${AcademicAPI}/batches/${programId}`, requestOptions)
            .then(handleResponse);
    }

    /**
     * Extract academic years and semesters from batch data
     * Batch response contains academic_years array with semester_divisions
     * @param {Array} batches - Array of batch objects
     */
    extractAcademicYearsAndSemesters(batches) {
        const academicYears = [];
        const semesters = [];
        const academicYearsSet = new Set();
        const semestersSet = new Set();

        batches.forEach(batch => {
            if (batch.academic_years && Array.isArray(batch.academic_years)) {
                batch.academic_years.forEach(ay => {
                    // Extract academic year - use batch_id + academic_year_id for uniqueness
                    const ayKey = `${batch.batch_id}_${ay.academic_year_id}`;
                    if (!academicYearsSet.has(ayKey)) {
                        academicYearsSet.add(ayKey);
                        academicYears.push({
                            id: ay.academic_year_id,
                            name: ay.name || `Year ${ay.year_number}`,
                            year_number: ay.year_number,
                            batch_id: batch.batch_id,
                        });
                    }

                    // Extract semesters from semester_divisions
                    if (ay.semester_divisions && Array.isArray(ay.semester_divisions)) {
                        ay.semester_divisions.forEach(semDiv => {
                            // Use batch_id + semester_id for uniqueness
                            const semKey = `${batch.batch_id}_${semDiv.semester_id}`;
                            if (!semestersSet.has(semKey)) {
                                semestersSet.add(semKey);
                                semesters.push({
                                    id: semDiv.semester_id,
                                    name: semDiv.name || `Semester ${semDiv.semester_number}`,
                                    semester_number: semDiv.semester_number,
                                    academic_year_id: ay.academic_year_id,
                                    batch_id: batch.batch_id,
                                    program_id: batch.program?.program_id,
                                });
                            }
                        });
                    }
                });
            }
        });

        return { academicYears, semesters };
    }

    /**
     * Get subject selection configurations
     * @param {string} academicYearId - Academic Year ID
     * @param {string} semesterId - Semester ID
     * @param {string} subjectTypeId - Optional Subject Type ID (query param)
     * @param {string} verticalTypeId - Optional Vertical Type ID (query param)
     */
    async getSubjectSelectionConfigs(academicYearId, semesterId, subjectTypeId = null, verticalTypeId = null) {
        try {
            if (!academicYearId || !semesterId) {
                console.warn("Academic Year and Semester required for fetching configs");
                return [];
            }

            const params = new URLSearchParams();
            if (subjectTypeId) {
                params.append("typeId", subjectTypeId);
            }
            if (verticalTypeId) {
                params.append("verticalTypeId", verticalTypeId);
            }

            const requestOptions = { method: "GET", headers: authHeader() };
            const url = `${AcademicAPI}/subject-selection-configs/academic-year/${academicYearId}/semester/${semesterId}${params.toString() ? `?${params.toString()}` : ''}`;

            console.log("Fetching configs from:", url);
            const response = await fetch(url, requestOptions);
            const data = await handleResponse(response);

            console.log("Fetched subject selection configs:", data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error fetching subject selection configs:", error);
            return [];
        }
    }

    /**
     * Get subject types by academic year and semester
     * @param {string} academicYearId - Academic Year ID
     * @param {string} semesterId - Semester ID
     */
    async getSubjectTypes(academicYearId, semesterId) {
        try {
            if (!academicYearId || !semesterId) {
                console.warn("Academic Year ID and Semester ID required for fetching subject types");
                return [];
            }

            const requestOptions = { method: "GET", headers: authHeader() };
            const response = await fetch(
                `${AcademicAPI}/api/student/subjects/types-ui/academic-year/${academicYearId}/semester/${semesterId}`,
                requestOptions
            );
            console.log("response", response);
            const data = await handleResponse(response);
            console.log("data", data);

            // Extract type_buttons array from response
            if (data && data.type_buttons && Array.isArray(data.type_buttons)) {
                // Map to expected format: {id, name, sub_tabs}
                const subjectTypes = data.type_buttons.map(type => ({
                    id: type.type_id,
                    name: type.type_name,
                    code: type.type_code,
                    description: type.type_description,
                    subject_count: type.subject_count,
                    sub_tabs: type.sub_tabs || { specializations: [], verticals: [] },
                }));
                console.log("Mapped subject types:", subjectTypes);
                return subjectTypes;
            }

            return [];
        } catch (error) {
            console.error("Error fetching subject types:", error);
            // Fallback to empty array on error
            return [];
        }
    }

    /**
     * Create subject selection configuration
     * @param {Object} configData - Configuration data
     */
    async createSubjectSelectionConfig(configData) {
        try {
            const requestOptions = {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({
                    academic_year_id: parseInt(configData.academicYearId),
                    semester_id: parseInt(configData.semesterId),
                    subject_type_id: parseInt(configData.subjectTypeId),
                    maximum_selections: configData.maxSelections ? parseInt(configData.maxSelections) : null,
                    minimum_selections: configData.minSelections ? parseInt(configData.minSelections) : null,
                    start_time: configData.startTime || null,
                    end_time: configData.endTime || null,
                    limit_per_subject_selections: configData.studentLimitPerSubject ? parseInt(configData.studentLimitPerSubject) : null,
                    subject_set_request: configData.subjectSetRequest || [],
                    vertical_type_id: configData.verticalId ? parseInt(configData.verticalId) : null,
                }),
            };

            const response = await fetch(
                `${AcademicAPI}/subject-selection-configs`,
                requestOptions
            );
            return handleResponse(response);
        } catch (error) {
            console.error("Error creating subject selection config:", error);
            throw error;
        }
    }

    /**
     * Update subject selection configuration
     * @param {number} configId - Configuration ID
     * @param {Object} configData - Updated configuration data
     */
    async updateSubjectSelectionConfig(configId, configData) {
        try {
            const requestOptions = {
                method: "PUT",
                headers: authHeader(),
                body: JSON.stringify(configData),
            };

            const response = await fetch(
                `${AcademicAPI}/subject-selection-configs/edit/${configId}`,
                requestOptions
            );
            return handleResponse(response);
        } catch (error) {
            console.error("Error updating subject selection config:", error);
            throw error;
        }
    }

    /**
     * Get subjects by tab (subject type) for configuration
     * @param {string|number} tabId - Subject Type ID
     * @param {string|number} academicYearId - Academic Year ID
     * @param {string|number} semesterId - Semester ID
     * @param {string} tabType - Subject Type Name (optional)
     */
    async getSubjectsByTab(tabId, academicYearId, semesterId, tabType = null) {
        try {
            if (!tabId || !academicYearId || !semesterId) {
                console.warn("Tab ID, Academic Year ID, and Semester ID are required");
                return [];
            }

            const params = new URLSearchParams();
            if (tabType) {
                params.append("tabType", tabType);
            }

            const requestOptions = { method: "GET", headers: authHeader() };
            const url = `${AcademicAPI}/api/subjects/by-tab/${tabId}/academic-year/${academicYearId}/semester/${semesterId}${params.toString() ? `?${params.toString()}` : ''}`;

            console.log("Fetching subjects from:", url);
            const response = await fetch(url, requestOptions);
            const data = await handleResponse(response);

            console.log("Fetched subjects by tab:", data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error fetching subjects by tab:", error);
            return [];
        }
    }

    /**
     * Get all students selection status for a configuration
     * @param {number} configId - Configuration ID
     */
    async getAllStudentsSelectionStatus(configId) {
        try {
            if (!configId) {
                console.warn("Config ID is required for fetching students selection status");
                return [];
            }

            const requestOptions = { method: "GET", headers: authHeader() };
            const response = await fetch(
                `${AcademicAPI}/student/subject-selection/status/${configId}`,
                requestOptions
            );
            const data = await handleResponse(response);

            console.log("Fetched students selection status:", data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error fetching students selection status:", error);
            return [];
        }
    }

    /**
     * Save student subject selection (Admin)
     * @param {number} studentId - Student ID
     * @param {Object} selectionData - Selection data with subjectSelectionConfigId and subjectIds
     */
    async saveStudentSubjectSelection(studentId, selectionData) {
        try {
            if (!studentId || !selectionData) {
                throw new Error("Student ID and selection data are required");
            }

            const requestOptions = {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({
                    subject_selection_config_id: selectionData.subjectSelectionConfigId,
                    subject_ids: selectionData.subjectIds
                }),
            };

            const response = await fetch(
                `${AcademicAPI}/student/subject-selection?currentStudentId=${studentId}`,
                requestOptions
            );
            const data = await handleResponse(response);

            console.log("Saved student subject selection:", data);
            return data;
        } catch (error) {
            console.error("Error saving student subject selection:", error);
            throw error;
        }
    }

    /**
     * Update student subject selection (Admin)
     * @param {number} studentId - Student ID
     * @param {Object} selectionData - Selection data with subjectSelectionConfigId and subjectIds
     */
    async updateStudentSubjectSelection(studentId, selectionData) {
        try {
            if (!studentId || !selectionData) {
                throw new Error("Student ID and selection data are required");
            }

            const requestOptions = {
                method: "PUT",
                headers: authHeader(),
                body: JSON.stringify({
                    subject_selection_config_id: selectionData.subjectSelectionConfigId,
                    subject_ids: selectionData.subjectIds
                }),
            };

            const response = await fetch(
                `${AcademicAPI}/student/subject-selection?currentStudentId=${studentId}`,
                requestOptions
            );
            const data = await handleResponse(response);

            console.log("Updated student subject selection:", data);
            return data;
        } catch (error) {
            console.error("Error updating student subject selection:", error);
            throw error;
        }
    }

    /**
     * Bulk save or update student subject selections
     * This API can handle single or multiple student selections
     * @param {Object} bulkRequest - Bulk request data with entries array
     * @param {Array} bulkRequest.entries - Array of student subject selection entries
     * Each entry should have: studentId, subjectSelectionConfigId, subjectIds
     */
    async bulkSaveOrUpdateSubjectSelections(bulkRequest) {
        try {
            if (!bulkRequest || !bulkRequest.entries || !Array.isArray(bulkRequest.entries)) {
                throw new Error("Bulk request with entries array is required");
            }

            if (bulkRequest.entries.length === 0) {
                throw new Error("At least one entry is required");
            }

            // Transform entries to match backend expected format (snake_case)
            const transformedEntries = bulkRequest.entries.map(entry => ({
                student_id: entry.studentId,
                subject_selection_config_id: entry.subjectSelectionConfigId,
                subject_ids: entry.subjectIds || []
            }));

            const requestOptions = {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({
                    entries: transformedEntries
                }),
            };

            console.log("Bulk save/update request payload:", {
                entries: transformedEntries
            });

            const response = await fetch(
                `${AcademicAPI}/student/subject-selection/bulk`,
                requestOptions
            );
            const data = await handleResponse(response);

            console.log("Bulk save/update response:", data);
            return data;
        } catch (error) {
            console.error("Error in bulk save/update subject selections:", error);
            throw error;
        }
    }

}

export const subjectSelectionService = new SubjectSelectionService();
