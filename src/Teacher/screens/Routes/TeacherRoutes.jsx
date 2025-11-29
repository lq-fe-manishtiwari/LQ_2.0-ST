// src/Teacher/screens/Routes/TeacherRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard.jsx";
import ClassRoutes from "../Pages/Class/Routes/ClassRoutes.jsx";
import AssessmentRoutes from "../Pages/Assessment/Routes/AssessmentRoutes.jsx";
import ContentRoutes from "../Pages/Content/Routes/ContentRoutes.jsx";
import FeedbackRoutes from "../Pages/Feedback/Routes/FeedbackRoutes.jsx";
import PMSRoutes from "../Pages/PerformanceManagementSystem/Routes/PMSRoutes.jsx";

export default function TeacherRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<Dashboard />} />

      {/* Class Area */}
      <Route path="class/*" element={<ClassRoutes />} />
      <Route path="assessments/*" element={<AssessmentRoutes />} />
      <Route path="assessments/*" element={<AssessmentRoutes />} />
      <Route path="content/*" element={<ContentRoutes />} />
      <Route path="feedback/*" element={<FeedbackRoutes />} />
      <Route path="pms/*" element={<PMSRoutes />} />

    </Routes>
  );
}