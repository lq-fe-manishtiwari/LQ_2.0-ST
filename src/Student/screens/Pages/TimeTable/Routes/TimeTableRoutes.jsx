import { Routes, Route, Navigate } from "react-router-dom";
import TimeTableLayout from "../TimeTableLayout";
import MyView from "../MyView";

export default function TimeTableRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="my-view" replace />} />

      <Route element={<TimeTableLayout />}>
        <Route path="my-view" element={<MyView />} />
        {/* <Route path="submitted-feedback" element={<SubmittedFeedback />} />  */}
      </Route>
    </Routes>
  );
}