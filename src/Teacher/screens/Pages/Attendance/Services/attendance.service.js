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
    getGroupedAttendance,
    getAttendanceBySubject,
    saveMultipleBulkAttendance,
    getSubjectTimetable,
    //Report
    getTeacherAttendanceSummaryReports,
    getDailyReport,
    getSummaryReport,
    getTimetableDashboardDetails,
    getDashboardHolidays,
};

function getTimetableDashboardDetails(teacherId, collegeId, date) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const queryString = `teacherId=${teacherId}&collegeId=${collegeId}&date=${date}`;
    const url = `${TimetableAPI}/teacher/dashboard/timetable?${queryString}`;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch timetable dashboard details'
        }));
}

function getDashboardHolidays(teacherId, collegeId, date) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const queryString = `teacherId=${teacherId}&collegeId=${collegeId}&date=${date}`;
    const url = `${TimetableAPI}/teacher/dashboard/holidays?${queryString}`;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch dashboard holidays'
        }));
}

// ... existing functions ...
function getSummaryReport(params) {
    const {
        collegeId,
        divisionId,
        semesterId,
        academicYearId,
        programId,
        startDate,
        endDate,
        paperId,
    } = params;

    let queryString = `collegeId=${collegeId}&startDate=${startDate}&endDate=${endDate}`;

    if (divisionId) queryString += `&divisionId=${divisionId}`;
    if (semesterId) queryString += `&semesterId=${semesterId}`;
    if (academicYearId) queryString += `&academicYearId=${academicYearId}`;
    if (programId) queryString += `&programId=${programId}`;
    if (paperId) queryString += `&paperId=${paperId}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const finalUrl = `${TimetableAPI}/attendance/student/summary-report?${queryString}`;

    return fetch(finalUrl, requestOptions)
        .then(handleResponse)
        .then(data => ({ success: true, data }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch student summary report',
        }));
}
function getDailyReport(params) {
    const { collegeId, divisionId, semesterId, academicYearId, programId, date, batchId, paperId } = params;

    // Build query string
    let queryString = `collegeId=${collegeId}&divisionId=${divisionId}&semesterId=${semesterId}&academicYearId=${academicYearId}&programId=${programId}&date=${date}`;


    if (paperId) {
        queryString += `&subjectId=${paperId}`;
    }

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const finalUrl = `${TimetableAPI}/attendance/student/report?${queryString}`;
    console.log('=== API Request ===');
    console.log('URL:', finalUrl);
    console.log('Query String:', queryString);

    return fetch(finalUrl, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch student attendance report'
        }));
}

function getSubjectTimetable(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload),
    };

    return fetch(`${TimetableAPI}/admin/academic/card-view/subject-timetable`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch subject timetable'
        }));
}

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

    const url = `${AcademicAPI}/s3/upload`;

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

function getTeacherAttendanceSummaryReports(collegeId, teacherId, startDate, endDate) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };
    // teacher-attendance/teacher/detailed-report
    const url = `${TimetableAPI}/teacher-attendance/teacher/detailed-report` +
        `?collegeId=${collegeId}` +
        `&teacherId=${teacherId}` +
        `&startDate=${startDate}` +
        `&endDate=${endDate}`;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch teacher attendance report'
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

// Get grouped attendance records for polling
function getGroupedAttendance(filters) {
    const { academicYearId, semesterId, divisionId, timeSlotId, date, subjectId } = filters;
    const queryString = `academicYearId=${academicYearId}&semesterId=${semesterId}&divisionId=${divisionId}&timeSlotId=${timeSlotId}&date=${date}&subjectId=${subjectId}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/qr-codes/records?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch grouped attendance'
        }));
}

function getAttendanceBySubject(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/list-attendance-by-subject`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch attendance by subject'
        }));
}

function saveMultipleBulkAttendance(payload) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(payload),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/multiple-bulk-attendance`, requestOptions)
        .then(handlePostResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to save multiple bulk attendance'
        }));
}