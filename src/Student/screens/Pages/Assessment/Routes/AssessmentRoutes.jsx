import { Routes, Route, Navigate } from "react-router-dom";
import AssessmentLayout from "../AssessmentLayout";
import Assessment from "../AssessmentTab/Assessment";
import AssessmentDashboard from "../AssessmentTab/AssessmentDashboard";
import StartAssessment from "../AssessmentTab/StartAssessment";
import TakeAssessment from "../AssessmentTab/TakeAssessment";
import ViewAssessmentResult from "../AssessmentTab/ViewAssessmentResult";
import ViewStudentResponses from "../AssessmentTab/ViewStudentResponses";

export default function AssessmentRoutes() {
  return (
    <Routes>
      {/* Redirect /my-assessment → /my-assessment/dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* Layout routes */}
      <Route element={<AssessmentLayout />}>
        <Route path="dashboard" element={<AssessmentDashboard />} />
        <Route path="assessment" element={<Assessment />} />
      </Route>

      {/* Full screen routes */}
      <Route path="assessment/start/:id" element={<StartAssessment />} />
      <Route path="assessment/take/:id" element={<TakeAssessment />} />
      <Route path="assessment/result/:id" element={<ViewAssessmentResult />} />
      <Route path="assessment/responses/:id" element={<ViewStudentResponses />} />
    </Routes>
  );
}
