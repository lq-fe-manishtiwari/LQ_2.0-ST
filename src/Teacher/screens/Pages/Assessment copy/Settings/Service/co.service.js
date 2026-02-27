// Class
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, AcademicAPI, ContentAPI } from '@/_services/api';

export const COService = {
    saveCO,
    getAllCOByCollegeId,
    getAllCOByCourseId,
    getAllCOByCourseOutcomeId,
    getCOBySemCourseId,
    UpdatecourseOutcomeId,
    DeleteCourseOutcomeId,
};

// -------------------- SAVE SINGLE PO --------------------
// const BaseUrl = `${ContentAPI}/api/admin/content`

function saveCO(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/admin/course-outcome`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// -------------------- GET ALL PO --------------------

function getAllCOByCollegeId(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/course-outcome/college/${collegeId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
// -------------------- GET PEO BY ID --------------------
function getAllCOByCourseId(courseId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/course-outcome/subject/${courseId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
function getAllCOByCourseOutcomeId(courseOutcomeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${ContentAPI}/admin/course-outcome/${courseOutcomeId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getCOBySemCourseId(SemId, SubId) {
    // obe/course-outcome/semester/${SemId}/subject/${subjectId}
    return apiNBARequest(`/obe/course-outcome/semester/${SemId}/subject/${SubId}`, {
        method: 'GET',
        headers: authHeader(),
    }).then(handleResponse);
}

function UpdatecourseOutcomeId(courseOutcomeId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${ContentAPI}/admin/course-outcome/${courseOutcomeId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function DeleteCourseOutcomeId(courseOutcomeId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/admin/course-outcome/${courseOutcomeId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}



