// User Profile Service
import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,PMSAPI,AcademicAPI, TimetableAPI } from '@/_services/api';


export const teacherProfileService = {
    getTeachersByProgram,
    getTeacherProfileById,
    saveAdvancedLearner,
    getAdvancedLearnerById,
    getAdvancedLearnersByUserId,
    updateAdvancedLearner,
    softDeleteAdvancedLearner,
    uploadFileToS3,
    saveSlowLearner,
    getSlowLearnersByUserId,
    getSlowLearnerById,
    updateSlowLearner,
    softDeleteSlowLearner,
    getTeacherDailyReport,
    getOtherActivities,
    createOtherActivity,
    updateOtherActivity,
    deleteOtherActivity,
    downloadAcademicDiaryByTeacher,

};

// ========================= GET TEACHERS BY PROGRAM =========================
function getTeachersByProgram(programId) {
    const requestOptions = { method: 'GET', headers: authHeader() };

    // 🔴 Future API
    // return fetch(`${PMSNEWAPI}/teacher/program/${programId}`, requestOptions)
    //     .then(handleResponse);

    // 🟡 Temporary hardcoded fallback
    return Promise.resolve(
        HARDCODED_TEACHERS.filter(
            t => Number(t.program_id) === Number(programId)
        )
    );
}

// ========================= GET SINGLE TEACHER PROFILE =========================
function getTeacherProfileById(teacherId) {
    const requestOptions = { method: 'GET', headers: authHeader() };

    // 🔴 Future API
    // return fetch(`${PMSNEWAPI}/teacher/${teacherId}`, requestOptions)
    //     .then(handleResponse);

    // 🟡 Temporary hardcoded fallback
    return Promise.resolve(
        HARDCODED_TEACHERS.find(
            t => Number(t.teacher_id) === Number(teacherId)
        )
    );
}


// ========================= ADVANCE LEARNER APIs =========================

// 1. POST /api/advance-learner
function saveAdvancedLearner(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/advance-learner`, requestOptions)
        .then(handleResponse);
}


// 3. GET-BY-USERID /api/advance-learner/user/{user_id}?page=0&size=10
function getAdvancedLearnersByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/advance-learner/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

// 4. GET-BY-ADVANCE-LEARNER-ID /api/advance-learner/{advance_learner_id}
function getAdvancedLearnerById(advanceLearnerId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/advance-learner/${advanceLearnerId}`, requestOptions)
        .then(handleResponse);
}

// 5. PUT /api/advance-learner/{advance_learner_id}/user/{user_id}
function updateAdvancedLearner(advanceLearnerId, userId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/advance-learner/${advanceLearnerId}/user/${userId}`, requestOptions)
        .then(handleResponse);
}

// 6. SOFT-DELETE /api/advance-learner/soft/{advance_learner_id}
function softDeleteAdvancedLearner(advanceLearnerId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/advance-learner/soft/${advanceLearnerId}`, requestOptions)
        .then(handleResponse);
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

// ========================= SLOW LEARNER APIs =========================

// 1. POST /api/slow-learner
function saveSlowLearner(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/slow-learner`, requestOptions)
        .then(handleResponse);
}


// 3. GET-BY-USERID /api/slow-learner/user/{user_id}?page=0&size=10
function getSlowLearnersByUserId(userId, page = 0, size = 10) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/slow-learner/user/${userId}?page=${page}&size=${size}`, requestOptions)
        .then(handleResponse);
}

// 4. GET-BY-SLOW-LEARNER-ID /api/slow-learner/{slow_learner_id}
function getSlowLearnerById(slowLearnerId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/slow-learner/${slowLearnerId}`, requestOptions)
        .then(handleResponse);
}

// 5. PUT /api/slow-learner/{slow_learner_id}/user/{user_id}
function updateSlowLearner(slowLearnerId, userId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/slow-learner/${slowLearnerId}/user/${userId}`, requestOptions)
        .then(handleResponse);
}

// 6. SOFT-DELETE /api/slow-learner/soft/{slow_learner_id}
function softDeleteSlowLearner(slowLearnerId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/slow-learner/soft/${slowLearnerId}`, requestOptions)
        .then(handleResponse);
}

// ========================= DAILY WORK REPORT APIs =========================

// GET /api/academic-diary/teacher?teacherId={teacherId}&collegeId={collegeId}&date={date}
function getTeacherDailyReport(teacherId, collegeId, date) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${TimetableAPI}/academic-diary/teacher?teacherId=${teacherId}&collegeId=${collegeId}&date=${date}`, requestOptions)
        .then(handleResponse);
}

// GET /api/other-activities?teacherId={teacherId}&date={date}
function getOtherActivities(teacherId, date) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${PMSAPI}/other-activities?teacherId=${teacherId}&date=${date}`, requestOptions)
        .then(handleResponse);
}

// POST /api/other-activities
function createOtherActivity(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/other-activities`, requestOptions)
        .then(handleResponse);
}

// PUT /api/other-activities/{id}
function updateOtherActivity(id, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${PMSAPI}/other-activities/${id}`, requestOptions)
        .then(handleResponse);
}

// DELETE /api/other-activities/{id}
function deleteOtherActivity(id) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/other-activities/${id}`, requestOptions)
        .then(handleResponse);
}

// ========================= ACADEMIC DIARY DOWNLOAD =========================
// GET /api/academic-diary/download?collegeId={collegeId}&teacherId={teacherId}
async function downloadAcademicDiaryByTeacher(teacherId, collegeId) {
    const response = await fetch(
        `${TimetableAPI}/academic-diary/download?collegeId=${collegeId}&teacherId=${teacherId}`,
        {
            method: 'GET',
            headers: {
                ...authHeader(), // 🔥 MUST (Bearer token)
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Download failed : ${response.status}`);
    }

    return response.blob(); 
}
