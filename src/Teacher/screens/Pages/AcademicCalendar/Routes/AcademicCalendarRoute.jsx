import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AcademicCalendarLayout from "../AcademicCalendarLayout";
import AcademicCalendarDashboard from "../Dashboard/AcademicCalendarDashboard";

const AcademicCalendarRoutes = () => {
  return (
    <Routes>
      {/* Layout Wrapper */}
      <Route element={<AcademicCalendarLayout />}>
        {/* Dashboard (Default & Only Route) */}
        <Route index element={<AcademicCalendarDashboard />} />
      </Route>

      {/* Safety Fallback */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AcademicCalendarRoutes;
