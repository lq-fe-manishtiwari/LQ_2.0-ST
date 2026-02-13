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

    /**
     * Initialize student payment
     * @param {Object} payload - {studentId, allocationId, amount, paymentModeId}
     * @returns {Promise<Object>} Initialization response
     */
    async initializeStudentPayment(payload) {
        const requestOptions = {
            method: 'POST',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch(`${FinanceAPI}/fee-collection/student/initialize`, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error initializing payment:', error);
            throw error;
        }
    }

    /**
     * Finalize student payment
     * @param {number} initializationId 
     * @param {string} transactionReference 
     * @returns {Promise<Object>} Finalization response
     */
    async finalizeStudentPayment(initializationId, transactionReference) {
        const requestOptions = {
            method: 'PUT',
            headers: authHeader(),
        };

        try {
            const response = await fetch(
                `${FinanceAPI}/fee-collection/student/finalize/${initializationId}?transactionReference=${transactionReference}`,
                requestOptions
            );
            return await handleResponse(response);
        } catch (error) {
            console.error('Error finalizing payment:', error);
            throw error;
        }
    }

    /**
     * Create Razorpay order
     * @param {Object} payload - {amount, currency, studentId, allocationId, keyId, keySecret}
     * @returns {Promise<Object>} Razorpay order response
     */
    async createRazorpayOrder(payload) {
        const requestOptions = {
            method: 'POST',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch(`${FinanceAPI}/razorpay/create-order`, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw error;
        }
    }

    /**
     * Collect student fee
     * @param {Object} payload - StudentFeeCollectionRequest
     * @returns {Promise<Object>} Fee collection response
     */
    async collectStudentFee(payload) {
        const requestOptions = {
            method: 'POST',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetch(`${FinanceAPI}/fee-collection/student/collect`, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error collecting fee:', error);
            throw error;
        }
    }
    /**
     * Get active payment modes
     * @returns {Promise<Array>} List of active payment modes
     */
    async getActivePaymentModes() {
        const requestOptions = {
            method: 'GET',
            headers: authHeader(),
        };

        try {
            const response = await fetch(`${FinanceAPI}/admin/payment-modes/active`, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching active payment modes:', error);
            throw error;
        }
    }
}

const studentFeesService = new StudentFeesService();
export default studentFeesService;
