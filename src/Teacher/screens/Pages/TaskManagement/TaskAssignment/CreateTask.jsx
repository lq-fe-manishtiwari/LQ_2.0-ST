import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ChevronDown, Eye, Trash2 } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import RoleModal from '../../HRM/Components/RoleModal';
// import {DepartmentService} from '../../../Academics/Services/Department.service';
import {Settings} from '../../HRM/Settings/Settings.service';
import {TaskManagement} from '../../HRM/Services/TaskManagement.service';

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
//       <label className="block text-sm font-semibold text-blue-700 mb-2">{label}*</label>
//       <div className="relative">
//         <div
//           className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {selectedItems.length > 0 ? (
//             selectedItems.map((item, index) => (
//               <span
//                 key={`${item}-${index}`}
//                 className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {item}
//                 <button
//                   onClick={(e) => {
//                   e.stopPropagation();
//                   onRemove(item);
//                 }}
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
//               availableOptions.map((option, index) => (
//                 <div
//                   key={`${option}-${index}`}
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

export default function TaskForm() {
  const navigate = useNavigate();

  // States
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);
  const [priorities, setPriorities] = useState([]);
  const [loadingPriorities, setLoadingPriorities] = useState(true);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id;

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

  // Helper function to get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const currentUserId = localStorage.getItem("currentUserId");
      const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
      const user = JSON.parse(localStorage.getItem("user"));
  
      // Priority-based ID extraction
      const possibleIds = [
        currentUserId,
        activeCollege?.user_id,
        user?.currentUserId,
        user?.id,
        user?.user_id
      ];
  
      for (let id of possibleIds) {
        if (id !== null && id !== undefined && id !== "null" && id !== "undefined") {
          const parsed = parseInt(id);
          if (!isNaN(parsed)) {
            return parsed; // valid ID found
          }
        }
      }
  
      return null;   // <-- Default return (IMPORTANT)
  
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;  // fallback return
    }
  };

  // Helper function to get role name from role_id
  const getRoleNameFromId = (roleId) => {
    if (!roleId) return "No Role";
    
    // First try to find in roles array
    const role = roles.find(r => (r.role_id || r.id) == roleId);
    if (role) {
      return role.role_name || role.name || `Role ${roleId}`;
    }
    
    // If roleId is a string (like "TEACHER", "ADMIN"), return it directly
    if (typeof roleId === 'string') {
      return roleId;
    }
    
    return `Role ${roleId}`;
  };

  // Helper function to get department name from department_id
  const getDepartmentNameFromId = (deptId) => {
    if (!deptId) return "No Department";
    
    // Find department by ID
    const dept = departments.find(d => {
      const id = d.department_id || d.id;
      return id?.toString() === deptId?.toString();
    });
    
    if (dept) {
      return dept.name || dept.department_name || `Department ${deptId}`;
    }
    
    // If deptId is a string (like "Chemistry", "physics"), return it directly
    if (typeof deptId === 'string' && isNaN(deptId)) {
      return deptId;
    }
    
    return `Department ${deptId}`;
  };

  // Helper function to get department ID from department name
  const getDepartmentIdFromName = (deptName) => {
    if (!deptName) return null;
    
    const dept = departments.find(d => 
      (d.name && d.name.toLowerCase() === deptName.toLowerCase()) ||
      (d.department_name && d.department_name.toLowerCase() === deptName.toLowerCase())
    );
    
    return dept ? (dept.department_id || dept.id) : null;
  };

  // Error handling for API calls
  const handleAPIError = (error, context) => {
    setAlertMessage(`Failed to ${context}. Please try again.`);
    setShowErrorAlert(true);
  };

  // Enhanced getUniqueKey function
  const getUniqueKey = (item, index, prefix = '') => {
    if (!item) {
      return `${prefix}-null-${index}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const id = item.department_id || item.id || item.staff_id || item.employee_id || 
               item.role_id || item.task_type_id || item.user_id || 
               item.assignment_id || item.task_assignment_id || 
               index;
    
    if (id === null || id === undefined || id === '') {
      return `${prefix}-null-${index}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return `${prefix}-${id}-${index}`;
  };

  // Fetch Departments on Mount
  // useEffect(() => {
  //   if (!collegeId) {
  //     setLoadingDepartments(false);
  //     return;
  //   }

  //   DepartmentService.getDepartmentByCollegeId(collegeId)
  //     .then(response => {
  //       const deptList = response.data || response || [];
  //       const uniqueDepartments = [];
  //       const seenIds = new Set();
        
  //       deptList.forEach(dept => {
  //         const deptId = dept.department_id || dept.id;
  //         if (deptId && !seenIds.has(deptId)) {
  //           seenIds.add(deptId);
  //           uniqueDepartments.push(dept);
  //         } else if (!deptId) {
  //           uniqueDepartments.push(dept);
  //         }
  //       });
        
  //       console.log("Departments fetched:", uniqueDepartments);
  //       setDepartments(uniqueDepartments);
  //       setLoadingDepartments(false);
  //     })
  //     .catch(err => {
  //       setLoadingDepartments(false);
  //       handleAPIError(err, "fetch departments");
  //     });
  // }, [collegeId]);

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
        const uniqueEmployees = [];
        const seenIds = new Set();
        
        console.log("Employees fetched for department:", form.department, empList);
        
        empList.forEach(emp => {
          const empId = emp.staff_id || emp.id || emp.employee_id || emp.user_id;
          if (empId && !seenIds.has(empId)) {
            seenIds.add(empId);
            uniqueEmployees.push(emp);
          } else if (!empId) {
            uniqueEmployees.push(emp);
          }
        });
        
        setEmployees(uniqueEmployees);
        setLoadingEmployees(false);
      })
      .catch(err => {
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
        const uniqueRoles = [];
        const seenIds = new Set();
        
        roleList.forEach(role => {
          const roleId = role.role_id || role.id;
          if (roleId && !seenIds.has(roleId)) {
            seenIds.add(roleId);
            uniqueRoles.push(role);
          } else if (!roleId) {
            uniqueRoles.push(role);
          }
        });
        
        console.log("Roles fetched:", uniqueRoles);
        setRoles(uniqueRoles);
        setLoadingRoles(false);
      })
      .catch(err => {
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
        const uniqueTypes = [];
        const seenIds = new Set();
        
        types.forEach(type => {
          const typeId = type.task_type_id || type.id;
          if (typeId && !seenIds.has(typeId)) {
            seenIds.add(typeId);
            uniqueTypes.push(type);
          } else if (!typeId) {
            uniqueTypes.push(type);
          }
        });
        
        setTaskTypes(uniqueTypes);
        setLoadingTaskTypes(false);
      })
      .catch(err => {
        setTaskTypes([]);
        setLoadingTaskTypes(false);
        handleAPIError(err, "fetch task types");
      });
  }, []);

  // Fetch Priorities on Mount
  useEffect(() => {
    Settings.getAllPriority()
      .then(response => {
        const priorityList = response.data || response || [];
        const uniquePriorities = [];
        const seenIds = new Set();
        
        priorityList.forEach(priority => {
          const priorityId = priority.priority_id || priority.id;
          if (priorityId && !seenIds.has(priorityId)) {
            seenIds.add(priorityId);
            uniquePriorities.push(priority);
          } else if (!priorityId) {
            uniquePriorities.push(priority);
          }
        });
        
        console.log("Priorities fetched:", uniquePriorities);
        setPriorities(uniquePriorities);
        setLoadingPriorities(false);
      })
      .catch(err => {
        setPriorities([]);
        setLoadingPriorities(false);
        handleAPIError(err, "fetch priorities");
      });
  }, []);

  // Date validation function
  const validateDates = () => {
    if (!form.assignedDate || !form.dueDate) {
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Get assigned_by from localStorage
      const assigned_by = getCurrentUserId();
      
      console.log("Assigned by user ID:", assigned_by);
      
      const assignedRole = assignedEmployees.length > 0 ? assignedEmployees[0]?.role : null;
      
      const payload = {
        task_name: form.title,
        description: form.description,
        task_type_id: parseInt(form.taskType),
        due_date_time: new Date(form.dueDate).toISOString(),
        assigned_date_time: new Date(form.assignedDate).toISOString(),
        priority_id: parseInt(form.priority),
        college_id: parseInt(collegeId),
        assigned_by: assigned_by,
        role_id: assignedRole ? parseInt(assignedRole) : null,
        
        user_assignments: assignedEmployees.map(emp => {
          const userId = emp.user_id || emp.employee;
          
          if (!userId || !emp.role || !emp.department) {
            throw new Error(`Employee assignment missing required fields: ${JSON.stringify(emp)}`);
          }

          // Get role name from roles array
          const roleObj = roles.find(r => (r.role_id || r.id) == emp.role);
          const roleName = roleObj ? (roleObj.role_name || roleObj.name || `Role ${emp.role}`) : `Role ${emp.role}`;
          
          // Get department name from departments array
          const deptId = emp.department;
          const deptObj = departments.find(d => {
            const id = d.department_id || d.id;
            return id?.toString() === deptId?.toString();
          });
          const deptName = deptObj ? (deptObj.name || deptObj.department_name || `Department ${deptId}`) : `Department ${deptId}`;
  
          return {
            user_id: parseInt(userId),
            user_name: emp.employeeName || "Unknown",
            user_role_id: parseInt(emp.role),
            user_role_name: roleName,
            department_id: parseInt(deptId),
            department_name: deptName,
            remarks: emp.responsibility || "N/A"
          };
        })
      };
  
      console.log("Final payload:", payload);
      
      const response = await TaskManagement.postTaskAssignment(payload);
  
      console.log("API Response:", response);
      
      // FIXED: Check if response is an array (as per your screenshot)
      // Your API returns array with task assignment objects
      if (Array.isArray(response) && response.length > 0) {
        // Check if any element in array has task_assignment_id
        const hasTaskAssignmentId = response.some(item => item.task_assignment_id);
        
        if (hasTaskAssignmentId) {
          setIsSubmitting(false);
          setAlertMessage('Task created successfully!');
          setShowSuccessAlert(true);
          
          // Clear form after success
          setTimeout(() => {
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
            setSelectedResponsibilities([]);
          }, 1000);
        } else {
          throw new Error('Task creation failed. No task assignment ID received.');
        }
      } 
      // Also check for success status if response is not array
      else if (response && (
        response.status === 200 || 
        response.status === 201 || 
        response.status === 202 ||
        response.status === "success" ||
        response.success === true ||
        (response.data && response.data.status === "success") ||
        (response.data && response.data.success === true)
      )) {
        setIsSubmitting(false);
        setAlertMessage('Task created successfully!');
        setShowSuccessAlert(true);
        
        // Clear form after success
        setTimeout(() => {
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
          setSelectedResponsibilities([]);
        }, 1000);
      } else {
        // Try to get error message from response
        const errorMsg = response?.message || 
                        response?.data?.message || 
                        response?.data?.error ||
                        'Task creation failed. Please try again.';
        throw new Error(errorMsg);
      }
  
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting task:', error);
      
      // Show user-friendly error message
      let errorMsg = 'Failed to create task. Please try again.';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.response && error.response.data) {
        // If axios error response
        if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        }
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

  // Add employee to table
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

    const employeeObj = employees.find(e => {
      const empId = e.staff_id || e.id || e.employee_id || e.user_id;
      return empId?.toString() === form.employee?.toString();
    });
    
    if (!employeeObj) {
      setAlertMessage('Selected employee not found.');
      setShowErrorAlert(true);
      return;
    }

    const isAlreadyAssigned = assignedEmployees.some(emp => 
      emp.user_id === employeeObj.user_id && emp.role === form.role
    );
    
    if (isAlreadyAssigned) {
      setAlertMessage('This employee with the same role is already assigned to the task.');
      setShowErrorAlert(true);
      return;
    }

    let employeeName = employeeObj.name || employeeObj.fullname || 
                      `${employeeObj.firstname || ''} ${employeeObj.lastname || ''}`.trim() || 
                      employeeObj.username || form.employee;
    
    // Get department name
    const deptObj = departments.find(d => {
      const deptId = d.department_id || d.id;
      return deptId?.toString() === form.department?.toString();
    });
    
    let deptName = "";
    let deptId = form.department;
    
    if (deptObj) {
      deptName = deptObj.name || deptObj.department_name || form.department;
      deptId = deptObj.department_id || deptObj.id || form.department;
    } else {
      // If department not found by ID, use employee's department from data
      deptName = employeeObj.department || "Unknown Department";
      deptId = getDepartmentIdFromName(employeeObj.department) || form.department;
    }
    
    // Get role name
    const roleObj = roles.find(r => {
      const roleId = r.role_id || r.id;
      return roleId?.toString() === form.role?.toString();
    });
    
    let roleName = form.role;
    if (roleObj) {
      roleName = roleObj.role_name || roleObj.name || form.role;
    }

    const newEmployee = {
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: employeeObj.user_id,
      employee: form.employee,
      employeeName: employeeName,
      department: deptId, // Store department ID
      departmentName: deptName, // Store department name for display
      role: form.role, // This is the role_id from the form
      roleName: roleName, // This is the display name
      roleDisplay: getRoleNameFromId(form.role), // This ensures display in table
      responsibility: selectedResponsibilities.length > 0 ? selectedResponsibilities.join(', ') : 'N/A',
      employeeData: employeeObj // Store full employee data for reference
    };

    console.log("Adding employee:", newEmployee);
    
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
    const employeeWithRoleName = {
      ...employee,
      roleName: getRoleNameFromId(employee.role),
      departmentName: employee.departmentName || getDepartmentNameFromId(employee.department)
    };
    setSelectedEmployee(employeeWithRoleName);
    setShowRoleModal(true);
  };



  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">Create Task</h2>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={() => navigate("/teacher/task-management/task-assignment")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* TASK INFORMATION SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Task Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="w-full">
            <label className={labelClass}>Title*</label>
            <input
              type="text"
              placeholder="Enter title *"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Description*</label>
            <textarea
              placeholder="Enter description *"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
            />
          </div>

          <CustomSelect
            label="Task Type*"
            value={(() => {
              const taskType = taskTypes.find(t => (t.task_type_id || t.id) == form.taskType);
              return taskType ? (taskType.task_type_name || taskType.name || taskType.title) : '';
            })()}
            onChange={(e) => setForm({ ...form, taskType: e.target.value })}
            options={taskTypes.map(type => ({
              value: type.task_type_id || type.id,
              name: type.task_type_name || type.name || type.title
            }))}
            placeholder={loadingTaskTypes ? "Loading task types..." : "Select task type*"}
            disabled={loadingTaskTypes}
            loading={loadingTaskTypes}
          />

          <div className="w-full">
            <label className={labelClass}>Assigned Date & Time*</label>
            <input
              type="datetime-local"
              className={`${inputClass} text-sm sm:text-base`}
              value={form.assignedDate}
              onChange={(e) => {
                setForm({ ...form, assignedDate: e.target.value });
                e.target.blur(); // Auto-close calendar
              }}
              onBlur={(e) => e.target.blur()} // Ensure calendar closes
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Due Date & Time*</label>
            <input
              type="datetime-local"
              className={`${inputClass} text-sm sm:text-base`}
              value={form.dueDate}
              min={form.assignedDate || new Date().toISOString().slice(0, 16)}
              onChange={(e) => {
                setForm({ ...form, dueDate: e.target.value });
                e.target.blur(); // Auto-close calendar
              }}
              onBlur={(e) => e.target.blur()} // Ensure calendar closes
            />
          </div>

          <CustomSelect
            label="Priority*"
            value={(() => {
              const priority = priorities.find(p => (p.priority_id || p.id) == form.priority);
              return priority ? (priority.priority_name || priority.name) : '';
            })()}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={priorities.map(priority => ({
              value: priority.priority_id || priority.id,
              name: priority.priority_name || priority.name
            }))}
            placeholder={loadingPriorities ? "Loading priorities..." : "Select priority*"}
            disabled={loadingPriorities}
            loading={loadingPriorities}
          />
        </div>
      </div>

      {/* ASSIGNED TO SECTION */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Assigned To</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <CustomSelect
            label="Department*"
            value={(() => {
              const department = departments.find(d => (d.department_id || d.id) == form.department);
              return department ? (department.name || department.department_name) : '';
            })()}
            onChange={(e) => setForm({ ...form, department: e.target.value, employee: "" })}
            options={departments.map(dept => ({
              value: dept.department_id || dept.id,
              name: dept.name || dept.department_name
            }))}
            placeholder={loadingDepartments ? "Loading..." : "Select department*"}
            disabled={loadingDepartments}
            loading={loadingDepartments}
          />

          <CustomSelect
            label="Employee*"
            value={(() => {
              if (!form.employee) return '';
              const employee = employees.find(e => {
                const empId = e.staff_id || e.id || e.employee_id || e.user_id;
                return empId?.toString() === form.employee?.toString();
              });
              
              if (employee) {
                return employee.name || employee.fullname || 
                       `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || 
                       employee.username || form.employee;
              }
              return '';
            })()}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            options={employees.map(emp => {
              const empId = emp.staff_id || emp.id || emp.employee_id || emp.user_id;
              return {
                value: empId,
                name: emp.name || emp.fullname || 
                      `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || 
                      emp.username || empId
              };
            })}
            placeholder={
              !form.department 
                ? "First select department" 
                : loadingEmployees 
                  ? "Loading employees..." 
                  : "Select employee*"
            }
            disabled={!form.department || loadingEmployees}
            loading={loadingEmployees}
          />

          <CustomSelect
            label="Role*"
            value={(() => {
              const role = roles.find(r => (r.role_id || r.id) == form.role);
              return role ? (role.role_name || role.name) : '';
            })()}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles.map(role => ({
              value: role.role_id || role.id,
              name: role.role_name || role.name
            }))}
            placeholder={loadingRoles ? "Loading roles..." : "Select role*"}
            disabled={loadingRoles}
            loading={loadingRoles}
          />

          {/* <MultiSelectResponsibility
            label="Roles & Responsibility"
            selectedItems={selectedResponsibilities}
            options={responsibilityOptions}
            onChange={handleResponsibilityChange}
            onRemove={handleResponsibilityRemove}
          /> */}
        </div>

        <div className="flex justify-end mt-6">
          <button 
            onClick={handleAddEmployee}
            className="px-6 py-2 rounded-full shadow-md text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Name</th>
                <th className="table-th text-center">Role</th>
                <th className="table-th text-center">Department</th>
                <th className="table-th text-center">Roles & Responsibility</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-td text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No employees assigned</p>
                      <p className="text-sm">Add employees using the form above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((employee, index) => (
                  <tr key={`${employee.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {employee.employeeName || employee.employee}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {/* FIXED: Use roleDisplay or getRoleNameFromId */}
                      {employee.roleDisplay || employee.roleName || getRoleNameFromId(employee.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {/* FIXED: Use departmentName directly */}
                      {employee.departmentName || getDepartmentNameFromId(employee.department)}
                    </td>
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
          currentEntries.map((employee, index) => (
            <div key={`${employee.id}-mobile-${index}`} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{employee.employeeName || employee.employee}</p>
                  {/* FIXED: Use roleDisplay or getRoleNameFromId */}
                  <p className="text-sm text-gray-500">
                    {employee.roleDisplay || employee.roleName || getRoleNameFromId(employee.role)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div><span className="font-medium">Department:</span> {employee.departmentName || getDepartmentNameFromId(employee.department)}</div>
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
              <h3 className="text-lg font-semibold text-gray-900">Ready to Assign Task</h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignedEmployees.length} employee(s) will be assigned to this task
              </p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full shadow-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium
                bg-orange-500 hover:bg-orange-600`}
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

      {/* Alerts */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/teacher/task-management/task-assignment");
          }}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {showErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

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

      <RoleModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        employee={selectedEmployee}
      />
    </div>
  );
}