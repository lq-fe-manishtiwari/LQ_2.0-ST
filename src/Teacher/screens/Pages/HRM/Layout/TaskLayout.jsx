// src/HRM/Tasks/TaskLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import TasksTabsNav from "../Components/TaskTabsNav";

export default function TaskLayout() {
  return (
    <div className="p-0 sm:p-6">
      {/* Task Header / Sidebar / Tabs */}
      <h2 className="pageheading mb-2 sm:mb-4">Task Management</h2>
      <TasksTabsNav />

      <div  className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
