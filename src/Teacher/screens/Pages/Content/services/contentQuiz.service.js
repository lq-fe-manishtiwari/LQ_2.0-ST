import { authHeader, handleResponse, authHeaderToPost, ContentAPI } from '@/_services/api';

export const contentQuizService = {
    createQuizQuestion,
    getAllQuizzes,
    getQuizById,
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

// GET  /api/quizzes
function getAllQuizzes() {    
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/quizzes`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET  /api/quizzes/{id}
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

// PUT  /api/quizzes/{id}
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
