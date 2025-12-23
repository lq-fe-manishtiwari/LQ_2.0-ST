
import { authHeaderToPost, handlePostResponse, TeacherLoginAPI ,COREAPI } from '@/_services/api';

// ========== STUDENT SUBJECT SELECTION API FUNCTIONS ==========
export function saveStudentSubjectSelection(currentStudentId, selectionData) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify(selectionData),
  };

  return fetch(`${COREAPI}/admin/academic/student/subject-selection?currentStudentId=${currentStudentId}`, requestOptions)
    .then(handlePostResponse)
    .then(data => ({
      success: true,
      data: data
    }))
    .catch(error => ({
      success: false,
      message: error.message || 'Failed to save subject selection'
    }));
}

// Enhanced API object with user profile methods
export const api = {
  saveStudentSubjectSelection,
};