import { authHeaderToPost, handleResponse, ContentAPI } from '../../../../../_services/api';

export const assessmentService = {
    getStudentAssessments
};

async function getStudentAssessments(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };

    return fetch(`${ContentAPI}/admin/assessment/students/assessments`, requestOptions)
        .then(handleResponse);
}
