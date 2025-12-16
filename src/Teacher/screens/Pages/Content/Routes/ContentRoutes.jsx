import { Routes, Route, Navigate } from "react-router-dom";
import ContentLayout from "../ContentLayout";
import TabLayout from "../AddContent/TabLayout";
import Add_Content from "../AddContent/Add_Content";
import StudentProject from "../AddContent/StudentProject";
import Questions from "../QuestionsTab/Questions";
// import ContentDashboard from "../Dashboard/ContentDashboard";_

export default function ContentRoutes() {
  return (
    <Routes>
      {/* ✅ Main dashboard route */}
      <Route path="dashboard" element={<ContentLayout />} />
      <Route path="content-dashboard" element={<ContentLayout />} />
      
      {/* ✅ Add content route */}
      <Route path="add-content" element={<TabLayout />}/>

      {/* ✅ Questions route */}
      <Route path="question-dashboard" element={<Questions />} />

      {/* ✅ Quiz route - placeholder for now */}
      <Route path="quiz-dashboard" element={<ContentLayout />} />

      <Route path="student-project" element={<StudentProject />} />

      {/* ✅ Redirect to dashboard when visiting /content */}
      <Route path="/" element={<Navigate to="content-dashboard" replace />} />
    </Routes>
  );
}
