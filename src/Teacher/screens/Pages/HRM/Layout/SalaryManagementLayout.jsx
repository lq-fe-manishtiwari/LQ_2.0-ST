import React from "react";
import { Outlet } from "react-router-dom";
import SalaryTabsNav from "../Components/SalaryTabNav";

export default function SalaryManagementLayout() {
  return (
    <div className="p-0 sm:p-6">
      <h2 className="pageheading mb-2 sm:mb-4">Salary Management</h2>
      <SalaryTabsNav/>

      <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
