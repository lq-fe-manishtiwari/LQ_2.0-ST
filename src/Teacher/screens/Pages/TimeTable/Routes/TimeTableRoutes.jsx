import { Routes, Route, Navigate } from "react-router-dom";
import MyViewDashboard from "../MyView/MyViewDashboard";
import TimeTableLayout from "../TimeTableLayout";

export default function TimeTableRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="my-view" replace />} />

      <Route element={<TimeTableLayout />}>
        <Route path="my-view" element={<MyViewDashboard />} />
        {/* <Route path="submitted-feedback" element={<SubmittedFeedback />} />  */}
      </Route>
    </Routes>
  );
}