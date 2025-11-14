
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentHomepage from '../Homepage/StudentHomepage.jsx';
import StudentDashboard from '../Dashboard/StudentDashboard.jsx';
import ProfileRoutes from '../Pages/Profile/Routes/ProfileRoutes.jsx';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/home" element={<StudentHomepage />} />
      <Route path="/my-profile/*" element={<ProfileRoutes />} /> 
        {/* Add more student pages */}
    </Routes>
  );
};

export default StudentRoutes;