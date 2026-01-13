import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  ExamMGMAPI
} from "@/_services/api";

export const examgService = {
  getTeacherDutyAllocationsByCollege,
  getTeacherDutyAllocationsByTeacher,
  getExamSchedulesByTeacher,

  getTeacherRevaluationRequests,
  updateRevaluationMarks,
};

/**
 * GET: Get Teacher Duty Allocations by College ID
 * /api/admin/teacher-duty-allocations/by-college/{collegeId}
 */
function getTeacherDutyAllocationsByCollege(collegeId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader()
  };

  return fetch(
    `${ExamMGMAPI}/admin/teacher-duty-allocations/by-college/${collegeId}`,
    requestOptions
  ).then(handleResponse);
}

/**
 * GET: Get Teacher Duty Allocations by Teacher ID
 * /api/admin/teacher-duty-allocations/by-teacher/{teacherId}
 */
function getTeacherDutyAllocationsByTeacher(teacherId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader()
  };

  return fetch(
    `${ExamMGMAPI}/admin/teacher-duty-allocations/by-teacher/${teacherId}`,
    requestOptions
  ).then(handleResponse);
}

/**
 * GET: Get Exam Schedules for a Teacher
 * /api/exam-schedules/teacher/{teacherId}
 */
function getExamSchedulesByTeacher(teacherId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader()
  };

  return fetch(
    `${ExamMGMAPI}/exam-schedules/teacher/${teacherId}`,
    requestOptions
  ).then(handleResponse);
}

function getTeacherRevaluationRequests(teacherId, examScheduleId) {
  // api/exam/teacher/revaluation-requests?teacherId=x&examScheduleId
  return fetch(
    `${ExamMGMAPI}/exam/teacher/revaluation-requests?teacherId=${teacherId}&examScheduleId=${examScheduleId}`,
    { method: "GET", headers: authHeader() }
  ).then(handleResponse);
}


function updateRevaluationMarks(id, data,teacherId) {
  return fetch(
    `${ExamMGMAPI}/exam/teacher/revaluation-requests/${id}/update-marks?teacherId=${teacherId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(data)
    }
  ).then(handleResponse);
}
