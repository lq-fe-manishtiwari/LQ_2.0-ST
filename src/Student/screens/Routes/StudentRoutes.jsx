
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentHomepage from '../Homepage/StudentHomepage.jsx';
import StudentDashboard from '../Dashboard/StudentDashboard.jsx';
import ProfileRoutes from '../Pages/Profile/Routes/ProfileRoutes.jsx';
import ContentRoutes from '../Pages/Content/Routes/ContentRoutes.jsx';
import LeavesRoutes from "../Pages/StudentLeaves/Routes/LeavesRoutes.jsx";
import SubjectSelectionPage from '../Pages/SubjectSelection/SubjectSelectionPage.jsx';
import AluminiRoutes from '../Pages/Alumini/Routes/Routes.jsx';
import USFeedbackRoutes from '../Pages/USFeedback/Routes/USFeedbackRoutes.jsx';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/home" element={<StudentHomepage />} />
      <Route path="/my-profile/*" element={<ProfileRoutes />} />
      <Route path="content/*" element={<ContentRoutes />} />
      <Route path="leaves/*" element={<LeavesRoutes />} />
      <Route path="subject-selection" element={<SubjectSelectionPage />} />
      <Route path="alumini/*" element={<AluminiRoutes />} />
      <Route path="us-feedback/*" element={<USFeedbackRoutes />} />
      {/* Add more student pages */}
    </Routes>
  );
};



export default StudentRoutes;