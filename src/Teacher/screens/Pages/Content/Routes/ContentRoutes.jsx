import { Routes, Route, Navigate } from "react-router-dom";

import ContentLayout from "../ContentLayout";
import TabLayout from "../AddContent/TabLayout";
import StudentProject from "../AddContent/StudentProject";
import Question from "../QuestionsTab/Questions.jsx";
import AddNewQuestion from "../AddQuestions/AddNewQuestions.jsx";

import QuizDashboard from "../Quiz/Quizdashboard";
import AddQuiz from "../Quiz/AddQuiz";
import EditQuiz from "../Quiz/EditQuiz";

export default function ContentRoutes() {
  return (
    <Routes>
      {/* ✅ Default redirect */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* ✅ Main Dashboard */}
      <Route path="dashboard" element={<ContentLayout />} />

      {/* ✅ Add Content (tabs UI stays here) */}
      <Route path="add-content" element={<TabLayout />} />

      {/* ✅ Quiz Dashboard */}
      <Route path="quiz-dashboard" element={<QuizDashboard />} />

      {/* ✅ Add Quiz */}
      <Route path="quiz/add" element={<AddQuiz />} />
      <Route path="quiz/edit" element={<EditQuiz />} />

      {/* ✅ Student Project */}
      <Route path="student-project" element={<StudentProject />} />

      {/* ✅ Redirect to dashboard when visiting /content */}
      <Route path="/" element={<Navigate to="content-dashboard" replace />} />



              <Route path="question-dashboard" element={<Question />} />
        <Route path="add-question" element={<AddNewQuestion />} />

    </Routes>
  );
}
