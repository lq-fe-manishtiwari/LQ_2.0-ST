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

// ────── Layouts (different homepage for each role) ──────
import TeacherHomepage from '../Teacher/screens/Homepage/Homepage.jsx';
import StudentHomepage from '../Student/screens/Homepage/StudentHomepage.jsx';

// ────── Nested route groups ──────
import TeacherRoutes from '../Teacher/screens/Routes/TeacherRoutes.jsx';
import StudentRoutes from '../Student/screens/Routes/StudentRoutes.jsx';

// ────── Route guards ──────
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  return isLoggedIn ? <Navigate to={getDefaultRedirect()} replace /> : children;
};

// ────── Redirect after login based on role ──────
const getDefaultRedirect = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user.iss === 'STUDENT' ? '/student-dashboard' : '/dashboard';
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

        {/* ────── TEACHER ────── */}
        <Route path="/dashboard" element={<TeacherHomepage><TeacherRoutes /></TeacherHomepage>} />
     {/* TEACHER – Class area (exact + any sub-page) */}
    <Route
      path="/teacher/*"
      element={
        <TeacherHomepage>
          <TeacherRoutes />
        </TeacherHomepage>
      }
    />

        {/* ────── STUDENT ────── */}
        <Route
          path="/student-dashboard"
          element={
            // <ProtectedRoute>
              <StudentHomepage>
                <StudentRoutes />
              </StudentHomepage>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            // <ProtectedRoute>
              <StudentHomepage>
                <StudentRoutes />
              </StudentHomepage>
            // </ProtectedRoute>
          }
        />

        {/* ────── FALLBACK ────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;