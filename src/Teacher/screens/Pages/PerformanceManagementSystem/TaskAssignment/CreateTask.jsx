import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ChevronDown, Eye, Trash2 } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import RoleModal from '../Components/RoleModal';
// import { DepartmentService } from '../../Academics/Services/Department.service';
// import { Settings } from '../Settings/Settings.service';
import { TaskManagement } from '../Services/TaskManagement.service';

// Multi-Select Responsibility Component
const MultiSelectResponsibility = ({ label, selectedItems, options, onChange, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = options.filter(option => !selectedItems.includes(option));

  const handleSelect = (option) => {
    onChange(option);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-blue-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedItems.length > 0 ? (
            selectedItems.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {item}
                <button
                  onClick={() => onRemove(item)}
                  className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
                  title="Remove Responsibility"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm ml-1">Select Responsibility(s)</span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map(option => (
                <div
                  key={option}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">All responsibilities selected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
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
            {options.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateTask() {
  const navigate = useNavigate();

  // API data states
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;
  const user = JSON.parse(localStorage.getItem("user"));

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

  // Alert States
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  
  // Assigned employees state
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  
  // Pagination state
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination calculations
  const totalEntries = assignedEmployees.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = assignedEmployees.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  
  // Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Multi-select responsibilities state
  const [selectedResponsibilities, setSelectedResponsibilities] = useState([]);
  
  // Responsibility options
  const responsibilityOptions = [
    'Project Management',
    'Team Leadership',
    'Quality Assurance',
    'Documentation',
    'Client Communication',
    'Code Review',
    'Testing',
    'Deployment',
    'Training',
    'Research & Development'
  ];

  const inputClass =
    "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";

  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  // Error handling for API calls
  const handleAPIError = (error, context) => {
    console.error(`Error ${context}:`, error);
    setAlertMessage(`Failed to ${context}. Please try again.`);
    setShowErrorAlert(true);
  };

  // Fetch Departments on Mount
  useEffect(() => {
    console.log("Fetching departments for collegeId:", collegeId);
    if (!collegeId) {
      console.warn("No collegeId found");
      setLoadingDepartments(false);
      return;
    }

    DepartmentService.getDepartmentByCollegeId(collegeId)
      .then(response => {
        console.log("Departments API response:", response);
        const deptList = response.data || response || [];
        console.log("Departments list:", deptList);
        
        // Format for CustomSelect component (needs name strings)
        const formattedDepartments = deptList.map(dept => ({
          id: dept.department_id || dept.id,
          name: dept.name || dept.department_name || `Department ${dept.department_id}`
        }));
        
        setDepartments(formattedDepartments);
        setLoadingDepartments(false);
      })
      .catch(err => {
        console.error("Error fetching departments:", err);
        setLoadingDepartments(false);
        handleAPIError(err, "fetch departments");
      });
  }, [collegeId]);

  // Fetch Employees when Department changes
  useEffect(() => {
    console.log("Fetching employees for department:", form.department);
    if (!form.department) {
      console.log("No department selected, clearing employees");
      setEmployees([]);
      setForm(prev => ({ ...prev, employee: "" }));
      return;
    }

    setLoadingEmployees(true);
    
    // Find the department ID from the selected department name
    const selectedDept = departments.find(d => d.name === form.department);
    const departmentId = selectedDept?.id;
    
    if (!departmentId) {
      console.error("Could not find department ID for:", form.department);
      setEmployees([]);
      setLoadingEmployees(false);
      return;
    }
    
    // NOTE: You need to fix the getStaffByDepartment function in your service
    // Currently it fetches all staff. You need to update it to filter by department
    TaskManagement.getStaffByDepartment(departmentId)
      .then(response => {
        console.log("Employees API response:", response);
        const empList = response.data || response || [];
        
        // Format for CustomSelect component
        const formattedEmployees = empList.map(emp => ({
          id: emp.staff_id || emp.id || emp.employee_id || emp.user_id,
          name: emp.name || emp.fullname || 
                `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || 
                `Employee ${emp.staff_id}`
        }));
        
        setEmployees(formattedEmployees);
        setLoadingEmployees(false);
      })
      .catch(err => {
        console.error("Error fetching employees:", err);
        setEmployees([]);
        setLoadingEmployees(false);
        handleAPIError(err, "fetch employees");
      });
  }, [form.department, departments]);

  // Fetch Roles on Mount
  useEffect(() => {
    Settings.getAllRole()
      .then(response => {
        const roleList = response.data || response || [];
        
        // Format for select options
        const formattedRoles = roleList.map(role => ({
          id: role.role_id || role.id,
          name: role.role_name || role.name || `Role ${role.role_id}`
        }));
        
        setRoles(formattedRoles);
        setLoadingRoles(false);
      })
      .catch(err => {
        console.error("Error fetching roles:", err);
        setRoles([]);
        setLoadingRoles(false);
        handleAPIError(err, "fetch roles");
      });
  }, []);

  // Fetch Task Types on Mount
  useEffect(() => {
    Settings.getAllTaskType()
      .then(response => {
        const types = response.data || response || [];
        
        // Format for select options
        const formattedTypes = types.map(type => ({
          id: type.task_type_id || type.id,
          name: type.task_type_name || type.name || `Task Type ${type.task_type_id}`
        }));
        
        setTaskTypes(formattedTypes);
        setLoadingTaskTypes(false);
      })
      .catch(err => {
        console.error("Error fetching task types:", err);
        setTaskTypes([]);
        setLoadingTaskTypes(false);
        handleAPIError(err, "fetch task types");
      });
  }, []);

  // Form validation
  const validateForm = () => {
    if (!form.title || form.title.trim() === '') {
      setAlertMessage('Title is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (!form.description || form.description.trim() === '') {
      setAlertMessage('Description is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (!form.taskType) {
      setAlertMessage('Task type is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (!form.assignedDate) {
      setAlertMessage('Assigned date is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (!form.dueDate) {
      setAlertMessage('Due date is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (!form.priority) {
      setAlertMessage('Priority is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (assignedEmployees.length === 0) {
      setAlertMessage('Please assign at least one employee to the task.');
      setShowErrorAlert(true);
      return false;
    }

    // Date validation
    const assignedDate = new Date(form.assignedDate);
    const dueDate = new Date(form.dueDate);
    
    if (assignedDate >= dueDate) {
      setAlertMessage('Due date must be after assigned date.');
      setShowErrorAlert(true);
      return false;
    }

    return true;
  };

  // Form submission handler with API integration
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const assigned_by = user?.id || user?.user_id || 1;
      
      // Find the selected task type ID
      const selectedTaskType = taskTypes.find(t => t.name === form.taskType);
      const taskTypeId = selectedTaskType?.id;
      
      if (!taskTypeId) {
        throw new Error('Invalid task type selected');
      }

      // Prepare assigned employees data
      const userAssignments = assignedEmployees.map(emp => {
        // Find employee ID from employees list
        const employeeObj = employees.find(e => e.name === emp.employee);
        // Find role ID from roles list
        const roleObj = roles.find(r => r.name === emp.role);
        // Find department ID from departments list
        const deptObj = departments.find(d => d.name === emp.department);
        
        return {
          user_id: employeeObj?.id || 0,
          user_name: emp.employee,
          user_role_id: roleObj?.id || 0,
          user_role_name: emp.role,
          department_id: deptObj?.id || 0,
          department_name: emp.department,
          remarks: emp.responsibility || "N/A"
        };
      });

      // Get role ID from first assigned employee for task level role
      const firstAssignment = userAssignments[0];
      
      const payload = {
        task_name: form.title,
        description: form.description,
        task_type_id: parseInt(taskTypeId),
        due_date_time: new Date(form.dueDate).toISOString(),
        assigned_date_time: new Date(form.assignedDate).toISOString(),
        priority: form.priority,
        college_id: parseInt(collegeId),
        assigned_by: parseInt(assigned_by),
        role_id: firstAssignment?.user_role_id || null,
        user_assignments: userAssignments
      };

      console.log("Creating task with payload:", payload);
      
      // API call to create task
      const response = await TaskManagement.postTaskAssignment(payload);
      console.log("Create task response:", response);
      
      // Check if response indicates success
      if (response && (response.status === 200 || response.status === 201 || response.success)) {
        setIsSubmitting(false);
        setAlertMessage('Task created successfully!');
        setShowSuccessAlert(true);
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error creating task:', error);
      setIsSubmitting(false);
      
      let errorMsg = 'Failed to create task. Please try again.';
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        if (error.response.data) {
          errorMsg = error.response.data.message || 
                    error.response.data.error || 
                    JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setAlertMessage(errorMsg);
      setShowErrorAlert(true);
    }
  };

  // Delete handlers
  const handleDelete = (id) => {
    setEmployeeToDelete(id);
    setShowAlert(true);
  };
  
  const handleConfirmDelete = () => {
    setShowAlert(false);
    // Remove employee from assigned employees list
    setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== employeeToDelete));
    // Show success message
    setTimeout(() => {
      setEmployeeToDelete(null);
      setAlertMessage('Employee deleted successfully!');
      setShowDeleteSuccessAlert(true);
    }, 500);
  };
  
  const handleCancelDelete = () => {
    setShowAlert(false);
    setEmployeeToDelete(null);
  };

  // Handle responsibility selection
  const handleResponsibilityChange = (responsibility) => {
    setSelectedResponsibilities([...selectedResponsibilities, responsibility]);
  };

  // Handle responsibility removal
  const handleResponsibilityRemove = (responsibility) => {
    setSelectedResponsibilities(selectedResponsibilities.filter(r => r !== responsibility));
  };

  // Add employee to table
  const handleAddEmployee = () => {
    if (!form.department || !form.employee || !form.role) {
      setAlertMessage('Please fill in Department, Employee, and Role fields.');
      setShowErrorAlert(true);
      return;
    }

    // Check if employee is already assigned
    const isAlreadyAssigned = assignedEmployees.some(emp => 
      emp.employee === form.employee && emp.role === form.role
    );
    
    if (isAlreadyAssigned) {
      setAlertMessage('This employee with the same role is already assigned to the task.');
      setShowErrorAlert(true);
      return;
    }

    const newEmployee = {
      id: Date.now(),
      department: form.department,
      employee: form.employee,
      role: form.role,
      responsibility: selectedResponsibilities.length > 0 ? selectedResponsibilities.join(', ') : 'N/A'
    };

    setAssignedEmployees([...assignedEmployees, newEmployee]);
    
    // Clear assigned to fields
    setForm({
      ...form,
      department: '',
      employee: '',
      role: '',
      responsibility: ''
    });
    setSelectedResponsibilities([]);
  };

  // Remove employee from table
  const handleRemoveEmployee = (id) => {
    handleDelete(id);
  };

  // View roles and responsibility
  const handleViewRoles = (employee) => {
    setSelectedEmployee(employee);
    setShowRoleModal(true);
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Create Task
          </h2>
        </div>

        {/* RIGHT: BACK BUTTON */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={() => navigate("/pms/task-assignment")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* TASK INFORMATION SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Task Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Title */}
          <div className="w-full">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              placeholder="enter title *"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              placeholder="enter description *"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Task Type - Updated to select from API */}
          <CustomSelect
            label="Task Type"
            value={form.taskType}
            onChange={(e) => setForm({ ...form, taskType: e.target.value })}
            options={taskTypes.map(t => t.name)}
            placeholder={loadingTaskTypes ? "Loading task types..." : "enter task type *"}
            disabled={loadingTaskTypes}
          />

          {/* Assigned Date */}
          <div className="w-full">
            <label className={labelClass}>Assigned Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.assignedDate}
              onChange={(e) => setForm({ ...form, assignedDate: e.target.value })}
            />
          </div>

          {/* Due Date */}
          <div className="w-full">
            <label className={labelClass}>Due Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          {/* Priority */}
          <CustomSelect
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={['High', 'Medium', 'Low']}
            placeholder="select priority *"
          />
        </div>
      </div>

      {/* ASSIGNED TO SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Assigned To
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Department - Updated with API data */}
          <CustomSelect
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value, employee: "" })}
            options={departments.map(d => d.name)}
            placeholder={loadingDepartments ? "Loading departments..." : "Select department *"}
            disabled={loadingDepartments}
          />

          {/* Employee - Updated with API data */}
          <CustomSelect
            label="Employee"
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            options={employees.map(e => e.name)}
            placeholder={
              loadingEmployees 
                ? "Loading employees..." 
                : !form.department 
                  ? "First select department" 
                  : "Select employee *"
            }
            disabled={!form.department || loadingEmployees}
          />

          {/* Role - Updated with API data */}
          <CustomSelect
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles.map(r => r.name)}
            placeholder={loadingRoles ? "Loading roles..." : "enter role"}
            disabled={loadingRoles}
          />

          {/* Responsibility */}
          <MultiSelectResponsibility
            label="Roles & Responsibility"
            selectedItems={selectedResponsibilities}
            options={responsibilityOptions}
            onChange={handleResponsibilityChange}
            onRemove={handleResponsibilityRemove}
          />
        </div>

        {/* Add Employee Button */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={handleAddEmployee}
            className="px-6 py-2 rounded-full shadow-md text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Name</th>
                <th className="table-th text-center">Designation</th>
                <th className="table-th text-center">Role</th>
                <th className="table-th text-center">Department</th>
                <th className="table-th text-center">Roles & Responsibility</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-td text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No employees assigned</p>
                      <p className="text-sm">Add employees using the form above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{employee.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">-</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{employee.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{employee.department}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleViewRoles(employee)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleRemoveEmployee(employee.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
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
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No employees assigned</p>
              <p className="text-sm">Add employees using the form above.</p>
            </div>
          </div>
        ) : (
          currentEntries.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{employee.employee}</p>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div><span className="font-medium">Department:</span> {employee.department}</div>
                <div><span className="font-medium">Responsibility:</span> {employee.responsibility}</div>
              </div>
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => handleViewRoles(employee)}
                  className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleRemoveEmployee(employee.id)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Task Button */}
      {assignedEmployees.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Ready to Assign Task
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignedEmployees.length} employee(s) will be assigned to this task
              </p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full shadow-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Assigning...</span>
                  <span className="sm:hidden">Assigning</span>
                </div>
              ) : (
                <span>Submit Task</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/pms/task-assignment");
          }}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {/* Error Alert */}
      {showErrorAlert && (
        <SweetAlert
          error
          title="Oops! Something went wrong"
          onConfirm={() => setShowErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Delete Confirmation Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this Employee?
        </SweetAlert>
      )}

      {/* Delete Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {/* Delete Error Alert */}
      {showDeleteErrorAlert && (
        <SweetAlert
          error
          title="Delete Failed"
          onConfirm={() => setShowDeleteErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Roles & Responsibility Modal */}
      <RoleModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        employee={selectedEmployee}
      />
    </div>
  );
}