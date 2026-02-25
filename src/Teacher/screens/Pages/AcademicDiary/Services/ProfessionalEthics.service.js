import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, PMSAPI, AcademicAPI, TimetableAPI } from '@/_services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const ProfessionalEthicsService = {
    PostProfessionalEthics,
    GetAllProfessionalEthics,
    GetProfessionalEthicsById,
    GetProfessionalEthicsByCollegeId,
    UpdateProfessionalEthics,
    SoftDeleteProfessionalEthics,
    HardDeleteProfessionalEthics,
    PostTeacherConsent,
    GetTeacherConsentByUserId,
     // Daily Work Report
    getTeacherDailyReport,
    getOtherActivities,
    createOtherActivity,
    updateOtherActivity,
    deleteOtherActivity,
    exportDailyWorkReportPdf,
    exportDailyWorkReportExcel
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
function PostTeacherConsent(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics-consent`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// 9. GET: Student Consent by User ID
function GetTeacherConsentByUserId(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/academic-diary/professional-ethics-consent/user/${userId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getTeacherDailyReport(teacherId, collegeId, date) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TimetableAPI}/academic-diary/teacher?teacherId=${teacherId}&collegeId=${collegeId}&date=${date}`, requestOptions)
        .then(handleResponse);
}
// GET /api/admin/teacher-other-activity/teacher/{teacherId}/date/{date}
function getOtherActivities(teacherId, date) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/teacher-other-activity/teacher/${teacherId}/date/${date}`, requestOptions)
        .then(handleResponse);
}

// POST /api/admin/teacher-other-activity
function createOtherActivity(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/teacher-other-activity`, requestOptions)
        .then(handleResponse);
}

// PUT /api/other-activities/{id}
function updateOtherActivity(id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/teacher-other-activity/${id}`, requestOptions)
        .then(handleResponse);
}

// DELETE /api/other-activities/{id}
function deleteOtherActivity(id) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/teacher-other-activity/${id}`, requestOptions)
        .then(handleResponse);
}
// GET /api/academic-diary/teacher/report/pdf
function exportDailyWorkReportPdf(params) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    
    // Directly format the query string
    const query = `userId=${params.userId}&startDate=${params.startDate}&endDate=${params.endDate}`;
    
    return fetch(`${TimetableAPI}/academic-diary/teacher/report/pdf?${query}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.blob();
        });
}

// GET /api/academic-diary/teacher/report/excel
function exportDailyWorkReportExcel(params) {
    const requestOptions = { method: 'GET', headers: authHeader() };

    // Directly format the query string
    const query = `userId=${params.userId}&startDate=${params.startDate}&endDate=${params.endDate}`;
    
    return fetch(`${TimetableAPI}/academic-diary/teacher/report/excel?${query}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.blob();
        });
}