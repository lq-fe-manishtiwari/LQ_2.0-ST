// import { apiClient } from './api';
import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const studentPlacementService = {
  // Get student drive applications by PRN ID
  getStudentDriveApplications: async (prnId = '2141354124') => {
    try {
      const requestOptions = {
        method: 'GET',
        headers: authHeader()
      };
      const response = await fetch(`${AcademicAPI}/api/student-drive-applications/student/${prnId}`, requestOptions);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student drive applications:', error);
      throw error;
    }
  }
};