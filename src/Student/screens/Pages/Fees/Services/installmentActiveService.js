import { FinanceAPI } from '../../../../../_services/api';
import { authHeaderToPost } from '../../../../../_services/api';

/**
 * Check if installment is active for a given allocation
 * @param {number} allocationId - Fee allocation ID
 * @returns {Promise<boolean>} True if installment system is active
 */
export const checkInstallmentActiveStatus = async (allocationId) => {
    try {
        const response = await fetch(`${FinanceAPI}/installment-active/status/${allocationId}`, {
            headers: authHeaderToPost(),
        });

        if (!response.ok) {
            return false;
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking installment active status:', error);
        // Return false on error to maintain default behavior
        return false;
    }
};
