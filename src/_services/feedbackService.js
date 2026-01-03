import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from './api';

/**
 * Enhanced error handling for API calls
 */
const handleApiError = (error, operation) => {
    console.error(`Feedback Service - ${operation}:`, error);

    const enhancedError = new Error(
        error?.message || `Failed to ${operation.toLowerCase()}`
    );

    enhancedError.originalError = error;
    enhancedError.operation = operation;
    enhancedError.timestamp = new Date().toISOString();

    throw enhancedError;
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

export const feedbackService = {
    // User-facing operations
    getMyFeedbackForms,
    getFeedbackFormById,
    submitFeedbackResponse,
    checkSubmissionStatus,
    getMySubmission,

    // Public access
    getPublicFeedback,
};

/**
 * Get feedback forms assigned to logged-in user
 * @param {Object} userProfile - User profile data
 * @returns {Promise<Array>} List of assigned feedback forms
 */
async function getMyFeedbackForms(userProfile) {
    try {
        const requestOptions = { method: 'GET', headers: authHeader() };

        const userType = (userProfile?.user?.user_type || userProfile?.userType || '').toUpperCase();
        const userId = userProfile?.user?.user_id || userProfile?.userId;

        // Build query string
        const params = new URLSearchParams({
            userId: userId,
            userType: userType === 'TEACHER' ? 'Teacher' : userType, // Normalize for backend
        });

        if (userType === 'TEACHER') {
            // For teachers, only send departmentId as requested
            if (userProfile.departmentId) params.append('departmentId', userProfile.departmentId);
        } else {
            // For others (Students, Parents, etc.), send all filters
            if (userProfile.programId) params.append('programId', userProfile.programId);
            if (userProfile.batchId) params.append('batchId', userProfile.batchId);
            if (userProfile.semesterId) params.append('semesterId', userProfile.semesterId);
            if (userProfile.departmentId) params.append('departmentId', userProfile.departmentId);
            if (userProfile.academicYearId) params.append('academicYearId', userProfile.academicYearId);
            if (userProfile.divisionId) params.append('divisionId', userProfile.divisionId);
        }

        const url = `${AcademicAPI}/admin/academic/feedback/my-forms?${params.toString()}`;
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get My Feedback Forms');
    }
}

/**
 * Get feedback form by ID
 * @param {string|number} id - Feedback form ID
 * @returns {Promise<Object>} Feedback form details
 */
async function getFeedbackFormById(id) {
    try {
        validateParams({ id }, 'Get Feedback Form By ID');

        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${AcademicAPI}/admin/academic/feedback/forms/${id}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Feedback Form By ID');
    }
}

/**
 * Submit feedback response
 * @param {Object} submissionData - Feedback submission data
 * @param {number} submissionData.feedbackFormId - Form ID
 * @param {number} submissionData.userId - User ID
 * @param {string} submissionData.userType - User type
 * @param {Array} submissionData.answers - Array of answers
 * @returns {Promise<Object>} Submission result
 */
async function submitFeedbackResponse(submissionData) {
    try {

        console.log('Submitting feedback:', submissionData);

        const payload = {
            ...submissionData,
            user_id: submissionData.user_id || submissionData.user?.user_id,
            user_type: submissionData.user_type || submissionData.user?.user_type
        };

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(payload),
        };

        const response = await fetch(`${AcademicAPI}/admin/academic/feedback/submit`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Submit Feedback Response');
    }
}

/**
 * Check if user has submitted response for a form
 * @param {number} formId - Feedback form ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Submission status
 */
async function checkSubmissionStatus(formId, userId) {
    try {
        validateParams({ formId, userId }, 'Check Submission Status');

        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(
            `${AcademicAPI}/admin/academic/feedback/forms/${formId}/check-submission?userId=${userId}`,
            requestOptions
        );
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Check Submission Status');
    }
}

/**
 * Get user's submission for a form
 * @param {number} responseId - Response ID
 * @returns {Promise<Object>} Response details
 */
async function getMySubmission(responseId) {
    try {
        validateParams({ responseId }, 'Get My Submission');

        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${AcademicAPI}/admin/academic/feedback/responses/${responseId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get My Submission');
    }
}

/**
 * Get public feedback form by code (no authentication required)
 * @param {string} code - Feedback form code
 * @param {number} feedbackFormId - Optional feedback form ID for verification
 * @returns {Promise<Object>} Public feedback form
 */
async function getPublicFeedback(code, feedbackFormId = null) {
    try {
        validateParams({ code }, 'Get Public Feedback');

        // Build URL with optional feedbackFormId query parameter
        let url = `${AcademicAPI}/admin/academic/public/feedback/forms/${code}`;
        if (feedbackFormId) {
            url += `?feedbackFormId=${feedbackFormId}`;
        }

        const requestOptions = { method: 'GET' };
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        handleApiError(error, 'Get Public Feedback');
    }
}
