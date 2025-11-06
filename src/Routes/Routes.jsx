import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Teacher/screens/Login/Dashboard/Login.jsx';
import Dashboard from '../Teacher/screens/Dashboard/Dashboard.jsx';
import Homepage from '../Teacher/screens/Homepage/Homepage.jsx';
import ClassRoutes from "../Teacher/screens/Pages/Class/Routes/ClassRoutes.jsx";
import FeedbackRoutes from '../Teacher/screens/Pages/Feedback/Routes/FeedbackRoutes.jsx';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* <Route path="/admin-forgot-password" element={
          <PublicRoute>
            <AdminForgotPassword />
          </PublicRoute>
        } /> */}

        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute>
              <Homepage>
                <Dashboard />
              </Homepage>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-class/*"
          element={
     
              <Homepage>
                <ClassRoutes />
              </Homepage>
          
          }
        />
        <Route
          path="/teacher-feedback/*"
          element={
     
              <Homepage>
                <FeedbackRoutes />
              </Homepage>
          
          }
        />
        {/* Teacher 
        <Route
          path="/teacher-list/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <TeacherRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-list"
          element={
            <ProtectedRoute>
              <Homepage>
                <TeacherRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <StudentRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/other-staff/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <OtherStaffRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-assessment/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <AssessmentRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-receivable/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <ReceivableRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-AdvanceFees/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <AdvanceFeesRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-ExcessFees/*"
          element={
            <ProtectedRoute>
              <Homepage>
                <ExcessFeesRoutes />
              </Homepage>
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;