import {
    authHeader,
    authHeaderToPost,
    handleResponse,
    ExamMGMAPI,
    TeacherLoginAPI
  } from "@/_services/api";
  
  export const examPaperService = {
    saveExampaper,
    getExamPaper,
    getPaperByCollege,
    getDetailedPaper,
    getPaperById,
    deleteExamPaper,
    updateExamPaper,
    getPaperByCollegeTeacher,

  };
  
  function saveExampaper(values) {
    // POST /api/admin/exam-papers
    const requestOptions = {
      method: "POST",
      headers: authHeaderToPost(),
      body: JSON.stringify(values)
    };
  
    return fetch(
      `${ExamMGMAPI}/admin/exam-papers`,
      requestOptions
    ).then(handleResponse);
  }

  function getDetailedPaper(examScheduleId, subjectId) {
    // /api/admin/exam-papers/exam-schedule/{examScheduleId}/subject/{subjectId}
    
      const requestOptions = {
        method: "GET",
        headers: authHeader()
      };
    
      return fetch(
        `${ExamMGMAPI}/admin/exam-papers/exam-schedule=${examScheduleId}subject&=${subjectId}`,
        requestOptions
      ).then(handleResponse);
    }

    function getExamPaper(examScheduleId) {
        // GET BY EXAM SCHEDULE /api/admin/exam-papers/exam-schedule/{examScheduleId}
        const requestOptions = {
          method: "GET",
          headers: authHeader()
        };
      
        return fetch(
          `${ExamMGMAPI}/admin/exam-papers/exam-schedule/${examScheduleId}`,
          requestOptions
        ).then(handleResponse);
      }

  function getPaperByCollege(collegeId) {
// GET BY COLLEGE /api/admin/exam-papers/college/{collegeId}
    const requestOptions = {
      method: "GET",
      headers: authHeader()
    };

    return fetch(
      `${ExamMGMAPI}/admin/exam-papers/college/${collegeId}`,
      requestOptions
    ).then(handleResponse);
  }

  function getPaperById(Id) {
    // GET BY ID /api/admin/exam-papers/{id}
        const requestOptions = {
          method: "GET",
          headers: authHeader()
        };
    
        return fetch(
          `${ExamMGMAPI}/admin/exam-papers/${Id}`,
          requestOptions
        ).then(handleResponse);
      }

function updateExamPaper(id, values) {
  // PUT /api/admin/exam-papers/{id} ->
  const requestOptions = {
    method: "PUT",
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  };

  return fetch(
    `${ExamMGMAPI}/admin/exam-papers/${id}`,
    requestOptions
  ).then(handleResponse);
}

function deleteExamPaper(id) {
  //  /api/admin/exam-papers/{id}
  const requestOptions = {
    method: "DELETE",
    headers: authHeader()
  };

  return fetch(
    `${ExamMGMAPI}/admin/exam-papers/${id}`,
    requestOptions
  ).then(handleResponse);
}

 function getPaperByCollegeTeacher(collegeId,teacherId) {
// GET BY COLLEGE /api/admin/exam-papers/college/{collegeId}/teacher/{teacherId
    const requestOptions = {
      method: "GET",
      headers: authHeader()
    };

    return fetch(
      `${ExamMGMAPI}/admin/exam-papers/college/${collegeId}/teacher/${teacherId}`,
      requestOptions
    ).then(handleResponse);
  }