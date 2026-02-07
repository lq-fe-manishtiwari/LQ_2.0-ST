import { authHeader, handleResponse, TimetableAPI, PMSAPI } from '@/_services/api';

export const committeeService = {
  getCommitteesByTeacherAndCollege,
  getFacultyCommitteeDetailsByTeacherId,
  saveFacultyCommitteeDetails,
  updateFacultyCommitteeDetails,
};

/**
 * Get committee memberships for a teacher in a specific college
 * @param {number} teacherId - Teacher's user ID
 * @param {number} collegeId - College ID
 * @returns {Promise<Array>} List of committee memberships
 */
function getCommitteesByTeacherAndCollege(teacherId, collegeId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${TimetableAPI}/admin/academic/committee/teacher/${teacherId}/college/${collegeId}`, requestOptions)
    .then(handleResponse);
}

/**
 * Get faculty committee details (chairperson/member at various levels)
 * @param {Object} params - Parameters object
 * @param {number} params.teacher_id - Teacher's user ID
 * @returns {Promise<Object>} Committee details object
 */
function getFacultyCommitteeDetailsByTeacherId({ teacher_id }) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSAPI}/academic-diary/faculty-committee-details/teacher/${teacher_id}`, requestOptions)
    .then(handleResponse);
}

/**
 * Save faculty committee details (POST)
 * @param {Object} payload - Committee details payload
 * @returns {Promise<Object>} Response object
 */
function saveFacultyCommitteeDetails(payload) {
  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(payload)
  };
  return fetch(`${PMSAPI}/academic-diary/faculty-committee-details`, requestOptions)
    .then(handleResponse);
}

/**
 * Update faculty committee details (PUT)
 * @param {Object} payload - Committee details payload
 * @returns {Promise<Object>} Response object
 */
function updateFacultyCommitteeDetails(payload) {
  const requestOptions = {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(payload)
  };
  return fetch(`${PMSAPI}/academic-diary/faculty-committee-details`, requestOptions)
    .then(handleResponse);
}
