import { authHeader, handleResponse, AcademicAPI } from '../../../../../_services/api';

export const collegeService = {
    getAllProgramByCollegeId,
    getAllColleges,
    getCollegeById
};

// GET /api/admin/academic/programs/by-college/{collegeId}
function getAllProgramByCollegeId(userId,collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/admin/academic/programs/allocated/user/${userId}/college/${collegeId}`, requestOptions).then(handleResponse);
}


// GET /api/admin/academic/colleges
function getAllColleges() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/colleges`, requestOptions).then(handleResponse);
}

// GET /api/admin/academic/colleges/{collegeId}
function getCollegeById(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/colleges/${collegeId}`, requestOptions).then(handleResponse);
}