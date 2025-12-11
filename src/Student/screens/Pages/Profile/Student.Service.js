// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, DevAPI } from '@/_services/api';

export const StudentService = {
    getStudentHistory,
};

function getStudentHistory(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  
  return fetch(`${DevAPI}/api/admin/students/student/${studentId}/history`, requestOptions)
    .then(handleResponse);
}
