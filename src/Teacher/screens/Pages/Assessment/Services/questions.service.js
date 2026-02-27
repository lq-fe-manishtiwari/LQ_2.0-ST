// QuestionsService.js
import { authHeader, apiNBARequest, handleResponse, authHeaderToPost, ContentAPI } from '@/_services/api';

export const QuestionsService = {
    saveQuestion,
    saveQuestionsBulk,
    getQuestionsByCollege,
    getQuestionsByProgram,
    getQuestionsBySubject,
    getQuestionsByModule,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    filterQuestions,

    // Question lavel 
    createQuestionLevel,
    getAllQuestionLevels,
    getQuestionLevelById,
    updateQuestionLevel,
    deleteQuestionLevel,
    getAllBloomsLevels,
};

// -------------------- SAVE SINGLE QUESTION --------------------
function saveQuestion(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };
    // api response 
    //      {
    //   "college_id": 1,
    //   "program_id": 2,
    //   "program_name": "B.Tech CSE",
    //   "subject_id": 10,
    //   "subject_name": "Data Structures",
    //   "module_id": 5,
    //   "module_name": "Trees",
    //   "unit_id": 1,
    //   "unit_name": "Binary Trees",
    //   "question": "What is a binary search tree?",
    //   "question_category": "SUBJECTIVE",
    //   "question_type": "SHORT_ANSWER",
    //   "question_level_id": 1,
    //   "blooms_level_id": 2,
    //   "course_outcome_ids": [101, 102],
    //   "default_marks": 5,
    //   "model_answer": "A binary search tree is...",
    //   "is_active": true
    // }

    return fetch(`${ContentAPI}/admin/assessment-question`, requestOptions)
        .then(handleResponse);
}

// -------------------- SAVE MULTIPLE QUESTIONS (BULK) --------------------
function saveQuestionsBulk(values) {
    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };
    // Api response 
    // {
    //   "college_id": 1,
    //   "program_id": 2,
    //   "program_name": "B.Tech CSE",
    //   "questions": [
    //     {
    //       "subject_id": 10,
    //       "module_id": 5,
    //       "question": "What is a stack?",
    //       "question_category": "OBJECTIVE",
    //       "question_type": "MCQ",
    //       "question_level_id": 1,
    //       "default_marks": 1,
    //       "options": [
    //         { "option_text": "LIFO", "correct": true }
    //       ]
    //     }
    //   ]
    // }

    return fetch(`${ContentAPI}/admin/assessment-question/bulk`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTIONS BY COLLEGE --------------------
function getQuestionsByCollege(collegeId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/college/${collegeId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTIONS BY PROGRAM --------------------
function getQuestionsByProgram(programId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/program/${programId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTIONS BY SUBJECT --------------------
function getQuestionsBySubject(subjectId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/subject/${subjectId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTIONS BY MODULE --------------------
function getQuestionsByModule(moduleId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/module/${moduleId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTION BY ID --------------------
function getQuestionById(questionId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/${questionId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- UPDATE QUESTION --------------------
function updateQuestion(questionId, values) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/${questionId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- DELETE QUESTION --------------------
function deleteQuestion(questionId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/${questionId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- FILTER QUESTIONS --------------------
function filterQuestions(filters) {
    // filters = { category: "OBJECTIVE", type: "MCQ", question_level_id: 1 }
    const query = new URLSearchParams(filters).toString();

    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/admin/assessment-question/filter?${query}`, requestOptions)
        .then(handleResponse);
}

// -------------------- CREATE QUESTION LEVEL --------------------
function createQuestionLevel(values) {
    // values = { question_level_type: "Easy" }

    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };

    return fetch(`${ContentAPI}/question-levels`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET ALL QUESTION LEVELS --------------------
function getAllQuestionLevels() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/question-levels`, requestOptions)
        .then(handleResponse);
}
function getAllBloomsLevels() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/blooms-level`, requestOptions)
        .then(handleResponse);
}

// -------------------- GET QUESTION LEVEL BY ID --------------------
function getQuestionLevelById(questionLevelId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/question-levels/${questionLevelId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- UPDATE QUESTION LEVEL --------------------
function updateQuestionLevel(questionLevelId, values) {
    // values = { question_level_type: "Hard" }

    const requestOptions = {
        method: 'PUT',
        headers: authHeaderToPost(),
        body: JSON.stringify(values),
    };

    return fetch(`${ContentAPI}/question-levels/${questionLevelId}`, requestOptions)
        .then(handleResponse);
}

// -------------------- DELETE QUESTION LEVEL --------------------
function deleteQuestionLevel(questionLevelId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
    };

    return fetch(`${ContentAPI}/question-levels/${questionLevelId}`, requestOptions)
        .then(handleResponse);
}