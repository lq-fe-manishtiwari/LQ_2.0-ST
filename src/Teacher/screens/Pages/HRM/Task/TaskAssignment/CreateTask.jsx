import React, { useState } from "react";
import { Plus, X, ChevronDown, Eye, Trash2, Users, Calendar, Target, FileText, AlertCircle } from "lucide-react";

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
              <Users className="w-5 h-5 text-blue-600" />
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  {employee?.role || "Team Member"}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Department</h4>
                <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
                  {employee?.department || "General"}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Responsibilities</h4>
              <ul className="space-y-3">
                {employee?.responsibility ? (
                  <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{employee.responsibility}</span>
                  </li>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-600">Complete assigned tasks on time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span className="text-sm text-gray-600">Report any issues immediately</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span className="text-sm text-gray-600">Attend all scheduled meetings</span>
                    </li>
                  </>
                )}
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

// Custom Select Component (UI only)
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-blue-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value || option.id || option.name : option;
              const optionDisplay = typeof option === 'object' ? option.name || option.label || option.value : option;
              
              return (
                <div
                  key={index}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSelect(optionValue)}
                >
                  {optionDisplay}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TaskForm() {
  // Mock form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedDate: "",
    dueDate: "",
    priority: "",
    department: "",
    employee: "",
    role: "",
    responsibility: "",
  });

  // Mock data
  const mockDepartments = [
    { id: 1, name: "IT" },
    { id: 2, name: "Design" },
    { id: 3, name: "Marketing" },
    { id: 4, name: "HR" }
  ];

  const mockEmployees = [
    { id: 1, name: "Alex Johnson", department: "IT" },
    { id: 2, name: "Sarah Miller", department: "Design" },
    { id: 3, name: "Michael Chen", department: "IT" },
    { id: 4, name: "Emma Wilson", department: "Marketing" }
  ];

  const mockRoles = [
    { id: 1, name: "Developer" },
    { id: 2, name: "Designer" },
    { id: 3, name: "Manager" },
    { id: 4, name: "Analyst" }
  ];

  const mockTaskTypes = [
    { id: 1, name: "Development" },
    { id: 2, name: "Design" },
    { id: 3, name: "Testing" },
    { id: 4, name: "Documentation" }
  ];

  // Assigned employees state
  const [assignedEmployees, setAssignedEmployees] = useState([
    {
      id: "emp-1",
      employeeName: "Alex Johnson",
      role: "Developer",
      department: "IT",
      responsibility: "Frontend Development"
    },
    {
      id: "emp-2",
      employeeName: "Sarah Miller",
      role: "Designer",
      department: "Design",
      responsibility: "UI/UX Design"
    }
  ]);

  // UI States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalEntries = assignedEmployees.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = assignedEmployees.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  // Mock handlers
  const handleSubmit = () => {
    console.log("Form submitted:", form);
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Task created successfully! (UI Demo)");
      
      // Reset form
      setForm({
        title: "",
        description: "",
        taskType: "",
        assignedDate: "",
        dueDate: "",
        priority: "",
        department: "",
        employee: "",
        role: "",
        responsibility: "",
      });
      setAssignedEmployees([]);
    }, 1500);
  };

  const handleAddEmployee = () => {
    if (!form.employee || !form.role || !form.department) {
      alert("Please select employee, role, and department first");
      return;
    }

    const newEmployee = {
      id: `emp-${Date.now()}`,
      employeeName: form.employee,
      role: form.role,
      department: form.department,
      responsibility: form.responsibility || "General tasks"
    };

    setAssignedEmployees([...assignedEmployees, newEmployee]);
    
    // Clear form
    setForm({
      ...form,
      employee: "",
      role: "",
      responsibility: ""
    });
    
    alert(`Added ${newEmployee.employeeName} to task`);
  };

  const handleRemoveEmployee = (id) => {
    const employee = assignedEmployees.find(emp => emp.id === id);
    if (employee && window.confirm(`Remove ${employee.employeeName} from task?`)) {
      setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== id));
      alert("Employee removed successfully (UI Demo)");
    }
  };

  const handleViewRoles = (employee) => {
    setSelectedEmployee(employee);
    setShowRoleModal(true);
  };

  const handleGoBack = () => {
    alert("Navigate back to task list (UI Demo)");
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Task</h1>
              <p className="text-sm text-gray-500">Assign tasks to team members with roles and responsibilities</p>
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

        {/* Task Information Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Task Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-none`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className={labelClass}>Task Type *</label>
                <CustomSelect
                  label=""
                  value={form.taskType}
                  onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                  options={mockTaskTypes}
                  placeholder="Select task type"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Assigned Date *</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.assignedDate}
                    onChange={(e) => setForm({ ...form, assignedDate: e.target.value })}
                    min={getCurrentDateTime()}
                  />
                </div>
                <div>
                  <label className={labelClass}>Due Date *</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    min={form.assignedDate}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Priority *</label>
                <CustomSelect
                  label=""
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  options={["High", "Medium", "Low"]}
                  placeholder="Select priority"
                />
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Task Preview:</h3>
                <div className="text-sm space-y-2">
                  <div className="flex">
                    <span className="font-medium w-24">Title:</span>
                    <span className="text-gray-700">{form.title || "Not set"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Priority:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      form.priority === "High" ? "bg-red-100 text-red-700" :
                      form.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      form.priority ? "bg-green-100 text-green-700" : "text-gray-500"
                    }`}>
                      {form.priority || "Not set"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Type:</span>
                    <span className="text-gray-700">{form.taskType || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assign Employees Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Assign Team Members
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <CustomSelect
              label="Department *"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              options={mockDepartments}
              placeholder="Select department"
            />

            <CustomSelect
              label="Employee *"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              options={mockEmployees.filter(emp => !form.department || emp.department === form.department)}
              placeholder={form.department ? "Select employee" : "Select department first"}
              disabled={!form.department}
            />

            <CustomSelect
              label="Role *"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={mockRoles}
              placeholder="Select role"
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Responsibilities</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={form.responsibility}
              onChange={(e) => setForm({ ...form, responsibility: e.target.value })}
              placeholder="Enter specific responsibilities for this assignment"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddEmployee}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Task
            </button>
          </div>
        </div>

        {/* Assigned Team Members Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Team Members ({assignedEmployees.length})</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Total: {assignedEmployees.length}</span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Responsibility</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No team members assigned</p>
                        <p className="text-sm mt-1">Add team members using the form above</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{employee.employeeName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {employee.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{employee.department}</td>
                      <td className="py-4 px-4 text-gray-700 text-sm">{employee.responsibility}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRoles(employee)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {assignedEmployees.length > 0 && (
              <div className="flex justify-between items-center px-4 py-4 border-t border-gray-200">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Showing {start + 1}-{Math.min(end, totalEntries)} of {totalEntries}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {assignedEmployees.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-600">No team members assigned</p>
                <p className="text-sm text-gray-500 mt-1">Add team members using the form above</p>
              </div>
            ) : (
              currentEntries.map((employee) => (
                <div key={employee.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{employee.employeeName}</h4>
                        <p className="text-sm text-gray-500">{employee.role} • {employee.department}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Responsibility:</span> {employee.responsibility}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewRoles(employee)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Task Button */}
        <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to Create Task</h3>
              <p className="text-sm text-gray-600 mt-1">
                Task will be assigned to {assignedEmployees.length} team member(s)
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
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