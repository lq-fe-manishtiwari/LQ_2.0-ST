import { NavLink } from "react-router-dom";

const customBlue = "rgb(33 98 193)";

export default function TabsNav() {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <NavLink
        to="pending-feedback"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md text-white font-medium transition-colors ${
            isActive ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          }`
        }
        style={({ isActive }) => (isActive ? { backgroundColor: customBlue } : {})}
      >
        Pending Feedback Forms
      </NavLink>

      <NavLink
        to="submitted-feedback"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md text-white font-medium transition-colors ${
            isActive ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          }`
        }
        style={({ isActive }) => (isActive ? { backgroundColor: customBlue } : {})}
      >
        My Submitted Forms
      </NavLink>
    </div>
  );
}