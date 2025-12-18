import { NavLink, useNavigate } from "react-router-dom";
import { FileText, HelpCircle, BookOpen, Users, X } from "lucide-react";

const tabs = [
  { name: "Content", path: "content", icon: <FileText size={16} /> },
  { name: "Quiz", path: "quiz", icon: <BookOpen size={16} /> },
  { name: "Question", path: "question", icon: <HelpCircle size={16} /> },
  { name: "Student Project", path: "student-project", icon: <Users size={16} /> },
];

export default function TabsNav() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/teacher/content/dashboard");
  };

  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 items-center justify-between">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `tab-link whitespace-nowrap w-auto flex items-center gap-2 flex-shrink-0 px-4 py-2 text-sm cursor-default ${
                  isActive ? "tab-active" : "tab-inactive"
                }`
              }
            >
              {tab.icon}
              {tab.name}
            </NavLink>
          ))}
        </div>
        
        {/* Back to Dashboard Button - Blue circle with X icon */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
          title="Back to Dashboard"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}