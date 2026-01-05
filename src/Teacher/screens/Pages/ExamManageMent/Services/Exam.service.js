import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    ExamMGMAPI
  } from "@/_services/api";
  
export const examgService = {
  getTeacherDutyAllocationsByCollege,
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

