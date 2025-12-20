import React from "react";
import { Outlet } from "react-router-dom";
import TabNav from "./Component/TabNav";

export default function LeavesLayout() {
  return (
    <div className="p-0 sm:p-6">
      <h2 className="pageheading mb-2 sm:mb-4">Leaves</h2>
      <TabNav/>

      <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
