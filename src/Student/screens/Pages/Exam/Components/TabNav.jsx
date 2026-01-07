import { NavLink } from "react-router-dom";

export default function TabsNav() {
  return (
    <div className="flex gap-2 mb-4">
      {/* <NavLink
        to="dashboard"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md ${
            isActive ? "bg-blue-600 text-white" : "bg-gray-200"
          }`
        }
      >
        <Table className="inline w-4 h-4 mr-1" />
        Tabular View
      </NavLink>

      <NavLink
        to="calendar"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md ${
            isActive ? "bg-blue-600 text-white" : "bg-gray-200"
          }`
        }
      >
        <Calendar className="inline w-4 h-4 mr-1" />
        Month View
      </NavLink> */}
    </div>
  );
}
