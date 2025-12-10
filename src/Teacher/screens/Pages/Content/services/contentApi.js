import { apiRequest, DevAPI, COREAPI, authHeader } from '../../../../../_services/api';

/**
 * Content API service for handling teacher content dashboard data
 */
export class ContentApiService {

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
    // /subjects/types-ui/academic-year/{academicYearId}/semester/{semesterId}
    try {
      const response = await fetch(`${COREAPI}/admin/academic/api/teacher/subjects/types-ui/academic-year/${academicYearId}/semester/${semesterId}`, {
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

  /**
   * Fetch subjects by tab for a specific academic year and semester
   * @param {string} tabId - The tab ID
   * @param {string} academicYearId - The academic year ID
   * @param {string} semesterId - The semester ID
   * @param {string} tabType - The tab type name
   * @returns {Promise} API response with subjects
   */
  static async getSubjectsByTab(tabId, academicYearId, semesterId, tabType) {
    try {
      const response = await fetch(`${COREAPI}/admin/academic/api/subjects/by-tab/${tabId}/academic-year/${academicYearId}/semester/${semesterId}?tabType=${tabType}`, {
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
      console.error('Error fetching subjects by tab:', error);
      throw error;
    }
  }

  /**
   * Fetch modules and units for a specific subject
   * @param {string} subjectId - The subject ID
   * @returns {Promise} API response with modules and units
   */
  static async getModulesAndUnits(subjectId) {
    try {
      const response = await fetch(`${COREAPI}/admin/academic/api/subjects/${subjectId}/modules-units`, {
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
      console.error('Error fetching modules and units:', error);
      throw error;
    }
  }

}

export default ContentApiService;