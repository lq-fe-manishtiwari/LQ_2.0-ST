import { authHeader, handleResponse, authHeaderToPost, AcademicAPI, ContentAPI, TeacherLoginAPI } from '../../../../../_services/api';

export const contentService = {
    createContentLevel,
    getAllContentLevels,
    getContentLevelById,
    updateContentLevel,
    deleteContentLevel,
    //Content Types
    getAllContentTypes,
    getModulesbySubject,
    getSubjectbyProgramId,
    createQuestion,
    getAllQuestions,
    getAllQuestionsPaginated,
    getQuestionById,
    getQuestionsByUnitId,
    getQuestionsByUnitIdPaginated,
    getQuestionsByModuleAndUnits,
    getQuestionsByModuleAndUnitsPaginated,
    updateQuestion,
    deleteQuestion,
    hardDeleteQuestion,
    bulkUploadQuestions,
    softDeleteContent,
    hardDeleteContent,

    getSubjectTypesByAcademicYearIdAndSemId,
    getSubjectsByTab,

    getModulesAndUnits,
    getAllQuestionLevel,
    getContentByUnits,
    getTeacherSubjectsAllocated,

    getAllContentsByUnitIdForTeacher,
    getAllContentsByModuleAndUnitsForTeacher,
    getStudentProjectsByUnit,
    getStudentProjectsByModuleAndUnits,
    approveStudentProject,
    rejectStudentProject,
    getApprovedModuleLevelContent,
    updateContent,
    uploadFileToS3,
};



function getAllQuestionLevel() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/question-levels`, requestOptions).then(handleResponse);
}

// POST /api/questions
function createQuestion(request) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(request)
    };
    return fetch(`${ContentAPI}/questions`, requestOptions).then(handleResponse);
}

// GET /api/questions (always paginated)
function getAllQuestions(page = 0, size = 10, sortDirection = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sortDirection) params.append('sortDirection', sortDirection);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/questions?${params.toString()}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // Return the full PagedResponse
            return data;
        });
}

// Alias for clarity
function getAllQuestionsPaginated(page = 0, size = 10, sortDirection = 'DESC') {
    return getAllQuestions(page, size, sortDirection);
}

// GET /api/questions/{questionId}
function getQuestionById(questionId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/questions/${questionId}`, requestOptions).then(handleResponse);
}

// GET /api/questions/teacher/unit/{unitId} (always paginated)
function getQuestionsByUnitId(unitId, page = 0, size = 10, sortDirection = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sortDirection) params.append('sortDirection', sortDirection);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/questions/teacher/unit/${unitId}?${params.toString()}`, requestOptions)
        .then(handleResponse);
}

// Alias for clarity
function getQuestionsByUnitIdPaginated(unitId, page = 0, size = 10, sortDirection = 'DESC') {
    return getQuestionsByUnitId(unitId, page, size, sortDirection);
}

// GET /api/questions/teacher/module/{moduleId}/units (always paginated)
function getQuestionsByModuleAndUnits(moduleId, unitIds = [], page = 0, size = 10, sortDirection = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sortDirection) params.append('sortDirection', sortDirection);

    let url = `${ContentAPI}/questions/teacher/module/${moduleId}/units?${params.toString()}`;
    if (unitIds.length > 0) {
        url += `&unitIds=${unitIds.join(',')}`;
    }

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(url, requestOptions).then(handleResponse);
}

// Alias for clarity
function getQuestionsByModuleAndUnitsPaginated(moduleId, unitIds = [], page = 0, size = 10, sortDirection = 'DESC') {
    return getQuestionsByModuleAndUnits(moduleId, unitIds, page, size, sortDirection);
}

// PUT /api/questions/{questionId}
function updateQuestion(questionId, request) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(request)
    };
    return fetch(`${ContentAPI}/questions/${questionId}`, requestOptions).then(handleResponse);
}

// DELETE /api/questions/{questionId}
function deleteQuestion(questionId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/questions/${questionId}`, requestOptions).then(handleResponse);
}

// DELETE /api/questions/{questionId}/force
function hardDeleteQuestion(questionId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/questions/${questionId}/force`, requestOptions).then(handleResponse);
}

// POST /api/questions/bulk
function bulkUploadQuestions(request) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(request)
    };
    return fetch(`${ContentAPI}/questions/bulk`, requestOptions).then(handleResponse);
}

// POST  /api/content-level
function createContentLevel(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/content-level`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET  /api/content-level
function getAllContentLevels() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/content-level`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET  /api/content-level/{id}
function getContentLevelById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/content-level/${id}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// PUT  /api/content-level/{id}
function updateContentLevel(id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/content-level/${id}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// DELETE /api/content-level/{id}
function deleteContentLevel(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/content-level/${id}`, requestOptions)
        .then(handleResponse);
}

// GET /api/admin/content-types
function getAllContentTypes() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/content-types`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getModulesbySubject(subjectId) {
    // /admin/academic/api/subjects/141/modules-units
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${AcademicAPI}/api/subjects/${subjectId}/modules-units/can-view?role=teacher`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getSubjectbyProgramId(programId) {
    // /api/admin/academic/subjects/by-program/46
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${AcademicAPI}/subjects/by-program/${programId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getModulesAndUnits(subjectId) {
    // GET - /admin/academic/api/subjects/{subjectId}/modules-units

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${AcademicAPI}/api/subjects/${subjectId}/modules-units/can-view?role=teacher`,
        requestOptions
    ).then(handleResponse);
}

async function getSubjectsByTab(tabId, academicYearId, semesterId, tabType) {
    try {
        const response = await fetch(
            `${AcademicAPI}/api/subjects/by-tab/${tabId}/academic-year/${academicYearId}/semester/${semesterId}?tabType=${tabType}`,
            {
                method: "GET",
                headers: authHeader()
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching subjects:", error);
        throw error;
    }
}

function getSubjectTypesByAcademicYearIdAndSemId(academicYearId, semesterId) {
    // GET - /admin/academic/api/teacher/subjects/types-ui/academic-year/{academicYearId}/semester/{semesterId}
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${AcademicAPI}/api/teacher/subjects/types-ui/academic-year/${academicYearId}/semester/${semesterId}`,
        requestOptions
    )
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return { success: true, data: data };
        })
        .catch(error => {
            console.error('Error fetching subject types:', error);
            throw error;
        });
}

function getContentByUnits(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${ContentAPI}/admin/content/unit/${unitId}`,
        requestOptions
    )
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return { success: true, data: data };
        })
        .catch(error => {
            console.error('Error fetching unit content:', error);
            throw error;
        });
}

function getAllContentsByUnitIdForTeacher(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${ContentAPI}/admin/content/teacher/unit/${unitId}`,
        requestOptions
    )
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return { success: true, data: data };
        })
        .catch(error => {
            console.error('Error fetching unit content for teacher:', error);
            throw error;
        });
}

function getAllContentsByModuleAndUnitsForTeacher(moduleId, unitIds = []) {
    let url = `${ContentAPI}/admin/content/teacher/module/${moduleId}/units`;
    if (unitIds.length > 0) {
        url += `?unitIds=${unitIds.join(',')}`;
    }

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            return { success: true, data: data };
        })
        .catch(error => {
            console.error('Error fetching module contents for teacher:', error);
            throw error;
        });
}

// GET /api/teacher/{teacherId}/subjects-allocated
function getTeacherSubjectsAllocated(teacherId, academicYearId, semesterId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const url = `${TeacherLoginAPI}/teacher/${teacherId}/subjects-allocated?academicYearId=${academicYearId}&semesterId=${semesterId}`;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// DELETE /api/content/{contentId} - Soft delete content
function softDeleteContent(contentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/admin/content/${contentId}`, requestOptions).then(handleResponse);
}

// DELETE /api/content/{contentId}/force - Hard delete content
function hardDeleteContent(contentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/admin/content/${contentId}/force`, requestOptions).then(handleResponse);
}
// Student Project Review APIs for Teachers

// GET /api/student-project/unit/{unitId}?status=PENDING
function getStudentProjectsByUnit(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/student-project/unit/${unitId}?status=PENDING`, requestOptions).then(handleResponse);
}

function getStudentProjectsByModuleAndUnits(moduleId, unitIds = [], status = null) {
    let url = `${ContentAPI}/student-project/module/${moduleId}/units`;
    const queryParts = [];
    if (unitIds.length > 0) {
        queryParts.push(`unitIds=${unitIds.join(',')}`);
    }
    if (status) {
        queryParts.push(`status=${status}`);
    }

    if (queryParts.length > 0) {
        url += `?${queryParts.join('&')}`;
    }

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(url, requestOptions).then(handleResponse);
}

// PUT /api/student-project/{projectId}/approve
function approveStudentProject(projectId) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost()
    };
    return fetch(`${ContentAPI}/student-project/${projectId}/approve`, requestOptions).then(handleResponse);
}

// PUT /api/student-project/{projectId}/reject
function rejectStudentProject(projectId, remark) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost()
    };
    const url = remark
        ? `${ContentAPI}/student-project/${projectId}/reject?remark=${encodeURIComponent(remark)}`
        : `${ContentAPI}/student-project/${projectId}/reject`;

    return fetch(url, requestOptions).then(handleResponse);
}

function getApprovedModuleLevelContent(moduleId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${ContentAPI}/admin/content/module/${moduleId}`,
        requestOptions
    )
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return { success: true, data: data };
        })
        .catch(error => {
            console.error('Error fetching module content:', error);
            throw error;
        });
}

// PUT /api/admin/content/{contentId}
function updateContent(contentId, request) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(request)
    };
    return fetch(`${ContentAPI}/admin/content/${contentId}`, requestOptions).then(handleResponse);
}

// Upload file to S3
function uploadFileToS3(file) {
    console.log("uploadFileToS3 called with file:", file);
    const formData = new FormData();
    formData.append('file', file);
    const authHeaders = authHeader();
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': authHeaders.Authorization
        },
        body: formData
    };

    const url = `${AcademicAPI}/s3/upload`;

    return fetch(url, requestOptions)
        .then(response => {
            console.log("S3 upload response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // S3 upload returns plain text URL, not JSON
            return response.text();
        })
        .then(data => {
            console.log("S3 upload data:", data);
            return data;
        })
        .catch(error => {
            console.error("S3 upload error:", error);
            throw error;
        });
}

