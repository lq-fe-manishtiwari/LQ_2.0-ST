import React from "react";
import { Outlet } from "react-router-dom";
import TabsNav from "./Components/TabNav";

const FeesLayout = () => {
  return (
    <div className="p-4 sm:p-6">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="pageheading">Fees</h2>
      </div>

      {/* ===== Tabs (Only Dashboard) ===== */}
      <TabsNav />

      {/* ===== Child Pages ===== */}
      <Outlet />
    </div>
  );
};

export default FeesLayout;
