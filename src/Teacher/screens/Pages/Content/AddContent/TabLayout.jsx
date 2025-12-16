import { Outlet } from "react-router-dom";
import TabsNav from "../Components/TabsNav";

export default function TabLayout() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      {/* Tabs Navigation */}
      <div className="mb-4">
        <TabsNav />
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}
