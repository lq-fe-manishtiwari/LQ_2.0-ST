import { Routes, Route, Navigate } from "react-router-dom";
import LeavesLayout from "../LeavesLayout";
// import SubmittedFeedback from "../Dashboard/SubmittedFeedback";
import MyLeaves from "../Dashboard/MyLeaves";

export default function LeavesRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="dashboard" replace />} />

      <Route element={<LeavesLayout />}>
        <Route path="dashboard" element={<MyLeaves />} />
        {/* <Route path="submitted-feedback" element={<SubmittedFeedback />} />  */}
      </Route>
    </Routes>
  );
}