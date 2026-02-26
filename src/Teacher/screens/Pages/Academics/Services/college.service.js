import { authHeader, handleResponse, handlePostResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

/**
 * Enhanced error handling for API calls
 */
const handleApiError = (error, operation) => {
  console.error(`College Service - ${operation}:`, error);

  // Create a more descriptive error
  const enhancedError = new Error(
    error?.message || `Failed to ${operation.toLowerCase()}`
  );

  // Preserve original error properties
  enhancedError.originalError = error;
  enhancedError.operation = operation;
  enhancedError.timestamp = new Date().toISOString();

  throw enhancedError;
};

/**
 * Retry mechanism for failed requests
 */
const withRetry = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) throw error;

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Validate required parameters
 */
const validateParams = (params, operation) => {
  const missing = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`${operation}: Missing required parameters: ${missing.join(', ')}`);
  }
};

export const collegeService = {
  // College operations
  getAllColleges,
  submitCollegeRequest,
  deleteCollege,
  getCollegeDetails,
  updateCollege,
  getAllCollegesByUser,

  // Program operations
  getAllprogram,
  getAllProgramByCollegeId,
  saveProgram,
  updateProgrambyID,
  DeleteprogrambyID,
  getProgrambyId,
  getProgrambyUserIdandCollegeId,
  getProgramByCollegeId,
  getSUbjectbyProgramID,
};

/**
 * Get all colleges
 * @returns {Promise<Array>} List of colleges
 */
async function getAllColleges() {
  try {
    return await withRetry(async () => {
      const requestOptions = { method: 'GET', headers: authHeader() };
      const response = await fetch(`${AcademicAPI}/new-colleges`, requestOptions);
      return handleResponse(response);
    });
  } catch (error) {
    handleApiError(error, 'Get All Colleges');
  }
}

/**
 * Get colleges by user ID
 * @param {string|number} userId - User ID
 * @returns {Promise<Array>} List of user's colleges
 */
async function getAllCollegesByUser(userId) {
  try {
    validateParams({ userId }, 'Get Colleges By User');

    return await withRetry(async () => {
      const requestOptions = { method: 'GET', headers: authHeader() };
      const response = await fetch(`${AcademicAPI}/colleges?userId=${userId}`, requestOptions);
      return handleResponse(response);
    });
  } catch (error) {
    handleApiError(error, 'Get Colleges By User');
  }
}

/**
 * Submit new college request
 * @param {Object} values - College data
 * @returns {Promise<Object>} Created college data
 */
async function submitCollegeRequest(values) {
  try {
    validateParams({
      college_name: values?.college_name,
      college_code: values?.college_code,
      college_email: values?.college_email
    }, 'Submit College Request');

    const requestOptions = {
      method: 'POST',
      headers: authHeaderToPost(),
      body: JSON.stringify(values)
    };

    const response = await fetch(`${AcademicAPI}/new-colleges`, requestOptions);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error, 'Submit College Request');
  }
}

/**
 * Get single college details
 * @param {string|number} collegeId - College ID
 * @returns {Promise<Object>} College details
 */
async function getCollegeDetails(collegeId) {
  try {
    validateParams({ collegeId }, 'Get College Details');

    return await withRetry(async () => {
      const requestOptions = { method: "GET", headers: authHeader() };
      const response = await fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions);
      return handleResponse(response);
    });
  } catch (error) {
    handleApiError(error, 'Get College Details');
  }
}

/**
 * Update college details
 * @param {string|number} collegeId - College ID
 * @param {Object} values - Updated college data
 * @returns {Promise<Object>} Updated college data
 */
async function updateCollege(collegeId, values) {
  try {
    validateParams({ collegeId }, 'Update College');

    const requestOptions = {
      method: "PUT",
      headers: authHeaderToPost(),
      body: JSON.stringify(values),
    };

    const response = await fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error, 'Update College');
  }
}

/**
 * Delete college
 * @param {string|number} collegeId - College ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteCollege(collegeId) {
  try {
    validateParams({ collegeId }, 'Delete College');

    const requestOptions = { method: 'DELETE', headers: authHeader() };
    const response = await fetch(`${AcademicAPI}/new-college/${collegeId}`, requestOptions);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error, 'Delete College');
  }
}




// Program 

function getAllprogram() {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs`, requestOptions)
    .then(handleResponse);
}

// /api/admin/programs/by-college/{collegeId}
function getAllProgramByCollegeId(collegeId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs/by-college/${collegeId}`, requestOptions)
    .then(handleResponse);
}

function saveProgram(values) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(values),
  };

  return fetch(`${AcademicAPI}/programs/bulk`, requestOptions)
    .then(handlePostResponse) // This should already throw on !response.ok
    .then(data => {
      if (data?.status === "error") {
        const error = new Error(data.message || "Failed to save program");
        error.response = data;
        throw error;
      }
      return data; // Success
    })
    .catch(err => {
      // Re-throw to be caught in component
      throw err;
    });
}

function DeleteprogrambyID(val) {
  // /api/admin/programs/{id}/soft-delete
  const requestOptions = { method: 'DELETE', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs/` + val + `/soft-delete`, requestOptions)
    .then(handleResponse);
}

function getProgrambyId(Program_id) {
  // api/admin/programs/program/{programId}

  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs/program/${Program_id}`, requestOptions)
    .then(handleResponse);
}
function updateProgrambyID(values) {
  // PUT : /admin/programs
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(values)
  };
  return fetch(`${AcademicAPI}/programs`, requestOptions)
    .then(handlePostResponse)
    .then(role => {
      return role;
    });
}

function getSUbjectbyProgramID(Program_id) {
  // subjects/program/{programId}

  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/subjects/by-program/${Program_id}`, requestOptions)
    .then(handleResponse);
}

function getProgrambyUserIdandCollegeId(userId, collegeId) {
  // /api/admin/academic/programs/allocated/user/{userId}/college/{collegeId}

  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs/allocated/user/${userId}/college/${collegeId}`, requestOptions)
    .then(handleResponse);
}

function getProgramByCollegeId(collegeId) {
  const requestOptions = { method: 'GET', headers: authHeader() };
  return fetch(`${AcademicAPI}/programs/by-college/${collegeId}`, requestOptions)
    .then(handleResponse);
}
