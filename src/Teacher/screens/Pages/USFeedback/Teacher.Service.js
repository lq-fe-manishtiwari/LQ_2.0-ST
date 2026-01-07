import { authHeader, handleResponse, DevAPI } from '@/_services/api';

export const TeacherService = {
    getTeacherAllocatedPrograms,
};

function getTeacherAllocatedPrograms(teacherId) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    return fetch(`${DevAPI}/teacher/${teacherId}`, requestOptions)
        .then(handleResponse);
}
