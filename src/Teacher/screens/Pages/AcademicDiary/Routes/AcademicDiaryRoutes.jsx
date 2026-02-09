import { Routes, Route, Navigate } from "react-router-dom";
import AcademicDiaryLayout from "../Layout/AcademicDiaryLayout";

// Dashboard Components
import ProfessionalEthics from "../Dashboard/ProfessionalEthics";
import Committee from "../Dashboard/Committee";
import AdvLearner from "../Dashboard/AdvLearner";
import SlowLearner from "../Dashboard/SlowLearner";
import DailyWorkReport from "../Dashboard/DailyWorkReport";
import Contributions from "../Contributions/Contributions";
import MyViewDashboard from "../../TimeTable/MyView/MyViewDashboard";
import Leaves from "../Dashboard/Leaves";
import TeachingPlan from "../Dashboard/TeachingPlan";
import AddTeachingPlan from "../Dashboard/TeachingPlan/AddTeachingPlan";
import EditTeachingPlan from "../Dashboard/TeachingPlan/EditTeachingPlan";
import ViewTeachingPlan from "../Dashboard/TeachingPlan/ViewTeachingPlan";
import MonitoringReports from "../MonitoringReport/MonitoringReports";

export default function AcademicDiaryRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to profile when visiting /teacher/academic-diary */}
      <Route path="/" element={<Navigate to="professional-ethics" replace />} />

      {/* ✅ Academic Diary routes with layout */}
      <Route element={<AcademicDiaryLayout />}>
        <Route index element={<Navigate to="professional-ethics" replace />} />
        <Route path="professional-ethics" element={<ProfessionalEthics />} />
        <Route path="committee" element={<Committee />} />
        <Route path="daily-work-report" element={<DailyWorkReport />} />
        <Route path="advanced-learner" element={<AdvLearner />} />
        <Route path="slow-learner" element={<SlowLearner />} />
        <Route path="contributions" element={<Contributions />} />

        {/* ✅ Teaching Plan Routes */}
        <Route path="teaching-plan" element={<TeachingPlan />} />
        <Route path="teaching-plan/add" element={<AddTeachingPlan />} />
        <Route path="teaching-plan/edit/:id" element={<EditTeachingPlan />} />
        <Route path="teaching-plan/view/:id" element={<ViewTeachingPlan />} />

        <Route path="time-table" element={<MyViewDashboard />} />
        <Route path="leave" element={<Leaves />} />
        <Route path="monitoring-reports" element={<MonitoringReports />} />
      </Route>
    </Routes>
  );
}
