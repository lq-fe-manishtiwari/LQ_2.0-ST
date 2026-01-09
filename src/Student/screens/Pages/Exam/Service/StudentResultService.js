import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from './api';

export const studentResultService = {
    getInternalExternal,
    getFinalREsult,
};
function getInternalExternal(studentId) {
    // GET /api/student/results/internal-or-external?studentId=X

      const requestOptions = {
        method: "GET",
        headers: authHeader()
      };
    
      return fetch(
        `${AcademicAPI}/student/results/internal-or-external/${studentId}`,
        requestOptions
      ).then(handleResponse);
    }

    function getFinalREsult(examScheduleId) {
        // GET /api/student/results/final?studentId=X

        const requestOptions = {
          method: "GET",
          headers: authHeader()
        };
      
        return fetch(
          `${AcademicAPI}${examScheduleId}/student/results/final/${studentId}`,
          requestOptions
        ).then(handleResponse);
      }