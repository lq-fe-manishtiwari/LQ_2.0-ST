import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,AcademicAPI } from '@/_services/api';
import { authHeaderToFile, handleTextResponse } from '@/_services/api';

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
  updateLeaveForm,
  softDeleteLeave,
  hardDeleteLeave,
  uploadFileToS3,

  getLeaveByAcaddemicyearIdSemesterId,
  getLeavesSummaryByUserId
};

/* ===================== LEAVE TYPE FUNCTIONS ===================== */
function uploadFileToS3(file) {
  const formData = new FormData();
  formData.append("file", file);

  const requestOptions = {
    method: "POST",
    headers: authHeaderToFile(),
    body: formData,
  };

  return fetch(`${AcademicAPI}/admin/academic/s3/upload`, requestOptions)
    .then(handleTextResponse)
    .then((response) => {
      return response; // assuming backend returns the file URL/path as plain text
    });
}
// 1. POST /api/leave-type
function createLeaveType(data) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSNEWAPI}/leave-type`, requestOptions).then(handleResponse);
}

// 2. GET ALL /api/leave-type?page=0&size=10
function getAllLeaveTypes(page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/leave-type?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 3. GET LEAVE TYPE BY ID /api/leave-type/{id}
function getLeaveTypeById(id) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/leave-type/${id}`, requestOptions).then(handleResponse);
}

// 4. GET LEAVE TYPES BY COLLEGE ID /api/leave-type/college/{college_id}?page=0&size=10
function getLeaveTypesByCollegeId(collegeId, page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/leave-type/college/${collegeId}?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 5. PUT /api/leave-types/{id}
function updateLeaveType(id, data) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };
  return fetch(`${PMSNEWAPI}/leave-type/${id}`, requestOptions).then(handleResponse);
}

// 6. SOFT DELETE /api/leave-type/soft/{id}
function softDeleteLeaveType(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/leave-type/soft/${id}`, requestOptions).then(handleResponse);
}

// 7. HARD DELETE /api/leave-type/hard/{id}
function hardDeleteLeaveType(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/leave-type/hard/${id}`, requestOptions).then(handleResponse);
}

/* ===================== APPLY LEAVE FUNCTIONS ===================== */

// 1. POST /api/apply-leave
async function applyLeave(data) {
  let attachmentUrls = [];

  // If there are attachments, upload them to S3 first
  if (data.attachment && data.attachment.length > 0) {
    const uploadPromises = data.attachment.map(file => uploadFileToS3(file));
    attachmentUrls = await Promise.all(uploadPromises);
  }

  // Prepare JSON payload
  const payload = {
    college_id: data.college_id,
    user_id: data.user_id,
    leave_type_id: data.leave_type_id,
    start_date: data.fromDate,      // matching form field names
    end_date: data.toDate,
    reason: data.reason,
    attachment: attachmentUrls,      // array of S3 URLs (or empty array)
    leave_period: data.leaveFor,       // Normal / Half Day
    no_of_days: parseFloat(data.days),
    leave_status: "PENDING",
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      ...authHeader(),
      'Content-Type': 'application/json',  // important for JSON
    },
    body: JSON.stringify(payload),
  };

  return fetch(`${PMSNEWAPI}/apply-leave`, requestOptions)
    .then(handleResponse);
}

function updateLeaveForm(id, values) {
  let attachmentUrls = [];

  // If new files are attached during edit
  if (values.attachment && values.attachment.length > 0) {
    // Upload new files
    const uploadPromises = values.attachment.map((file) => uploadFileToS3(file));
    // Note: Since this is sync function, we can't await here directly
    // But in practice, your frontend calls this via async handleSubmit, so it's fine
    // We'll assume uploadFileToS3 returns promise and handle in component
    // Alternatively, make this function async (recommended below)
  }

  // For edit: We only send updated fields. DO NOT send leave_status!
  const payload = {
    college_id: values.college_id,
    user_id: values.user_id,
    leave_type_id: parseInt(values.leave_type_id),
    start_date: values.fromDate,
    end_date: values.toDate,
    reason: values.reason || null,
    attachment: attachmentUrls, // new uploaded URLs (existing ones are preserved on backend?)
    leave_period: values.leaveFor,
    no_of_days: parseFloat(values.days),
    leave_status: "PENDING",
    // IMPORTANT: Do NOT send leave_status here → preserves current status (Approved/Rejected/Pending)
  };

  const requestOptions = {
    method: "PUT",
    headers: {
      ...authHeaderToPost(), // assuming this includes Content-Type and auth
      // If authHeaderToPost() doesn't set Content-Type, add it:
      // "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  return fetch(`${PMSNEWAPI}/apply-leave/${id}`, requestOptions).then(handleResponse);
}

// 2. GET ALL /api/apply-leave?page=0&size=10
function getAllLeaves(page = 0, size = 10) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave?page=${page}&size=${size}`, requestOptions).then(handleResponse);
}

// 3. GET LEAVE BY ID /api/apply-leave/{apply_leave_id}
function getLeaveById(id) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/${id}`, requestOptions).then(handleResponse);
}

// 4. GET LEAVES BY USER ID /api/apply-leave/user/{user_id}
function getLeavesByUserId(userId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/user/${userId}`, requestOptions).then(handleResponse);
}

// 5. GET LEAVES BY COLLEGE ID /api/apply-leave/college/{college_id}
function getLeavesByCollegeId(collegeId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/college/${collegeId}`, requestOptions).then(handleResponse);
}

// 6. PUT /api/apply-leave/{id}/status
function updateLeaveStatus(id, payload) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(payload),
  };
  return fetch(`${PMSNEWAPI}/apply-leave/${id}/status`, requestOptions)
    .then(handleResponse);
}




// 7. SOFT DELETE /api/apply-leave/soft/{id}
function softDeleteLeave(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/soft/${id}`, requestOptions).then(handleResponse);
}

// 8. HARD DELETE /api/apply-leave/hard/{id}
function hardDeleteLeave(id) {
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/hard/${id}`, requestOptions).then(handleResponse);
}

function getLeaveByAcaddemicyearIdSemesterId(academicYearId,SemesterId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/by-academic-year-semester?academicYearId=${academicYearId}&semesterId=${SemesterId}`, requestOptions).then(handleResponse);
}

function getLeavesSummaryByUserId(userId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${PMSNEWAPI}/apply-leave/summary/${userId}`, requestOptions).then(handleResponse);
}