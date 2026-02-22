// Class
// import config from 'config';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI, PMSAPI, TeacherLoginAPI } from '@/_services/api';

export const Settings = {
    getAllRole,
    postRole,
    getRolebyID,
    updateRole,
    deleteRole,

    //======roles-responsibility========
    getAllRoleResponsibility,
    postRoleResponsibility,
    getRoleResponsibilitybyID,
    updateRoleResponsibility,
    deleteRoleResponsibility,

    //========API===========
    getAllApi,
    postApi,
    getApibyID,
    updateApi,
    deleteApi,

    //=======================Task Type======================================
    getAllTaskType,
    postTaskType,
    getTaskTypebyID,
    updateTaskType,
    deleteTaskType,
    bulkSaveTaskType,
    bulkDeleteTaskType,

    //=======================Task Status======================================
    getAllTaskStatus,
    postTaskStatus,
    getTaskStatusbyID,
    updateTaskStatus,
    deleteTaskStatus,

    //=======================Priority======================================
    getAllPriority,
    postPriority,
    getPrioritybyID,
    getPriorityByName,
    getDefaultPriority,
    updatePriority,
    deletePriority,
    checkPriorityExistsByName,
    bulkCreatePriority,

    // Performance Matrix / Monitoring Related
    getAuthorityRoles,
    getAllUnit,
    getAllFrequency,
    getAllRatings,
    getApprovalHierarchyByEmployeeId,
    updateAppraisal,
    postAppraisal,

};

function getAllRole() {
    // @GetMapping("/api/admin/role")
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/admin/role`, requestOptions)
        .then(handleResponse);
}

function postRole(values) {
    // @PostMapping("/api/admin/role")
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/admin/role`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getRolebyID(id) {
    // @GetMapping("/api/admin/role/{id}")
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/admin/role/${id}`, requestOptions)
        .then(handleResponse);
}

function updateRole(values, id) {
    // @PutMapping("/api/admin/role/{id}")
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TeacherLoginAPI}/admin/role/${id}`, requestOptions)
        .then(handleResponse)
        .then(role => {
            return role;
        });
}

function deleteRole(id) {
    // @DeleteMapping("/api/admin/role/{id}")
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/role/${id}`, requestOptions)
        .then(handleResponse);
}

//===========================roles-responsibility=============================================

function getAllRoleResponsibility() {
    // GET /api/roles-responsibility/get-all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/roles-responsibility/get-all`, requestOptions)
        .then(handleResponse);
}

function postRoleResponsibility(values) {
    // POST /api/roles-responsibility/save
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/roles-responsibility/save`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getRoleResponsibilitybyID(id) {
    // GET /api/roles-responsibility/get/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/roles-responsibility/get/${id}`, requestOptions)
        .then(handleResponse);
}

function updateRoleResponsibility(values) {
    // PUT /api/roles-responsibility/update
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/roles-responsibility/update`, requestOptions)
        .then(handleResponse)
        .then(role => {
            return role;
        });
}

function deleteRoleResponsibility(id) {
    // DELETE /api/roles-responsibility/delete/{id}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/roles-responsibility/delete/${id}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Handle text response instead of JSON
        });
}

//=================/academic-performance-indicator============================================
function getAllApi(values) {
    // GET /api/academic-performance-indicator/master/get-all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-performance-indicator/master/get-all`, requestOptions)
        .then(handleResponse);
}

function postApi(values) {
    // POST /api/academic-performance-indicator/master/save
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-performance-indicator/master/save`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getApibyID(id) {
    // GET /api/academic-performance-indicator/master/get/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-performance-indicator/master/get/${id}`, requestOptions)
        .then(handleResponse);
}


function updateApi(values) {
    // PUT /api/academic-performance-indicator/master/update
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/academic-performance-indicator/master/update`, requestOptions)
        .then(handleResponse)
        .then(api => {
            return api;
        });
}

function deleteApi(id) {
    // DELETE /api/academic-performance-indicator/master/delete/{id}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-performance-indicator/master/delete/${id}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        });
}


///=======================Task Type======================================
function getAllTaskType() {
    // GET /api/admin/task-types
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/task-types`, requestOptions)
        .then(handleResponse);
}

function postTaskType(values) {
    // POST /api/admin/task-types 
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/task-types`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getTaskTypebyID(id) {
    // GET /api/admin/task-types/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/task-types/${id}`, requestOptions)
        .then(handleResponse);
}

function updateTaskType(values) {
    // PUT /api/admin/task-types 
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/task-types`, requestOptions)
        .then(handleResponse)
        .then(taskType => {
            return taskType;
        });
}

function deleteTaskType(id) {
    // DELETE /api/admin/task-types/bulk
    const requestOptions = {
        method: 'DELETE',
        headers: authHeaderToPost(),
        body: JSON.stringify([id])
    };
    return fetch(`${PMSAPI}/admin/task-types/bulk`, requestOptions)
        .then(handleResponse);
}

function bulkSaveTaskType(values) {
    // POST /api/admin/task-types/bulk 
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/task-types/bulk`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function bulkDeleteTaskType(ids) {
    // DELETE /api/admin/task-types/bulk
    const requestOptions = {
        method: 'DELETE',
        headers: authHeaderToPost(),
        body: JSON.stringify(ids)
    };
    return fetch(`${PMSAPI}/admin/task-types/bulk`, requestOptions)
        .then(handleResponse);
}


// =======================Task Status======================================

function getAllTaskStatus() {
    // GET /api/admin/task-status/all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/task-status/all`, requestOptions)
        .then(handleResponse);
}

function postTaskStatus(values) {
    // POST /api/admin/task-status/create
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/task-status/create`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getTaskStatusbyID(id) {
    // GET /api/admin/task-status/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/task-status/${id}`, requestOptions)
        .then(handleResponse);
}

function updateTaskStatus(values, id) {
    // PUT /api/admin/task-status/create/update/{id}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/task-status/update/${id}`, requestOptions)
        .then(handleResponse)
        .then(taskStatus => {
            return taskStatus;
        });
}

function deleteTaskStatus(id) {
    // DELETE /api/admin/task-status/delete/{id}
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/admin/task-status/delete/${id}`, requestOptions)
        .then(handleResponse);
}

// =======================Priority======================================

function getAllPriority() {
    // GET /api/admin/priority/all
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/priority/all`, requestOptions)
        .then(handleResponse);
}

function postPriority(values) {
    // POST /api/admin/priority/create
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/priority/create`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

function getPrioritybyID(id) {
    // GET /api/admin/priority/{id}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/priority/${id}`, requestOptions)
        .then(handleResponse);
}

function getPriorityByName(priorityName) {
    // GET /api/admin/priority/name/{priorityName}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/priority/name/${priorityName}`, requestOptions)
        .then(handleResponse);
}

function getDefaultPriority() {
    // GET /api/admin/priority/default
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/priority/default`, requestOptions)
        .then(handleResponse);
}

function updatePriority(values, id) {
    // PUT /api/admin/priority/update/{id}
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/priority/update/${id}`, requestOptions)
        .then(handleResponse)
        .then(priority => {
            return priority;
        });
}

function deletePriority(id) {
    // DELETE /api/admin/priority/delete/{id}
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${PMSAPI}/admin/priority/delete/${id}`, requestOptions)
        .then(handleResponse);
}

function checkPriorityExistsByName(priorityName) {
    // GET /api/admin/priority/exists/name/{priorityName}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/priority/exists/name/${priorityName}`, requestOptions)
        .then(handleResponse);
}

function bulkCreatePriority(values) {
    // POST /api/admin/priority/bulk-create
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/admin/priority/bulk-create`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

// ======================= Performance Matrix / Monitoring APIs =======================

function getAuthorityRoles(collegeId) {
    // GET /api/admin/authority-role/college/{collegeId}
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/authority-role/college/${collegeId}`, requestOptions)
        .then(handleResponse);
}

function getAllUnit(collegeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/internal-monitoring/unit/all?collegeId=${collegeId}`, requestOptions)
        .then(handleResponse);
}

function getAllFrequency(collegeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/academic-diary/internal-monitoring/frequency/all?collegeId=${collegeId}`, requestOptions)
        .then(handleResponse);
}

function getAllRatings(collegeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/ratings/college?collegeId=${collegeId}`, requestOptions)
        .then(handleResponse);
}

function getApprovalHierarchyByEmployeeId(employeeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/admin/approval-hierarchy/employee/${employeeId}`, requestOptions)
        .then(handleResponse);
}

function updateAppraisal(id, data) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };
    return fetch(`${PMSAPI}/admin/appraisals/${id}`, requestOptions)
        .then(handleResponse);
}

function postAppraisal(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data)
    };
    return fetch(`${PMSAPI}/admin/appraisals`, requestOptions)
        .then(handleResponse);
}
