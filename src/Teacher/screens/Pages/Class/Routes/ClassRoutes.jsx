import { Routes, Route, Navigate } from "react-router-dom";
import ClassLayout from "../ClassLayout";
import TabularView from "../Dashboard/TabularView";
import MonthlyView from "../Dashboard/MonthlyView";
import Attendance  from "../Dashboard/Attendance";

export default function ClassRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /student */}
      <Route path="/" element={<Navigate to="Tabular-view" replace />} />
      
      {/* ✅ Student list route */}
      <Route element={<ClassLayout />}>
        <Route path="Tabular-view" element={<TabularView />} />
        <Route path="Monthly-view" element={<MonthlyView />} />
        <Route path="Attendance" element={<Attendance/>}/>
      </Route>
    </Routes>
  );
}