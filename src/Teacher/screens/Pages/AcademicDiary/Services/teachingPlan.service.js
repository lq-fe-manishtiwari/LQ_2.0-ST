import { authHeader, handleResponse, PMSAPI } from '@/_services/api';

// The base URL for teaching plan APIs as per user documentation
const TP_API = `${PMSAPI}/admin/teaching-plan`;

export const teachingPlanService = {
    PostTeachingPlan,
    GetTeachingPlanById,
    GetAllTeachingPlanByCollegeId,
    FilterTeachingPlans,
    UpdateTeachingPlan,
    DeleteTeachingPlan,
    saveObjective // Keeping this for the objective creation step
};

// 1. POST: Create Teaching Plan
async function PostTeachingPlan(values) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
    };
    return fetch(`${TP_API}`, requestOptions).then(handleResponse);
}

// 2. GET BY ID: Get Teaching Plan by ID
async function GetTeachingPlanById(teachingPlanId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TP_API}/get/${teachingPlanId}`, requestOptions).then(handleResponse);
}

// 3. GET ALL: Get Teaching Plans by College ID
async function GetAllTeachingPlanByCollegeId(collegeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TP_API}/get-all/college/${collegeId}`, requestOptions).then(handleResponse);
}

// 4. FILTER: Teaching Plan filter API
async function FilterTeachingPlans(params) {
    const { academicYearId, semesterId, subjectId, teacherId } = params;
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(
        `${TP_API}/filter?academicYearId=${academicYearId}&semesterId=${semesterId}&subjectId=${subjectId}&teacherId=${teacherId}`,
        requestOptions
    ).then(handleResponse);
}

// 5. PUT: Update Teaching Plan
async function UpdateTeachingPlan(teachingPlanId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
    };
    return fetch(`${TP_API}/update/${teachingPlanId}`, requestOptions).then(handleResponse);
}

// 6. DELETE: Delete Teaching Plan
async function DeleteTeachingPlan(teachingPlanId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${TP_API}/delete/${teachingPlanId}`, requestOptions).then(handleResponse);
}

// Internal: Save individual objectives (multi-step process)
async function saveObjective(objectiveData) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(objectiveData)
    };
    return fetch(`${TP_API}/objective/create`, requestOptions).then(handleResponse);
}

