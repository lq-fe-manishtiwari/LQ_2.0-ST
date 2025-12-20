import { authHeader, ContentAPI } from '../../../../../_services/api';

/**
 * Service for handling Student Project submissions and retrieval.
 */
export class StudentProjectService {

    /**
     * Submit a new student project
     * @param {Object} projectData - The project data
     * @returns {Promise} API response
     */
    static async submitProject(projectData) {
        try {
            const response = await fetch(`${ContentAPI}/student-project`, {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
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
            console.error('Error submitting project:', error);
            throw error;
        }
    }

    /**
     * Get projects submitted by a student
     * @param {string} studentId - The student ID
     * @returns {Promise} API response with list of projects
     */
    static async getMyProjects(studentId) {
        try {
            const response = await fetch(`${ContentAPI}/student-project/student/${studentId}`, {
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
            console.error('Error fetching student projects:', error);
            throw error;
        }
    }
}

export default StudentProjectService;
