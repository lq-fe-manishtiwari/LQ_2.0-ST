import { Routes, Route, Navigate } from "react-router-dom";
import AcademicDiaryLayout from "../Layout/AcademicDiaryLayout";

// Dashboard Components
import ProfessionalEthics from "../Dashboard/ProfessionalEthics";
import Committee from "../Dashboard/Committee";
import AdvLearner from "../Dashboard/AdvLearner";
import SlowLearner from "../Dashboard/SlowLearner";
import Contributions from "../Contributions/Contributions";

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
        <Route path="advanced-learner" element={<AdvLearner />} />
        <Route path="slow-learner" element={<SlowLearner />} />
        <Route path="contributions" element={<Contributions />} />
        {/* TODO: Add Teaching Plan and Timetable components when ready */}
        {/* <Route path="teaching-plan" element={<TeachingPlan />} /> */}
        {/* <Route path="time-table" element={<TimeTable />} /> */}
      </Route>
    </Routes>
  );
}
