import React from "react";
import { Outlet } from "react-router-dom";
import ContentDashboard from "./Dashboard/ContentDashboard";

export default function ContentLayout() {
  return (
    <div className="p-0 sm:p-6">
      <h2 className="pageheading mb-2 sm:mb-4">Content</h2>
      <ContentDashboard />
    </div>
  );
}
