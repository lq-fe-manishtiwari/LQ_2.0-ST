import { Routes, Route, Navigate } from "react-router-dom";
import ProfileDashboard from "../Dashboard/ProfileDashboard";
import ProfileLayout from "../ProfileLayout";

export default function ProfileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProfileLayout />}>
        <Route index element={<ProfileDashboard />} />
        <Route path="dashboard" element={<ProfileDashboard />} />

      </Route>
    </Routes>
  );
}