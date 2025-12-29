import { Routes, Route, Navigate } from "react-router-dom";
import LeavesLayout from "../LeavesLayout";
// import SubmittedFeedback from "../Dashboard/SubmittedFeedback";
import MyLeaves from "../Dashboard/MyLeaves";
import ClassLeave from "../Dashboard/ClassLeave";
import Dashboard from "../Dashboard/Dashboard";

export default function LeavesRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="dashboard" replace />} />

      <Route element={<LeavesLayout />}>
       <Route path="dashboard" element={<Dashboard />} />
        <Route path="myleaves" element={<MyLeaves />} />
        <Route path="class-leave" element={<ClassLeave />} /> 
      </Route>
    </Routes>
  );
}