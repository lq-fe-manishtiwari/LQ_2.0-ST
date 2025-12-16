import { authHeader, handleResponse, authHeaderToPost, ContentAPI, AcademicAPI } from '@/_services/api';

export const contentService = {
    AddContent,
    getCOntentByUnitId,
    UpdateCOntentbyContentId,
    DeleteContentById,

    getSubjectbyProgramId,
    getModulesAndUnitsBySubjectId,
    getContentTypes,
    uploadFileToS3,
    getQuizzesByUnitId,

    getContentLevel,
};

const BaseUrl = `${ContentAPI}/api/admin/content`

function AddContent(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${ContentAPI}/admin/content`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getCOntentByUnitId(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${BaseUrl}/unit/${unitId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function UpdateCOntentbyContentId(contentId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${BaseUrl}/${contentId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function DeleteContentById(contentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${BaseUrl}/${contentId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getSubjectbyProgramId(programId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subjects/by-program/${programId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getModulesAndUnitsBySubjectId(subjectId) {
    // api/admin/academic/api/subjects/141/modules-units  
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/api/subjects/${subjectId}/modules-units`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
function getContentTypes() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/admin/content-types`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
function uploadFileToS3(file) {
    console.log("uploadFileToS3 called with file:", file);
    const formData = new FormData();
    formData.append('file', file);
    const authHeaders = authHeader();
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': authHeaders.Authorization
        },
        body: formData
    };

    const url = `${AcademicAPI}/s3/upload`;

    return fetch(url, requestOptions)
        .then(response => {
            console.log("S3 upload response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // S3 upload returns plain text URL, not JSON
            return response.text();
        })
        .then(data => {
            console.log("S3 upload data:", data);
            return data;
        })
        .catch(error => {
            console.error("S3 upload error:", error);
            throw error;
        });
}

function getQuizzesByUnitId(unitId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/quizzes/unit/${unitId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getContentLevel() {
    // content/api/content-level
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${ContentAPI}/content-level`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}