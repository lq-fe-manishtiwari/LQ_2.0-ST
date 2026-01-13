import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, TimetableAPI, TeacherAcademicAPI } from '../../../../../_services/api';

export const AttendanceManagement = {
    saveDailyAttendance,
    getAttendanceStudents,
    getTimeSlots,
};

function saveDailyAttendance(attendanceData) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(attendanceData),
    };

    return fetch(`${TeacherAcademicAPI}/attendance/save`, requestOptions)
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