// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, TeacherLoginAPI } from '@/_services/api';

export const DepartmentService = {
    saveDepartment,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartmentByCollegeId,
}; 



function getDepartment() {
    // /: /departments
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments`, requestOptions)
    .then(handleResponse);
}

function saveDepartment(values) {
  // POST   // /: /departments
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/departments`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function updateDepartment(values,id) {
  // POST   /api/departments/{id}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/departments/${id}?name=${values.department_name}&collegeId=${values.college_id}`, requestOptions)
    .then(handleResponse)
    .then(role => {
        return role;
    });
}

function deleteDepartment(id) {
    // /api/departments/soft/{id}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/soft/${id}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Return text response as-is since delete returns "Department deleted successfully"
            return response.text();
        });
}

function getDepartmentById(id) {
    // /: /api/departments/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/${id}`, requestOptions)
    .then(handleResponse);
}

function getDepartmentByCollegeId(id) {
    // /: /api/departments/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/college/${id}`, requestOptions)
    .then(handleResponse);
}