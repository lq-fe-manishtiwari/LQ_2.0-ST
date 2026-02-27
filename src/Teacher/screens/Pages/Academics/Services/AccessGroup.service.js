import { authHeader, handleResponse, authHeaderToPost, AcademicAPI, TeacherLoginAPI } from '@/_services/api';

export const AccessGroupService = {
    createAccessGroup,
    updateAccessGroup,
    getAllAccessGroups,
    getAccessGroupById,
    deleteAccessGroup,
    allocateAccessGroupsToUser
};

/**
 * Create a new access group
 * @param {Object} accessGroupData - Access group data
 * @returns {Promise} API response
 */
function createAccessGroup(accessGroupData) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(accessGroupData)
    };
    
    return fetch(`${TeacherLoginAPI}/admin/access-groups`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

/**
 * Update an existing access group
 * @param {number} groupId - Access group ID
 * @param {Object} accessGroupData - Updated access group data
 * @returns {Promise} API response
 */
function updateAccessGroup(groupId, accessGroupData) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(accessGroupData)
    };
    
    return fetch(`${TeacherLoginAPI}/admin/access-groups/${groupId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

/**
 * Get all access groups
 * @param {boolean} includePermissions - Whether to include permissions in response
 * @returns {Promise} API response
 */
function getAllAccessGroups(includePermissions = true) {
    const requestOptions = { 
        method: 'GET', 
        headers: authHeader() 
    };
    
    const url = `${TeacherLoginAPI}/admin/access-groups?includePermissions=${includePermissions}`;
    
    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

/**
 * Get access group by ID
 * @param {number} groupId - Access group ID
 * @param {boolean} includePermissions - Whether to include permissions in response
 * @returns {Promise} API response
 */
function getAccessGroupById(groupId, includePermissions = true) {
    const requestOptions = { 
        method: 'GET', 
        headers: authHeader() 
    };
    
    const url = `${TeacherLoginAPI}/admin/access-groups/${groupId}?includePermissions=${includePermissions}`;
    
    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

/**
 * Delete an access group
 * @param {number} groupId - Access group ID
 * @returns {Promise} API response
 */
function deleteAccessGroup(groupId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    
    return fetch(`${TeacherLoginAPI}/admin/access-groups/${groupId}`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}

/**
 * Allocate access groups to a user
 * @param {number} userId - User ID
 * @param {Array} accessGroupIds - Array of access group IDs
 * @returns {Promise} API response
 */
function allocateAccessGroupsToUser(userId, accessGroupIds) {
    return fetch(`${TeacherLoginAPI}/v1/users/${userId}/access-groups`, {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(accessGroupIds)
    })
    .then(handleResponse);
}
