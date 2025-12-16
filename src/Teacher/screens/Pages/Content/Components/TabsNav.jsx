import { NavLink } from "react-router-dom";
import { FileText, HelpCircle, BookOpen, Users } from "lucide-react";

const tabs = [
  { name: "Content", path: "content", icon: <FileText size={16} /> },
  { name: "Quiz", path: "quiz", icon: <BookOpen size={16} /> },
  { name: "Question", path: "question", icon: <HelpCircle size={16} /> },
  { name: "Student Project", path: "student-project", icon: <Users size={16} /> },
];

export default function TabsNav() {
  return (
    <div className="p-2 md:p-2">
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
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
    </div>
  );
}
