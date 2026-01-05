import { Routes, Route, Navigate } from "react-router-dom";
import MyViewDashboard from "../MyView/MyViewDashboard";
import TimeTableLayout from "../TimeTableLayout";
import ViewUpadateTimetable from "../MyView/ViewUpadateTimetable";

export default function TimeTableRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="my-view" replace />} />

      <Route element={<TimeTableLayout />}>
        <Route path="my-view" element={<MyViewDashboard />} />
        <Route path="View-Upadate-Timetable" element={<ViewUpadateTimetable />} />
        {/* <Route path="submitted-feedback" element={<SubmittedFeedback />} />  */}
      </Route>
    </Routes>
  );
}