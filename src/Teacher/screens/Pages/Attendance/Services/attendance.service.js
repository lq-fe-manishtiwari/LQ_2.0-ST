import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, TimetableAPI, AcademicAPI } from '../../../../../_services/api';

export const TeacherAttendanceManagement = {
    uploadFileToS3,
    saveDailyAttendance,
    getAttendanceStudents,
    getTimeSlots,
    getAttendanceStatuses,
    getAttendanceList,
    saveQRCodeSession,
    getQRCodeSession,
    getSessionAttendanceCount,
};

// Upload file to S3
function uploadFileToS3(file) {
    console.log("uploadFileToS3 called with file:", file);
    const formData = new FormData();
    formData.append('file', file);
    const authHeaders = authHeader();
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': authHeaders.Authorization
        },
        body: formData
    };

    const url = `${AcademicAPI}/admin/academic/s3/upload`;

    return fetch(url, requestOptions)
        .then(response => {
            console.log("S3 upload response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // S3 upload returns plain text URL, not JSON
            return response.text();
        })
        .then(data => {
            console.log("S3 upload data:", data);
            return data;
        })
        .catch(error => {
            console.error("S3 upload error:", error);
            throw error;
        });
}

function saveDailyAttendance(attendanceData) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(attendanceData),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/bulk-attendance`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to save attendance'
        }));
}

function getAttendanceStudents(filters) {
    const { academicYearId, semesterId, divisionId, subjectId } = filters;
    const queryString = `academicYearId=${academicYearId}&semesterId=${semesterId}&divisionId=${divisionId}&subjectId=${subjectId}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/students?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch attendance students'
        }));
}

function getTimeSlots(params) {
    const { teacherId, subjectId, date, academicYearId, semesterId, divisionId, collegeId } = params;
    const queryString = `teacherId=${teacherId}&subjectId=${subjectId}&date=${date}&academicYearId=${academicYearId}&semesterId=${semesterId}&divisionId=${divisionId}&collegeId=${collegeId}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/timetable-classes?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch time slots'
        }));
}

function getAttendanceStatuses(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/status?collegeId=${collegeId}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch attendance statuses'
        }));
}

function getAttendanceList(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/list-attendance`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch attendance list'
        }));
}

function saveQRCodeSession(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(data),
    };

    return fetch(`${TimetableAPI}/qr-codes`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to save QR session'
        }));
}

function getQRCodeSession(params) {
    const { academicYearId, semesterId, divisionId, paperId, timeSlotId, date } = params;
    const queryString = `academicYearId=${academicYearId}&semesterId=${semesterId}&divisionId=${divisionId}&paperId=${paperId}&timeSlotId=${timeSlotId}&date=${date}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/qr-codes?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch QR session'
        }));
}

// Get session attendance count (REST API polling instead of WebSocket)
function getSessionAttendanceCount(params) {
    const { academicYearId, semesterId, divisionId, subjectId, timetableId, timetableAllocationId, date, timeSlotId } = params;

    const queryString = `academicYearId=${academicYearId}&semesterId=${semesterId}&divisionId=${divisionId}&subjectId=${subjectId}&timetableId=${timetableId}&timetableAllocationId=${timetableAllocationId}&date=${date}&timeSlotId=${timeSlotId}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/session-count?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch attendance count'
        }));
}