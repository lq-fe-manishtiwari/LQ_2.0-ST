import { authHeaderToPost, handleResponse, ContentAPI } from '../../../../../_services/api';

export const assessmentService = {
    getStudentAssessments,
    getAssessmentQuestions,
    startAssessmentAttempt,
    recordQuestionResponse,
    recordBatchResponses,
    submitAssessmentAttempt,
    getAssessmentResponses,
};

// Fetch student responses for an assessment
// async function getAssessmentResponses(assessmentId) {
//     const requestOptions = {
//         method: 'GET',
//         headers: authHeaderToPost(),
//     };

//     return fetch(`${ContentAPI}/student/assessment/attempt/${assessmentId}/responses`, requestOptions)
//         .then(handleResponse);
// }
async function getAssessmentResponses(studentId, assessmentId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeaderToPost(),
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/student/${studentId}/assessment/${assessmentId}`, requestOptions)
        .then(handleResponse);
}

async function getStudentAssessments(data, studentId) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };

    return fetch(`${ContentAPI}/admin/assessment/students/assessments?studentId=${studentId}`, requestOptions)
        .then(handleResponse);
}

async function getAssessmentQuestions(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeaderToPost(),
    };

    return fetch(`${ContentAPI}/admin/assessment/questions/${id}`, requestOptions)
        .then(handleResponse);
}

// Start a new assessment attempt
async function startAssessmentAttempt(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/start`, requestOptions)
        .then(handleResponse);
}

// Record a single question response
async function recordQuestionResponse(attemptId, data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/${attemptId}/record-response`, requestOptions)
        .then(handleResponse);
}

// Record batch question responses
async function recordBatchResponses(attemptId, data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/${attemptId}/record-responses`, requestOptions)
        .then(handleResponse);
}

// Submit assessment attempt
async function submitAssessmentAttempt(attemptId) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/${attemptId}/submit`, requestOptions)
        .then(handleResponse);
}

