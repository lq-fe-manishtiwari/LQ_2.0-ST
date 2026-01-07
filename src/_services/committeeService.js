import { authHeader, handleResponse, TimetableAPI } from './api';
export const userCommitteeService = {
    getMyCommittees,
    getMyMeetings,
    getCommitteeDetails,
    getCommitteeMeetings,
    getMeetingDetails,
    getMeetingAttendance,
    getMeetingMinutes,
    downloadMeetingReport
};
async function getMyCommittees(userId, userType) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/user/committee/my-committees?userId=${userId}&userType=${userType}`, requestOptions);
    return handleResponse(response);
}

async function getMyMeetings(userId, userType) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/user/committee/my-meetings?userId=${userId}&userType=${userType}`, requestOptions);
    return handleResponse(response);
}

async function getCommitteeDetails(committeeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/user/committee/${committeeId}`, requestOptions);
    return handleResponse(response);
}

async function getCommitteeMeetings(committeeId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/user/committee/${committeeId}/meetings`, requestOptions);
    return handleResponse(response);
}

async function getMeetingDetails(meetingId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/user/committee/meeting/${meetingId}`, requestOptions);
    return handleResponse(response);
}

async function getMeetingAttendance(meetingId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/admin/academic/committee/meeting/${meetingId}/attendance`, requestOptions);
    return handleResponse(response);
}

async function getMeetingMinutes(meetingId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/admin/academic/committee/meeting/${meetingId}/minutes`, requestOptions);
    return handleResponse(response);
}

async function downloadMeetingReport(meetingId) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    const response = await fetch(`${TimetableAPI}/admin/academic/committee/meeting/${meetingId}/report`, requestOptions);

    if (!response.ok) {
        throw new Error('Failed to download report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-report-${meetingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}


