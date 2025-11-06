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