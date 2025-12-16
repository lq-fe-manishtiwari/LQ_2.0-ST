import { authHeader, handleResponse, AcademicAPI } from '../../../../../_services/api';

export const studentService = {
    fetchClassesByprogram,
    getStudentsByClass,
    getStudentById
};

// GET /api/admin/academic/programs/{programId}/classes
export function fetchClassesByprogram(programId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/admin/academic/program-class-year/program/${programId}`, requestOptions).then(handleResponse);
}

// GET /api/admin/academic/students/by-class/{classId}
function getStudentsByClass(classId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/students/by-class/${classId}`, requestOptions).then(handleResponse);
}

// GET /api/admin/academic/students/{studentId}
function getStudentById(studentId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/students/${studentId}`, requestOptions).then(handleResponse);
}