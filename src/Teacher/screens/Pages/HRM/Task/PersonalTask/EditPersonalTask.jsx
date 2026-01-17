import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Edit, X, ChevronDown } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { TaskManagement } from '../../Services/TaskManagement.service';
import { Settings } from '../../Settings/Settings.service';
import { api } from '../../../../../../_services/api';

// Custom Select Component inside EditTask.js
// Custom Select Component (Updated to match CreateNewTasks)
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

export default function EditPersonalTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const taskData = location.state?.taskData;

  // Helper function to safely format date
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  // Initialize form with passed data or empty values
  const [form, setForm] = useState({
    title: taskData?.title || "",
    description: taskData?.description || "",
    taskType: taskData?.task_type?.task_type_name || "",
    taskTypeId: taskData?.task_type?.task_type_id || "",
    assignedDate: formatDateForInput(taskData?.assigned_date_time),
    dueDate: formatDateForInput(taskData?.due_date_time),
    priority: taskData?.priority?.priority_name || "",
    priorityId: taskData?.priority?.priority_id || "",
    status: taskData?.status?.name || "",
    statusId: taskData?.status?.task_status_id || "",
  });

  // New State for Task Category and Academic Filters
  const [taskCategory, setTaskCategory] = useState("NON_ACADEMIC");
  const [allocations, setAllocations] = useState([]);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);

  const [academicFilters, setAcademicFilters] = useState({
    program: '',
    batch: '',
    academicYear: '',
    semester: '',
    division: '',
    subject: ''
  });

  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prioritiesData, taskTypesData, statusesData] = await Promise.all([
          Settings.getAllPriority(),
          Settings.getAllTaskType(),
          Settings.getAllTaskStatus()
        ]);

        setPriorities(prioritiesData || []);
        setTaskTypes(taskTypesData || []);
        setStatuses(statusesData || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Only fetch from API if no data was passed
  useEffect(() => {
    if (id && !loading && !taskData) {
      TaskManagement.getMyTaskbyID(id)
        .then(response => {
          if (response) {
            setForm({
              title: response.title || "",
              description: response.description || "",
              taskType: response.task_type?.task_type_name || "",
              taskTypeId: response.task_type?.task_type_id || "",
              assignedDate: response.assigned_date_time ? response.assigned_date_time.slice(0, 16) : "",
              dueDate: response.due_date_time ? response.due_date_time.slice(0, 16) : "",
              priority: response.priority?.priority_name || "",
              priorityId: response.priority?.priority_id || "",
              status: response.status?.name || "",
              statusId: response.status?.task_status_id || "",
            });
            // Initialize Academic Filters if applicable
            if (response.task_category === "ACADEMIC" || response.task_category === "Academic") {
              setTaskCategory("ACADEMIC");
              setAcademicFilters({
                program: response.program_id || response.academic_year?.program?.program_id || response.academic_year?.program_id,
                batch: response.batch_id || response.academic_year?.batch?.batch_id || response.academic_year?.batch_id,
                academicYear: response.academic_year_id,
                semester: response.semester_id,
                division: response.division_id,
                subject: response.subject_id
              });
            } else {
              setTaskCategory("NON_ACADEMIC");
            }
          }
        })
        .catch(error => {
          console.error('Error fetching task:', error);
          setAlertMessage('Failed to load task data.');
          setShowErrorAlert(true);
        });
    }
  }, [id, loading, taskData]);

  useEffect(() => {
    // Initial Data Load (from passed state or fallback API)
    const initialData = taskData; // If passed from navigation
    if (initialData) {
      if (initialData.task_category === "ACADEMIC" || initialData.task_category === "Academic") {
        setTaskCategory("ACADEMIC");
        setAcademicFilters({
          program: initialData.program_id || initialData.academic_year?.program?.program_id || initialData.academic_year?.program_id,
          batch: initialData.batch_id || initialData.academic_year?.batch?.batch_id || initialData.academic_year?.batch_id,
          academicYear: initialData.academic_year_id,
          semester: initialData.semester_id,
          division: initialData.division_id,
          subject: initialData.subject_id
        });
      }
    }

    // Get Teacher ID
    const userProfileStr = localStorage.getItem("userProfile");
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      if (userProfile?.teacher_id) {
        setCurrentTeacherId(userProfile.teacher_id);
      }
    }
  }, [taskData]);

  // Fetch Allocations
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
      if (field === 'program') {
        newFilters.batch = ''; newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = ''; newFilters.subject = '';
      } else if (field === 'batch') {
        newFilters.academicYear = ''; newFilters.semester = ''; newFilters.division = ''; newFilters.subject = '';
      } else if (field === 'academicYear') {
        newFilters.semester = ''; newFilters.division = ''; newFilters.subject = '';
      } else if (field === 'semester') {
        newFilters.division = ''; newFilters.subject = '';
      } else if (field === 'division') {
        newFilters.subject = '';
      }
      return newFilters;
    });
  };

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.taskTypeId || !form.dueDate || !form.priorityId || !form.statusId) {
      setAlertMessage('Please fill in all required fields.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);

    const currentUser = JSON.parse(localStorage.getItem("userProfile"));
    const userId = currentUser?.user?.user_id || null;

    const payload = {
      user_id: userId,
      title: form.title,
      description: form.description,
      priority_id: parseInt(form.priorityId),
      assigned_date_time: form.assignedDate ? (form.assignedDate.length === 16 ? form.assignedDate + ":00" : form.assignedDate) : null,
      due_date_time: form.dueDate ? (form.dueDate.length === 16 ? form.dueDate + ":00" : form.dueDate) : null,
      task_type_id: parseInt(form.taskTypeId),
      status_id: parseInt(form.statusId),
      ...(taskCategory === "ACADEMIC" ? {
        task_category: "ACADEMIC",
        academic_year_id: parseInt(academicFilters.academicYear),
        semester_id: parseInt(academicFilters.semester),
        division_id: parseInt(academicFilters.division),
        program_id: parseInt(academicFilters.program),
        subject_id: parseInt(academicFilters.subject)
      } : {
        task_category: ""
      })
    };

    TaskManagement.updateMyTask(payload, id)
      .then(response => {
        setIsSubmitting(false);
        setAlertMessage('Task updated successfully!');
        setShowSuccessAlert(true);
      })
      .catch(error => {
        setIsSubmitting(false);
        console.error('Error updating task:', error);
        setAlertMessage('Failed to update task. Please try again.');
        setShowErrorAlert(true);
      });
  };

  const handleCancel = () => {
    navigate("/teacher/hrm/tasks/personal-tasks");
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {/* <Edit className="w-6 h-6 text-[#2162C1]" /> */}
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Edit Personal Task
          </h2>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Task Information
        </h2>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="w-full">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              placeholder="enter title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              placeholder="enter description"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Priority"
              value={form.priorityId}
              onChange={(e) => setForm({
                ...form,
                priorityId: e.target.value,
                priority: priorities.find(p => p.priority_id == e.target.value)?.priority_name || ''
              })}
              options={priorities.map(p => ({ value: p.priority_id, name: p.priority_name }))}
              placeholder="select priority"
              disabled={loading}
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Assigned Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.assignedDate}
              onChange={(e) => setForm({ ...form, assignedDate: e.target.value })}
              placeholder="select date & time"
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Due Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              placeholder="select due date"
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Task Type"
              value={form.taskTypeId}
              onChange={(e) => setForm({
                ...form,
                taskTypeId: e.target.value,
                taskType: taskTypes.find(t => t.task_type_id == e.target.value)?.task_type_name || ''
              })}
              options={taskTypes.map(t => ({ value: t.task_type_id, name: t.task_type_name }))}
              placeholder="select task type"
              disabled={loading}
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Status"
              value={form.statusId}
              onChange={(e) => setForm({
                ...form,
                statusId: e.target.value,
                status: statuses.find(s => s.task_status_id == e.target.value)?.name || ''
              })}
              options={statuses.map(s => ({ value: s.task_status_id, name: s.name }))}
              placeholder="select status"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update'
            )}
          </button>

          <button
            onClick={handleCancel}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/teacher/hrm/tasks/personal-tasks");
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
    </div>
  );
}

