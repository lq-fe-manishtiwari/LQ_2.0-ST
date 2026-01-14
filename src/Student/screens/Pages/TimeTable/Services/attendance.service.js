import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, TimetableAPI } from '../../../../../_services/api';

export const StudentAttendanceManagement = {
    markAttendance
};

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
