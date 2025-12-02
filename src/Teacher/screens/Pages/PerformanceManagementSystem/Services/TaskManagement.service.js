// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, PMSAPI ,PMSNEWAPI} from '@/_services/api';

export const TaskManagement = {
       getAllStaff,
       getStaffByDepartment,

       getAllPMSTasks,
       postTaskAssignment,
       getTaskAssignmentbyID,
       deletePMSTaskAssignment,
       updateTaskAssignment,
}; 

function getAllStaff() {
    // /api/admin/staff/all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/staff/all`, requestOptions)
    .then(handleResponse);
}

function getStaffByDepartment(departmentId) {
    // /api/admin/staff/all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/staff/all`, requestOptions)
    .then(handleResponse);
}

//=============================Task Assignment======================

// NEW (PMS Task GET-ALL API)  ✔
function getAllPMSTasks() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/task/get-all`, requestOptions)
        .then(handleResponse);
}

function postTaskAssignment(values) {
   // *POST* /create-with-multiple-assignments
   const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
};
return fetch(`${PMSAPI}/task/create-with-multiple-assignments`, requestOptions)
    .then(handleResponse)
    .then(data => {
        return data;
    });
  }

function getTaskAssignmentbyID(assignmentId) {
    // *GET* /get/{assignmentId}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/task/get/${assignmentId}`, requestOptions)
    .then(handleResponse);
}

function updateTaskAssignment(values) {
    // /create-with-multiple-assignments
      const requestOptions = {
          method: 'PUT',
          headers: authHeaderToPost(),
          body: JSON.stringify(values)
      };
      return fetch(`${PMSAPI}/admin/create-with-multiple-assignments`, requestOptions)
      .then(handleResponse)
      .then(role => {
          return role;
      });
  }


  function deletePMSTaskAssignment(assignmentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${PMSAPI}/task/delete/${assignmentId}`, requestOptions)
        .then(handleResponse);
}