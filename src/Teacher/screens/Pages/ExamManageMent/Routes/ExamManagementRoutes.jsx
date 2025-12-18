import { Routes, Route, Navigate } from "react-router-dom";
import ExamManagementLayout from "../ExamManagementLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";


export default function ExamManagementRoutes() {
  return (
    <Routes>

<Route path="/*" element={<ExamManagementLayout />}>

<Route index element={<Navigate to="exam-dashboard" replace />} />
<Route path="exam-dashboard" element={<ExamDashboard />} />

</Route>
    </Routes>
  );
}