import { Routes, Route, Navigate } from "react-router-dom";
import ContentLayout from "../ContentLayout";
import Add_Content from "../AddContent/Add_Content";
import StudentProject from "../AddContent/StudentProject";

export default function ContentRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to dashboard when visiting /content */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      
      {/* ✅ Main dashboard route */}
      <Route path="dashboard" element={<ContentLayout />} />
      
      {/* ✅ Add content route */}
      <Route path="/add-content" element={<Add_Content />} />
       
      <Route path="/student-project" element={<StudentProject />} />
      
    </Routes>
  );
}
