// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, PMSAPI,TeacherLoginAPI} from '@/_services/api';

export const TaskManagement = {
       getAllStaff,
       getStaffByDepartment,

       getAllPMSTasks,
       postTaskAssignment,
       getTaskAssignmentbyID,
       deletePMSTaskAssignment,
       updateTaskAssignment,

       
       getAllMyTasks,
       postMyTask,
       getMyTaskbyID,
       deleteMyTask,
       updateMyTask,

       //department 
       getDepartmentByCollegeId,
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
    // POST /create-with-multiple-assignments (same endpoint, POST method for both create/update)
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


  function deletePMSTaskAssignment(assignmentId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${PMSAPI}/task/delete/${assignmentId}`, requestOptions)
        .then(handleResponse);
}
//=============================My Task ======================

function getAllMyTasks(user_id) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/self-task/user/${user_id}`, requestOptions)
        .then(handleResponse);
}

function postMyTask(values) {
   // # **POST** `/create/bulk
   const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
};
return fetch(`${PMSAPI}/admin/self-task/create/bulk`, requestOptions)
    .then(handleResponse)
    .then(data => {
        return data;
    });
  }

function getMyTaskbyID(user_id) {
    //  **GET** `/user/{user_id}`
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/user/${user_id}`, requestOptions)
    .then(handleResponse);
}

function updateMyTask(values, self_task_id) {
    // *PUT** `/update/{self_task_id}` 
      const requestOptions = {
          method: 'PUT',
          headers: authHeaderToPost(),
          body: JSON.stringify(values)
      };
      return fetch(`${PMSAPI}/admin/self-task/update/${self_task_id}`, requestOptions)
      .then(handleResponse)
      .then(role => {
          return role;
      });
  }


  function deleteMyTask(self_task_id,user_id) {
    //**DELETE** `/delete/{self_task_id}?user_id={user_id}
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${PMSAPI}/admin/self-task/delete/${self_task_id}?user_id=${user_id}`, requestOptions)
        .then(handleResponse);
}

//department
function getDepartmentByCollegeId(id) {
    // /: /api/departments/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/departments/college/${id}`, requestOptions)
    .then(handleResponse);
}