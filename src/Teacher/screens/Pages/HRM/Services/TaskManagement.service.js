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
       updateTaskStatus,    //teacher side status update
       getEmployeeTaskView,

       
       getAllMyTasks,
       postMyTask,
       getMyTaskbyID,
       deleteMyTask,
       updateMyTask,

       //department 
       getDepartmentByCollegeId,

        // Timesheet APIs
       getUserTimesheet,
       getUserTimesheetMonthly,
       getUserTimesheetCurrentMonth,
       getTimesheetBetweenDates,
       getUserTimesheetCurrentWeek,
       getUserTimesheetToday,
       getUserTimesheetSummary,
       getUserTimesheetMonthlySummary,

        // Personal Task (User To-Do)
       postPersonalTasksBulk,
       getUserTodoByUserId,
       getUserTodoById,
       getUserTodoStats,
       updateUserTodo,
       deleteUserTodo,
       deleteAllUserTodos
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

//=============================Timesheet APIs======================

function getUserTimesheet(userId, startDate, endDate) {
    // GET : /api/timesheet/user/{userId}
    const queryParams = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
    });
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetMonthly(userId, year, month) {
    // GET : /api/timesheet/user/{userId}/monthly
    const queryParams = new URLSearchParams({
        year: year,
        month: month
    });
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/monthly?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetCurrentMonth(userId) {
    // GET : /api/timesheet/user/{userId}/current-month
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/current-month`, requestOptions)
        .then(handleResponse);
}

function getTimesheetBetweenDates(userId, startDate, endDate) {
    // GET : /api/timesheet/between-dates
    const queryParams = new URLSearchParams({
        userId: userId,
        startDate: startDate,
        endDate: endDate
    });
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/between-dates?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetCurrentWeek(userId) {
    // GET : /api/timesheet/user/{userId}/current-week
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/current-week`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetToday(userId) {
    // GET : /api/timesheet/user/{userId}/today
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/today`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetSummary(userId, startDate, endDate) {
    // GET : /api/timesheet/user/{userId}/summary
    const queryParams = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
    });
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/summary?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function getUserTimesheetMonthlySummary(userId, year, month) {
    // GET : /api/timesheet/user/{userId}/monthly-summary
    const queryParams = new URLSearchParams({
        year: year,
        month: month
    });
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/timesheet/user/${userId}/monthly-summary?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function updateTaskStatus(taskId, taskStatusId, updatedBy) {
    // PUT: /api/task/update-status/{taskId}
    const queryParams = new URLSearchParams({
        taskStatusId: taskStatusId,
        updatedBy: updatedBy
    });
    const requestOptions = { method: 'PUT', headers: authHeader() };
    return fetch(`${PMSAPI}/task/update-status/${taskId}?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

function getEmployeeTaskView(userId, collegeId) {
    // GET: /api/task/employee-view
    const queryParams = new URLSearchParams({
        userId: userId,
        collegeId: collegeId
    });
    
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/task/employee-view?${queryParams.toString()}`, requestOptions)
        .then(handleResponse);
}

// ============================= User To-Do APIs =============================

function postPersonalTasksBulk(values) {
    // POST : /api/admin/user-todo/create/bulk
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(`${PMSAPI}/admin/user-todo/create/bulk`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// GET : /api/admin/user-todo/user/{userId}
function getUserTodoByUserId(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/user/${userId}`,
        requestOptions
    ).then(handleResponse);
}


// GET : /api/admin/user-todo/{userToDoId}?userId={userId}
function getUserTodoById(userToDoId, userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/${userToDoId}?userId=${userId}`,
        requestOptions
    ).then(handleResponse);
}


// GET : /api/admin/user-todo/user/{userId}/stats
function getUserTodoStats(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/user/${userId}/stats`,
        requestOptions
    ).then(handleResponse);
}

// PUT : /api/admin/user-todo/update/{toDoId}
function updateUserTodo(toDoId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/update/${toDoId}`,
        requestOptions
    ).then(handleResponse);
}


// DELETE : /api/admin/user-todo/delete/{toDoId}?userId={userId}
function deleteUserTodo(toDoId, userId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/delete/${toDoId}?userId=${userId}`,
        requestOptions
    ).then(handleResponse);
}


// DELETE : /api/admin/user-todo/delete/user/{userId}
function deleteAllUserTodos(userId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(
        `${PMSAPI}/admin/user-todo/delete/user/${userId}`,
        requestOptions
    ).then(handleResponse);
}
