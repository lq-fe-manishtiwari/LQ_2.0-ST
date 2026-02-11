// -------------------- AssessmentService.js --------------------
import { authHeader, authHeaderToPost, ContentAPI, AcademicAPI, handleResponse } from '@/_services/api';

// -------------------- DELETE ASSESSMENT --------------------
function deleteAssessment(assessmentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment/${assessmentId}`, requestOptions)
        .then(handleResponse);
}

export const AssessmentService = {
    createAssessment,
    updateAssessment,
    getAssessmentById,
    getAssessmentsByCollege,
    deleteAssessment,
    filterAssessments,
    getDashboardStats,
    evaluateBulk,
    evaluateAttempt,
    getStudentSubmissions,
    getProgramByCollegeId
};

// -------------------- FILTER ASSESSMENTS --------------------
function filterAssessments(filters) {
    const query = new URLSearchParams(filters).toString();
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment/filter?${query}`, requestOptions)
        .then(handleResponse);
}


// -------------------- CREATE ASSESSMENT --------------------
function createAssessment(values) {
    // API Expects snake_case payload
    // values = {
    //   college_id, mode, academic_year_id, batch_id, program_id, semester_id, division_id,
    //   subject_id, subject_name, module_id, module_name, unit_id, unit_name,
    //   title, type, category, status, test_start_datetime, test_end_datetime,
    //   time_limit_minutes, rubric_id, questions: [{ question_id, marks, order }]
    // }

    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };

    return fetch(`${ContentAPI}/admin/assessment`, requestOptions)
        .then(handleResponse);
}

// -------------------- UPDATE ASSESSMENT --------------------
function updateAssessment(assessmentId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };

    return fetch(`${ContentAPI}/admin/assessment/${assessmentId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET ASSESSMENT BY ID --------------------
function getAssessmentById(assessmentId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment/${assessmentId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET ASSESSMENTS BY COLLEGE --------------------
function getAssessmentsByCollege(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment/college/${collegeId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET DASHBOARD STATS --------------------
function getDashboardStats(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/assessment/dashboard`, requestOptions)
        .then(handleResponse);
}

// -------------------- EVALUATION APIs --------------------

// Bulk Evaluation
function evaluateBulk(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/assessment/evaluation/bulk`, requestOptions)
        .then(response => {
            return response.text().then(text => {
                let data;
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (e) {
                    data = text;
                }

                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }

                return data;
            });
        });
}

// Single Attempt Evaluation
function evaluateAttempt(attemptId, payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/assessment/evaluation/attempt/${attemptId}`, requestOptions)
        .then(handleResponse);
}

// Get Student Submissions
function getStudentSubmissions(assessmentId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/student/assessment/attempt/${assessmentId}/responses`, requestOptions)
        .then(handleResponse);
}
function getProgramByCollegeId(collegeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${AcademicAPI}/programs/by-college/${collegeId}`, requestOptions)
        .then(handleResponse);
}
