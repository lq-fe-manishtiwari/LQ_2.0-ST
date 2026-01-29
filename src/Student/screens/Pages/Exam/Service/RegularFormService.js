import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,ExamMGMAPI,FinanceAPI,DevAPI } from '@/_services/api';


export const regularFormService = {
   getStudentExamForms,
   allocateExamFees,
   getStudentHistory,
};

/**
 * GET: Get Student Exam Forms by Student ID
 * /api/admin/student-exam-forms/student/{studentId}
 */
function getStudentExamForms(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader()
  };

  return fetch(
    `${ExamMGMAPI}/admin/student-exam-forms/student/${studentId}`,
    requestOptions
  ).then(handleResponse);
}

/**
 * POST: Allocate Exam Fees to Students
 * /api/admin/student-fee-allocations/exam-fees
 */
function allocateExamFees(payload) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(payload)
  };

  return fetch(
    `${FinanceAPI}/admin/student-fee-allocations/exam-fees`,
    requestOptions
  ).then(handleResponse);
}

function getStudentHistory(studentId) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  
  return fetch(`${DevAPI}/admin/students/student/${studentId}/history/active`, requestOptions)
    .then(handleResponse);
}