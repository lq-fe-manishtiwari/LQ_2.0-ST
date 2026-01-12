
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentHomepage from '../Homepage/StudentHomepage.jsx';
import StudentDashboard from '../Dashboard/StudentDashboard.jsx';
import ProfileRoutes from '../Pages/Profile/Routes/ProfileRoutes.jsx';
import ContentRoutes from '../Pages/Content/Routes/ContentRoutes.jsx';
import LeavesRoutes from "../Pages/StudentLeaves/Routes/LeavesRoutes.jsx";
import SubjectSelectionPage from '../Pages/SubjectSelection/SubjectSelectionPage.jsx';
import AluminiRoutes from '../Pages/Alumini/Routes/Routes.jsx';
import TimeTableRoutes from '../Pages/TimeTable/Routes/TimeTableRoutes.jsx';
import USFeedbackRoutes from '../Pages/USFeedback/Routes/USFeedbackRoutes.jsx';
import MyCommittees from '../Pages/Committee/MyCommittees.jsx';
import CommitteeDetails from '../Pages/Committee/CommitteeDetails.jsx';
import MeetingDetails from '../Pages/Committee/MeetingDetails.jsx';
import AttendanceRoutes from '../Pages/Attendance/Routes/AttendanceRoutes.jsx';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/home" element={<StudentHomepage />} />
      <Route path="/my-profile/*" element={<ProfileRoutes />} />
      <Route path="timetable/*" element={<TimeTableRoutes />} />
      <Route path="attendance/*" element={<AttendanceRoutes />} />
      <Route path="content/*" element={<ContentRoutes />} />
      <Route path="leaves/*" element={<LeavesRoutes />} />
      <Route path="subject-selection" element={<SubjectSelectionPage />} />
      <Route path="alumini/*" element={<AluminiRoutes />} />
      <Route path="us-feedback/*" element={<USFeedbackRoutes />} />
      <Route path="committees" element={<MyCommittees />} />
      <Route path="committee/:committeeId" element={<CommitteeDetails />} />
      <Route path="committee/meeting/:meetingId" element={<MeetingDetails />} />
      {/* Add more student pages */}
    </Routes>
  );
};



export default StudentRoutes;