import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, TimetableAPI, TeacherAcademicAPI } from '../../../../../_services/api';

export const TeacherAttendanceManagement = {
 getStudentAttendanceTimetable
};

function getStudentAttendanceTimetable(params) {
    const { studentId, startDate, endDate } = params;

    const queryString = `studentId=${studentId}&startDate=${startDate}&endDate=${endDate}`;

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(
        `${TimetableAPI}/admin/academic/attendance/student-attendance?${queryString}`,
        requestOptions
    )
        .then(handleResponse)
        .then(data => ({
            success: true,
            data: data,
        }))
        .catch(error => ({
            success: false,
            message: error.message || 'Failed to fetch student attendance report',
        }));
}
