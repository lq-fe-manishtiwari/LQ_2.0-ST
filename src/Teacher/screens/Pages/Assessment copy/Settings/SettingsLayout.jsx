import React from "react";
import { Outlet } from "react-router-dom";
import TabsNav from "../Components/TabsNav";

const SETTINGS_TABS = [
    { label: "Rubrics Configuration", to: "/admin-assessment/settings/rubrics" },
    { label: "CO Configuration", to: "/admin-assessment/settings/co" },
    { label: "Question Level Setting", to: "/admin-assessment/settings/question-level-setting" },
];

export default function SettingsLayout() {
    return (
        <div className="p-0 sm:p-6">
            <h2 className="pageheading mb-2 sm:mb-4">Assessment Settings</h2>
            <TabsNav customTabs={SETTINGS_TABS} />

            {/* Mobile: flat view (no card) | Desktop: card layout */}
            <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
                <Outlet />
            </div>
        </div>
    );
}
