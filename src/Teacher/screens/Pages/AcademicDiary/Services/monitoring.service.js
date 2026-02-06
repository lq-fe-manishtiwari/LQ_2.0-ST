import { authHeader, handleResponse, authHeaderToPost, PMSAPI } from '@/_services/api';

export const monitoringService = {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getResponses,
  saveResponse,
};

/**
 * Get all activities for a college and term
 * @param {number} collegeId - College ID
 * @param {string} term - "term1" or "term2"
 * @returns {Promise<Array>} List of activities
 */
function getActivities(collegeId, term) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSAPI}/monitoring/activities?college_id=${collegeId}&term=${term}`, requestOptions)
    .then(handleResponse);
}

/**
 * Add a new activity
 * @param {Object} data - Activity data
 * @param {number} data.college_id - College ID
 * @param {string} data.term - "term1" or "term2"
 * @param {string} data.activity - Activity name/description
 * @param {number} data.created_by - User ID of creator
 * @returns {Promise<Object>} Created activity
 */
function addActivity(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/monitoring/activities`, requestOptions)
    .then(handleResponse);
}

/**
 * Update an existing activity
 * @param {number} activityId - Activity ID
 * @param {Object} data - Updated activity data
 * @param {string} data.activity - Updated activity name/description
 * @returns {Promise<Object>} Updated activity
 */
function updateActivity(activityId, data) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/monitoring/activities/${activityId}`, requestOptions)
    .then(handleResponse);
}

/**
 * Delete an activity (soft delete)
 * @param {number} activityId - Activity ID
 * @returns {Promise<Object>} Deletion result
 */
function deleteActivity(activityId) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSAPI}/monitoring/activities/${activityId}`, requestOptions)
    .then(handleResponse);
}

/**
 * Get teacher's responses for a term
 * @param {number} userId - Teacher's user ID
 * @param {string} term - "term1" or "term2"
 * @returns {Promise<Array>} List of responses
 */
function getResponses(userId, term) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSAPI}/monitoring/responses?user_id=${userId}&term=${term}`, requestOptions)
    .then(handleResponse);
}

/**
 * Save or update a teacher's response (UPSERT)
 * @param {Object} data - Response data
 * @param {number} data.user_id - Teacher's user ID
 * @param {number} data.activity_id - Activity ID
 * @param {string} data.term - "term1" or "term2"
 * @param {string} data.rating - "excellent", "satisfactory", or "can_do_better"
 * @returns {Promise<Object>} Saved response
 */
function saveResponse(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSAPI}/monitoring/responses`, requestOptions)
    .then(handleResponse);
}
