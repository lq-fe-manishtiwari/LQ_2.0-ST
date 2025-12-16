import React, { useState } from "react";
import { FileText, HelpCircle, BookOpen, Users } from "lucide-react";
// import Questions from "../QuestionsTab/Questions";
import ContentDashboard from "../Dashboard/ContentDashboard";
import StudentProject from "../AddContent/StudentProject";
import Add_Content from "../AddContent/Add_Content"
import Question from "../QuestionsTab/Questions.jsx";

const tabs = [
  { name: "Content", key: "content", icon: <FileText size={16} /> },
  { name: "Quiz", key: "quiz", icon: <BookOpen size={16} /> },
  { name: "Question", key: "question", icon: <HelpCircle size={16} /> },
  { name: "Student Project", key: "student-project", icon: <Users size={16} /> },
];

export default function TabsNav() {
  const [activeTab, setActiveTab] = useState("content");

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <Add_Content/>;
      case "quiz":
        return (
          <div className="p-6 text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Quiz Dashboard</h3>
            <p>Quiz functionality will be implemented here.</p>
          </div>
        );
      case "question":
        return <Question/>;
      case "student-project":
        return <StudentProject />;
      default:
        return <ContentDashboard />;
    }
  };

  return (
    <div className="p-2 md:p-2">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`tab-link whitespace-nowrap w-auto flex items-center gap-2 flex-shrink-0 px-4 py-2 text-sm cursor-default
              ${activeTab === tab.key ? "tab-active" : "tab-inactive"}
            `}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
