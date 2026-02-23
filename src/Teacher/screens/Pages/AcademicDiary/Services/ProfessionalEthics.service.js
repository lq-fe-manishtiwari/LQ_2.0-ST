import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, PMSAPI, AcademicAPI } from '@/_services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const ProfessionalEthicsService = {
    PostProfessionalEthics,
    GetAllProfessionalEthics,
    GetProfessionalEthicsById,
    GetProfessionalEthicsByCollegeId,
    UpdateProfessionalEthics,
    SoftDeleteProfessionalEthics,
    HardDeleteProfessionalEthics,
    PostStudentConsent,
    GetStudentConsentByUserId
};

// 1. POST: Create new professional ethics
function PostProfessionalEthics(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 2. GET ALL: Get all professional ethics with pagination
function GetAllProfessionalEthics(page = 0, size = 10) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 3. GET BY ID: Get specific professional ethics by ID
function GetProfessionalEthicsById(professionalEthicsId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics/${professionalEthicsId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 4. GET BY COLLEGE ID: Get professional ethics by college ID with pagination
function GetProfessionalEthicsByCollegeId(collegeId, page = 0, size = 10) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics/college/${collegeId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 5. PUT: Update existing professional ethics
function UpdateProfessionalEthics(professionalEthicsId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics/${professionalEthicsId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 6. SOFT DELETE: Soft delete professional ethics
function SoftDeleteProfessionalEthics(professionalEthicsId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics/soft/${professionalEthicsId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 7. HARD DELETE: Hard delete professional ethics
function HardDeleteProfessionalEthics(professionalEthicsId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics/hard/${professionalEthicsId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 8. POST: Student Consent
function PostStudentConsent(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${API_BASE_URL}/student-consent`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 9. GET: Student Consent by User ID
function GetStudentConsentByUserId(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${API_BASE_URL}/student-consent/getByUserId/${userId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
