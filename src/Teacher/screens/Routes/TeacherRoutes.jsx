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
import AssessmentRoutes from "../Pages/Assessment copy/Routes/AssessmentRoutes.jsx";
import ContentRoutes from "../Pages/Content/Routes/ContentRoutes.jsx";
import FeedbackRoutes from "../Pages/Feedback/Routes/FeedbackRoutes.jsx";
import USFeedbackRoutes from "../Pages/USFeedback/Routes/USFeedbackRoutes.jsx";
import PMSRoutes from "../Pages/PerformanceManagementSystem/Routes/PMSRoutes.jsx";
import ExamManagementRoutes from "../Pages/ExamManageMent/Routes/ExamManagementRoutes.jsx";
import LeavesRoutes from "../Pages/TeacherLeaves/Routes/LeavesRoutes.jsx";
import HRMRoutes from "../Pages/HRM/Routes/HRMRoute.jsx";
import TimeTableRoutes from "../Pages/TimeTable/Routes/TimeTableRoutes.jsx";
import MyCommittees from "../Pages/Committee/MyCommittees.jsx";
import CommitteeDetails from "../Pages/Committee/CommitteeDetails.jsx";
import MeetingDetails from "../Pages/Committee/MeetingDetails.jsx";
import LibraryRoutes from "../Pages/LibraryManangement/Routes/LibraryRoutes.jsx";

export default function TeacherRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<Dashboard />} />

      {/* Teacher Profile with Nested Tabs */}
      <Route path="teacher-profile" element={<TeacherProfile />}>
        {/* <Route index element={<MyAttendance />} /> Default tab */}
        {/* {/* <Route path="MyAttendance" element={<MyAttendance />} />*/}
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
      <Route path="timetable/*" element={<TimeTableRoutes />} />
      <Route path="feedback/*" element={<FeedbackRoutes />} />
      <Route path="us-feedback/*" element={<USFeedbackRoutes />} />
      <Route path="teacher-hrm/*" element={<HRMRoutes />} />
      <Route path="pms/*" element={<PMSRoutes />} />
      <Route path="exam/*" element={<ExamManagementRoutes />} />
      <Route path="library/*" element={<LibraryRoutes />} />
      <Route path="leaves/*" element={<LeavesRoutes />} />
      <Route path="committees" element={<MyCommittees />} />
      <Route path="committee/:committeeId" element={<CommitteeDetails />} />
      <Route path="committee/meeting/:meetingId" element={<MeetingDetails />} />

    </Routes>
  );
}