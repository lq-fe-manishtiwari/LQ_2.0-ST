import { NavLink } from "react-router-dom";

export default function TabsNav() {
  return (
    <div className="flex gap-2 mb-4">
      <NavLink
        to="pending-feedback"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "bg-gray-200"}`
        }
      >
        Pending Feedback Forms
      </NavLink>

      <NavLink
        to="submitted-feedback"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "bg-gray-200"}`
        }
      >
        My Submitted Forms
      </NavLink>
    </div>
  );
}
