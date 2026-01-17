import { Routes, Route, Navigate } from "react-router-dom";
import ExamManagementLayout from "../ExamManagementLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";
import AssignedTasks from "../Dashboard/AssignedTasks";
import Schedule from "../Dashboard/Schedule";
import Paper from "../Dashboard/Paper";
import MarksEntry from "../Dashboard/MarksEntry";
import ReEvaluation from "../Dashboard/ReEvaluation";
import AnswerSheetList from "../AnswerSheets/AnswerSheets";
import AddAnswerSheet from "../AnswerSheets/AddAnswerSheet";
import MarkingInterface from "../AnswerSheets/MarkingInterface";
import Reports from "../Reports/Reports";
import MarksEntryReport from "../Reports/MarksEntryReport";
import StudentAttendanceReport from "../Reports/StudentAttendanceReport";
import FinalResultsReport from "../Reports/FinalResultsReport";


export default function ExamManagementRoutes() {
  return (
    <Routes>
      {/* default */}
     <Route path="/" element={<Navigate to="dashboard" replace />} />
    
      {/* dashboard */}
       <Route  element={<ExamManagementLayout />} >
       <Route path="dashboard" element={<ExamDashboard />} />
       <Route path="tasks" element={<AssignedTasks />} />
       <Route path="schedule" element={<Schedule />} />
       <Route path="paper" element={<Paper />} />
       <Route path="marksEntry" element={<MarksEntry />} />
       <Route path="Evaluation" element={<ReEvaluation />} />
       <Route path="answer-sheets"  element={<AnswerSheetList />} />
       <Route path="answer-sheets/add" element={<AddAnswerSheet />} />
       <Route path="answer-sheets/mark/:id" element={<MarkingInterface />} />
       <Route path="reports" element={<Reports />} />
       <Route path="marksEntry" element={<MarksEntryReport />} />
       <Route path="studentAttendanceReport" element={<StudentAttendanceReport />} />
       <Route path="finalResultsReport" element={<FinalResultsReport />} />
       

     </Route>
    </Routes>
  );
}