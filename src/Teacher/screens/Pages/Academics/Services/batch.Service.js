// Class
// import config from 'config';
import { authHeader, handleResponse, TeacherLoginAPI, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const batchService = {
	saveBatch,
	getBatch,
	updateBatch,
	deleteBatch,
	getBatchById,
	getBatchByProgramId,
	getBatchbyUserId,
	getBatchbyCollegeId,

	allocateClassTeacher,
	deallocateClassTeacher,
	getBatchbyProgramIds,
};

function getBatch() {
	// /api/batches
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse);
}

function saveBatch(values) {
	// POST API-/api/batches
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updateBatch(values) {
	// POST   // /: api/batches
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/batches`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function deleteBatch(batchId) {
	// /api/admin/divisions/{id}/soft-delete
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/${batchId}/soft`, requestOptions)
		.then(handleResponse);
}

function getBatchById(batch_id) {
	// /: /api/batches/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/batch/${batch_id}`, requestOptions)
		.then(handleResponse);
}
function getBatchByProgramId(program_is) {
	// /: /api/batches/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/${program_is}`, requestOptions)
		.then(handleResponse);
}

function getBatchbyUserId(userId) {
	// /: /api/admin/academic/batches/user/{userId}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/user/${userId}`, requestOptions)
		.then(handleResponse);
}

function getBatchbyCollegeId(collegeID) {
	// /: /api/admin/academic/batches/user/{userId}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/batches/college/${collegeID}`, requestOptions)
		.then(handleResponse);
}

function allocateClassTeacher(values) {
	// POST API-/api/admin/teachers/allocate
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${TeacherLoginAPI}/admin/teachers/allocate`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function deallocateClassTeacher(allocationId) {
	// POST API-/api/admin/teachers/deallocate/{allocationId}
	const requestOptions = {
		method: 'POST',
		headers: authHeader(),
	};
	return fetch(`${TeacherLoginAPI}/admin/teachers/deallocate/${allocationId}`, requestOptions)
		.then(handleResponse)
		.then(response => {
			return response;
		});
}

function getBatchbyProgramIds(programIds) {
	// POST /api/admin/academic/batches/by-program
	const requestOptions = {
		method: 'GET',
		headers: authHeaderToPost(),
	};
	return fetch(`${AcademicAPI}/batches/by-programs?programIds=${programIds}`, requestOptions)
		.then(handleResponse);
}

