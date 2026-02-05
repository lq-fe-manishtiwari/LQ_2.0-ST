// import { apiClient } from './api';
import { authHeader, handleResponse, authHeaderToPost, TeacherLoginAPI } from '@/_services/api';

const API_BASE_URL = `${TeacherLoginAPI}`;

// Get campus drives for a student
export const getCampusDrivesForStudent = async (studentId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/campus-drives/student/${studentId}`, requestOptions);
  return handleResponse(response);
};

// Get job openings for a student
export const getJobOpeningsForStudent = async (studentId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/job-openings/student/${studentId}`, requestOptions);
  return handleResponse(response);
};

// Create a new student drive application
export const createStudentDriveApplication = async (applicationData) => {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(applicationData)
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications`, requestOptions);
  return handleResponse(response);
};

// Get application by ID
export const getApplicationById = async (applicationId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/${applicationId}`, requestOptions);
  return handleResponse(response);
};

// Get applications by college
export const getApplicationsByCollege = async (collegeId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/college/${collegeId}`, requestOptions);
  return handleResponse(response);
};

// Get applications by drive
export const getApplicationsByDrive = async (driveId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/drive/${driveId}`, requestOptions);
  return handleResponse(response);
};

// Get applications by college and status
export const getApplicationsByCollegeAndStatus = async (collegeId, status) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/college/${collegeId}/status/${status}`, requestOptions);
  return handleResponse(response);
};

// Update application
export const updateApplication = async (applicationId, updateData) => {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify(updateData)
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/${applicationId}`, requestOptions);
  return handleResponse(response);
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  const requestOptions = {
    method: 'PATCH',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/${applicationId}/status?status=${status}`, requestOptions);
  return handleResponse(response);
};

// Delete application
export const deleteApplication = async (applicationId) => {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/${applicationId}`, requestOptions);
  return handleResponse(response);
};

// Get application count for drive
export const getApplicationCountByDrive = async (driveId) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  const response = await fetch(`${API_BASE_URL}/student-drive-applications/count/drive/${driveId}`, requestOptions);
  return handleResponse(response);
};

export const studentPlacementService = {
  // Get student drive applications by PRN ID
  getStudentDriveApplications: async (prnId) => {
    try {
      const requestOptions = {
        method: 'GET',
        headers: authHeader()
      };
      const response = await fetch(`${API_BASE_URL}/student-drive-applications/student/${prnId}`, requestOptions);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student drive applications:', error);
      throw error;
    }
  },
    getRegistrationFormsByCollege: async (collegeId) => {
        try {
          const requestOptions = {
            method: 'GET',
            headers: authHeader()
          };
          const response = await fetch(`${API_BASE_URL}/registration-forms/college/${collegeId}`, requestOptions);
          return handleResponse(response);
        } catch (error) {
          console.error('Error fetching student drive applications:', error);
          throw error;
        }
      },

 getStudentInterviews: async (prnId) => {
    try {
      const requestOptions = {
        method: 'GET',
        headers: authHeader()
      };
      const response = await fetch(`${API_BASE_URL}/student/offers/interviews/prn/${prnId}`, requestOptions);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student drive applications:', error);
      throw error;
    }
  },

   getStudentOfferLetters: async (prnId) => {
    try {
      const requestOptions = {
        method: 'GET',
        headers: authHeader()
      };
      const response = await fetch(`${API_BASE_URL}/student/offers/prn/${prnId}`, requestOptions);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student drive applications:', error);
      throw error;
    }
  },

   updateStudentOfferLetters: async (prnId,placementId,status) => {
    try {
       const requestOptions = {
      method: 'PUT',
      headers: authHeaderToPost(),
      body: JSON.stringify({ offer_status: status })
    };
      const response = await fetch(`${API_BASE_URL}/student/offers/${prnId}/${placementId}/status`, requestOptions);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student drive applications:', error);
      throw error;
    }
  },

};