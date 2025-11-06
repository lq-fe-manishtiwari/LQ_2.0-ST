import { NavLink } from "react-router-dom";
import { Table, Calendar } from "lucide-react";

export default function TabsNav() {
  return (
    <div className="flex gap-2 mb-4">
      <NavLink
        to="pending-feedback"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md ${isActive ? "bg-blue-600 text-white" : "bg-gray-200"}`
        }
      >
        <Table className="inline w-4 h-4 mr-1" />
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
