import { Routes, Route, Navigate } from "react-router-dom";
import PMSLayout from "../PMSLayout";
import UserDashboard from "../User/UserDashboard";
import DocumentDashboard from "../Document/DocumentDashboard";
import TaskAssignmentDashboard from "../TaskAssignment/TaskAssignmentDashboard";
import MyTaskDashboard from "../MyTasks/MyTaskDashboard";
import ApiDashboard from "../API/ApiDashboard";
import TimeSheetDashboard from "../Timesheet/TimeSheetDashboard";
import LeaveDashboard from "../Leave/LeaveDashboard";
import DepartmentDashoard from "../Department/DepartmentDashoard";

import CreateNewTasks from "../MyTasks/CreateNewTasks";
import ViewMyTasks from "../MyTasks/ViewMyTasks";
import AddApi from "../API/AddApi";
import AddLeave from "../Leave/AddLeave";
import ViewLeave from "../Leave/ViewLeave";
import EditLeave from "../Leave/EditLeave";

import CreateTask from "../TaskAssignment/CreateTask";
import TaskView from "../TaskAssignment/TaskView";
import EditTask from "../TaskAssignment/EditTask";

import AddDepartment from "../Department/AddDepartment";
import AddUser from "../User/AddUser";

// ⭐ MISSING IMPORT FIXED
import ViewUser from "../User/ViewUser";

export default function PMSRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PMSLayout />}>

        <Route index element={<Navigate to="user-dashboard" replace />} />

        <Route path="user-dashboard" element={<UserDashboard />} />
        <Route path="document" element={<DocumentDashboard />} />
        <Route path="department" element={<DepartmentDashoard />} />
        <Route path="task-assignment" element={<TaskAssignmentDashboard />} />
        <Route path="my-task" element={<MyTaskDashboard />} />
        <Route path="api" element={<ApiDashboard />} />
        <Route path="timesheet" element={<TimeSheetDashboard />} />
        <Route path="leave" element={<LeaveDashboard />} />

        {/* Users */}
        <Route path="user-dashboard/add" element={<AddUser />} />
        <Route path="user-dashboard/edit/:id" element={<AddUser />} />
        <Route path="user-dashboard/view-user/:userId" element={<ViewUser />} />

        {/* View / Edit Task */}
        <Route path="user-dashboard/view-task/:id" element={<TaskView />} />
        <Route path="user-dashboard/edit-task/:id" element={<EditTask />} />

        {/* Leaves */}
        <Route path="leave/add-leave" element={<AddLeave />} />
        <Route path="leave/view-leave/:id" element={<ViewLeave />} />
        <Route path="leave/edit/:id" element={<EditLeave />} />

        {/* My Tasks */}
        <Route path="my-task/add-task" element={<CreateNewTasks />} />
        <Route path="my-task/edit/:id" element={<CreateNewTasks />} />
        <Route path="my-task/view/:id" element={<ViewMyTasks />} />

        {/* Task Assignment */}
        <Route path="task-assignment/create" element={<CreateTask />} />
        <Route path="task-assignment/:id" element={<TaskView />} />
        <Route path="task-assignment/:id/edit" element={<CreateTask />} />

        {/* Department */}
        <Route path="department/add" element={<AddDepartment />} />
        <Route path="department/edit/:id" element={<AddDepartment />} />

      </Route>
    </Routes>
  );
}
