import { apiRequest, DevAPI,COREAPI, authHeader } from '../../../../../_services/api';

/**
 * Content API service for handling teacher content dashboard data
 */
export class ContentService {
  
  /**
   * Fetch allocated programs for a teacher
   * @param {string} teacherId - The teacher's ID
   * @returns {Promise} API response with allocated programs
   */
  static async getAllocatedPrograms(teacherId) {
    try {
      const response = await fetch(`${DevAPI}/teacher/allocated-program/${teacherId}`, {
        method: 'GET',
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching allocated programs:', error);
      throw error;
    }
  }

  /**
   * Fetch subject types for a specific program and semester
   * @param {string} academicYearId - The program ID
   * @param {string} semesterId - The semester ID
   * @returns {Promise} API response with subject types
   */
  static async getSubjectTypes(academicYearId, semesterId) {
    // /api/student/subjects/types-ui/academic-year/{academicYearId}/semester/{semesterId}
    try {
      const response = await fetch(`${COREAPI}/admin/academic/api/student/subjects/types-ui/academic-year/${academicYearId}/semester/${semesterId}`, {
        method: 'GET',
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching subject types:', error);
      throw error;
    }
  }


}

export default ContentService;