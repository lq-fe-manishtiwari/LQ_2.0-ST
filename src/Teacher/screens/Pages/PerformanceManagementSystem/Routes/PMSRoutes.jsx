import { Routes, Route, Navigate } from "react-router-dom";
import PMSLayout from "../PMSLayout";
import UserDashboard from "../User/UserDashboard";
import DocumentDashboard from "../Document/DocumentDashboard";
import TaskAssignmentDashboard from "../TaskAssignment/TaskAssignmentDashboard"   
import MyTaskDashboard from "../MyTasks/MyTaskDashboard";
import ApiDashboard from  "../API/ApiDashboard";
import TimeSheetDashboard from "../Timesheet/TimeSheetDashboard";
import LeaveDashboard from "../Leave/LeaveDashboard";
import DepartmentDashoard from "../Department/DepartmentDashoard";

import CreateNewTasks from "../MyTasks/CreateNewTasks";
import ViewMyTasks from "../MyTasks/ViewMyTasks";

export default function PMSRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PMSLayout />}>
        <Route index element={<Navigate to="user-dashboard" replace />} />
        <Route path="user-dashboard" element={<UserDashboard/>} />
        <Route path="document" element={<DocumentDashboard/>} />
        <Route path="department" element={<DepartmentDashoard/>} />
        <Route path="task-assignment" element={<TaskAssignmentDashboard/>} />
        <Route path="my-task" element={<MyTaskDashboard/>} />
        <Route path="api" element={<ApiDashboard/>} />
        <Route path="timesheet" element={<TimeSheetDashboard/>} />
        <Route path="leave" element={<LeaveDashboard/>} />

      {/* mytasks ui  */}
        <Route path="my-task/add-task" element={<CreateNewTasks />} />
        <Route path="my-task/edit/:id" element={<CreateNewTasks />} />
        <Route path="my-task/view/:id" element={<ViewMyTasks/>}/>
      </Route>
    </Routes>
  );
}