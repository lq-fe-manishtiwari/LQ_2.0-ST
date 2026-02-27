import { authHeader, handleResponse, authHeaderToPost ,AcademicAPI,TeacherLoginAPI} from '@/_services/api';
// import { AcademicAPI } from '../../../../_services/api';

export const allocationService = {
    saveAllocation,
    getProgramAllocatedDetailsbyProgramId,
    getAcessGroupByUserId,
    deleteAcessGroupByUserId,
    deleteProgramDivisionAllocationByPCYSD,
};

function saveAllocation(values) {
    // POST /api/admin/program-class-year/allocate
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values)
    };
    return fetch(`${AcademicAPI}/program-class-year/allocate-bulk`, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}
function getAcessGroupByUserId(userId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(
        `${TeacherLoginAPI}/v1/users/${userId}/access-groups`,
        requestOptions
    ).then(handleResponse);
}

function deleteAcessGroupByUserId(userId,accessGroupId) {
    // DELETE /api/v1/users/{userId}/access-groups/{accessGroupId}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${TeacherLoginAPI}/v1/users/${userId}/access-groups/${accessGroupId}`, requestOptions)
        .then(handleResponse);
}

function getProgramAllocatedDetailsbyProgramId(programId) {
    // get /api/admin/program-class-year/program/{programId}
	const requestOptions = { method: 'GET', headers: authHeader() };

    return fetch(`${AcademicAPI}/program-class-year/structure/${programId}`,requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        });
}


function deleteProgramDivisionAllocationByPCYSD(id) {
    // /allocation/{pcysdId}
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${AcademicAPI}/program-class-year/allocation/${id}`, requestOptions)
        .then(handleResponse);
}