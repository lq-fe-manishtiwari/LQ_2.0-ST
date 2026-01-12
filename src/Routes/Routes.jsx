// src/Route.Routes.jsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// ────── Shared Login (handles both roles) ──────
import Login from '../Login/Login.jsx';
import AdminForgotPassword from '../Login/AdminForgotPassword.jsx';

// ────── Layouts (different homepage for each role) ──────
import TeacherHomepage from '../Teacher/screens/Homepage/Homepage.jsx';
import StudentHomepage from '../Student/screens/Homepage/StudentHomepage.jsx';

// ────── Nested route groups ──────
import TeacherRoutes from '../Teacher/screens/Routes/TeacherRoutes.jsx';
import StudentRoutes from '../Student/screens/Routes/StudentRoutes.jsx';
import ProfileRoutes from '../Student/screens/Pages/Profile/Routes/ProfileRoutes.jsx';
import PMSRoutes from '../Teacher/screens/Pages/PerformanceManagementSystem/Routes/PMSRoutes.jsx';
import ContentRoutes from '../Student/screens/Pages/Content/Routes/ContentRoutes.jsx';
import HRMRoutes from '../Teacher/screens/Pages/HRM/Routes/HRMRoute.jsx';
import SubjectSelectionRoutes from '../Teacher/screens/Pages/SubjectSelection/Routes/SubjectSelectionRoutes.jsx';
import TimeTableRoutes from '../Student/screens/Pages/TimeTable/Routes/TimeTableRoutes.jsx';

import AcademicCalendarRoute from "../Teacher/screens/Pages/AcademicCalendar/Routes/AcademicCalendarRoute.jsx"
import AcademicCalendarRoutes from "../Student/screens/Pages/AcademicCalendar/Routes/AcademicCalendarRoutes.jsx"
import AttendanceRoutes from '../Teacher/screens/Pages/Attendance/Routes/AttendanceRoutes.jsx';
import StudentAttendanceRoutes from '../Student/screens/Pages/Attendance/Routes/AttendanceRoutes.jsx';

// ────── Route guards ──────
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

// GET DEFAULT REDIRECT
const getDefaultRedirect = () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  return user?.iss === "STUDENT" ? "/student-dashboard" : "/dashboard";
};

// PUBLIC ROUTE (redirect if logged-in)
const PublicRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("refreshToken");
  return isLoggedIn ? <Navigate to={getDefaultRedirect()} replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ────── PUBLIC ────── */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route path="/admin-forgot-password" element={
          <PublicRoute>
            <AdminForgotPassword />
          </PublicRoute>
        } />

        {/* ────── TEACHER ────── */}
        <Route path="/dashboard" element={<ProtectedRoute><TeacherHomepage><TeacherRoutes /></TeacherHomepage></ProtectedRoute>} />
        {/* TEACHER – Class area (exact + any sub-page) */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute>
              <TeacherHomepage>
                <TeacherRoutes />
              </TeacherHomepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject-selection/*"
          element={

            <ProtectedRoute>
              <TeacherHomepage>
                <SubjectSelectionRoutes />
              </TeacherHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/hrm/*"
          element={
            <ProtectedRoute>
              <TeacherHomepage>
                <HRMRoutes />
              </TeacherHomepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/*"
          element={
            <ProtectedRoute>
              <TeacherHomepage>
                <AttendanceRoutes />
              </TeacherHomepage>
            </ProtectedRoute>
          }
        />
        {/* ────── TEACHER – Academic Calendar ────── */}
        <Route
          path="/teacher/academic-calendar/*"
          element={
            <ProtectedRoute>
              <TeacherHomepage>
                <AcademicCalendarRoute />
              </TeacherHomepage>
            </ProtectedRoute>
          }
        />


        {/* ────── STUDENT ────── */}
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <StudentRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <StudentRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <ProfileRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/timetable/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <TimeTableRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <StudentAttendanceRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/curriculum/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <ContentRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pms/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <PMSRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hrm/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <HRMRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/academic-calendar/*"
          element={
            <ProtectedRoute>
              <StudentHomepage>
                <AcademicCalendarRoutes />
              </StudentHomepage>
            </ProtectedRoute>
          }
        />









        {/* ────── FALLBACK ────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;