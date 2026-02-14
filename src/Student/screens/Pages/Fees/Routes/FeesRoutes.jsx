import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeesLayout from "../FeesLayout";
import StudentFeesDetails from "../Dashboard/StudentFeesDetails";

const FeesRoutes = () => {
  return (
    <Routes>
      {/* Layout Wrapper */}
      <Route element={<FeesLayout />}>
        {/* Dashboard (Default & Only Route) */}
        <Route index element={<StudentFeesDetails />} />
      </Route>

      {/* Safety Fallback */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default FeesRoutes;
