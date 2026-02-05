// ListOfBooks & ParticipationInSeminar Service
import { authHeader, handleResponse, authHeaderToPost, PMSAPI } from '@/_services/api';

export const listOfBooksService = {
    // --- List of Books ---
    saveListOfBooks,
    getListOfBooksByUserId,
    getListOfBooksById,
    updateListOfBooks,
    softDeleteListOfBooks,
    hardDeleteListOfBooks,

    // --- Participation in Seminar ---
    saveParticipationInSeminar,
    getParticipationInSeminarById,
    getParticipationInSeminarByUserId,
    getParticipationInSeminarByCollegeId,
    updateParticipationInSeminar,
    softDeleteParticipationInSeminar,
    hardDeleteParticipationInSeminar,

     // --- List of Publications ---
    savePublication,
    getPublicationById,
    getPublicationsByUserId,
    getPublicationsByCollegeId,
    updatePublication,
    softDeletePublication,
    hardDeletePublication,

    //-------COUNSELING OF STUDENTS-------
    saveCounseling,
    getCounselingById,
    getCounselingByCollegeId,
    getCounselingByUserId,
    updateCounseling,
    softDeleteCounseling,
    hardDeleteCounseling,

    //-------SOCIETAL CONTRIBUTION-------
    saveSocietalContribution,
    getSocietalContributionById,
    getSocietalContributionByUserId,
    getSocietalContributionByCollegeId,
    updateSocietalContribution,
    deleteSocietalContribution,
};

/* =========================
   LIST OF BOOKS
========================= */
function saveListOfBooks(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/list-of-books`, requestOptions).then(handleResponse);
}


function getListOfBooksByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/list-of-books/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function getListOfBooksById(booksReferredId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/list-of-books/${booksReferredId}`, requestOptions).then(handleResponse);
}

function updateListOfBooks(booksReferredId, userId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/list-of-books/${booksReferredId}/user/${userId}`, requestOptions)
        .then(handleResponse);
}

function softDeleteListOfBooks(booksReferredId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/list-of-books/soft/${booksReferredId}`, requestOptions)
        .then(handleResponse);
}

function hardDeleteListOfBooks(booksReferredId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/list-of-books/hard/${booksReferredId}`, requestOptions)
        .then(handleResponse);
}

/* =========================
   PARTICIPATION IN SEMINAR
========================= */
function saveParticipationInSeminar(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar`, requestOptions)
        .then(handleResponse);
}


function getParticipationInSeminarById(participationId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/${participationId}`, requestOptions)
        .then(handleResponse);
}

function getParticipationInSeminarByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function getParticipationInSeminarByCollegeId(collegeId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/college/${collegeId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function updateParticipationInSeminar(participationId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/${participationId}`, requestOptions)
        .then(handleResponse);
}

function softDeleteParticipationInSeminar(participationId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/soft/${participationId}`, requestOptions)
        .then(handleResponse);
}

function hardDeleteParticipationInSeminar(participationId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/participation-in-seminar/hard/${participationId}`, requestOptions)
        .then(handleResponse);
}

function savePublication(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication`, requestOptions).then(handleResponse);
}


function getPublicationById(publicationId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/${publicationId}`, requestOptions)
        .then(handleResponse);
}

function getPublicationsByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function getPublicationsByCollegeId(collegeId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/college/${collegeId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function updatePublication(publicationId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/${publicationId}`, requestOptions)
        .then(handleResponse);
}

function softDeletePublication(publicationId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/soft/${publicationId}`, requestOptions)
        .then(handleResponse);
}

function hardDeletePublication(publicationId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/list-of-publication/hard/${publicationId}`, requestOptions)
        .then(handleResponse);
}

/* =========================
   COUNSELING OF STUDENTS
========================= */
function saveCounseling(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students`, requestOptions).then(handleResponse);
}

function getCounselingById(counselingId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/${counselingId}`, requestOptions)
        .then(handleResponse);
}

function getCounselingByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function getCounselingByCollegeId(collegeId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/college/${collegeId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

function updateCounseling(counselingId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/${counselingId}`, requestOptions)
        .then(handleResponse);
}

function softDeleteCounseling(counselingId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/soft/${counselingId}`, requestOptions)
        .then(handleResponse);
}

function hardDeleteCounseling(counselingId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/counseling-of-students/hard/${counselingId}`, requestOptions)
        .then(handleResponse);
}


// 1. SAVE (POST)
function saveSocietalContribution(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution`,
        requestOptions
    ).then(handleResponse);
}

// 2. GET BY ID
function getSocietalContributionById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution/${id}`,
        requestOptions
    ).then(handleResponse);
}

// 3. GET BY USER ID
function getSocietalContributionByUserId(userId, page = 0, size = 10) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution/user/${userId}?page=${page}&size=${size}`,
        requestOptions
    ).then(handleResponse);
}

// 4. GET BY COLLEGE ID
function getSocietalContributionByCollegeId(collegeId, page = 0, size = 10) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution/college/${collegeId}?page=${page}&size=${size}`,
        requestOptions
    ).then(handleResponse);
}

// 5. UPDATE (PUT)
function updateSocietalContribution(id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution/${id}`,
        requestOptions
    ).then(handleResponse);
}

// 6. DELETE
function deleteSocietalContribution(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
    };
    return fetch(
        `${PMSAPI}/academic-diary/societal-contribution/${id}`,
        requestOptions
    ).then(handleResponse);
}