import { authHeader, handleResponse, authHeaderToPost, PMSAPI } from '@/_services/api';

export const monitoringService = {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getResponses,
  saveBulkResponses,
};

/**
 * Get all activities for a college and term
 * @param {number} collegeId - College ID
 * @param {string} term - "Term 1" or "Term 2"
 * @returns {Promise<Array>} List of activities
 */
function getActivities(collegeId, term) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/activity/all?collegeId=${collegeId}&term=${term}`, requestOptions)
    .then(handleResponse);
}

/**
 * Add a new activity
 * @param {Object} data - Activity data
 * @param {number} data.college_id - College ID
 * @param {string} data.term - "Term 1" or "Term 2"
 * @param {string} data.activity_name - Activity name
 * @returns {Promise<Object>} Created activity
 */
function addActivity(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/activity`, requestOptions)
    .then(handleResponse);
}

/**
 * Get teacher's responses/checklist for a term
 * @param {number} collegeId - College ID
 * @param {number} userId - Teacher's user ID
 * @param {string} term - "Term 1" or "Term 2"
 * @returns {Promise<Array>} List of responses
 */
function getResponses(collegeId, userId, term) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/checklist?collegeId=${collegeId}&userId=${userId}&term=${term}`, requestOptions)
    .then(handleResponse);
}

/**
 * Save responses in bulk
 * @param {Array} data - List of response objects
 * @returns {Promise<Object>} Response from server
 */
function saveBulkResponses(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/response/bulk`, requestOptions)
    .then(handleResponse);
}

/**
 * Update an existing activity
 * @param {Object} data - Activity data including activity_id
 * @returns {Promise<Object>} Updated activity
 */
function updateActivity(data) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/activity`, requestOptions)
    .then(handleResponse);
}

/**
 * Delete an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise<Object>} Deletion result
 */
function deleteActivity(activityId) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSAPI}/academic-diary/internal-monitoring/activity/${activityId}`, requestOptions)
    .then(handleResponse);
}
