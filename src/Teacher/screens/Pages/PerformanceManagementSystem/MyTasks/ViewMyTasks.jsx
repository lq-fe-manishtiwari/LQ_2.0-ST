import React, { useState } from "react";
import { Eye, X } from "lucide-react";
import RoleModal from '../Components/RoleModal';

export default function ViewMyTasks({ task }) {
  // Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Sample employee data
  const employees = [
    {
      id: 1,
      name: 'Tejas Chaudhari',
      employee: 'Tejas Chaudhari',
      designation: 'Graphic Designer',
      role: 'Employee',
      department: 'Digital Marketing',
      responsibility: 'Design and creative work, Brand identity development, Visual content creation'
    },
    {
      id: 2,
      name: 'Ranee Nikure',
      employee: 'Ranee Nikure',
      designation: 'Digital Marketing Head',
      role: 'Team Leader',
      department: 'Digital Marketing',
      responsibility: 'Team management and strategy, Campaign planning, Performance monitoring'
    },
    {
      id: 3,
      name: 'Janhvi Wanmali',
      employee: 'Janhvi Wanmali',
      designation: 'Associate Software Engineer',
      role: 'Employee',
      department: 'Digital Marketing',
      responsibility: 'Software development and maintenance, Code review, Testing and deployment'
    }
  ];

  // View roles and responsibility
  const handleViewRoles = (employee) => {
    setSelectedEmployee(employee);
    setShowRoleModal(true);
  };

  // Example fallback data
  const data = task || {
    title: "Creative of Diwali",
    description: "I have to make a creative on a Diwali",
    assignedDate: "20-09-2025 , 12:10 PM",
    dueDate: "20-09-2025 , 12:10 PM",
    assignedBy: "Self",
    taskType: "Scheduled",
    priority: "High",
    status: "In-Progress",
    overdue: "5 Days 21 Hrs 25 Min",
  };

  // Helper function to check if task is overdue
  const isTaskOverdue = (task) => {
    if (task.status === 'Complete' || task.status === 'Completed') return false;
    const dateStr = task.dueDate.split(' , ')[0]; // Get date part
    const [day, month, year] = dateStr.split('-');
    const dueDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return dueDate < currentDate;
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">

      {/* ⭐ TOP HEADING + BACK BUTTON */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">Task Details</h2>
        </div>

        {/* RIGHT: BACK BUTTON */}
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 
                     flex items-center justify-center rounded-full shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ⭐ MAIN VIEW CARD - Updated Layout */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border w-full">
        
        {/* Two Column Layout as per screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-4 lg:space-y-6">
            
            <div className="break-words">
              <span className="font-semibold text-gray-700">Title:</span>
              <p className="text-gray-900 mt-1">{data.title}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Assigned Date & Time:</span>
              <p className="text-gray-900 mt-1">{data.assignedDate}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Assigned By:</span>
              <p className="text-gray-900 mt-1">{data.assignedBy}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">Priority:</span>
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                  data.priority === "High"
                    ? "bg-red-100 text-red-800"
                    : data.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {data.priority}
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 lg:space-y-6">
            
            <div className="break-words">
              <span className="font-semibold text-gray-700">Description:</span>
              <p className="text-gray-900 mt-1">{data.description}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Due Date & Time:</span>
              <p className={`mt-1 font-medium ${
                isTaskOverdue(data) ? 'text-red-600' : 'text-gray-900'
              }`}>
                {data.dueDate}
              </p>
              {isTaskOverdue(data) && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                  Overdue by: {data.overdue}
                </span>
              )}
            </div>

            <div>
              <span className="font-semibold text-gray-700">Task Type:</span>
              <p className="text-gray-900 mt-1">{data.taskType}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">Status:</span>
              <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                data.status === 'Complete' || data.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : data.status === 'In-Progress' || data.status === 'Active'
                  ? 'bg-blue-100 text-blue-800'
                  : data.status === 'Incomplete'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data.status}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ⭐ TASK ASSIGNMENTS TABLE - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Name</th>
                <th className="table-th text-center">Designation</th>
                <th className="table-th text-center">Role</th>
                <th className="table-th text-center">Department</th>
                {/* <th className="table-th text-center">Roles & Responsibility</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{employee.designation}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{employee.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{employee.department}</td>
                  {/* <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleViewRoles(employee)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ────────────────────── Pagination ────────────────────── */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
          {/* Previous Button */}
          <button
            disabled={true}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all bg-blue-200 text-gray-400 cursor-not-allowed"
          >
            Previous
          </button>

          {/* Showing X-Y of Z */}
          <span className="text-sm font-medium text-gray-700">
            Showing <strong>1</strong>–<strong>3</strong> of <strong>3</strong> entries
          </span>

          {/* Next Button */}
          <button
            disabled={true}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all bg-blue-200 text-gray-400 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-500">{employee.designation}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div><span className="font-medium">Role:</span> {employee.role}</div>
              <div><span className="font-medium">Department:</span> {employee.department}</div>
            </div>
            <div className="flex justify-end items-center">
              <button 
                onClick={() => handleViewRoles(employee)}
                className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roles & Responsibility Modal */}
      {/* <RoleModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        employee={selectedEmployee}
      /> */}
    </div>
  );
}