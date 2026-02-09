// Objective & ParticipationInSeminar Service
import { authHeader, handleResponse, authHeaderToPost, TeacherLoginAPI,TimetableAPI,PMSAPI } from '@/_services/api';

export const settingsService = {
    // --- List of Books ---
    saveObjective,
    getAllObjectivebyCollegeId,
    getObjectiveById,
    updateObjective,
    DeleteObjective,

   
};

/* =========================
   LIST OF BOOKS
========================= */
function saveObjective(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/teaching-plan/objective/create`, requestOptions).then(handleResponse);
}

function getAllObjectivebyCollegeId(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/teaching-plan/objective/get-all/college/${collegeId}`,
        requestOptions
    ).then(handleResponse);
}


function getObjectiveById(Id) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/teaching-plan/objective/get/${Id}`, requestOptions).then(handleResponse);
}

function updateObjective(Id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/teaching-plan/objective/update/${Id}`, requestOptions)
        .then(handleResponse);
}

function DeleteObjective(Id) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/teaching-plan/objective/delete/${Id}`, requestOptions)
        .then(handleResponse);
}
