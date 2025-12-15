import { Routes, Route, Navigate } from "react-router-dom";
import ContentLayout from "../ContentLayout";
import TabLayout from "../AddContent/TabLayout";
import Add_Content from "../AddContent/Add_Content";
import StudentProject from "../AddContent/StudentProject";
// import ContentDashboard from "../Dashboard/ContentDashboard";_

export default function ContentRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to dashboard when visiting /content */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* ✅ Main dashboard route */}
      <Route path="dashboard" element={<ContentLayout />} />
      
      {/* ✅ Add content route */}
      <Route path="add-content" element={<TabLayout />}/>


      <Route path="/student-project" element={<StudentProject />} />


    </Routes>
  );
}
