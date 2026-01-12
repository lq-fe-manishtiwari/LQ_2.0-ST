import { Routes, Route, Navigate } from "react-router-dom";
import AttendanceLayout from "../Layout/AttendanceLayout";
import MyAttendance from "../MyAttendance/MyAttendance";

export default function StudentAttendanceRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="my-attendance" replace />} />

            <Route element={<AttendanceLayout />}>
                {/* <Route path="dashboard" element={<Dashboard />} /> */}
                <Route path="my-attendance" element={<MyAttendance />} />
            </Route>
        </Routes>
    );
}