import { authHeader, handleResponse, authHeaderToPost, DevAPI } from '@/_services/api';

export const AluminiService = {
    getStudentHistory,
    getAluminiDetails,
    getAnnouncementDetails,
    getEventsDetails,
    getGalleryDetails,
    getSocialMediaDetails,
};

function getStudentHistory(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  
  return fetch(`${DevAPI}/admin/students/student/${studentId}/history/active`, requestOptions)
    .then(handleResponse);
}

function getAluminiDetails(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/alumni/student/${studentId}`, requestOptions)
    .then(handleResponse);
}

function getAnnouncementDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/announcement/student/batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getEventsDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/events/student/batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getGalleryDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/gallery/student/batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getSocialMediaDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/social-media/student/batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
