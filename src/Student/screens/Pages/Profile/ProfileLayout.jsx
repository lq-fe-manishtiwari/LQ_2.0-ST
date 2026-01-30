import React from "react";
import { Outlet } from "react-router-dom";
import TabsNav from "../Profile/Components/TabNav";

export default function ProfileLayout() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="pageheading mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-800">My Profile</h2>
      <TabsNav />

      <div className="mt-2 sm:mt-4">
        <Outlet />
      </div>
    </div>
  );
}
