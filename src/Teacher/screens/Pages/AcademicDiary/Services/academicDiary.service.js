// User Profile Service
import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI,PMSAPI,AcademicAPI } from '@/_services/api';


export const teacherProfileService = {
    getTeachersByProgram,
    getTeacherProfileById,
    saveAdvancedLearner,
    getAdvancedLearnerById,
    getAdvancedLearnersByUserId,
    updateAdvancedLearner,
    softDeleteAdvancedLearner,
    uploadFileToS3

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

// 7. HARD-DELETE /api/advance-learner/hard/{advance_learner_id}
function hardDeleteAdvancedLearner(advanceLearnerId) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${PMSAPI}/advance-learner/hard/${advanceLearnerId}`, requestOptions)
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