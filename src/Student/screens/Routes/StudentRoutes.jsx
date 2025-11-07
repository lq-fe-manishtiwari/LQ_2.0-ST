
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentHomepage from '../Homepage/StudentHomepage.jsx';
import StudentDashboard from '../Dashboard/StudentDashboard.jsx';
// import StudentClass from '../screens/Pages/Class/StudentClass.jsx'; // example

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/home" element={<StudentHomepage />} />
      {/* <Route path="/class/*" element={<StudentClass />} /> */}
      {/* Add more student pages */}
    </Routes>
  );
};

export default StudentRoutes;