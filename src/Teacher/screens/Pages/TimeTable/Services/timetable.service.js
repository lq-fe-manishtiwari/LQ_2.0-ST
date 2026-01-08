import {
    authHeader, handleResponse, authHeaderToPost, TimetableAPI,TeacherLoginAPI,
    AcademicAPI
} from '@/_services/api';

export const timetableService = {
    getAllSlotsbyCollegeId,
    getPaperAllocationsByAcademicYearAndSemester,
    getModulesAndUnits,
    allocateTemplate,
    checkTeacherConflict,
    getAllTimetableByCollegeId,
    getTemplateById,
    updateTemplate,
    getPeriodTimetable,
    getClassroomAvailability,
    createSlotException,
    getTeacherTimetable
};

function getTeacherTimetable({ teacher_id, college_id, start_date, end_date }) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const queryParams = new URLSearchParams({
        teacher_id,
        college_id,
        start_date,
        end_date
    }).toString();

    return fetch(
        `${TimetableAPI}/admin/academic/teacher-timetable?${queryParams}`,
        requestOptions
    ).then(handleResponse);
}


function saveTimeSlots(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TimetableAPI}/admin/academic/time-slots`, requestOptions)
        .then(handleResponse)
        .then(role => {
            return role;
        });
}

function getAllSlotsbyCollegeId(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${TimetableAPI}/admin/academic/time-slots?collegeId=${collegeId}`,
        requestOptions
    ).then(handleResponse);
}

function getModulesAndUnits(subjectId) {
    // GET - /admin/academic/api/subjects/{subjectId}/modules-units

    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${AcademicAPI}/api/subjects/${subjectId}/modules-units`,
        requestOptions
    ).then(handleResponse);
}

// GET /api/admin/subject-allocation/by-academic-year-semester
function getPaperAllocationsByAcademicYearAndSemester(academicYearId, semesterId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${AcademicAPI}/subject-allocation/by-academic-year-semester?academicYearId=${academicYearId}&semesterId=${semesterId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}


function updateTimeSlot(slotID, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };

    return fetch(
        `${TimetableAPI}/admin/academic/time-slot/${slotID}`,
        requestOptions
    ).then(handleResponse);
}


function deleteTimeSlot(slotID) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(
        `${TimetableAPI}/admin/academic/time-slot/${slotID}`,
        requestOptions
    ).then(handleResponse);
}
function saveTimetableTemplate(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TimetableAPI}/admin/academic/timetable-templates`, requestOptions)
        .then(handleResponse);
}

function allocateTemplate(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TimetableAPI}/admin/academic/template-allocations`, requestOptions)
        .then(handleResponse);
}

function checkTeacherConflict(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${TimetableAPI}/admin/academic/teacher-conflict-check`, requestOptions)
        .then(handleResponse);
}


function getAllTimetableByCollegeId(collegeId) {
    //admin/academic/timetable-templates
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(
        `${TimetableAPI}/admin/academic/timetable-templates?collegeId=${collegeId}`,
        requestOptions
    ).then(handleResponse);
}

function getTemplateById(templateId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(
        `${TimetableAPI}/admin/academic/timetable-template/${templateId}`,
        requestOptions
    ).then(handleResponse);
}

function updateTemplate(templateId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(
        `${TimetableAPI}/admin/academic/timetable-template/${templateId}`,
        requestOptions
    ).then(handleResponse);
}


function getPeriodTimetable({ academic_year_id, semester_id, division_id, college_id, start_date, end_date }) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    const queryParams = new URLSearchParams({
        academic_year_id,
        semester_id,
        division_id,
        college_id,
        start_date,
        end_date
    }).toString();

    return fetch(
        `${TimetableAPI}/admin/academic/period-timetable?${queryParams}`,
        requestOptions
    ).then(handleResponse);
}

function getClassroomAvailability(classroomId) {
    const requestOptions = {
        method: "GET",
        headers: authHeader()
    };

    return fetch(
        `${AcademicAPI}/admin/academic/classroom/${classroomId}/availability`,
        requestOptions
    ).then(handleResponse);
}

function createSlotException(exceptionData) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(exceptionData)
    };
    return fetch(`${TimetableAPI}/admin/academic/slot-exceptions`, requestOptions)
        .then(handleResponse);
}
