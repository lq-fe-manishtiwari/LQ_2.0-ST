import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, TimetableAPI } from '../../../../../_services/api';

export const StudentAttendanceManagement = {
    markAttendance,
    checkExistence
};

function checkExistence(params) {
    const { timeSlotId, subjectId, studentId, date } = params;
    const queryString = `timeSlotId=${timeSlotId}&subjectId=${subjectId}&studentId=${studentId}&date=${date}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${TimetableAPI}/admin/academic/attendance/check-existence?${queryString}`, requestOptions)
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to check attendance existence'
        }));
}

function markAttendance(attendanceData) {
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
            message: error.message || 'Failed to mark attendance'
        }));
}
