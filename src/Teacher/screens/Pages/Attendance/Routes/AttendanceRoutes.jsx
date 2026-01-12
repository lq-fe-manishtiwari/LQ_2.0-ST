import { Routes, Route, Navigate } from "react-router-dom";
import AttendanceLayout from "../Layout/AttendanceLayout";
import ClassAttendance from "../ClassAttendance/ClassAttendance";
import Dashboard from "../Dashboard/Dashboard";

export default function AttendanceRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="class-attendance" replace />} />

            <Route element={<AttendanceLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="class-attendance" element={<ClassAttendance />} />
            </Route>
        </Routes>
    );
}