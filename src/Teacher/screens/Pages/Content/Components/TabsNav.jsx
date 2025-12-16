import React, { useState } from "react";
import { FileText, HelpCircle, BookOpen, Users, X } from "lucide-react";
import Questions from "../QuestionsTab/Questions";
import ContentDashboard from "../Dashboard/ContentDashboard";
import StudentProject from "../AddContent/StudentProject";

const tabs = [
  { name: "Content", key: "content", icon: <FileText size={18} /> },
  { name: "Quiz", key: "quiz", icon: <BookOpen size={18} /> },
  { name: "Question", key: "question", icon: <HelpCircle size={18} /> },
  { name: "Student Project", key: "student-project", icon: <Users size={18} /> },
];

export default function TabsNav() {
  const [activeTab, setActiveTab] = useState("content");

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <ContentDashboard />;
      case "quiz":
        return (
          <div className="p-6 text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Quiz Dashboard</h3>
            <p>Quiz functionality will be implemented here.</p>
          </div>
        );
      case "question":
        return <Questions />;
      case "student-project":
        return <StudentProject />;
      default:
        return <ContentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center sm:text-left text-blue-700">Content Management</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mt-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg transition-all
                  ${activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}