import { authHeader, handleResponse, authHeaderToPost, AcademicAPI, ContentAPI } from '@/_services/api';

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

    getSubjectTypesByAcademicYearIdAndSemId,
    getSubjectsByTab,
    getSubjectsByAcademicYearAndSemester,

    getModulesAndUnits,
    getAllQuestionLevel,
    getContentByUnits,
    getBatchCounts,
    updateModuleAccess,
    getApprovedModuleLevelContent,
    updateContent,
    softDeleteContent,
    uploadFileToS3,
    getAssessmentQuestionsByFilter,
};


function getAssessmentQuestionsByFilter(filters) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/assessment-question/filter?${params.toString()}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}


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

// GET /api/questions
// function getAllQuestions() {
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

// Alias for clarity - same as getAllQuestions but explicit about pagination
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

// GET /api/questions/unit/{unitId} (always paginated)
function getQuestionsByUnitId(unitId, page = 0, size = 10, sortDirection = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sortDirection) params.append('sortDirection', sortDirection);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/questions/unit/${unitId}?${params.toString()}`, requestOptions)
        .then(handleResponse);
}

// Alias for clarity
function getQuestionsByUnitIdPaginated(unitId, page = 0, size = 10, sortDirection = 'DESC') {
    return getQuestionsByUnitId(unitId, page, size, sortDirection);
}

// GET /api/questions/module/{moduleId}/units (always paginated)
function getQuestionsByModuleAndUnits(moduleId, unitIds = [], page = 0, size = 10, sortDirection = 'DESC') {
    const params = new URLSearchParams();

    // Add unitIds as multiple parameters
    unitIds.forEach(id => params.append('unitIds', id));

    params.append('page', page);
    params.append('size', size);
    if (sortDirection) params.append('sortDirection', sortDirection);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/questions/module/${moduleId}/units?${params.toString()}`, requestOptions)
        .then(handleResponse);
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
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || `HTTP error! status: ${response.status}`);
                });
            }
            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }
            // Return text for non-JSON responses
            return response.text();
        });
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

    return fetch(`${AcademicAPI}/api/subjects/${subjectId}/modules-units`, requestOptions)
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
        `${AcademicAPI}/api/subjects/${subjectId}/modules-units`,
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

function getSubjectsByAcademicYearAndSemester(academicYearId, semesterId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const url = `${AcademicAPI}/subject-allocation/subjects-by-academic-year-semester?academicYearId=${academicYearId}&semesterId=${semesterId}`;

    return fetch(
        url,
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
            console.error('Error fetching subjects by academic year and semester:', error);
            throw error;
        });
}

function getBatchCounts(programIds) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${ContentAPI}/approval/dashboard/counts/batch?programIds=${programIds}`,
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
            console.error('Error fetching batch counts:', error);
            throw error;
        });
}

function updateModuleAccess(moduleIds, status, accessType = 'student') {
    // Determine the endpoint based on access type
    const endpoint = accessType === 'teacher'
        ? `${AcademicAPI}/module-unit/modules/can-view-teacher`
        : `${AcademicAPI}/module-unit/modules/can-view`;

    // Prepare payload according to ModuleCanViewRequest
    const payload = {
        module_ids: moduleIds,
        status: status
    };

    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(endpoint, requestOptions)
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
            console.error('Error updating module access:', error);
            throw error;
        });
}

// // POST /api/admin/subjects/create
// function saveCourse(values) {
// 	const requestOptions = {
// 		method: 'POST',
// 		headers: authHeaderToPost(),
// 		body: JSON.stringify(values)
// 	};
// 	return fetch(`${AcademicAPI}/subjects/create`, requestOptions)
// 	.then(handleResponse)
// 	.then(role => {
// 		return role;
// 	});
// }

// function deleteCourse(subjectId) {
// 	//  /api/admin/subjects/soft/{subjectId} 
// 	const requestOptions = { method: 'DELETE', headers: authHeader() };
// 	return fetch(`${AcademicAPI}/subjects/soft/${subjectId}`, requestOptions)
// 		.then(handleResponse);
// }

// function updateCourse(subjectId,values) {
//  //   PUT /api/admin/subjects/edit/{id} 
//     const requestOptions = {
//         method: 'PUT',
//         headers: authHeaderToPost(),
//         body: JSON.stringify(values)
//     };
//     return fetch(`${AcademicAPI}/subjects/edit/${subjectId}`, requestOptions)
//         .then(handleResponse)
//         .then(data => {
//             return data;
//         });
// }
// GET /api/admin/content/module/{moduleId}
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

// DELETE /api/admin/content/{contentId}
function softDeleteContent(contentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
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
