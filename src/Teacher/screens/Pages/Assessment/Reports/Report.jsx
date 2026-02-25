import React, { useState } from "react";
import AssessmentReports from "./AssessmentReports";
import QuestionReports from "./QuestionReports";
import RubricsReports from "./RubricsReports";

const Reports = () => {
    const [activeTab, setActiveTab] = useState("Assessment Reports");

    const tabs = [
        { id: "Assessment Reports", name: "Assessment Reports" },
        { id: "Question Reports", name: "Question Reports" },
        { id: "Rubrics Reports", name: "Rubrics Reports" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header / Tabs */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="px-4">
                    <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide justify-start">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-4 py-2 
                                    rounded-full 
                                    text-sm font-medium 
                                    whitespace-nowrap
                                    transition-all
                                    ${activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    }
                                `}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 lg:p-6 mx-auto max-w-[1600px]">
                <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 overflow-hidden min-h-[600px]">
                    {activeTab === "Assessment Reports" && (
                        <AssessmentReports />
                    )}
                    {activeTab === "Question Reports" && (
                        <QuestionReports />
                    )}
                    {activeTab === "Rubrics Reports" && (
                        <RubricsReports />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;

