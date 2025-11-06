import { Routes, Route, Navigate } from "react-router-dom";
import ClassLayout from "../ClassLayout";
import TabularView from "../Dashboard/TabularView";


export default function ClassRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /student */}
      <Route path="/" element={<Navigate to="Tabular-view" replace />} />
      
      {/* ✅ Student list route */}
      <Route element={<ClassLayout />}>
  <Route path="Tabular-view" element={<TabularView />} />
  <Route path="Month-view" element={<div>Month View Content Here</div>} />
</Route>

      
    
    </Routes>
  );
}
