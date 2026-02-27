import { authHeaderToPost, ContentAPI, handleResponse } from '@/_services/api';

export const ReportsService = {
    getAssessmentReport,
    getRubricReport,
    getQuestionReport,
};

/**
 * Fetch Assessment Report
 * POST /api/admin/assessment/report
 */
function getAssessmentReport(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/assessment/report`, requestOptions)
        .then(handleResponse);
}

/**
 * Fetch Rubric Report
 * POST /api/admin/rubric/report
 */
function getRubricReport(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/rubric/report`, requestOptions)
        .then(handleResponse);
}

/**
 * Fetch Assessment Question Report
 * POST /api/admin/assessment-question/report
 */
function getQuestionReport(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };

    return fetch(`${ContentAPI}/admin/assessment-question/report`, requestOptions)
        .then(handleResponse);
}
