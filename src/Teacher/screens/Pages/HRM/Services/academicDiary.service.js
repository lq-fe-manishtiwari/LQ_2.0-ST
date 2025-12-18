// User Profile Service
import { authHeader, handleResponse, authHeaderToPost, PMSNEWAPI } from '@/_services/api';

/**
 * 🔹 Temporary hardcoded data
 * 🔹 API aane ke baad sirf fetch uncomment karna h
 */
const HARDCODED_TEACHERS = [
    {
        teacher_id: 1,
        program_id: 40,
        name: "Dr. Amit Sharma",
        department: "Computer Science",
        designation: "Associate Professor",
        qualification: "PhD (CS)",
        dob: "1985-03-15",
        appointment_date: "2015-07-01",
        phone: "022-234567",
        mobile: "9876543210",
        email: "amit.sharma@college.edu",
        address_local: "Mumbai",
        address_permanent: "Jaipur"
    },
    {
        teacher_id: 2,
        program_id: 40,
        name: "Ms. Neha Verma",
        department: "Computer Science",
        designation: "Assistant Professor",
        qualification: "M.Tech",
        dob: "1990-08-22",
        appointment_date: "2019-06-15",
        phone: "022-987654",
        mobile: "9123456789",
        email: "neha.verma@college.edu",
        address_local: "Pune",
        address_permanent: "Lucknow"
    },
    {
        teacher_id: 3,
        program_id: 40,
        name: "Dr. Rakesh Kumar",
        department: "Mechanical",
        designation: "Professor",
        qualification: "PhD (Mechanical)",
        dob: "1978-01-10",
        appointment_date: "2010-01-20",
        phone: "011-445566",
        mobile: "9988776655",
        email: "rakesh.kumar@college.edu",
        address_local: "Delhi",
        address_permanent: "Patna"
    }
];

export const teacherProfileService = {
    getTeachersByProgram,
    getTeacherProfileById
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
