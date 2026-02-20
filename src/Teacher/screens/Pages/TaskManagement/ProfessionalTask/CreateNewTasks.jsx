import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ChevronDown } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { Settings } from '../../HRM/Settings/Settings.service';
import { TaskManagement } from '../../HRM/Services/TaskManagement.service';
import { api } from "../../../../../_services/api";

// Custom Select Component (unchanged)
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
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
            {loading ? "Loading..." : (value ? options.find(o => o.value == value)?.name || placeholder : placeholder)}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option.value)}
              >
                {option.name}
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
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedDate: "",
    dueDate: "",
    priority: "",
  });
  const [taskTypes, setTaskTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);
  const [loadingPriorities, setLoadingPriorities] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);

  // New State for Task Category and Academic Filters
  const [taskCategory, setTaskCategory] = useState("NON_ACADEMIC");
  const [allocations, setAllocations] = useState([]);
  const [academicFilters, setAcademicFilters] = useState({
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    division: '',
    subject: ''
  });
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  useEffect(() => {
    // Updated function to correctly extract user_id (3138) from your localStorage structure
    const getUserIdFromStorage = () => {
      let userId = localStorage.getItem("currentUserId") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        localStorage.getItem("id") ||
        localStorage.getItem("UserID") ||
        localStorage.getItem("uid");

      if (!userId) {
        userId = sessionStorage.getItem("currentUserId") ||
          sessionStorage.getItem("userId") ||
          sessionStorage.getItem("user_id") ||
          sessionStorage.getItem("id") ||
          sessionStorage.getItem("UserID") ||
          sessionStorage.getItem("uid");
      }

      // Primary source: userProfile (your app's actual storage key)
      let teacherId = null;
      if (!userId || !teacherId) {
        const userProfileStr = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            if (userProfile?.teacher_id) {
              teacherId = userProfile.teacher_id;
            }
            // Also try to get userId from here if not found yet
            if (!userId && userProfile?.user?.user_id) {
              userId = userProfile.user.user_id;
            }
          } catch (e) {
            console.error("Error parsing userProfile:", e);
          }
        }
      }

      // Fallback: generic "user" key (less likely for teacherId but good for userId)
      if (!userId) {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id || user.userId || user.user_id || user.UserID || user.uid;
          } catch (e) {
            console.error("Error parsing user object:", e);
          }
        }
      }

      // Final fallback: JWT token decoding (if any token exists)
      if (!userId) {
        const token = localStorage.getItem("token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("refreshToken");
        if (token) {
          try {
            let tokenStr = token;
            if (typeof token === "string" && token.startsWith('{')) {
              try { tokenStr = JSON.parse(token).token || token; } catch { }
            }
            const parts = tokenStr.split('.');
            if (parts.length > 1) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
              ).join(''));
              const payload = JSON.parse(jsonPayload);
              userId = payload.userId || payload.user_id || payload.id || payload.sub || payload.jti;
            }
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }
      }

      return { userId: userId ? parseInt(userId, 10) : null, teacherId: teacherId ? parseInt(teacherId, 10) : null };
    };

    const { userId, teacherId } = getUserIdFromStorage();
    if (userId && !isNaN(userId)) {
      setCurrentUserId(userId);
    }
    if (teacherId && !isNaN(teacherId)) {
      setCurrentTeacherId(teacherId);
    }

    if (!userId && !teacherId) {
      setAlertMessage("User not authenticated. Please login again.");
      setShowErrorAlert(true);
    }

    // Fetch task types
    Settings.getAllTaskType()
      .then(response => {
        const types = response.data || response || [];
        const uniqueTypes = [];
        const seenIds = new Set();

        types.forEach(type => {
          const typeId = type.task_type_id || type.id;
          const typeName = type.task_type_name || type.name || type.title;

          if (typeId && !seenIds.has(typeId)) {
            seenIds.add(typeId);
            uniqueTypes.push({ value: typeId, name: typeName });
          } else if (!typeId && typeName) {
            uniqueTypes.push({ value: typeName, name: typeName });
          }
        });

        setTaskTypes(uniqueTypes);
        setLoadingTaskTypes(false);
      })
      .catch(err => {
        console.error("Error fetching task types:", err);
        setTaskTypes([]);
        setLoadingTaskTypes(false);
        setAlertMessage("Failed to load task types.");
        setShowErrorAlert(true);
      });

    // Fetch priorities
    Settings.getAllPriority()
      .then(response => {
        const priorityList = response || [];
        const formattedPriorities = priorityList.map(p => ({
          value: p.priority_id,
          name: p.priority_name
        }));
        setPriorities(formattedPriorities);
        setLoadingPriorities(false);
      })
      .catch(err => {
        console.error("Error fetching priorities:", err);
        setPriorities([]);
        setLoadingPriorities(false);
        setAlertMessage("Failed to load priorities.");
        setShowErrorAlert(true);
      });
  }, []);

  // Fetch Allocations for Academic Task
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!currentTeacherId) return;
      setLoadingAllocations(true);
      try {
        const response = await api.getTeacherAllocatedPrograms(currentTeacherId);

        if (response.success) {
          const data = response.data;
          const allAllocations = [
            ...(data.class_teacher_allocation || []),
            ...(data.normal_allocation || [])
          ];
          setAllocations(allAllocations);
        }
      } catch (error) {
        console.error("Error fetching allocations:", error);
      } finally {
        setLoadingAllocations(false);
      }
    };

    if (currentTeacherId) {
      fetchAllocations();
    }
  }, [currentTeacherId]);

  // Derived Options Helper Functions
  const getUniqueOptions = (filterFn, mapFn) => {
    const map = new Map();
    allocations.filter(filterFn).forEach(item => {
      const { id, name } = mapFn(item);
      if (id) map.set(id, name);
    });
    return Array.from(map.entries()).map(([value, name]) => ({ value, name }));
  };

  const programOptions = getUniqueOptions(
    () => true,
    (item) => ({ id: item.program?.program_id, name: item.program?.program_name })
  );

  const batchOptions = getUniqueOptions(
    (item) => !academicFilters.program || item.program?.program_id == academicFilters.program,
    (item) => ({ id: item.batch?.batch_id, name: item.batch?.batch_name })
  );

  const academicYearOptions = getUniqueOptions(
    (item) => (!academicFilters.program || item.program?.program_id == academicFilters.program) &&
      (!academicFilters.batch || item.batch?.batch_id == academicFilters.batch),
    (item) => ({ id: item.academic_year_id, name: item.academic_year?.name })
  );

  const semesterOptions = getUniqueOptions(
    (item) => (!academicFilters.program || item.program?.program_id == academicFilters.program) &&
      (!academicFilters.batch || item.batch?.batch_id == academicFilters.batch) &&
      (!academicFilters.academicYear || item.academic_year_id == academicFilters.academicYear),
    (item) => ({ id: item.semester_id, name: item.semester?.name })
  );

  const divisionOptions = getUniqueOptions(
    (item) => (!academicFilters.program || item.program?.program_id == academicFilters.program) &&
      (!academicFilters.batch || item.batch?.batch_id == academicFilters.batch) &&
      (!academicFilters.academicYear || item.academic_year_id == academicFilters.academicYear) &&
      (!academicFilters.semester || item.semester_id == academicFilters.semester),
    (item) => ({ id: item.division_id, name: item.division?.division_name })
  );

  const subjectOptions = () => {
    // Collect all subjects from matching allocations
    const subjectsMap = new Map();
    allocations.filter(item =>
      (!academicFilters.program || item.program?.program_id == academicFilters.program) &&
      (!academicFilters.batch || item.batch?.batch_id == academicFilters.batch) &&
      (!academicFilters.academicYear || item.academic_year_id == academicFilters.academicYear) &&
      (!academicFilters.semester || item.semester_id == academicFilters.semester) &&
      (!academicFilters.division || item.division_id == academicFilters.division)
    ).forEach(alloc => {
      if (alloc.subjects && Array.isArray(alloc.subjects)) {
        alloc.subjects.forEach(sub => {
          subjectsMap.set(sub.subject_id, sub.name);
        });
      }
    });
    return Array.from(subjectsMap.entries()).map(([value, name]) => ({ value, name }));
  };

  const handleAcademicFilterChange = (field, value) => {
    setAcademicFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      // Reset subsequent filters
      if (field === 'program') {
        newFilters.batch = ''; newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = '';
      } else if (field === 'batch') {
        newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = '';
      } else if (field === 'academicYear') {
        newFilters.semester = ''; newFilters.division = '';
      } else if (field === 'semester') {
        newFilters.division = ''; newFilters.subject = '';
      } else if (field === 'division') {
        newFilters.subject = '';
      }
      return newFilters;
    });
  };

  const formatDateTimeForAPI = (datetimeLocal) => {
    if (!datetimeLocal) return '';
    return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      setAlertMessage('User not authenticated. Please login again.');
      setShowErrorAlert(true);
      return;
    }

    // Validation
    if (!form.title.trim()) { setAlertMessage('Please enter a task title.'); setShowErrorAlert(true); return; }
    if (!form.description.trim()) { setAlertMessage('Please enter a task description.'); setShowErrorAlert(true); return; }
    if (!form.taskType) { setAlertMessage('Please select a task type.'); setShowErrorAlert(true); return; }
    if (!form.assignedDate) { setAlertMessage('Please select an assigned date and time.'); setShowErrorAlert(true); return; }
    if (!form.dueDate) { setAlertMessage('Please select a due date and time.'); setShowErrorAlert(true); return; }
    if (!form.priority) { setAlertMessage('Please select a priority.'); setShowErrorAlert(true); return; }
    if (new Date(form.dueDate) <= new Date(form.assignedDate)) {
      setAlertMessage('Due date must be after assigned date.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = [{
        user_id: currentUserId,
        title: form.title.trim(),
        description: form.description.trim(),
        priority_id: parseInt(form.priority),
        assigned_date_time: formatDateTimeForAPI(form.assignedDate),
        due_date_time: formatDateTimeForAPI(form.dueDate),
        task_type_id: parseInt(form.taskType),
        status: 3,
        ...(taskCategory === "ACADEMIC" ? {
          task_category: "ACADEMIC",
          academic_year_id: parseInt(academicFilters.academicYear),
          semester_id: parseInt(academicFilters.semester),
          division_id: parseInt(academicFilters.division),
          subject_id: parseInt(academicFilters.subject),
          program_id: parseInt(academicFilters.program)
        } : {
          task_category: "NON_ACADEMIC"
        })
      }];

      const response = await TaskManagement.postMyTask(taskData);
      setIsSubmitting(false);
      setAlertMessage('Task created successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error creating task:', error);
      let errorMsg = 'Failed to create task. Please try again.';
      if (error.response?.data?.message) errorMsg = error.response.data.message;
      else if (error.message?.includes('401') || error.message?.includes('403')) errorMsg = 'Authentication failed. Please login again.';
      else if (error.message?.includes('400')) errorMsg = 'Invalid data. Please check your inputs.';
      setAlertMessage(errorMsg);
      setShowErrorAlert(true);
    }
  };

  const handleCancel = () => {
    navigate("/teacher/task-management/professional-tasks");
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

  const getSelectedTaskTypeName = () => {
    if (!form.taskType) return '';
    const selected = taskTypes.find(t => t.value == form.taskType);
    return selected ? selected.name : '';
  };

  const getSelectedPriorityName = () => {
    if (!form.priority) return '';
    const selected = priorities.find(p => p.value == form.priority);
    return selected ? selected.name : '';
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {/* <Plus className="w-6 h-6 text-[#2162C1]" /> */}
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">Add Task</h2>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">

        {/* Task Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-blue-700 mb-2">Category</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={taskCategory === "NON_ACADEMIC"}
                onChange={() => setTaskCategory("NON_ACADEMIC")}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">NON_ACADEMIC</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={taskCategory === "ACADEMIC"}
                onChange={() => setTaskCategory("ACADEMIC")}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">ACADEMIC</span>
            </label>
          </div>
        </div>

        {/* Academic Filters */}
        {taskCategory === "ACADEMIC" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <CustomSelect
              label="Program"
              value={academicFilters.program}
              onChange={(e) => handleAcademicFilterChange('program', e.target.value)}
              options={programOptions}
              placeholder="Select Program"
            />
            <CustomSelect
              label="Batch"
              value={academicFilters.batch}
              onChange={(e) => handleAcademicFilterChange('batch', e.target.value)}
              options={batchOptions}
              placeholder="Select Batch"
              disabled={!academicFilters.program}
            />
            <CustomSelect
              label="Academic Year"
              value={academicFilters.academicYear}
              onChange={(e) => handleAcademicFilterChange('academicYear', e.target.value)}
              options={academicYearOptions}
              placeholder="Select Academic Year"
              disabled={!academicFilters.batch}
            />
            <CustomSelect
              label="Semester"
              value={academicFilters.semester}
              onChange={(e) => handleAcademicFilterChange('semester', e.target.value)}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={!academicFilters.academicYear}
            />
            <CustomSelect
              label="Division"
              value={academicFilters.division}
              onChange={(e) => handleAcademicFilterChange('division', e.target.value)}
              options={divisionOptions}
              placeholder="Select Division"
              disabled={!academicFilters.semester}
            />
            <CustomSelect
              label="Subject"
              value={academicFilters.subject}
              onChange={(e) => handleAcademicFilterChange('subject', e.target.value)}
              options={subjectOptions()}
              placeholder="Select Subject"
              disabled={!academicFilters.division}
            />
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Task Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" placeholder="Enter task title" className={inputClass} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={100} />
            <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea placeholder="Enter task description" className={`${inputClass} min-h-[100px] resize-none`}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
            <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
          </div>
          <div>
            <CustomSelect
              label="Priority *"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={priorities}
              placeholder={loadingPriorities ? "Loading..." : "Select priority"}
              disabled={loadingPriorities}
              loading={loadingPriorities}
            />
          </div>
          <div>
            <label className={labelClass}>Assigned Date & Time *</label>
            <input type="datetime-local" className={inputClass} value={form.assignedDate}
              onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Due Date & Time *</label>
            <input type="datetime-local" className={inputClass} value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} min={form.assignedDate || getCurrentDateTime()} />
          </div>
          <div>
            <CustomSelect
              label="Task Type *"
              value={form.taskType}
              onChange={(e) => setForm({ ...form, taskType: e.target.value })}
              options={taskTypes}
              placeholder={loadingTaskTypes ? "Loading..." : "Select task type"}
              disabled={loadingTaskTypes}
              loading={loadingTaskTypes}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Task Preview:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Title:</span> {form.title || "Not set"}</div>
            <div><span className="font-medium">Priority:</span> {getSelectedPriorityName() || "Not set"}</div>
            <div><span className="font-medium">Task Type:</span> {getSelectedTaskTypeName() || "Not set"}</div>
            <div><span className="font-medium">Assigned:</span> {form.assignedDate || "Not set"}</div>
            <div><span className="font-medium">Due:</span> {form.dueDate || "Not set"}</div>
            <div className="md:col-span-2"><span className="font-medium">Description:</span> {form.description || "Not set"}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={handleSubmit} disabled={isSubmitting || !currentUserId}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[120px]">
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : 'Create Task'}
          </button>
          <button onClick={handleCancel} disabled={isSubmitting}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel" onConfirm={() => { setShowSuccessAlert(false); navigate("/teacher/task-management/professional-tasks"); }}
          confirmBtnText="Go to Tasks" showCancel={true} cancelBtnText="Create Another"
          onCancel={() => {
            setShowSuccessAlert(false);
            setForm({ title: "", description: "", taskType: "", assignedDate: "", dueDate: "", priority: "" });
          }}>
          {alertMessage}
        </SweetAlert>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <SweetAlert error title="Error!" onConfirm={() => setShowErrorAlert(false)} confirmBtnText="Try Again">
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}