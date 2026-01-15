import { Routes, Route, Navigate } from "react-router-dom";
import AttendanceLayout from "../Layout/AttendanceLayout";
import Dashboard from "../Dashboard/Dashboard";
import CardView from "../CardView/CardView";
import TimetableView from "../TimetableView/TimetableView";
import TabularView from "../TabularView/TabularView";
import QRAttendanceDashboard from "../QRAttendance/QRAttendanceDashboard";
import AttendanceReports from "../Reports/AttendanceReport";

export default function AttendanceRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="tabular-view" replace />} />

            <Route element={<AttendanceLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="card-view" element={<CardView />} />
                <Route path="tabular-view" element={<TabularView />} />
                <Route path="timetable-view" element={<TimetableView />} />
                <Route path="qr-attendance" element={<QRAttendanceDashboard />} />
                <Route path="reports" element={<AttendanceReports />} />
            </Route>
        </Routes>
    );
}