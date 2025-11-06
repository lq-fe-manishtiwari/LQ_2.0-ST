// src/Teacher/screens/Routes/TeacherRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../Dashboard/Dashboard.jsx";
import ClassRoutes from "../Pages/Class/Routes/ClassRoutes.jsx";

export default function TeacherRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<Dashboard />} />

      {/* Class Area */}
      <Route path="class/*" element={<ClassRoutes />} />
    </Routes>
  );
}