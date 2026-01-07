import {
  authHeader,
  authHeaderToPost,
  handleResponse,
  ExamMGMAPI
} from "@/_services/api";

export const examMarksEntryService = {
  getMarksBySchedule,
  submitMarksBatch,
};


function getMarksBySchedule(examScheduleId,subject_id) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${ExamMGMAPI}/admin/exam-marks/exam-schedule/${examScheduleId}`,
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

