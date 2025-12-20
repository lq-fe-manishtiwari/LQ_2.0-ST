import { authHeader, handleResponse, authHeaderToPost, ContentAPI } from '@/_services/api';

export const contentQuizService = {
    createQuizQuestion,
    getAllQuizzes,
    getAllQuizzesPaginated,
    getQuizById,
    getQuizzesByUnitIdForTeacher,
    getQuizzesByUnitIdForTeacherPaginated,
    getQuizzesByModuleAndUnitsForTeacher,
    getQuizzesByModuleAndUnitsForTeacherPaginated,
    updateQuiz,
    softDeleteQuiz,
    updateQuizByQuizId,
};

// POST /api/quizzes
function createQuizQuestion(quizData) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(quizData)
    };
    return fetch(`${ContentAPI}/quizzes`, requestOptions).then(handleResponse);
}

// GET /api/quizzes (always paginated)
function getAllQuizzes(page = 0, size = 10, sort = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sort) params.append('sort', sort);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes?${params.toString()}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // Return the full PagedResponse
            return data;
        });
}

// Alias for clarity
function getAllQuizzesPaginated(page = 0, size = 10, sort = 'DESC') {
    return getAllQuizzes(page, size, sort);
}

// GET /api/quizzes/{id}
function getQuizById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes/${id}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET /api/quizzes/teacher/unit/{unitId} (always paginated)
function getQuizzesByUnitIdForTeacher(unitId, page = 0, size = 10, sort = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (sort) params.append('sort', sort);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes/teacher/unit/${unitId}?${params.toString()}`, requestOptions)
        .then(handleResponse);
}

// Alias for clarity
function getQuizzesByUnitIdForTeacherPaginated(unitId, page = 0, size = 10, sort = 'DESC') {
    return getQuizzesByUnitIdForTeacher(unitId, page, size, sort);
}

// GET /api/quizzes/teacher/module/{moduleId}/units (always paginated)
function getQuizzesByModuleAndUnitsForTeacher(moduleId, unitIds = [], page = 0, size = 10, sort = 'DESC') {
    const params = new URLSearchParams();

    // Add unitIds as multiple parameters
    unitIds.forEach(id => params.append('unitIds', id));

    params.append('page', page);
    params.append('size', size);
    if (sort) params.append('sort', sort);

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes/teacher/module/${moduleId}/units?${params.toString()}`, requestOptions)
        .then(handleResponse);
}

// Alias for clarity
function getQuizzesByModuleAndUnitsForTeacherPaginated(moduleId, unitIds = [], page = 0, size = 10, sort = 'DESC') {
    return getQuizzesByModuleAndUnitsForTeacher(moduleId, unitIds, page, size, sort);
}

// PUT /api/quizzes/{id}
function updateQuiz(id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/quizzes/${id}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// DELETE /api/quizzes/{id}
function softDeleteQuiz(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes/${id}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Delete failed with status ${response.status}`);
            }
            return true; // ✅ success
        });
}

// PUT /api/quizzes/{quizId}
function updateQuizByQuizId(quizId, quizData) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(quizData)
    };

    return fetch(`${ContentAPI}/quizzes/${quizId}`, requestOptions)
        .then(handleResponse);
}
