import { Routes, Route, Navigate } from "react-router-dom";
import ExamManagementLayout from "../ExamManagementLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";
import AssignedTasks from "../Dashboard/AssignedTasks";
import Schedule from "../Dashboard/Schedule";
import Paper from "../Dashboard/Paper";
import MarksEntry from "../Dashboard/MarksEntry";
import ReEvaluation from "../Dashboard/ReEvaluation";
import AnswerSheetList from "../AnswerSheets/AnswerSheets";


export default function ExamManagementRoutes() {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="answer-sheets"  element={<AnswerSheetList />} ></Route>
      {/* dashboard */}
       <Route  element={<ExamManagementLayout />} >
       <Route path="dashboard" element={<ExamDashboard />} />
       <Route path="tasks" element={<AssignedTasks />} />
       <Route path="schedule" element={<Schedule />} />
       <Route path="paper" element={<Paper />} />
       <Route path="marksEntry" element={<MarksEntry />} />
       <Route path="Evaluation" element={<ReEvaluation />} />
       


       </Route>
    </Routes>
  );
}