import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClassLayout from "../ClassLayout";
import TabularView from "../Dashboard/TabularView";

export default function ClassRoutes() {
  return (
    <Routes>
      {/* Auto redirect /teacher-class → Tabular View */}
      <Route index element={<Navigate to="Tabular-view" replace />} />

      <Route element={<ClassLayout />}>
        <Route path="Tabular-view" element={<TabularView />} />
        <Route path="Month-view" element={<div className="p-8 text-3xl">Month View Coming Soon</div>} />
      </Route>

      <Route path="*" element={<Navigate to="Tabular-view" replace />} />
    </Routes>
  );
}