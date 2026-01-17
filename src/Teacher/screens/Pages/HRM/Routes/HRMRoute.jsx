import { Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "../Users/UserDashboard";
import TaskManagementLayout from "../Layout/HRMLayout";

import SalaryManagementLayout from "../Layout/SalaryManagementLayout";
import SalaryEmployee from "../SalaryManagement/SalaryEmployee"
import SalaryAttendance from "../SalaryManagement/SalaryAttendance"
import SalaryDashboard from "../SalaryManagement/SalaryDashboard"
import SalaryType from "../SalaryManagement/SalaryType"
import AddSalaryType from "../SalaryManagement/AddSalaryType"
import ViewSalaryType from "../SalaryManagement/ViewSalaryType"
import EditSalaryType from "../SalaryManagement/EditSalaryType"
import SalaryTeacher from "../SalaryManagement/SalaryTeacher"
import ViewLeaveStatus from "../SalaryManagement/ViewLeaveStatus";

//================================AcademicDiary============================
import AcademicDiaryLayout from "../Layout/AcademicDiaryLayout";
import UserProfile from "../AcademicDiary/UserProfile";
import ProfessionalEthics from "../AcademicDiary/ProfessionalEthics";
import Committee from "../AcademicDiary/Committee";
import AdvLearner from "../AcademicDiary/AdvLearner";

import SettingsLayout from "../Layout/SettingsLayout";
import RolePage from "../Settings/RolePage";
import TaskType from "../Settings/TaskType";
import TaskStatus from "../Settings/TaskStatus";
import Priority from "../Settings/PriorityPage";
import BulkUpload from "../Settings/Component/BulkUpload";


//==========================Task====================================
import TaskLayout from "../Layout/TaskLayout";
import MyTasks from "../Task/MyTasks/MyTasks";
import TaskAssignment from "../Task/TaskAssignment/TaskAssignment";
import TaskForm from "../Task/TaskAssignment/CreateTask";
import ViewMyTasks from "../Task/MyTasks/ViewMyTasks";
import EditTask from "../Task/TaskAssignment/EditTask";
import MyTaskEdit from "../Task/MyTasks/MyEditTask";
import TaskView from "../Task/TaskAssignment/TaskView";
import CreateTask from "../Task/MyTasks/CreateNewTasks";
import TimeSheetDashboard from "../Task/Timesheet/Timesheet";


export default function HRMRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /hrm */}
      <Route path="/" element={<Navigate to="tasks" replace />} />

      {/* ✅ Student list route */}
      <Route element={<TaskManagementLayout />}>
        <Route path="dashboard" element={<UserDashboard />} />
        {/* <Route path="salary" element={<DepartmentPage />} /> */}
        {/* <Route path="tasks" element={<DepartmentPage />} />
        <Route path="departments/add" element={<AddDepartment />} />
        <Route path="departments/edit/:id" element={<EditDepartment />} /> */}
      </Route>




      <Route path="academic-diary" element={<AcademicDiaryLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="professional-ethics" element={<ProfessionalEthics />} />
        <Route path="committee" element={<Committee />} />
        <Route path="advanced-learner" element={<AdvLearner />} />
        <Route path="slow-learner" element={<Committee />} />
        <Route path="teaching-plan" element={<SalaryAttendance />} />
        <Route path="time-table" element={<SalaryAttendance />} />
      </Route>

      <Route path="tasks" element={<TaskLayout />}>
        <Route index element={<Navigate to="task-assignment" replace />} />
        <Route path="professional-tasks" element={<MyTasks />} />
        <Route path="professional-tasks/add" element={<CreateTask />} />
        <Route path="professional-tasks/view/:id" element={<ViewMyTasks />} />
        <Route path="professional-tasks/edit/:id" element={<MyTaskEdit />} />
        <Route path="task-assignment" element={<TaskAssignment />} />
        <Route path="task-assignment/create-task" element={<TaskForm />} />
        <Route path="task-assignment/task-view/:id" element={<TaskView />} />
        <Route path="task-assignment/edit-task/:id" element={<EditTask />} />
        <Route path="timesheet" element={<TimeSheetDashboard />} />
      </Route>

      <Route path="salary" element={<SalaryManagementLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* Salary dashboard */}
        <Route path="dashboard" element={<SalaryDashboard />} />
        <Route path="employee" element={<SalaryEmployee />} />
        <Route path="attendance" element={<SalaryAttendance />} />
        {/* <Route path="add-teacher" element={<AddTeacher />} />
        <Route path="add-otherstaff" element={<AddOtherStaff />} /> */}

        <Route path="salary-type" element={<SalaryType />} />
        <Route path="salary-type/add" element={<AddSalaryType />} />
        <Route path="salary-type/view/:id" element={<ViewSalaryType />} />
        <Route path="salary-type/edit/:id" element={<EditSalaryType />} />
        <Route path="salary-teacher" element={<SalaryTeacher />} />
        <Route path="salary-teacher/view-status/:id" element={<ViewLeaveStatus />} />
      </Route>

      <Route path="settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="role" replace />} />
        <Route path="role" element={<RolePage />} />
        <Route path="role/bulkupload" element={<BulkUpload />} />
        <Route path="task-type" element={<TaskType />} />
        <Route path="priority" element={<Priority />} />
        <Route path="task-status" element={<TaskStatus />} />
        {/* <Route path="task-type/bulkupload" element={<BulkUpload />} /> */}
        {/* <Route path="committee" element={<Committee />} />
        <Route path="teaching-plan" element={<SalaryAttendance />} />
        <Route path="time-table" element={<SalaryAttendance />} /> */}

      </Route>
    </Routes>
  );
}