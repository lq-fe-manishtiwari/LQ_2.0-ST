import { apiRequest, DevAPI, COREAPI, authHeader ,ContentAPI} from '../../../../../_services/api';

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
      const response = await fetch(`${COREAPI}/admin/academic/api/subjects/by-tab/${tabId}/academic-year/${academicYearId}/semester/${semesterId}?tabType=${encodeURIComponent(tabType)}`, {
        method: 'GET',
        headers: authHeader()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
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


    /**
   * Fetch unit content for a specific unit
   * @param {string} unitId - The unit ID
   * @returns {Promise} API response with modules and units
   */
  static async getContentByUnits(unitId) {
    try {
      const response = await fetch(`${ContentAPI}/admin/content/unit/${unitId}`, {
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

  /**
   * Fetch quiz data by quiz ID
   * @param {string} quizId - The quiz ID
   * @returns {Promise} API response with quiz data
   */
  static async getQuizById(quizId) {
    try {
      const response = await fetch(`${ContentAPI}/quizzes/${quizId}`, {
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
      console.error('Error fetching quiz data:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answers
   * @param {string} quizId - The quiz ID
   * @param {Object} answers - The quiz answers
   * @param {number} score - The calculated score
   * @returns {Promise} API response
   */
  static async submitQuizAnswers(quizId, answers, score) {
    try {
      const response = await fetch(`${ContentAPI}/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answers,
          score: score,
          submitted_at: new Date().toISOString()
        })
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
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  }

  /**
   * Save quiz result
   * @param {Object} resultData - The quiz result data
   * @returns {Promise} API response
   */
  static async saveQuizResult(resultData) {
    try {
      const response = await fetch(`${ContentAPI}/admin/content-quiz/result`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
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
      console.error('Error saving quiz result:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   * @returns {Promise} API response with user profile
   */
  static async getProfile() {
    try {
      const response = await fetch(`${DevAPI}/profile/me`, {
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
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get quiz results for a specific student and quiz
   * @param {string} contentId - The content ID
   * @param {string} quizId - The quiz ID (optional)
   * @param {string} studentId - The student ID
   * @returns {Promise} API response with quiz results history
   */
  static async getQuizResultsByStudent(contentId, quizId, studentId) {
    try {
      let url = `${ContentAPI}/admin/content-quiz/result?contentId=${contentId}&studentId=${studentId}`;
      if (quizId) {
        url += `&quizId=${quizId}`;
      }

      const response = await fetch(url, {
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
      console.error('Error fetching quiz results by student:', error);
      throw error;
    }
  }
}

export default ContentService;