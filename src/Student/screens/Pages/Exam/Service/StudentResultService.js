import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,ExamMGMAPI } from '@/_services/api';
import { authHeaderToFile, handleTextResponse } from '@/_services/api';

export const studentResultService = {
    getInternalExternal,
    getFinalResult,

    createRevaluationRequest,
    getStudentRevaluationRequests,
    updateStudentRevaluationRequest
};
function getInternalExternal(studentId) {
    // GET /api/student/results/internal-or-external?studentId=X
    // /api/student/results/internal-or-external?studentId=186

      const requestOptions = {
        method: "GET",
        headers: authHeader()
      };
    
      return fetch(
        `${ExamMGMAPI}/student/results/internal-or-external?studentId=${studentId}`,
        requestOptions
      ).then(handleResponse);
    }

    function getFinalResult(studentId) {
        // GET /api/student/results/final?studentId=X

        const requestOptions = {
          method: "GET",
          headers: authHeader()
        };
      
        return fetch(
          `${ExamMGMAPI}/student/results/final/${studentId}`,
          requestOptions
        ).then(handleResponse);
      }

function createRevaluationRequest(studentId, data) {
  return fetch(
    `${ExamMGMAPI}/exam/student/revaluation-requests?studentId=${studentId}`,
    {
      method: "POST",
      headers: authHeaderToPost(),
      body: JSON.stringify(data)
    }
  ).then(handleResponse);
}

function getStudentRevaluationRequests(studentId) {
  return fetch(
    `${ExamMGMAPI}/exam/student/revaluation-requests/${studentId}`,
    { method: "GET", headers: authHeader() }
  ).then(handleResponse);
}

function updateStudentRevaluationRequest(id, studentId, data) {
  return fetch(
    `${ExamMGMAPI}/student/student/revaluation-requests/${id}?studentId=${studentId}`,
    {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(data)
    }
  ).then(handleResponse);
}
