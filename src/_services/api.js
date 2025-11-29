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
  forgotPassword
};

// ✅ MAIN LOGIN FUNCTION (GLOBAL!)
export function login(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(`${DevAPI}/auth`, requestOptions) 
    .then(handleLoginResponse)
    .then((user) => {
      const decoded = jwtDecode(user.token);
      localStorage.setItem("currentUser", JSON.stringify(decoded));
      localStorage.setItem("refreshToken", JSON.stringify(user));
      localStorage.setItem("show_payment_popup", "1");
      
      currentUserSubject.value = decoded;
      currentUserToken.value = user;
      
      return decoded;
    });
}

// ✅ LOGOUT FUNCTION
export function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("show_payment_popup");
  
  currentUserSubject.value = null;
  currentUserToken.value = null;
  
  // Redirect to login
  window.location.href = '/';
}
// ✅ Forgot Password FUNCTION
export function forgotPassword(data) {
  const requestOptions = {
    method: "POST",
    headers:  authHeaderToPost(),
    body: JSON.stringify(data),
  };

  return fetch(
    `${DevAPI}/auth/forgot-password`,
    requestOptions
  ).then((result) => {
    return result;
  });
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
        authenticationService.logout();
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
        authenticationService.logout();
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

// ========== DEV API HELPER ==========
export const DevAPI = import.meta.env.VITE_API_URL;
// ========== DEFAULT FETCH HELPER ==========
export function apiRequest(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers
    }
  };
  return fetch(`${DevAPI}${url}`, config);
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

  return fetch(`${DevAPI}${endpoint}`, requestOptions)
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

  return fetch(`https://lq-new-api.learnqoch.com/user/teacher/${teacherId}`, requestOptions)
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

  return fetch(`${DevAPI}/graphql`, requestOptions)
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

// Enhanced API object with user profile methods
export const api = {
  getUserProfile,
  updateUserProfile,
  getTeacherAllocatedPrograms,
  getStudentsByFilters,
  // Add other existing functions if needed
  request: apiRequest,
};