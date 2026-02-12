// Rubric Service
import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    ContentAPI
} from '@/_services/api';

export const RubricService = {
    saveRubric,
    updateRubric,
    deleteRubric,
    getRubricById,
    getRubricsBySubjectId,
    getRubricsByCollegeId,
    getRubricsByCollegeId,
    getRubricsByCollegeAndType,
    getRubricByAssessmentId
};

// -------------------- GET RUBRIC BY ASSESSMENT ID --------------------
function getRubricByAssessmentId(assessmentId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/rubric/assessment/${assessmentId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- CREATE RUBRIC --------------------
function saveRubric(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/admin/rubric`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- UPDATE RUBRIC --------------------
function updateRubric(rubricId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/admin/rubric/${rubricId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- DELETE RUBRIC (SOFT DELETE) --------------------
function deleteRubric(rubricId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/rubric/${rubricId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- GET RUBRIC BY ID --------------------
function getRubricById(rubricId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/rubric/${rubricId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- GET RUBRICS BY SUBJECT --------------------
function getRubricsBySubjectId(subjectId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/rubric/subject/${subjectId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- GET RUBRICS BY COLLEGE --------------------
function getRubricsByCollegeId(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/rubric/college/${collegeId}`, requestOptions)
        .then(handleResponse)
        .then(data => data);
}

// -------------------- GET RUBRICS BY COLLEGE & TYPE --------------------
function getRubricsByCollegeAndType(collegeId, rubricType) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${ContentAPI}/admin/rubric/college/${collegeId}/type/${rubricType}`,
        requestOptions
    )
        .then(handleResponse)
        .then(data => data);
}
