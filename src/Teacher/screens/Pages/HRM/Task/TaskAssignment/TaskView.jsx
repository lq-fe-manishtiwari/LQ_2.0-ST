import React, { useState } from "react";
import { Eye, X, Clock, Calendar, User, Target, FileText, AlertCircle } from "lucide-react";

// Mock RoleModal Component (UI only)
const RoleModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Roles & Responsibilities</h3>
              <p className="text-sm text-gray-500">{employee?.name || "Employee"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                {employee?.roleName || "Team Member"}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Department</h4>
              <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
                {employee?.departmentName || "General"}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Responsibilities</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600">Complete assigned tasks on time</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span className="text-sm text-gray-600">Submit progress reports weekly</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <span className="text-sm text-gray-600">Report any issues immediately</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TaskView() {
  // Mock task data
  const [task, setTask] = useState({
    id: 1,
    title: "Website Redesign Project",
    description: "Redesign the company website with modern UI/UX principles. Focus on improving user experience and mobile responsiveness. Include new features like dark mode and improved navigation.",
    assignedDate: "2024-03-10T09:00:00",
    dueDate: "2024-03-25T18:00:00",
    assignedBy: "John Manager",
    priority: "High",
    taskType: "Development",
    status: "In Progress"
  });

  // Mock employees data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      designation: "Frontend Developer",
      role: 1,
      department: 2,
      responsibility: "UI Development"
    },
    {
      id: 2,
      name: "Sarah Miller",
      designation: "UX Designer",
      role: 2,
      department: 3,
      responsibility: "User Research & Design"
    },
    {
      id: 3,
      name: "Michael Chen",
      designation: "Backend Developer",
      role: 3,
      department: 2,
      responsibility: "API Integration"
    }
  ]);

  // Mock departments data
  const mockDepartments = [
    { id: 1, name: "HR" },
    { id: 2, name: "IT" },
    { id: 3, name: "Design" },
    { id: 4, name: "Marketing" }
  ];

  // Mock roles data
  const mockRoles = [
    { id: 1, name: "Developer" },
    { id: 2, name: "Designer" },
    { id: 3, name: "Manager" },
    { id: 4, name: "Analyst" }
  ];

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Helper functions
  const getRoleNameFromId = (roleId) => {
    const role = mockRoles.find(r => r.id === roleId);
    return role ? role.name : "Team Member";
  };

  const getDepartmentNameFromId = (deptId) => {
    const dept = mockDepartments.find(d => d.id === deptId);
    return dept ? dept.name : "General";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
  };

  const isTaskOverdue = () => {
    const due = new Date(task.dueDate);
    const today = new Date();
    return due < today;
  };

  const calculateOverdueTime = () => {
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffTime = now - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays} Day${diffDays !== 1 ? 's' : ''} ${diffHours} Hour${diffHours !== 1 ? 's' : ''}`;
  };

  const handleViewRoles = (employee) => {
    const employeeWithDetails = {
      ...employee,
      roleName: getRoleNameFromId(employee.role),
      departmentName: getDepartmentNameFromId(employee.department)
    };
    setSelectedEmployee(employeeWithDetails);
    setShowRoleModal(true);
  };

  const handleGoBack = () => {
    alert("Navigate back to task list (UI Demo)");
  };

  // Mock loading state for demonstration
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Eye className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
            </div>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="bg-white rounded-2xl p-12 shadow-sm border flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading task details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">Error loading task</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task Details</h1>
              <p className="text-sm text-gray-500">View and manage task information</p>
            </div>
          </div>
          <button
            onClick={handleGoBack}
            className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
            title="Go back"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Task Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Task Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                    <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned Date & Time</label>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(task.assignedDate)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned By</label>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{task.assignedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Task Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                      {task.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Due Date & Time</label>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isTaskOverdue() ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isTaskOverdue() ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                      {isTaskOverdue() && (
                        <span className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Overdue by {calculateOverdueTime()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        task.priority === "High" 
                          ? "bg-red-100 text-red-700" 
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Task Type</label>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {task.taskType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${
                      task.status === "Completed" 
                        ? "bg-green-100 text-green-700"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Employees Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assigned Employees</h2>
              <p className="text-sm text-gray-500">{employees.length} team members assigned</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{employee.designation}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {getRoleNameFromId(employee.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{getDepartmentNameFromId(employee.department)}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewRoles(employee)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                      <p className="text-sm text-gray-500">{employee.designation}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-gray-700">{getRoleNameFromId(employee.role)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-gray-700">{getDepartmentNameFromId(employee.department)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewRoles(employee)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Roles & Responsibilities
                </button>
              </div>
            ))}
          </div>
        </div>

  
        {/* Role Modal */}
        <RoleModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          employee={selectedEmployee}
        />
      </div>
    </div>
  );
}