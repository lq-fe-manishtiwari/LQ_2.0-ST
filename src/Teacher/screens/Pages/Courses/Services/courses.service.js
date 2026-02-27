// Class
// import config from 'config';
import { authHeader, handleResponse, handleTextResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const courseService = {
	getAllCourses,
	getCourseById,
	saveCourse,
	saveBulkCourses,
	deleteCourse,
	updateCourse,
	getSubjectByProgramID,

	getCoursesPaperTypes,
	getPaperTypeById,

	savePaperType,
	updatePaperType,
	softDeletePaperType,
	getCoursesVerticalNumbers,
	getVerticalNumberById,
	saveVerticalNumber,
	updateVerticalNumber,
	softDeleteVerticalNumber,
	getCoursesSubjectMode,
	getSubjectModeById,
	saveSubjectMode,
	updateSubjectMode,
	softDeleteSubjectMode,
	getCoursesSpecialization,
	getSpecializationById,
	saveSpecialization,
	updateSpecialization,
	softDeleteSpecialization,

	//bulk upload
	bulkUploadPapers,
	bulkUploadModule,

	saveModule,
	getAllModules,
	getModuleById,
	getModulesBySubject,
	updateModule,
	softDeleteModule,
	hardDeleteModule,

	// Batch operations
	getBatchesByProgramIds,
	getBatchById,
	getSubjectAllocationsByAcademicYearAndSemester,

	// New APIs for paper creation
	createSubjectAndAllocate,
	createGlobalSubject,
	getSubjectsByCollegeId,
	getGlobalSubjectsByCollegeId,
	allocateSubject,
	deallocateSubject,

	updateNonGlobalSubject,
	getNonGlobalSubject,

	//UNIT
	saveUnit,
	updateUnit,
	bulkUploadUnit,
	getAllUnits,
	getUnitById,
	deleteUnit,
	getUnitsByModuleId,
	getModulesByCollegeId,
	getUnitsByCollegeId,
	getFilteredModules,
	getFilteredUnits,
	getFilteredPapers,

};


// GET /api/admin/academic/subjects/non-global/12
function getNonGlobalSubject(subjectId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/subjects/non-global/${subjectId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// PUT /api/admin/academic/subjects/non-global/{subjectId}
function updateNonGlobalSubject(subjectId, values) {
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/non-global/${subjectId}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}
// GET /api/admin/subjects 
function getAllCourses() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects`, requestOptions)
		.then(handleResponse);
}

function getCourseById(paperId) {
	// GET /api/admin/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/${paperId}`, requestOptions)
		.then(handleResponse);
}

// POST /api/admin/subjects/create
function saveCourse(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/create`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// POST /api/admin/subjects/bulk-upload 
function saveBulkCourses(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/bulk-upload`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function deleteCourse(subjectId) {
	//  /api/admin/subjects/soft/{subjectId} 
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects/soft/${subjectId}`, requestOptions)
		.then(handleResponse);
}

function updateCourse(subjectId, values) {
	//   PUT /api/admin/subjects/edit/{id} 
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/edit/${subjectId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

function getSubjectByProgramID(programId) {
	// GET- /api/admin/academic/subjects/program/{programId} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subjects/by-program/${programId}`, requestOptions)
		.then(handleResponse);
}

// SUBJECT TYPE

// GET- /api/admin/subject-type 
function getCoursesPaperTypes() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-type`, requestOptions)
		.then(handleResponse);
}

function getPaperTypeById(paperTypeId) {
	// GET /api/admin/subject-type/{id}
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-type/${paperTypeId}`, requestOptions)
		.then(handleResponse);
}

// POST /api/admin/subject-type/create
function savePaperType(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-type/create`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updatePaperType(paperTypeId, values) {
	// PUT- /api/admin/academic/subject-type/{id} 
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-type/${paperTypeId}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}



// DELETE - /api/admin/subject-type/soft/{id}
function softDeletePaperType(id) {
	return fetch(`${AcademicAPI}/subject-type/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	})
}

//   VERTICAL NUMBER

//GET- /api/admin/vertical-type 
function getCoursesVerticalNumbers() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/vertical-type`, requestOptions)
		.then(handleResponse);
}

function getVerticalNumberById(verticalNumberId) {
	// GET BY vertical type /api/admin/academic/vertical-type/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/vertical-type/${verticalNumberId}`, requestOptions)
		.then(handleResponse);
}

// POST /api/admin/vertical-type/create
function saveVerticalNumber(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/vertical-type/create`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updateVerticalNumber(verticalNumberId, values) {
	// PUT- /api/admin/academic/vertical-type/{id} 
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/vertical-type/${verticalNumberId}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}


// /api/admin/vertical-type/soft/{id} 
function softDeleteVerticalNumber(id) {
	return fetch(`${AcademicAPI}/vertical-type/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	})
}




//   SUBJECT MODE

//GET /api/admin/subject-mode 
function getCoursesSubjectMode() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-mode`, requestOptions)
		.then(handleResponse);
}

function getSubjectModeById(subjectModeId) {
	// GET By subject Mode id /api/admin/academic/subject-mode/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/subject-mode/${subjectModeId}`, requestOptions)
		.then(handleResponse);
}

// POST /api/admin/subject-mode/create
function saveSubjectMode(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-mode/create`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updateSubjectMode(subjectModeId, values) {
	// PUT- /api/admin/academic/subject-mode/{id}
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-mode/${subjectModeId}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// DELETE - /api/admin/subject-mode/soft/{id}
function softDeleteSubjectMode(id) {
	return fetch(`${AcademicAPI}/subject-mode/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
}





// SPECIALIZATION

// GET ALL /api/admin/academic/specialization  
function getCoursesSpecialization() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/specialization`, requestOptions)
		.then(handleResponse);
}

function getSpecializationById(specializationId) {
	// GET By subject Mode id /api/admin/academic/specialization/{id} 
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/specialization/${specializationId}`, requestOptions)
		.then(handleResponse);
}

// POST /api/admin/academic/specialization
function saveSpecialization(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/specialization`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function updateSpecialization(specializationId, values) {
	// PUT- /api/admin/academic/specialization/{id}
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/specialization/${specializationId}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// DELETE-/api/admin/academic/specialization/soft/{id} 
function softDeleteSpecialization(id) {
	return fetch(`${AcademicAPI}/specialization/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
}

// BULK UPLOAD
function bulkUploadPapers(values) {
	// POST  /api/admin/subjects/bulk-upload
	const requestOptions = {
		method: "POST",
		headers: authHeaderToPost(),
		body: JSON.stringify(values),
	};
	return fetch(`${AcademicAPI}/subjects/bulk-upload`, requestOptions)
		.then(handleResponse)
		.then((res) => {
			return res;
		});
}

//-------------MODULE-------------

// POST api/admin/module-unit/module 
function saveModule(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/module-unit/module`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

// GET- /api/admin/module-unit/modules 
function getAllModules() {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/modules`, requestOptions)
		.then(handleResponse);
}

// BULK UPLOAD
function bulkUploadModule(values) {
	// POST  /api/admin/module-unit/module/bulk
	const requestOptions = {
		method: "POST",
		headers: authHeaderToPost(),
		body: JSON.stringify(values),
	};
	return fetch(`${AcademicAPI}/module-unit/module/bulk`, requestOptions)
		.then(handleResponse)
		.then((res) => {
			return res;
		});
}

// GET api/admin/academic/module-unit/college/{collegeID}
function getModulesByCollegeId(collegeId) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/college/${collegeId}`, requestOptions)
		.then(handleResponse);
}

//-------------UNIT-------------

//GET- /api/admin/module-unit/module/{id} 
function getModuleById(id) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/module/${id}`, requestOptions)
		.then(handleResponse);
}
//GET- api/admin/academic/api/subjects/{subjectId}/modules
function getModulesBySubject(subjectId) {
	const requestOptions = { method: 'GET', headers: authHeader() };
	return fetch(`${AcademicAPI}/api/subjects/${subjectId}/modules`, requestOptions)
		.then(handleResponse);
}

//PUT- /api/admin /module-unit/module/{id} 
function updateModule(id, values) {
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/module-unit/module/${id}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

//DELETE- /api/admin/module-unit/module/soft/{id} 
function softDeleteModule(id) {
	return fetch(`${AcademicAPI}/module-unit/module/soft/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	});
}

//DELETE- /api/admin/academic/module-unit/module/hard/{id} 
function hardDeleteModule(id) {
	return fetch(`${AcademicAPI}/module-unit/module/hard/${id}`, {
		method: "DELETE",
		headers: { ...authHeader(), "Content-Type": "application/json" },
	})
		.then(response => {
			if (!response.ok) {
				return response.text().then(text => {
					try {
						const json = JSON.parse(text);
						if (json.message && (json.message.includes('constraint') || json.message.includes('ConstraintViolationException'))) {
							throw new Error('Cannot delete this module because it has associated units or content. Please delete the related data first.');
						}
						throw new Error(json.message || 'Failed to delete module');
					} catch (parseError) {
						if (text.includes('constraint') || text.includes('ConstraintViolationException')) {
							throw new Error('Cannot delete this module because it has associated units or content. Please delete the related data first.');
						}
						throw new Error(text || 'Failed to delete module');
					}
				});
			}
			return response.text().then(text => {
				try {
					return JSON.parse(text);
				} catch {
					return text;
				}
			});
		});
}

// POST /api/admin/batches-by-programs
function getBatchesByProgramIds(programIds) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(programIds)
	};
	return fetch(`${AcademicAPI}/subject-allocation/batches-by-programs`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// POST /api/admin/subject-allocation/create-and-allocate
function createSubjectAndAllocate(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-allocation/create-and-allocate`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// POST /api/admin/subjects/create (for global papers)
function createGlobalSubject(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subjects/create`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/subjects/{collegeId}
function getSubjectsByCollegeId(collegeId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/subjects/${collegeId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/academic/subjects/{collegeId}/global
function getGlobalSubjectsByCollegeId(collegeId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/subjects/${collegeId}/global`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// POST /api/admin/subject-allocation/allocate
function allocateSubject(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/subject-allocation/allocate`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// DELETE /api/admin/subject-allocation/soft/{id}
function deallocateSubject(allocationId) {
	const requestOptions = {
		method: 'DELETE',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/subject-allocation/deallocate/${allocationId}`, requestOptions)
		.then(handleTextResponse);
}

// GET /api/admin/batch/{batchId}
function getBatchById(batchId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/batches/batch/${batchId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/subject-allocation/by-academic-year-semester
function getSubjectAllocationsByAcademicYearAndSemester(academicYearId, semesterId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/subject-allocation/by-academic-year-semester?academicYearId=${academicYearId}&semesterId=${semesterId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// UNIT /
// POST  /api/admin/academic/module-unit/unit
function saveUnit(values) {
	const requestOptions = {
		method: 'POST',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/module-unit/unit`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}


// BULK UPLOAD
function bulkUploadUnit(values) {
	// Bulk Upload :-  /api/admin/academic/module-unit/unit/bulk 
	const requestOptions = {
		method: "POST",
		headers: authHeaderToPost(),
		body: JSON.stringify(values),
	};
	return fetch(`${AcademicAPI}/module-unit/unit/bulk`, requestOptions)
		.then(handleResponse)
		.then((res) => {
			return res;
		});
}

function updateUnit(Id, values) {
	// api/admin/academic/module-unit/unit/{id} 
	const requestOptions = {
		method: 'PUT',
		headers: authHeaderToPost(),
		body: JSON.stringify(values)
	};
	return fetch(`${AcademicAPI}/module-unit/unit/${Id}`, requestOptions)
		.then(handleResponse)
		.then(role => {
			return role;
		});
}

function getAllUnits() {
	// - /api/admin/academic/module-unit/units 
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/module-unit/units`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

function deleteUnit(Id) {
	//  /api/admin/academic/module-unit/unit/soft/{id}  
	const requestOptions = { method: 'DELETE', headers: authHeader() };
	return fetch(`${AcademicAPI}/module-unit/unit/soft/${Id}`, requestOptions)
		.then(response => {
			if (!response.ok) throw new Error('Delete failed');
			return response.text().then(text => {
				try {
					return JSON.parse(text);
				} catch {
					return text;
				}
			});
		});
};

//  /api/admin/academic/module-unit/units/{collegeID}
function getUnitsByCollegeId(collegeId) {
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/module-unit/units/${collegeId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

function getUnitsByModuleId(moduleId) {
	// /api/admin/academic/module-unit/units/module/{moduleId} 
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/module-unit/units/module/${moduleId}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}
function getUnitById(Id) {
	//  /api/admin/academic/module-unit/unit/{id} 
	const requestOptions = {
		method: 'GET',
		headers: authHeader()
	};
	return fetch(`${AcademicAPI}/module-unit/unit/${Id}`, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/modules/filter
function getFilteredModules(batchId, academicYearId, semesterId, subjectId) {
	const requestOptions = { method: 'GET', headers: authHeader() };

	// Build query parameters
	const params = new URLSearchParams();
	if (batchId) params.append('batchId', batchId);
	if (academicYearId) params.append('academicYearId', academicYearId);
	if (semesterId) params.append('semesterId', semesterId);
	if (subjectId) params.append('subjectId', subjectId);

	const queryString = params.toString();
	const url = `${AcademicAPI}/module-unit/modules/filter${queryString ? `?${queryString}` : ''}`;

	return fetch(url, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/academic/subjects/filter
function getFilteredPapers(programId, batchId, academicYearId, semesterId, typeId, modeId, collegeId) {
	const requestOptions = { method: 'GET', headers: authHeader() };

	// Build query parameters
	const params = new URLSearchParams();
	if (programId) params.append('programId', programId);
	if (batchId) params.append('batchId', batchId);
	if (academicYearId) params.append('academicYearId', academicYearId);
	if (semesterId) params.append('semesterId', semesterId);
	if (typeId) params.append('typeId', typeId);
	if (modeId) params.append('modeId', modeId);
	if (collegeId) params.append('collegeId', collegeId);

	const queryString = params.toString();
	const url = `${AcademicAPI}/subjects/filter${queryString ? `?${queryString}` : ''}`;

	return fetch(url, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}

// GET /api/admin/units/filter
function getFilteredUnits(batchId, academicYearId, semesterId, subjectId, moduleId) {
	const requestOptions = { method: 'GET', headers: authHeader() };

	// Build query parameters
	const params = new URLSearchParams();
	if (batchId) params.append('batchId', batchId);
	if (academicYearId) params.append('academicYearId', academicYearId);
	if (semesterId) params.append('semesterId', semesterId);
	if (subjectId) params.append('subjectId', subjectId);
	if (moduleId) params.append('moduleId', moduleId);

	const queryString = params.toString();
	const url = `${AcademicAPI}/module-unit/units/filter${queryString ? `?${queryString}` : ''}`;

	return fetch(url, requestOptions)
		.then(handleResponse)
		.then(data => {
			return data;
		});
}