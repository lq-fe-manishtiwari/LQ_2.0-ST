import { jwtDecode } from 'jwt-decode';

// GLOBAL SUBJECTS (BehaviorSubject for currentUser)
let currentUserSubject = null;
let currentUserToken = null;

export function initializeAuth() {
  // BehaviorSubject setup (RxJS ya simple object)
  currentUserSubject = { value: null };
  currentUserToken = { value: null };

  // Load from localStorage on init
  const storedUser = localStorage.getItem('currentUser');
  const storedToken = localStorage.getItem('refreshToken');

  if (storedUser) currentUserSubject.value = JSON.parse(storedUser);
  if (storedToken) currentUserToken.value = JSON.parse(storedToken);
}

// AUTHENTICATION SERVICE OBJECT
export const authenticationService = {
  currentUser: () => currentUserSubject?.value,
  currentUserToken: () => currentUserToken?.value,
  login,
  logout,
  forgotPassword,
  getProfile
};

// ✅ MAIN LOGIN FUNCTION (GLOBAL!)
export function login(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(`${TeacherLoginAPI}/auth`, requestOptions)
    .then(handleLoginResponse)
    .then(async (user) => {
      const decoded = jwtDecode(user.token);
      localStorage.setItem("currentUser", JSON.stringify(decoded));
      localStorage.setItem("refreshToken", JSON.stringify(user));
      localStorage.setItem("show_payment_popup", "1");

      currentUserSubject.value = decoded;
      currentUserToken.value = user;

      // Initialize user profile after successful login
      try {
        const { default: userProfileService } = await import('./userProfile.service.js');
        await userProfileService.initializeAfterLogin();
        console.log('User profile initialized after login');
      } catch (error) {
        console.error('Failed to initialize user profile after login:', error);
        // Don't throw error as login was successful, profile can be fetched later
      }

      return decoded;
    });
}

// ✅ LOGOUT FUNCTION
export function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("show_payment_popup");
  localStorage.removeItem("userProfile"); // Clear profile data
  localStorage.removeItem("userProfileFetched"); // Clear profile fetch status

  currentUserSubject.value = null;
  currentUserToken.value = null;

  // Only redirect if not already on login page to prevent loops
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}
// ✅ Forgot Password FUNCTION
export function forgotPassword(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(
    `${TeacherLoginAPI}/auth/forgot-password`,
    requestOptions
  ).then((result) => {
    return result;
  });
}

// ✅ GET PROFILE FUNCTION
export function getProfile() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(`${TeacherLoginAPI}/profile/me`, requestOptions)
    .then(handleResponse);
}

// ========== RESPONSE HANDLERS ==========
export function handleTextResponse(response) {
  return response.text();
}

export function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        // Only logout if not already on login page
        if (!window.location.pathname.includes('/login')) {
          authenticationService.logout();
        }
      } else if ([400].includes(response.status)) {
        return data;
      }
      const error = (data?.message) || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}

export function handleLoginResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      const error = {
        message: data?.message || response.statusText,
        status: data?.status || response.status
      };
      return Promise.reject(error);
    }
    return data;
  });
}

export function handleFileResponse(response) {
  return response.blob().then(blob => {
    if (!response.ok) {
      return response.text().then(text => {
        const data = text && JSON.parse(text);
        const error = { message: data?.message, status: data?.status };
        return Promise.reject(error);
      });
    }
    return blob;
  });
}

export function handlePostResponse(response) {
  return response.text().then(text => {
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      return Promise.reject({
        message: "Invalid JSON response",
        status: response.status,
        raw: text
      });
    }

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        // Only logout if not already on login page
        if (!window.location.pathname.includes('/login')) {
          authenticationService.logout();
        }
      }
      return Promise.reject(data);
    }
    return data;
  });
}

// ========== AUTH HEADERS (CLEAN & PERFECT!) ==========
export function authHeader() {
  const token = currentUserToken?.value?.token;
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'view': 'web'
    };
  }
  return { 'Content-Type': 'application/json', 'view': 'web' };
}

export function authHeaderToPost() {
  const token = currentUserToken?.value?.token;
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'view': 'web'
    };
  }
  return { 'Content-Type': 'application/json', 'view': 'web' };
}

export function authHeaderToFile() {
  const token = currentUserToken?.value?.token;
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'view': 'web'
    };
  }
  return { 'view': 'web' };
}

export function authHeaderToDownloadReport() {
  const token = currentUserToken?.value?.token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ========== API ENDPOINTS CONFIGURATION ==========
export const AcademicAPI = import.meta.env.VITE_API_URL_Academic;
export const TeacherLoginAPI = import.meta.env.VITE_API_URL_TeacherORLogin;
export const TeacherAcademicAPI = import.meta.env.VITE_API_URL_AcademicAPI;
export const PMSAPI = import.meta.env.VITE_API_URL_HRM;
export const PMSNEWAPI = import.meta.env.VITE_API_URL_HRMNEW;
export const TimetableAPI = import.meta.env.VITE_API_URL_Timetable;
export const COREAPI = import.meta.env.VITE_API_CORE;
export const ContentAPI = import.meta.env.VITE_API_URL_Content;
export const ExamMGMAPI = import.meta.env.VITE_API_URL_ExamMGM;
export const FinanceAPI = import.meta.env.VITE_API_URL_finance;

// Legacy support - defaults to TeacherLoginAPI for backward compatibility
export const DevAPI = TeacherLoginAPI;

// ========== DIFFERENTIATED API HELPERS ==========
export function academicApiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${AcademicAPI}${url}`, config);
}

export function teacherApiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${TeacherLoginAPI}${url}`, config);
}

// ========== DEFAULT FETCH HELPER (Legacy) ==========
export function apiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${TeacherLoginAPI}${url}`, config);
}

// ========== USER PROFILE API FUNCTIONS ==========
export function getUserProfile(userType = null) {
  // Determine the endpoint based on user type
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const type = userType || currentUser?.iss;

  let endpoint = '/profile/me';
  if (type === 'TEACHER') {
    endpoint = '/profile/me';
  } else if (type === 'STUDENT') {
    endpoint = '/profile/me';
  }

  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
  };

  return fetch(`${DevAPI}${endpoint}`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch user profile'
    }));
}

export function updateUserProfile(profileData, userType = null) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const type = userType || currentUser?.iss;

  let endpoint = '/user/profile';
  if (type === 'TEACHER') {
    endpoint = '/teacher/profile';
  } else if (type === 'STUDENT') {
    endpoint = '/student/profile';
  }

  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(profileData),
  };

  return fetch(`${TeacherLoginAPI}${endpoint}`, requestOptions)
    .then(handlePostResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to update user profile'
    }));
}

// ========== TEACHER PROGRAMS API FUNCTIONS ==========
export function getTeacherAllocatedPrograms(teacherId) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
  };

  return fetch(`${TeacherLoginAPI}/teacher/${teacherId}`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch teacher allocated programs'
    }));
}

export function getTeacherAllocatedMentoringClasses(teacherId) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
  };

  return fetch(`${TeacherAcademicAPI}/subjects/mentoring-allocations/collections/mentor/${teacherId}`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch teacher allocated programs'
    }));
}

function getMentoringAllocationsbyCollectionId(collection_id) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${TeacherAcademicAPI}/subjects/mentoring-allocations/students/collection/${collection_id}`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch teacher allocated programs'
    }));
}
// ========== GRAPHQL STUDENTS API FUNCTIONS ==========
export function getStudentsByFilters(programId, academicYearId, semesterId = null, divisionId = null) {
  const query = `
    query StudentsByFilters($programId: ID!, $academicYearId: ID!, $semesterId: ID, $divisionId: ID) {
      studentsByFilters(
        programId: $programId,
        academicYearId: $academicYearId,
        semesterId: $semesterId,
        divisionId: $divisionId
      ) {
        student {
          studentId
          firstname
          lastname
          email
          rollNumber
          admissionNumber
        }
        allocation {
          id
          rollNumber
          academicYear {
            name
            yearNumber
            startDate
            endDate
          }
          semester {
            name
            semesterNumber
          }
        }
      }
    }
  `;

  const variables = {
    programId,
    academicYearId,
    semesterId,
    divisionId
  };

  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify({
      query,
      variables
    }),
  };

  return fetch(`${TeacherLoginAPI}/graphql`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data?.data?.studentsByFilters || []
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch students'
    }));
}

//  Upload file to S3 and get the path
export function uploadFileToS3(file) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${AcademicAPI}/s3/upload`, {
    method: "POST",
    headers: authHeaderToFile(),
    body: formData,
  })
    .then(res => res.ok ? res.text() : res.text().then(err => Promise.reject(new Error(err))))
    .then(text => {
      try { return JSON.parse(text).response || JSON.parse(text).url || text.trim(); }
      catch { return text.trim(); }
    });
}

// ========== TEACHER DASHBOARD API FUNCTION ==========
export function getTeacherDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const teacherId = currentUser?.jti;

  if (!teacherId) {
    return Promise.reject({
      success: false,
      message: 'Teacher ID not found in token'
    });
  }

  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
  };

  return fetch(`${TeacherLoginAPI}/admin/teacher/${teacherId}`, requestOptions)
    .then(handleResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to fetch teacher dashboard'
    }));
}

// Enhanced API object with user profile methods
export const api = {
  getUserProfile,
  updateUserProfile,
  getTeacherAllocatedPrograms,
  getTeacherAllocatedMentoringClasses,
  getMentoringAllocationsbyCollectionId,
  getStudentsByFilters,
  uploadFileToS3,
  getTeacherDashboard,
  // Add other existing functions if needed
  request: apiRequest,
};