
  import React from 'react';
  import { Routes, Route } from 'react-router-dom';
  import StudentHomepage from '../Homepage/StudentHomepage.jsx';
  import StudentDashboard from '../Dashboard/StudentDashboard.jsx';
  import ProfileRoutes from '../Pages/Profile/Routes/ProfileRoutes.jsx';
  import ContentRoutes from '../Pages/Content/Routes/ContentRoutes.jsx';
  import LeavesRoutes from '../Pages/StudentLeaves/Routes/LeavesRoutes.jsx';

  const StudentRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/home" element={<StudentHomepage />} />
        <Route path="/my-profile/*" element={<ProfileRoutes />} /> 
        <Route path="content/*" element={<ContentRoutes />} /> 
        <Route path="leaves/*" element={<LeavesRoutes />} /> 
          {/* Add more student pages */}
      </Routes>
    );
  };

  export default StudentRoutes;