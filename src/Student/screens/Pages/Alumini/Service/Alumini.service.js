import { authHeader, handleResponse, authHeaderToPost, DevAPI ,TeacherLoginAPI} from '@/_services/api';

export const AluminiService = {
    getStudentHistory,
    getAluminiDetails,
    getAnnouncementDetails,
    getEventsDetails,
    getGalleryDetails,
    getSocialMediaDetails,
    postLikeDislike,
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
  return fetch(`${DevAPI}/admin/announcements/by-batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getEventsDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/admin/events/by-batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getGalleryDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/admin/photo-galleries/by-batch/${batchId}`, requestOptions)
    .then(handleResponse);
}
function getSocialMediaDetails(batchId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${DevAPI}/admin/social-media-posts/byBatch/${batchId}`, requestOptions)
    .then(handleResponse);
}

function postLikeDislike(userId, payload) {

    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload)
    };
    // return fetch(`/api/likes?userId=${userId}`, requestOptions)
    return fetch(`${TeacherLoginAPI}/likes?userId=${userId}`, requestOptions)
        .then(handleResponse);
}