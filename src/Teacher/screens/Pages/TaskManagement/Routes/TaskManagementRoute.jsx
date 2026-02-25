// src/Teacher/screens/Pages/TaskManagement/Routes/TaskManagementRoute.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import TaskManagementLayout from "../Layout/TaskManagementLayout";

// Task Assignment
import TaskAssignment from "../TaskAssignment/TaskAssignment";
import TaskForm from "../TaskAssignment/CreateTask";
import EditTask from "../TaskAssignment/EditTask";
import TaskView from "../TaskAssignment/TaskView";

// Professional Tasks
import MyTasks from "../ProfessionalTask/MyTasks";
import CreateProfessionalTask from "../ProfessionalTask/CreateNewTasks";
import ViewProfessionalTask from "../ProfessionalTask/ViewMyTasks";
import EditProfessionalTask from "../ProfessionalTask/MyEditTask";

// Personal Tasks
import PersonalTask from "../PersonalTask/PersonalTask";
import AddPersonalTask from "../PersonalTask/AddPersonalTask";
import ViewPersonalTask from "../PersonalTask/ViewPersonalTask";
import EditPersonalTask from "../PersonalTask/EditPersonalTask";

// Timesheet
import TimeSheetDashboard from "../Timesheet/Timesheet";

export default function TaskManagementRoutes() {
  return (
    <Routes>
      {/* Redirect root to task-assignment */}
      <Route index element={<Navigate to="task-assignment" replace />} />

      <Route element={<TaskManagementLayout />}>
        {/* Task Assignment */}
        <Route path="task-assignment" element={<TaskAssignment />} />
        <Route path="task-assignment/create-task" element={<TaskForm />} />
        <Route path="task-assignment/task-view/:id" element={<TaskView />} />
        <Route path="task-assignment/edit-task/:id" element={<EditTask />} />

        {/* Professional Tasks */}
        <Route path="professional-tasks" element={<MyTasks />} />
        <Route path="professional-tasks/add" element={<CreateProfessionalTask />} />
        <Route path="professional-tasks/view/:id" element={<ViewProfessionalTask />} />
        <Route path="professional-tasks/edit/:id" element={<EditProfessionalTask />} />

        {/* Personal Tasks */}
        <Route path="personal-tasks" element={<PersonalTask />} />
        <Route path="personal-tasks/add" element={<AddPersonalTask />} />
        <Route path="personal-tasks/view/:id" element={<ViewPersonalTask />} />
        <Route path="personal-tasks/edit/:id" element={<EditPersonalTask />} />

        {/* Timesheet */}
        <Route path="timesheet" element={<TimeSheetDashboard />} />
      </Route>
    </Routes>
  );
}
