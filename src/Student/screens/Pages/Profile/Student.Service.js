// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, DevAPI } from '@/_services/api';

export const StudentService = {
  getStudentHistory,
  getStudentHistoryWithoutactive,
};

function getStudentHistory(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };


  return fetch(`${DevAPI}/admin/students/student/${studentId}/history`, requestOptions)
    .then(handleResponse);
}
function getStudentHistoryWithoutactive(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };


  return fetch(`${DevAPI}/admin/students/student/${studentId}/history`, requestOptions)
    .then(handleResponse);
}