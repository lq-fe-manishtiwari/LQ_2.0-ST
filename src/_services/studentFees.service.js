import { FinanceAPI, authHeader, handleResponse } from './api';

class StudentFeesService {
    /**
     * Get all complete allocation details by student ID
     * @param {number|string} studentId 
     * @returns {Promise<Array>} List of fee allocations
     */
    async getStudentFeeAllocations(studentId) {
        if (!studentId) {
            throw new Error('Student ID is required');
        }

        const requestOptions = {
            method: 'GET',
            headers: authHeader(),
        };

        try {
            const response = await fetch(`${FinanceAPI}/admin/student-fee-allocations/student/${studentId}`, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            console.error(`Error fetching fees for student ${studentId}:`, error);
            throw error;
        }
    }
}

const studentFeesService = new StudentFeesService();
export default studentFeesService;
