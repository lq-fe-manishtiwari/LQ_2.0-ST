import { Routes, Route, Navigate } from "react-router-dom";
import ExamManagementLayout from "../ExamManagementLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";

export default function ExamManagementRoutes() {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* dashboard */}
      <Route path="dashboard" element={<ExamManagementLayout />} />

       <Route path="dashboard" element={<ExamDashboard />} />
    </Routes>
  );
}