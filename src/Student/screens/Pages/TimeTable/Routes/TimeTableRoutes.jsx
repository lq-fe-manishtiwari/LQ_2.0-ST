import { Routes, Route, Navigate } from "react-router-dom";
import TimeTableLayout from "../TimeTableLayout";
import MyView from "../MyView";
import Reports from "../Reports"
import Dashboard from "../Dashboard"

export default function TimeTableRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="my-view" replace />} />

      {/* Standalone route for QR attendance marking */}
      <Route path="mark-attendance" element={<MarkAttendancePage />} />

      <Route element={<TimeTableLayout />}>
        <Route path="my-view" element={<MyView />} />
        {/* <Route path="submitted-feedback" element={<SubmittedFeedback />} />  */}
       <Route path="reports" element={<Reports />} />
       <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}