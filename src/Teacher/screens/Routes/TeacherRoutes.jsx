// src/Teacher/screens/Routes/TeacherRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard.jsx";
import TeacherProfile from "../Dashboard/TeacherProfile.jsx";

// Import all tab pages
// import MyAttendance from "../Dashboard/MyAttendance.jsx";
// import Personal from "../Dashboard/pages/Personal.jsx";
// import Communication from "../Dashboard/pages/Communication.jsx";
// import EmploymentHistory from "../Dashboard/pages/EmploymentHistory.jsx";
// import Qualification from "../Dashboard/pages/Qualification.jsx";
// import Password from "../Dashboard/pages/Password.jsx";
// import MeetingLink from "../Dashboard/pages/MeetingLink.jsx";
// import KnowMyClass from "../Dashboard/pages/KnowMyClass.jsx";

// Other routes
import ClassRoutes from "../Pages/Class/Routes/ClassRoutes.jsx";
import AssessmentRoutes from "../Pages/Assessment/Routes/AssessmentRoutes.jsx";
import ContentRoutes from "../Pages/Content/Routes/ContentRoutes.jsx";
import FeedbackRoutes from "../Pages/Feedback/Routes/FeedbackRoutes.jsx";
import PMSRoutes from "../Pages/PerformanceManagementSystem/Routes/PMSRoutes.jsx";

export default function TeacherRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<Dashboard />} />

      {/* Teacher Profile with Nested Tabs */}
      <Route path="teacher-profile" element={<TeacherProfile />}>
        {/* <Route index element={<MyAttendance />} /> Default tab */}
        {/* {/* <Route path="MyAttendance" element={<MyAttendance />} /> */}
        {/* <Route path="Personal" element={<Personal />} />
        <Route path="Communication" element={<Communication />} />
        <Route path="EmploymentHistory" element={<EmploymentHistory />} />
        <Route path="Qualification" element={<Qualification />} />
        <Route path="Password" element={<Password />} />
        <Route path="MeetingLink" element={<MeetingLink />} />
        <Route path="KnowMyClass" element={<KnowMyClass />} />  */}
      </Route>

      {/* Other Areas */}
      <Route path="class/*" element={<ClassRoutes />} />
      <Route path="assessments/*" element={<AssessmentRoutes />} />
      <Route path="content/*" element={<ContentRoutes />} />
      <Route path="feedback/*" element={<FeedbackRoutes />} />
      <Route path="pms/*" element={<PMSRoutes />} />

    </Routes>
  );
}