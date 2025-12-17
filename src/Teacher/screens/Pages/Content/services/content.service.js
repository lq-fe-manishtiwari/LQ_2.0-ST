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
    getQuestionById,
    getQuestionsByUnitId,
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

// GET /api/questions
function getAllQuestions() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/questions`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET /api/questions/{questionId}
function getQuestionById(questionId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/questions/${questionId}`, requestOptions).then(handleResponse);
}

// GET /api/questions/unit/{unitId}
function getQuestionsByUnitId(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/questions/teacher/unit/${unitId}`, requestOptions).then(handleResponse);
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

    return fetch(`${AcademicAPI}/admin/academic/api/subjects/${subjectId}/modules-units`, requestOptions)
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
