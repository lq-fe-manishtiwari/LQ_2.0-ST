import { authHeader, handleResponse, authHeaderToPost, HRMAPI } from '@/_services/api';

export const leaveService = {
  // Leave Type APIs
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  getLeaveTypesByCollegeId,
  updateLeaveType,
  softDeleteLeaveType,
  hardDeleteLeaveType,

  // Apply Leave APIs
  applyLeave,
  getAllLeaves,
  getLeaveById,
  getLeavesByUserId,
  getLeavesByCollegeId,
  updateLeaveStatus,
  softDeleteLeave,
  hardDeleteLeave,
};

/* ===================== LEAVE TYPE FUNCTIONS ===================== */

// 1. POST /api/leave-type
function createLeaveType(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${HRMAPI}/leave-type`, requestOptions).then(handleResponse);
}

// 2. GET ALL /api/leave-type?page=0&size=10
function getAllLeaveTypes(page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/leave-type?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 3. GET LEAVE TYPE BY ID /api/leave-type/{id}
function getLeaveTypeById(id) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/leave-type/${id}`, requestOptions).then(handleResponse);
}

// 4. GET LEAVE TYPES BY COLLEGE ID /api/leave-type/college/{college_id}?page=0&size=10
function getLeaveTypesByCollegeId(collegeId, page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/leave-type/college/${collegeId}?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 5. PUT /api/leave-types/{id}
function updateLeaveType(id, data) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${HRMAPI}/leave-type/${id}`, requestOptions).then(handleResponse);
}

// 6. SOFT DELETE /api/leave-type/soft/{id}
function softDeleteLeaveType(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${HRMAPI}/leave-type/soft/${id}`, requestOptions).then(handleResponse);
}

// 7. HARD DELETE /api/leave-type/hard/{id}
function hardDeleteLeaveType(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${HRMAPI}/leave-type/hard/${id}`, requestOptions).then(handleResponse);
}

/* ===================== APPLY LEAVE FUNCTIONS ===================== */

// 1. POST /api/apply-leave
function applyLeave(data) {
  const formData = new FormData();
  formData.append('college_id', data.college_id);
  formData.append('user_id', data.user_id);
  formData.append('leave_type_id', data.leave_type_id);
  formData.append('start_date', data.start_date);
  formData.append('end_date', data.end_date);
  formData.append('remark', data.remark);

  if (data.attachment && data.attachment.length > 0) {
    data.attachment.forEach((file) => formData.append('attachment', file));
  }

  const requestOptions = {
    method: 'POST',
    headers: authHeader(), // authHeader already works with multipart/form-data in fetch
    body: formData,
  };

  return fetch(`${HRMAPI}/apply-leave`, requestOptions).then(handleResponse);
}

// 2. GET ALL /api/apply-leave?page=0&size=10
function getAllLeaves(page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 3. GET LEAVE BY ID /api/apply-leave/{apply_leave_id}
function getLeaveById(id) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave/${id}`, requestOptions).then(handleResponse);
}

// 4. GET LEAVES BY USER ID /api/apply-leave/user/{user_id}
function getLeavesByUserId(userId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave/user/${userId}`, requestOptions).then(handleResponse);
}

// 5. GET LEAVES BY COLLEGE ID /api/apply-leave/college/{college_id}
function getLeavesByCollegeId(collegeId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave/college/${collegeId}`, requestOptions).then(handleResponse);
}

// 6. PUT /api/apply-leave/{id}/status
function updateLeaveStatus(id, leave_status) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify({ leave_status }),
  };
  return fetch(`${HRMAPI}/apply-leave/${id}/status`, requestOptions).then(handleResponse);
}

// 7. SOFT DELETE /api/apply-leave/soft/{id}
function softDeleteLeave(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave/soft/${id}`, requestOptions).then(handleResponse);
}

// 8. HARD DELETE /api/apply-leave/hard/{id}
function hardDeleteLeave(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${HRMAPI}/apply-leave/hard/${id}`, requestOptions).then(handleResponse);
}
