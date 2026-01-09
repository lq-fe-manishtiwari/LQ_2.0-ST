import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,ExamMGMAPI } from '@/_services/api';
import { authHeaderToFile, handleTextResponse } from '@/_services/api';

export const studentResultService = {
    getInternalExternal,
    getFinalResult,

    createRevaluationRequest,
    getStudentRevaluationRequests,
    updateStudentRevaluationRequest,
    getStudentAtktData
};
function getInternalExternal(studentId) {
    // GET /api/student/results/internal-or-external?studentId=X

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
          `${ExamMGMAPI}/student/results/final?studentId=${studentId}`,
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


function getStudentAtktData(studentId) {
  // http://localhost:6060/api/student/results/atkt?studentId=541
  return fetch(
    `${ExamMGMAPI}/student/results/atkt?studentId=${studentId}`,
    { method: "GET", headers: authHeader() }
  ).then(handleResponse);
}