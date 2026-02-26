import { authHeader, handleResponse, authHeaderToPost,AcademicAPI,TeacherLoginAPI } from '@/_services/api';
// import { AcademicAPI } from '../../../../_services/api';

export const AdminGradeAllocationService = {
    getAllAccessControl,
    saveAccessControl,
 
};

function saveAccessControl(values) {
    // get /api/admin/program-allocations
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/program-allocations`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getAllAccessControl() {
// https://lq-new-api.learnqoch.com/user/api/admin/access-modules?includeSubmodules=true&includeEntries=true
    const requestOptions = { method: 'GET', headers: authHeader() };

    return fetch(`${TeacherLoginAPI}/admin/access-modules?includeSubmodules=true&includeEntries=true`,requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
