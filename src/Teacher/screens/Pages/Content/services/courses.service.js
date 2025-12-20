import { authHeader, handleResponse, AcademicAPI } from '../../../../../_services/api';

export const courseService = {
    getAllCourses,
    getCourseById,
    getSubjectsByProgram,
    createCourse,
    updateCourse,
    deleteCourse
};

// GET /api/admin/academic/subjects
function getAllCourses() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subjects`, requestOptions).then(handleResponse);
}

// GET /api/admin/academic/subjects/{subjectId}
function getCourseById(subjectId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subjects/${subjectId}`, requestOptions).then(handleResponse);
}

// GET /api/admin/academic/subjects/by-program/{programId}
function getSubjectsByProgram(programId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subjects/by-program/${programId}`, requestOptions).then(handleResponse);
}

// POST /api/admin/academic/subjects/create
function createCourse(courseData) {
    const requestOptions = {
        method: 'POST',
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    };
    return fetch(`${AcademicAPI}/subjects/create`, requestOptions).then(handleResponse);
}

// PUT /api/admin/academic/subjects/edit/{subjectId}
function updateCourse(subjectId, courseData) {
    const requestOptions = {
        method: 'PUT',
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    };
    return fetch(`${AcademicAPI}/subjects/edit/${subjectId}`, requestOptions).then(handleResponse);
}

// DELETE /api/admin/academic/subjects/soft/{subjectId}
function deleteCourse(subjectId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subjects/soft/${subjectId}`, requestOptions).then(handleResponse);
}