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
    getTeacherTimetable,

    getClassUpdates,
    createClassUpdate,
    updateClassUpdate,
    deleteClassUpdates,
    uploadFileToS3
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

//=================================Class update================

function getClassUpdates(exceptionId, templateSlotId) {

    // exactly one value required
    if (
        (exceptionId && templateSlotId) ||
        (!exceptionId && !templateSlotId)
    ) {
        return Promise.reject(
            "exceptionId OR templateSlotId (only one) is required"
        );
    }

    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const queryParam = exceptionId
        ? `exceptionId=${exceptionId}`
        : `templateSlotId=${templateSlotId}`;

    return fetch(
        `${TimetableAPI}/admin/class-updates?${queryParam}`,
        requestOptions
    ).then(handleResponse);
}

function createClassUpdate(payload) {
    const {
        exception_id,
        template_slot_id,
        user_id,
        college_id,
    } = payload;

    // exactly one validation
    if (
        (exception_id && template_slot_id) ||
        (!exception_id && !template_slot_id)
    ) {
        return Promise.reject(
            "Exactly one of exception_id or template_slot_id is required"
        );
    }

    if (!user_id || !college_id) {
        return Promise.reject("user_id and college_id are required");
    }

    const requestOptions = {
        method: "POST",
        headers: {
            ...authHeader(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    };

    return fetch(
        `${TimetableAPI}/admin/class-updates`,
        requestOptions
    ).then(handleResponse);
}

function updateClassUpdate(classUpdateId, payload) {

    const requestOptions = {
        method: "PUT",
        headers: {
            ...authHeader(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), 
    };

    return fetch(
        `${TimetableAPI}/admin/class-updates/${classUpdateId}`,
        requestOptions
    ).then(handleResponse);
}


function deleteClassUpdates(classUpdateIds) {

    const requestOptions = {
        method: "DELETE",
        headers: {
            ...authHeader(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(classUpdateIds),
    };

    return fetch(
        `${TimetableAPI}/admin/class-updates`,
        requestOptions
    ).then(handleResponse);
}



function uploadFileToS3(file) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Uploading file to S3:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            const formData = new FormData();
            formData.append("file", file);
            
            // Get auth headers - NO Content-Type for FormData
            const headers = authHeader();
            // Remove Content-Type - browser will set it with boundary
            if (headers['Content-Type']) {
                delete headers['Content-Type'];
            }
            
            const requestOptions = {
                method: "POST",
                headers: headers,
                body: formData,
            };
            
            console.log('Sending request to:', `${AcademicAPI}/s3/upload`);
            
            const response = await fetch(`${AcademicAPI}/s3/upload`, requestOptions);
            
            // Get response as text first
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            
            if (!response.ok) {
                console.error('Upload failed with status:', response.status);
                throw new Error(`Upload failed: ${response.status} - ${responseText}`);
            }
            
            // IMPORTANT: Since API returns plain text URL, just return it
            // Don't try to parse as JSON
            const fileUrl = responseText.trim();
            
            console.log('File upload successful, URL:', fileUrl);
            resolve(fileUrl);
            
        } catch (error) {
            console.error('Error in uploadFileToS3:', error);
            reject(error);
        }
    });
}