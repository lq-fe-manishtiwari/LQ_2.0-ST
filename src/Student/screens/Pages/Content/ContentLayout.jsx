import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import TabsNav from "./Components/TabNav";

export default function ContentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const showCloseBtn = location.pathname === '/curriculum/student-project';

  return (
    <div className="p-0 sm:p-6">
      <div className="flex justify-between items-center mb-2 sm:mb-4 gap-4">
        <h2 className="pageheading">Content</h2>
        {showCloseBtn && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg ml-auto mr-4"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <TabsNav/>
      <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
