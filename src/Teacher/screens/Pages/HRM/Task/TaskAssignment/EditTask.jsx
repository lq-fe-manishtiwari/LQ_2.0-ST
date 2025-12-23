import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Pencil, ChevronDown, Eye, Trash2, Edit } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import RoleModal from '../../Components/RoleModal';
// import {DepartmentService} from '../../../Academics/Services/Department.service';
import {Settings} from '../../Settings/Settings.service';
import {TaskManagement} from '../../Services/TaskManagement.service';

// Multi-Select Responsibility Component
// const MultiSelectResponsibility = ({ label, selectedItems, options, onChange, onRemove }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const availableOptions = options.filter(option => !selectedItems.includes(option));

//   const handleSelect = (option) => {
//     onChange(option);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div ref={dropdownRef}>
//       <label className="block text-sm font-semibold text-blue-700 mb-2">{label}</label>
//       <div className="relative">
//         <div
//           className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {selectedItems.length > 0 ? (
//             selectedItems.map(item => (
//               <span
//                 key={item}
//                 className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {item}
//                 <button
//                   onClick={() => onRemove(item)}
//                   className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
//                   title="Remove Responsibility"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             ))
//           ) : (
//             <span className="text-gray-400 text-sm ml-1">Select Responsibility(s)</span>
//           )}
//           <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
//         </div>

//         {isOpen && (
//           <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//             {availableOptions.length > 0 ? (
//               availableOptions.map(option => (
//                 <div
//                   key={option}
//                   className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
//                   onClick={() => handleSelect(option)}
//                 >
//                   {option}
//                 </div>
//               ))
//             ) : (
//               <div className="px-4 py-3 text-sm text-gray-500">All responsibilities selected.</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
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
          className={`w-full px-3 py-2 border ${disabled || loading ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {loading ? "Loading..." : value || placeholder}
          </span>
          {!loading && (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          )}
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map((option, index) => {
              // Ensure we have a valid option object
              if (!option || typeof option === 'string') {
                return (
                  <div
                    key={`option-${index}-${option}`}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </div>
                );
              }
              
              // Handle object options
              const optionKey = `${option.id || option.value || index}-${option.name || option.label || 'unknown'}`;
              const optionValue = option.value || option.id || option;
              const optionDisplay = option.label || option.name || option.value || option.id || 'Unknown';
              
              return (
                <div
                  key={optionKey}
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

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get active college and user from localStorage
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;
  const user = JSON.parse(localStorage.getItem("user"));

  // API data states
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  
  // Loading states
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [loadingPriorities, setLoadingPriorities] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedDate: "",
    dueDate: "",
    priority: "",
    status: "",
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

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  // Error handling for API calls
  const handleAPIError = (error, context) => {
    console.error(`Error ${context}:`, error);
    setAlertMessage(`Failed to ${context}. Please try again.`);
    setShowErrorAlert(true);
  };

  // Fetch Departments on Mount - FIXED
  useEffect(() => {
    if (!collegeId) {
      console.log("No college ID found");
      setLoadingDepartments(false);
      return;
    }

    setLoadingDepartments(true);
    TaskManagement.getDepartmentByCollegeId(collegeId)
      .then(response => {
        const deptList = response.data || response || [];
        console.log("Department API Response:", deptList);
        
        // Format departments for CustomSelect - FIXED
        const formattedDepts = deptList.map(dept => ({
          id: dept.department_id || dept.id,
          name: dept.department_name || dept.name, // Use department_name from API
          value: dept.department_id || dept.id,
          department_name: dept.department_name || dept.name // Keep original name
        }));
        
        console.log("Formatted Departments:", formattedDepts);
        setDepartments(formattedDepts);
        
        // Update assigned employees with department names
        setAssignedEmployees(prev => prev.map(emp => {
          const dept = formattedDepts.find(d => 
            String(d.value) === String(emp.department) || 
            String(d.id) === String(emp.department)
          );
          return {
            ...emp,
            departmentName: dept ? dept.name : emp.departmentName
          };
        }));
        
        setLoadingDepartments(false);
      })
      .catch(err => {
        console.error("Department fetch error:", err);
        setDepartments([]);
        setLoadingDepartments(false);
        handleAPIError(err, "fetch departments");
      });
  }, [collegeId]);

  // Fetch Employees when Department changes
  useEffect(() => {
    if (!form.department) {
      setEmployees([]);
      setForm(prev => ({ ...prev, employee: "" }));
      return;
    }

    setLoadingEmployees(true);
    TaskManagement.getStaffByDepartment(form.department)
      .then(response => {
        const empList = response.data || response || [];
        // Format employees for CustomSelect with unique keys
        const formattedEmps = empList.map((emp, index) => ({
          id: emp.staff_id || emp.id || emp.employee_id || `emp-${index}`,
          name: emp.name || emp.fullname || `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || 'Unknown Employee',
          value: emp.staff_id || emp.id || emp.employee_id || `emp-${index}`,
          user_id: emp.user_id || index
        }));
        
        // Remove duplicates based on user_id
        const uniqueEmps = formattedEmps.filter((emp, index, self) => 
          index === self.findIndex(e => e.user_id === emp.user_id)
        );
        setEmployees(uniqueEmps);
        setLoadingEmployees(false);
      })
      .catch(err => {
        console.error("Employee fetch error:", err);
        setEmployees([]);
        setLoadingEmployees(false);
        handleAPIError(err, "fetch employees");
      });
  }, [form.department]);

  // Fetch Roles on Mount
  useEffect(() => {
    Settings.getAllRole()
      .then(response => {
        const roleList = response.data || response || [];
        // Format roles for CustomSelect
        const formattedRoles = roleList.map(role => ({
          id: role.role_id || role.id,
          name: role.role_name || role.name,
          value: role.role_id || role.id
        }));
        setRoles(formattedRoles);
        
        // Update assigned employees with role names
        setAssignedEmployees(prev => prev.map(emp => {
          const role = formattedRoles.find(r => 
            String(r.value) === String(emp.role) || 
            String(r.id) === String(emp.role)
          );
          return {
            ...emp,
            roleName: role ? role.name : emp.roleName
          };
        }));
        
        setLoadingRoles(false);
      })
      .catch(err => {
        console.error("Role fetch error:", err);
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
        // Format task types for CustomSelect
        const formattedTypes = types.map(type => ({
          id: type.task_type_id || type.id,
          name: type.task_type_name || type.name || type.title,
          value: type.task_type_id || type.id
        }));
        setTaskTypes(formattedTypes);
        setLoadingTaskTypes(false);
      })
      .catch(err => {
        console.error("Task type fetch error:", err);
        setTaskTypes([]);
        setLoadingTaskTypes(false);
        handleAPIError(err, "fetch task types");
      });
  }, []);

  // Fetch Task Statuses on Mount
  useEffect(() => {
    Settings.getAllTaskStatus()
      .then(response => {
        const statusList = response.data || response || [];
        // Format statuses for CustomSelect
        const formattedStatuses = statusList.map(status => ({
          id: status.task_status_id || status.id,
          name: status.name || status.status_name,
          value: status.task_status_id || status.id
        }));
        setStatuses(formattedStatuses);
        setLoadingStatuses(false);
      })
      .catch(err => {
        console.error("Status fetch error:", err);
        setStatuses([]);
        setLoadingStatuses(false);
        handleAPIError(err, "fetch statuses");
      });
  }, []);

  // Fetch Priorities on Mount
  useEffect(() => {
    Settings.getAllPriority()
      .then(response => {
        const priorityList = response.data || response || [];
        // Format priorities for CustomSelect
        const formattedPriorities = priorityList.map(priority => ({
          id: priority.priority_id || priority.id,
          name: priority.priority_name || priority.name,
          value: priority.priority_id || priority.id
        }));
        setPriorities(formattedPriorities);
        setLoadingPriorities(false);
      })
      .catch(err => {
        console.error("Priority fetch error:", err);
        setPriorities([]);
        setLoadingPriorities(false);
        handleAPIError(err, "fetch priorities");
      });
  }, []);

  // Fetch task data for editing
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      TaskManagement.getTaskAssignmentbyID(id)
        .then((response) => {
          const data = response.data || response;
          const taskList = Array.isArray(data) ? data : [data];
          const first = taskList[0];

          console.log("Task data:", first);

          // Date formatter
          const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (isNaN(date)) return "";
            const pad = (n) => n.toString().padStart(2, "0");
            return (
              date.getFullYear() +
              "-" +
              pad(date.getMonth() + 1) +
              "-" +
              pad(date.getDate()) +
              "T" +
              pad(date.getHours()) +
              ":" +
              pad(date.getMinutes())
            );
          };

          // Set main form fields
          setForm({
            title: first.task?.task_name || "",
            description: first.task?.description || "",
            taskType: first.task?.task_type?.task_type_id || "",
            assignedDate: formatDateForInput(first.task?.assigned_date_time),
            dueDate: formatDateForInput(first.task?.due_date_time),
            priority: first.task?.priority?.priority_id || "",
            status: first.task_status?.task_status_id || first.task?.task_status?.task_status_id || "",
            department: "",
            employee: "",
            role: "",
            responsibility: ""
          });

          // Convert all assigned users
          const assignedList = taskList.map((item) => {
            // Get employee name from user object
            const firstName = item.user?.teacher_info?.firstname || item.user?.other_staff_info?.firstname || "";
            const lastName = item.user?.teacher_info?.lastname || item.user?.other_staff_info?.lastname || "";
            const employeeName = `${firstName} ${lastName}`.trim() || item.user?.username || "Unknown";
            
            const empDetails = {
              id: item.task_assignment_id?.toString() || `emp-${Date.now()}`,
              user_id: item.user?.user_id,
              employee: item.user?.user_id?.toString(),
              employeeName: employeeName,
              department: item.department_id?.toString(),
              departmentName: "Loading...", // Will be resolved when departments load
              role: item.role_id?.toString(),
              roleName: "Loading...", // Will be resolved when roles load
              responsibility: item.remarks || "N/A"
            };
            return empDetails;
          });

          console.log("Assigned employees:", assignedList);
          setAssignedEmployees(assignedList);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Task fetch error:", err);
          setIsLoading(false);
          setAlertMessage('Failed to load task data. Please try again.');
          setShowErrorAlert(true);
        });
    }
  }, [id]);

  // Helper function to get department name - FIXED
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "No Department";
    
    const dept = departments.find(d => 
      String(d.value) === String(departmentId) || 
      String(d.id) === String(departmentId)
    );
    
    return dept ? dept.name : `Department ${departmentId}`;
  };

  // Helper function to get role name
  const getRoleName = (roleId) => {
    if (!roleId) return "No Role";
    
    const role = roles.find(r => 
      String(r.value) === String(roleId) || 
      String(r.id) === String(roleId)
    );
    
    return role ? role.name : `Role ${roleId}`;
  };

  // Date validation function
  const validateDates = () => {
    if (!form.assignedDate || !form.dueDate) {
      setAlertMessage('Please enter both assigned date and due date.');
      setShowErrorAlert(true);
      return false;
    }
    
    const assignedDate = new Date(form.assignedDate);
    const dueDate = new Date(form.dueDate);
    
    if (isNaN(assignedDate.getTime())) {
      setAlertMessage('Please enter a valid assigned date.');
      setShowErrorAlert(true);
      return false;
    }
    
    if (isNaN(dueDate.getTime())) {
      setAlertMessage('Please enter a valid due date.');
      setShowErrorAlert(true);
      return false;
    }
    
    if (assignedDate >= dueDate) {
      setAlertMessage('Due date must be after assigned date.');
      setShowErrorAlert(true);
      return false;
    }
    
    return true;
  };

  // Enhanced form validation
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

    if (!form.status) {
      setAlertMessage('Status is required.');
      setShowErrorAlert(true);
      return false;
    }

    if (assignedEmployees.length === 0) {
      setAlertMessage('Please assign at least one employee to the task.');
      setShowErrorAlert(true);
      return false;
    }

    // Date validation
    if (!validateDates()) {
      return false;
    }

    return true;
  };

  // Update task status handler
  const handleStatusUpdate = async (newStatusId) => {
    try {
      const updatedBy = user?.id || user?.user_id || 1;
      await TaskManagement.updateTaskStatus(id, newStatusId, updatedBy);
      
      setForm(prev => ({ ...prev, status: newStatusId }));
      setAlertMessage('Task status updated successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Status update error:", error);
      setAlertMessage('Failed to update task status. Please try again.');
      setShowErrorAlert(true);
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const assigned_by = user?.id || user?.user_id || 1;
      const assignedRole = assignedEmployees.length > 0 ? assignedEmployees[0]?.role : null;

      const payload = {
        task_assignment_id: parseInt(id),
        task_name: form.title,
        description: form.description,
        task_type_id: parseInt(form.taskType),
        priority_id: parseInt(form.priority),
        task_status_id: parseInt(form.status),
        assigned_date_time: new Date(form.assignedDate).toISOString(),
        due_date_time: new Date(form.dueDate).toISOString(),
        role_id: assignedEmployees.length > 0 ? parseInt(assignedEmployees[0].role) : 2,
        college_id: parseInt(collegeId),
        user_id: assignedEmployees.length > 0 ? parseInt(assignedEmployees[0].user_id) : 101,
        user_role_id: assignedEmployees.length > 0 ? parseInt(assignedEmployees[0].role) : 2,
        department_id: assignedEmployees.length > 0 ? parseInt(assignedEmployees[0].department) : 5,
        assigned_by: parseInt(assigned_by),
        remarks: assignedEmployees.length > 0 ? assignedEmployees[0].responsibility || "Please complete this task with proper testing" : "Please complete this task with proper testing"
      };

      console.log("Full payload:", payload);
      const response = await TaskManagement.updateTaskAssignment(payload);

      // API returns an array when successful, so check for array or success indicators
      if (response && (Array.isArray(response) || response.status === 200 || response.status === 201 || response.success)) {
        setIsSubmitting(false);
        setAlertMessage('Task updated successfully!');
        setShowSuccessAlert(true);
      } else {
        console.error("Unexpected response:", response);
        throw new Error(response?.message || response?.error || 'API returned unexpected response format');
      }

    } catch (error) {
      console.error("Submit error:", error);
      setIsSubmitting(false);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update task. Please try again.';
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
    setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== employeeToDelete));
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

  // Add employee to table - FIXED
  const handleAddEmployee = () => {
    if (!form.department) {
      setAlertMessage('Please select a department.');
      setShowErrorAlert(true);
      return;
    }

    if (!form.employee) {
      setAlertMessage('Please select an employee.');
      setShowErrorAlert(true);
      return;
    }

    if (!form.role) {
      setAlertMessage('Please select a role.');
      setShowErrorAlert(true);
      return;
    }

    // Find employee details - try multiple search criteria
    let employeeObj = employees.find(e => String(e.value) === String(form.employee));
    
    // If not found by value, try by id
    if (!employeeObj) {
      employeeObj = employees.find(e => String(e.id) === String(form.employee));
    }
    
    // If still not found, try by user_id
    if (!employeeObj) {
      employeeObj = employees.find(e => String(e.user_id) === String(form.employee));
    }
    
    if (!employeeObj) {
      console.error("Employee not found. Form employee:", form.employee, "Available employees:", employees);
      setAlertMessage('Selected employee not found. Please select an employee from the dropdown.');
      setShowErrorAlert(true);
      return;
    }

    // Check if employee is already assigned by user_id
    const isAlreadyAssigned = assignedEmployees.some(emp => 
      String(emp.user_id) === String(employeeObj.user_id) && String(emp.role) === String(form.role)
    );
    
    if (isAlreadyAssigned) {
      setAlertMessage('This employee with the same role is already assigned to the task.');
      setShowErrorAlert(true);
      return;
    }

    let employeeName = employeeObj.name || form.employee;
    
    // Get department name using helper function
    const deptName = getDepartmentName(form.department);
    
    // Get role name using helper function
    const roleName = getRoleName(form.role);

    const newEmployee = {
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: employeeObj.user_id,
      employee: employeeObj.value, // Use the employee's value (EMP000017) not user_id
      employeeName: employeeName,
      department: form.department,
      departmentName: deptName,
      role: form.role,
      roleName: roleName,
      responsibility: selectedResponsibilities.length > 0 ? selectedResponsibilities.join(', ') : 'N/A'
    };

    console.log("Adding new employee:", newEmployee);
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
    const employeeWithNames = {
      ...employee,
      employeeName: employee.employeeName || employee.employee,
      name: employee.employeeName || employee.employee,
      employee: employee.employeeName || employee.employee,
      roleName: getRoleName(employee.role),
      roleDisplay: getRoleName(employee.role),
      departmentName: getDepartmentName(employee.department),
      responsibility: employee.responsibility || 'View task details, Complete assigned work, Report progress'
    };
    setSelectedEmployee(employeeWithNames);
    setShowRoleModal(true);
  };

  // Edit employee - populate form fields
  const handleEditEmployee = (employee) => {
    console.log("Editing employee:", employee);
    
    // Set form fields
    setForm({
      ...form,
      department: employee.department,
      employee: employee.employee, // Keep the original employee value
      role: employee.role
    });
    
    // Set responsibilities if they exist
    if (employee.responsibility && employee.responsibility !== 'N/A') {
      const responsibilities = employee.responsibility.split(', ');
      setSelectedResponsibilities(responsibilities);
    } else {
      setSelectedResponsibilities([]);
    }
    
    // Remove the employee from the list so they can be re-added with changes
    setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== employee.id));
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Pencil className="w-6 h-6 text-[#2162C1]" />
            <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
              Edit Task
            </h2>
          </div>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          <Pencil className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Edit Task
          </h2>
        </div>

        {/* RIGHT: BACK BUTTON - FIXED */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={() => navigate("/hrm/tasks/task-assignment")}
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
              className={`${inputClass} bg-gray-100 cursor-not-allowed`}
              value={form.title}
              disabled={true}
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              placeholder="enter description *"
              className={`${inputClass} bg-gray-100 cursor-not-allowed`}
              value={form.description}
              disabled={true}
            />
          </div>

          {/* Task Type */}
          <div className="w-full">
            <label className={labelClass}>Task Type</label>
            <CustomSelect
              label=""
              value={(() => {
                const taskType = taskTypes.find(t => String(t.value) === String(form.taskType));
                return taskType ? taskType.name : form.taskType;
              })()}
              onChange={(e) => setForm({ ...form, taskType: e.target.value })}
              options={taskTypes}
              placeholder={loadingTaskTypes ? "Loading task types..." : "enter task type *"}
              disabled={true}
              loading={loadingTaskTypes}
            />
          </div>

          {/* Assigned Date */}
          <div className="w-full">
            <label className={labelClass}>Assigned Date & Time</label>
            <input
              type="datetime-local"
              className={`${inputClass} text-sm sm:text-base bg-gray-100 cursor-not-allowed`}
              value={form.assignedDate}
              disabled={true}
            />
          </div>

          {/* Due Date */}
          <div className="w-full">
            <label className={labelClass}>Due Date & Time</label>
            <input
              type="datetime-local"
              className={`${inputClass} text-sm sm:text-base bg-gray-100 cursor-not-allowed`}
              value={form.dueDate}
              disabled={true}
            />
          </div>

          {/* Priority */}
          <CustomSelect
            label="Priority"
            value={(() => {
              const priority = priorities.find(p => String(p.value) === String(form.priority));
              return priority ? priority.name : form.priority;
            })()}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={priorities}
            placeholder={loadingPriorities ? "Loading priorities..." : "select priority *"}
            disabled={true}
            loading={loadingPriorities}
          />

          {/* Status */}
          <CustomSelect
            label="Status"
            value={(() => {
              const status = statuses.find(s => String(s.value) === String(form.status));
              return status ? status.name : form.status;
            })()}
            onChange={(e) => {
              const newStatusId = e.target.value;
              if (newStatusId !== form.status) {
                handleStatusUpdate(newStatusId);
              }
            }}
            options={statuses}
            placeholder={loadingStatuses ? "Loading statuses..." : "select status *"}
            disabled={loadingStatuses}
            loading={loadingStatuses}
          />
        </div>
      </div>

      {/* ASSIGNED TO SECTION - COMMENTED OUT */}
      {/* <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Assigned To
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <CustomSelect
            label="Department"
            value={(() => {
              const department = departments.find(d => String(d.value) === String(form.department));
              return department ? department.name : form.department;
            })()}
            onChange={(e) => setForm({ ...form, department: e.target.value, employee: "" })}
            options={departments}
            placeholder={loadingDepartments ? "Loading departments..." : "Select department *"}
            disabled={loadingDepartments}
            loading={loadingDepartments}
          />

          <CustomSelect
            label="Employee"
            value={(() => {
              if (!form.employee) return "";
              const employee = employees.find(e => 
                String(e.value) === String(form.employee) || 
                String(e.id) === String(form.employee) || 
                String(e.user_id) === String(form.employee)
              );
              return employee ? employee.name : "";
            })()}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            options={employees.length > 0 ? employees : []}
            placeholder={
              loadingEmployees 
                ? "Loading employees..." 
                : !form.department 
                  ? "First select department" 
                  : employees.length === 0
                  ? "No employees found"
                  : "Select employee *"
            }
            disabled={!form.department || loadingEmployees}
            loading={loadingEmployees}
          />

          <CustomSelect
            label="Role"
            value={(() => {
              const role = roles.find(r => String(r.value) === String(form.role));
              return role ? role.name : form.role;
            })()}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles}
            placeholder={loadingRoles ? "Loading roles..." : "Select role *"}
            disabled={loadingRoles}
            loading={loadingRoles}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button 
            onClick={handleAddEmployee}
            className="px-6 py-2 rounded-full shadow-md text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            Add Employee
          </button>
        </div>
      </div> */}

      {/* Employee Table - DESKTOP - COMMENTED OUT */}
      {/* <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">No employees assigned</p>
                      <p className="text-sm">Add employees using the form above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((employee) => {
                  const departmentName = getDepartmentName(employee.department);
                  const roleName = getRoleName(employee.role);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.employeeName || employee.employee}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{roleName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{departmentName}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
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
      </div> */}

      {/* Mobile Cards - COMMENTED OUT */}
      {/* <div className="lg:hidden space-y-4">
        {assignedEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No employees assigned</p>
              <p className="text-sm">Add employees using the form above.</p>
            </div>
          </div>
        ) : (
          currentEntries.map((employee) => {
            const departmentName = getDepartmentName(employee.department);
            const roleName = getRoleName(employee.role);
            
            return (
              <div key={employee.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{employee.employeeName || employee.employee}</p>
                    <p className="text-sm text-gray-500">{roleName}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div><span className="font-medium">Department:</span> {departmentName}</div>
                </div>
                <div className="flex justify-end items-center gap-2">
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleRemoveEmployee(employee.id)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div> */}
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
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-td text-center py-12"> {/* Change to 6 if roles & responsibility column is enabled */}
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No employees assigned</p>
                      <p className="text-sm">Add employees using the form above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((employee) => {
                  // Use helper functions to get names
                  const departmentName = getDepartmentName(employee.department);
                  const roleName = getRoleName(employee.role);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{employee.employeeName || employee.employee}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">-</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{roleName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{departmentName}</td>
                      {/* <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleViewRoles(employee)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td> */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          currentEntries.map((employee) => {
            // Use helper functions to get names
            const departmentName = getDepartmentName(employee.department);
            const roleName = getRoleName(employee.role);
            
            return (
              <div key={employee.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{employee.employeeName || employee.employee}</p>
                    <p className="text-sm text-gray-500">{roleName}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div><span className="font-medium">Department:</span> {departmentName}</div>
                  {/* <div><span className="font-medium">Responsibility:</span> {employee.responsibility}</div> */}
                </div>
                <div className="flex justify-end items-center gap-2">
                  {/* <button 
                    onClick={() => handleViewRoles(employee)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button> */}
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleRemoveEmployee(employee.id)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Task Button - COMMENTED OUT */}
      {/* {assignedEmployees.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Ready to Update Task
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignedEmployees.length} employee(s) will be updated for this task
              </p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full shadow-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Updating...</span>
                  <span className="sm:hidden">Updating</span>
                </div>
              ) : (
                <span>Update Task</span>
              )}
            </button>
          </div>
        </div>
      )} */}

      {/* Simple Update Status Button */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Task Status
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Only task status can be updated
            </p>
          </div>
          <button 
            onClick={() => {
              setAlertMessage('Task status updated successfully!');
              setShowSuccessAlert(true);
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full shadow-md text-white transition-all text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/hrm/tasks/task-assignment");
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