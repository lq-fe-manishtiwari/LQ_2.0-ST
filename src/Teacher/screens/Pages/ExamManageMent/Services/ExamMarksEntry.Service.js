import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  ExamMGMAPI
} from "@/_services/api";

export const examMarksEntryService = {
  getMarksBySchedule,
  submitMarksBatch,
  getMarksByScheduleWithPaperURL
};

function getMarksByScheduleWithPaperURL(examScheduleId,subject_id) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${ExamMGMAPI}/admin/exam-marks/exam-schedule/${examScheduleId}/subject/${subject_id}?includeExamPaper=true`,
    requestOptions
  ).then(handleResponse);
}


function getMarksBySchedule(examScheduleId,subject_id) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${ExamMGMAPI}/admin/exam-marks/exam-schedule/${examScheduleId}/subject/${subject_id}`,
    requestOptions
  ).then(handleResponse);
}


function submitMarksBatch(marksArray) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(marksArray),
  };

  return fetch(`${ExamMGMAPI}/admin/exam-marks/batch`, requestOptions)
    .then(handleResponse);
}

