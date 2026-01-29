import { authHeader, handleResponse, authHeaderToPost, TeacherLoginAPI } from '@/_services/api';
const API_BASE = `${TeacherLoginAPI}`;

// ============================================
// UTILITY FUNCTIONS
// ============================================

const handleApiError = (error, operation) => {
    console.error(`Placement Service - ${operation}:`, error);
    const enhancedError = new Error(error?.message || `Failed to ${operation.toLowerCase()}`);
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    enhancedError.timestamp = new Date().toISOString();
    throw enhancedError;
};

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

// ============================================
// COMPANY SERVICES
// ============================================

async function createCompany(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            company_name: data.company_name,
            email: data.email,
            phone: data.phone,
            industry: data.industry
        }, 'Create Company');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/companies`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Company');
    }
}

async function getAllCompanies(collegeId) {
    try {
        validateParams({ collegeId }, 'Get All Companies');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/companies/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get All Companies');
    }
}

async function getCompaniesByStatus(collegeId, status) {
    try {
        validateParams({ collegeId, status }, 'Get Companies By Status');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/companies/college/${collegeId}/status/${status}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Companies By Status');
    }
}

async function getCompanyById(companyId) {
    try {
        validateParams({ companyId }, 'Get Company By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/companies/${companyId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Company By ID');
    }
}

async function updateCompany(companyId, data) {
    try {
        validateParams({ companyId }, 'Update Company');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/companies/${companyId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Company');
    }
}

async function deleteCompany(companyId) {
    try {
        validateParams({ companyId }, 'Delete Company');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/companies/${companyId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Company');
    }
}

// ============================================
// PLACEMENT JOB ROLES SERVICES
// ============================================

async function createJobRole(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            role_name: data.role_name,
            job_code: data.job_code,
            job_category_id: data.job_category_id
        }, 'Create Job Role');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/placement-job-roles`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Job Role');
    }
}

async function updateJobRole(roleId, data) {
    try {
        validateParams({ roleId }, 'Update Job Role');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/placement-job-roles/${roleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Job Role');
    }
}

async function getJobRoleById(roleId) {
    try {
        validateParams({ roleId }, 'Get Job Role By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-job-roles/${roleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Job Role By ID');
    }
}

async function getJobRolesByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Job Roles By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-job-roles/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Job Roles By College');
    }
}

async function deleteJobRole(roleId) {
    try {
        validateParams({ roleId }, 'Delete Job Role');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-job-roles/${roleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Job Role');
    }
}

// ============================================
// ELIGIBILITY CRITERIA SERVICES
// ============================================

async function createEligibilityCriteria(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            criteria_name: data.criteria_name
        }, 'Create Eligibility Criteria');
        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/eligibility-criteria`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Eligibility Criteria');
    }
}

async function updateEligibilityCriteria(criteriaId, data) {
    try {
        validateParams({ criteriaId }, 'Update Eligibility Criteria');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/eligibility-criteria/${criteriaId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Eligibility Criteria');
    }
}

async function getEligibilityCriteriaById(criteriaId) {
    try {
        validateParams({ criteriaId }, 'Get Eligibility Criteria By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/eligibility-criteria/${criteriaId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Eligibility Criteria By ID');
    }
}

async function getEligibilityCriteriaByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Eligibility Criteria By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/eligibility-criteria/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Eligibility Criteria By College');
    }
}

async function getAllEligibilityCriteria() {
    try {
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/eligibility-criteria`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get All Eligibility Criteria');
    }
}

async function deleteEligibilityCriteria(criteriaId) {
    try {
        validateParams({ criteriaId }, 'Delete Eligibility Criteria');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/eligibility-criteria/${criteriaId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Eligibility Criteria');
    }
}

// ============================================
// PLACEMENT RULES SERVICES
// ============================================

async function createPlacementRule(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            rule_name: data.rule_name
        }, 'Create Placement Rule');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/placement-rules`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Placement Rule');
    }
}

async function updatePlacementRule(ruleId, data) {
    try {
        validateParams({ ruleId }, 'Update Placement Rule');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/placement-rules/${ruleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Placement Rule');
    }
}

async function getPlacementRuleById(ruleId) {
    try {
        validateParams({ ruleId }, 'Get Placement Rule By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-rules/${ruleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Placement Rule By ID');
    }
}

async function getPlacementRulesByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Placement Rules By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-rules/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Placement Rules By College');
    }
}

async function getActivePlacementRulesByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Active Placement Rules By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-rules/college/${collegeId}/active`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Active Placement Rules By College');
    }
}

async function updatePlacementRuleStatus(ruleId, isActive) {
    try {
        validateParams({ ruleId }, 'Update Placement Rule Status');
        // Ensure isActive is explicitly converted to boolean
        const isActiveBool = Boolean(isActive);
        const requestOptions = {
            method: 'PATCH',
            headers: {
                ...authHeader(),
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(`${API_BASE}/placement-rules/${ruleId}/status?isActive=${isActiveBool}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Placement Rule Status');
    }
}

async function deletePlacementRule(ruleId) {
    try {
        validateParams({ ruleId }, 'Delete Placement Rule');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-rules/${ruleId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Placement Rule');
    }
}

// ============================================
// PLACEMENT POLICIES SERVICES
// ============================================

async function createPlacementPolicy(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            policy_name: data.policy_name
        }, 'Create Placement Policy');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/placement-policies`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Placement Policy');
    }
}

async function updatePlacementPolicy(policyId, data) {
    try {
        validateParams({ policyId }, 'Update Placement Policy');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/placement-policies/${policyId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Placement Policy');
    }
}

async function getPlacementPoliciesByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Placement Policies By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-policies/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Placement Policies By College');
    }
}

async function searchPlacementPolicies(collegeId, searchTerm) {
    try {
        validateParams({ collegeId }, 'Search Placement Policies');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const queryParams = new URLSearchParams({ collegeId, searchTerm }).toString();
        const response = await fetch(`${API_BASE}/placement-policies/search?${queryParams}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Search Placement Policies');
    }
}

async function deletePlacementPolicy(policyId) {
    try {
        validateParams({ policyId }, 'Delete Placement Policy');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/placement-policies/${policyId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Placement Policy');
    }
}

// ============================================
// JOB OPENING SERVICES
// ============================================

async function createJobOpening(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            company_id: data.company_id
        }, 'Create Job Opening');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/job-openings`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Job Opening');
    }
}

async function getCoordinators(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Coordinators');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/coordinators/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Coordinators');
    }
}

// ============================================
// INTERVIEW ROUNDS SERVICES
// ============================================

async function createInterviewRound(data) {
    try {
        validateParams({ 
            college_id: data.college_id,
            round_name: data.round_name,
            round_type: data.round_type
        }, 'Create Interview Round');

        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_BASE}/interview-rounds`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Interview Round');
    }
}

async function updateInterviewRound(roundId, data) {
    try {
        validateParams({ roundId }, 'Update Interview Round');
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/interview-rounds/${roundId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Interview Round');
    }
}

async function getInterviewRoundsByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Interview Rounds By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/interview-rounds/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Interview Rounds By College');
    }
}

async function getInterviewRoundById(roundId) {
    try {
        validateParams({ roundId }, 'Get Interview Round By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/interview-rounds/${roundId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Interview Round By ID');
    }
}

async function getInterviewRoundsByCollegeAndType(collegeId, roundType) {
    try {
        validateParams({ collegeId, roundType }, 'Get Interview Rounds By College And Type');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/interview-rounds/college/${collegeId}/type/${roundType}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Interview Rounds By College And Type');
    }
}

async function deleteInterviewRound(roundId) {
    try {
        validateParams({ roundId }, 'Delete Interview Round');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/interview-rounds/${roundId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Interview Round');
    }
}

// ============================================
// STAFF SERVICES
// ============================================

async function getStaffByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Staff By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/admin/other-staff/by-college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Staff By College');
    }
}

// ============================================
// REGISTRATION FORM SERVICES
// ============================================

async function createRegistrationForm(collegeId, data) {
    try {
        validateParams({ collegeId }, 'Create Registration Form');
        const requestOptions = {
            method: 'POST',
            headers: authHeaderToPost(),
            body: JSON.stringify(data)
        };
        const response = await fetch(`${API_BASE}/registration-forms?collegeId=${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Create Registration Form');
    }
}

async function updateRegistrationForm(formId, collegeId = null, data = null) {
    try {
        validateParams({ formId }, 'Update Registration Form');
        const url = collegeId 
            ? `${API_BASE}/registration-forms/${formId}?collegeId=${collegeId}`
            : `${API_BASE}/registration-forms/${formId}`;
        const requestOptions = {
            method: 'PUT',
            headers: authHeaderToPost(),
            body: data ? JSON.stringify(data) : undefined
        };
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Update Registration Form');
    }
}

async function getRegistrationFormById(formId) {
    try {
        validateParams({ formId }, 'Get Registration Form By ID');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/registration-forms/${formId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Registration Form By ID');
    }
}

async function getAllRegistrationForms() {
    try {
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/registration-forms`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get All Registration Forms');
    }
}

async function getRegistrationFormsByCollege(collegeId) {
    try {
        validateParams({ collegeId }, 'Get Registration Forms By College');
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/registration-forms/college/${collegeId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Registration Forms By College');
    }
}

async function deleteRegistrationForm(formId) {
    try {
        validateParams({ formId }, 'Delete Registration Form');
        const requestOptions = { method: 'DELETE', headers: authHeader() };
        const response = await fetch(`${API_BASE}/registration-forms/${formId}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Delete Registration Form');
    }
}

// ============================================
// STUDENT SERVICES
// ============================================

async function getActiveStudentsByProgramCollege(collegeId, programIds) {
    try {
        validateParams({ collegeId, programIds }, 'Get Active Students By Program College');
        const programIdsStr = Array.isArray(programIds) ? programIds.join(',') : programIds;
        const requestOptions = { method: 'GET', headers: authHeader() };
        const response = await fetch(`${API_BASE}/admin/students/active-by-program-college?collegeId=${collegeId}&programIds=${programIdsStr}`, requestOptions);
        return handleResponse(response);
    } catch (error) {
        handleApiError(error, 'Get Active Students By Program College');
    }
}

// ============================================
// EXPORT ALL SERVICES
// ============================================

export const placementService = {
    // Company Services
    createCompany,
    getAllCompanies,
    getCompaniesByStatus,
    getCompanyById,
    updateCompany,
    deleteCompany,

    // Job Role Services
    createJobRole,
    updateJobRole,
    getJobRoleById,
    getJobRolesByCollege,
    deleteJobRole,

    // Eligibility Criteria Services
    createEligibilityCriteria,
    updateEligibilityCriteria,
    getEligibilityCriteriaById,
    getEligibilityCriteriaByCollege,
    getAllEligibilityCriteria,
    deleteEligibilityCriteria,

    // Placement Rules Services
    createPlacementRule,
    updatePlacementRule,
    getPlacementRuleById,
    getPlacementRulesByCollege,
    getActivePlacementRulesByCollege,
    updatePlacementRuleStatus,
    deletePlacementRule,

    // Placement Policies Services
    createPlacementPolicy,
    updatePlacementPolicy,
    getPlacementPoliciesByCollege,
    searchPlacementPolicies,
    deletePlacementPolicy,

    // Job Opening Services
    createJobOpening,
    getCoordinators,

    // Interview Rounds Services
    createInterviewRound,
    updateInterviewRound,
    getInterviewRoundsByCollege,
    getInterviewRoundById,
    getInterviewRoundsByCollegeAndType,
    deleteInterviewRound,

    // Staff Services
    getStaffByCollege,

    // Student Services
    getActiveStudentsByProgramCollege,

    // Registration Form Services
    createRegistrationForm,
    updateRegistrationForm,
    getRegistrationFormById,
    getAllRegistrationForms,
    getRegistrationFormsByCollege,
    deleteRegistrationForm
};
