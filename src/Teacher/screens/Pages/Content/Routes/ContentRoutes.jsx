import { Routes, Route, Navigate } from "react-router-dom";

import ContentLayout from "../ContentLayout";
import TabLayout from "../AddContent/TabLayout";

import Add_Content from "../AddContent/Add_Content";
import StudentProject from "../AddContent/StudentProject";

import Question from "../QuestionsTab/Questions.jsx";
import AddNewQuestion from "../AddQuestions/AddNewQuestions.jsx";

import QuizDashboard from "../Quiz/Quizdashboard";
import AddQuiz from "../Quiz/AddQuiz";
import EditQuiz from "../Quiz/EditQuiz";

export default function ContentRoutes() {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* dashboard */}
      <Route path="dashboard" element={<ContentLayout />} />

      {/* TAB ROUTES */}
      <Route path="add-content" element={<TabLayout />}>
        <Route index element={<Navigate to="content" replace />} />

        {/* Content */}
        <Route path="content" element={<Add_Content />} />

        {/* Student Project */}
        <Route path="student-project" element={<StudentProject />} />

        {/* Question */}
        <Route path="question" element={<Question />} />
        <Route path="question/add-question" element={<AddNewQuestion />} />

        {/* Quiz (FIXED) */}
        <Route path="quiz" element={<QuizDashboard />} />
        <Route path="quiz/add" element={<AddQuiz />} />
        <Route path="quiz/edit" element={<EditQuiz />} />
      </Route>
    </Routes>
  );
}
