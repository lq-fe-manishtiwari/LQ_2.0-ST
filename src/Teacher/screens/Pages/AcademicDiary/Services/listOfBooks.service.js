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