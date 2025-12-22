'use client';
import { useNavigate } from "react-router-dom";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  X,
  Plus,
  Calendar,
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
// import Loader from '../../Components/Loader';
import { TaskManagement } from '../../Services/TaskManagement.service';
// import { DepartmentService } from '../../../Academics/Services/Department.service';
import { Settings } from '../../Settings/Settings.service';

// Custom Select Components
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
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

const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = programOptions.filter(p => !selectedPrograms.includes(p));
  const handleSelect = (program) => {
    onProgramChange({ target: { value: program } });
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400 transition-all duration-150"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedPrograms.length > 0 ? (
            selectedPrograms.map(prog => (
              <span
                key={prog}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {prog}
                <button
                  onClick={() => onProgramRemove(prog)}
                  className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
                  title="Remove Program"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm ml-1">Select Program(s)</span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map(prog => (
                <div
                  key={prog}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSelect(prog)}
                >
                  {prog}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">All programs selected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MyTaskTable = ({
  tasks = [],
  selectedTask,
  onTaskSelect,
  onToggleActive,
  searchQuery,
    filters,   
  onView,
  onEdit,
  onDelete,
  onShowDetails,
  currentPage = 0,
  entriesPerPage = 10,
  onPageChange,
  loading = false,
  totalTasks = 0,
  totalPages = 0,
  statusChanging = {},
}) => {
  // Helper function to check if task is overdue
  const isTaskOverdue = (task) => {
    if (task.status === 'Complete') return false;
    const dueDate = new Date(task.dueDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < currentDate;
  };
  // Convert 0-based API pagination to 1-based UI pagination
  const displayPage = currentPage + 1;
  const indexOfFirst = currentPage * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, totalTasks);
  const handlePrev = () => displayPage > 1 && onPageChange(displayPage - 2);
  const handleNext = () => displayPage < totalPages && onPageChange(displayPage);
  // Calculate if next button should be disabled - only enable when there are more than 10 entries
  const isNextDisabled = totalTasks <= entriesPerPage || displayPage >= totalPages;
  
  return (
    <>
      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Department</th>
                <th className="table-th">Task Title</th>
                <th className="table-th">Task Type</th>
                <th className="table-th">Assigned By</th>
                <th className="table-th">Due on</th>
                <th className="table-th table-cell-center">Priority</th>
                <th className="table-th table-cell-center">Status</th>
                <th className="table-th table-cell-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="table-td text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      {/* <Loader size="lg" className="mb-4" /> */}
                      <p className="text-gray-500">Loading tasks...</p>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-td text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No tasks found</p>
                      <p className="text-sm">
                        No tasks found. Try adjusting the filters or contact support if the
                        issue persists.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{task.firstname} {task.lastname}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{task.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{task.taskTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{task.taskType}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{task.assignedBy}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${
                      isTaskOverdue(task) ? 'text-red-600' : 'text-gray-700'
                    }`}>{task.dueOn}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggleActive(task.id)}
                        disabled={statusChanging[task.id]}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusChanging[task.id]
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : task.status === 'Complete'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : task.status === 'Pending'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : task.status === 'Incomplete'
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                      >
                        {statusChanging[task.id] ? (
                          <>
                            {/* <Loader size="sm" className="mr-1" /> */}
                            Updating...
                          </>
                        ) : (
                          <>
                            {task.status === 'Complete' ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                            {task.status}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView(task)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(task)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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
        </div>
        {/* ────────────────────── Pagination ────────────────────── */}
        {!loading && totalTasks > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={displayPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${displayPage === 1
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              Previous
            </button>
            {/* Showing X-Y of Z */}
            <span className="text-sm font-medium text-gray-700">
              Showing <strong>{indexOfFirst + 1}</strong>–<strong>{indexOfLast}</strong> of <strong>{totalTasks}</strong> entries
            </span>
            {/* Next Button - Fixed condition */}
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${isNextDisabled
                 ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              {/* <Loader size="lg" className="mb-4" /> */}
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-sm">
                {searchQuery || filters.department || filters.priority || filters.status
                  ? `No tasks found matching your search or filters`
                  : "No tasks found. Try adjusting the search or contact support if the issue persists."}
              </p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{task.firstname} {task.lastname}</p>
                    <p className="text-sm text-gray-500">{task.department}</p>
                    <p className="text-sm text-gray-500">{task.taskTitle}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Type:</span> {task.taskType}</div>
                  <div><span className="font-medium">Assigned By:</span> {task.assignedBy}</div>
                  <div><span className="font-medium">Priority:</span> 
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div><span className="font-medium">Status:</span>
                    <button
                      onClick={() => onToggleActive(task.id)}
                      disabled={statusChanging[task.id]}
                      className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                        statusChanging[task.id]
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : task.status === 'Complete'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : task.status === 'Pending'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : task.status === 'Incomplete'
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {statusChanging[task.id] ? (
                        <>
                          {/* <Loader size="sm" className="mr-1" /> */}
                          Updating...
                        </>
                      ) : (
                        <>
                          {task.status === 'Complete' ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                          {task.status}
                        </>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <span className={`font-medium ${
                      isTaskOverdue(task) ? 'text-red-600' : 'text-gray-700'
                    }`}>Due:</span>
                    <span className={`ml-1 font-semibold ${
                      isTaskOverdue(task) ? 'text-red-600' : 'text-gray-700'
                    }`}>{task.dueOn}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(task)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(task)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalTasks > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={handlePrev}
            disabled={displayPage === 1}
            className={`px-4 py-2 rounded-md ${
              displayPage === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {indexOfFirst + 1}–{indexOfLast} of {totalTasks}
          </span>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-4 py-2 rounded-md ${
              isNextDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

// Date formatting helper
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = `${hours}:${minutes} ${ampm}`;
  return `${day}-${month}-${year} ${strTime}`;
};

// Main component
export default function MyTasks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mobileTabStart, setMobileTabStart] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusChanging, setStatusChanging] = useState({});
  const [filters, setFilters] = useState({
    filterOpen: false,
    department: '',
    priority: '',
    status: '',
    view: '',
    year: '',
    month: '',
    week: '',
    fromDate: '',
    toDate: '',
    activeSubTab: ''
  });
  // Alert States
  const [alert, setAlert] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = currentUser?.userId || null;
  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id || null;

  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [priorities, setPriorities] = useState([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const years = ['2022', '2023', '2024', '2025'];
  const monthTabs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getWeekOptions = (year, month) => {
    if (!year || !month) return [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(month);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const weeks = Math.ceil(daysInMonth / 7);
    return Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
  };
  
  const getWeekTabs = (year, month, week) => {
    if (!year || !month || !week) return [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(month);
    const weekNumber = parseInt(week.split(' ')[1]);
   
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(weekNumber * 7, new Date(year, monthIndex + 1, 0).getDate());
   
    const days = [];
    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(year, monthIndex, day);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayLabel = `${dayName}, ${day} ${months[monthIndex]}`;
      days.push({ label: dayLabel, date: new Date(date) });
    }
    return days;
  };
  
  const getPeriodTabs = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      return ['25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025', '25-02-2025'];
    }
   
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const daysPerPeriod = Math.ceil(totalDays / 10); // Divide into 10 periods
   
    const periods = [];
    for (let i = 0; i < 10; i++) {
      const periodStart = new Date(start);
      periodStart.setDate(start.getDate() + (i * daysPerPeriod));
     
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
     
      periods.push(formatDate(periodStart));
    }
    return periods;
  };
  
  const getSubTabs = () => {
    switch(filters.view) {
      case 'monthly': return monthTabs;
      case 'weekly': return getWeekTabs(parseInt(filters.year), filters.month, filters.week);
      case 'period': return getPeriodTabs(filters.fromDate, filters.toDate);
      default: return [];
    }
  };
  
  const handleViewChange = (view) => {
    const viewValue = view.toLowerCase();
    let subTabs;
    if (viewValue === 'monthly') {
      subTabs = monthTabs;
    } else if (viewValue === 'weekly') {
      subTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
    } else {
      subTabs = getPeriodTabs(filters.fromDate, filters.toDate);
    }
    const firstTab = Array.isArray(subTabs[0]) ? subTabs[0] : subTabs[0]?.label || subTabs[0];
    setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: firstTab }));
  };
  
  const filteredTasks = useMemo(() => {
    let list = tasks;
   
    // Search filter
    if (searchQuery) {
      list = list.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
   
    // Priority filter
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(task => task.priority === filters.priority);
    }
   
    // Status filter
    if (filters.status && filters.status !== 'All') {
      list = list.filter(task => task.status === filters.status);
    }
   
    // Department filter
    if (filters.department) {
      list = list.filter(task => task.department === filters.department);
    }
   
    return list;
  }, [tasks, searchQuery, filters.priority, filters.status, filters.department]);
  
  const handleTaskSelect = (id) => {
    setSelectedTask(selectedTask === id ? null : id);
  };
  
  const handleToggleActive = async (id) => {
    setStatusChanging(prev => ({ ...prev, [id]: true }));
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === 'Pending' || task.status === 'Incomplete' ? 'Complete' : 'Pending';
    const updateValues = { status: newStatus };
    
    try {
      await TaskManagement.updateMyTask(updateValues, parseInt(id));
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setAlert(null)}
        >
          Status updated successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
        >
          Failed to update status.
        </SweetAlert>
      );
    } finally {
      setStatusChanging(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleView = (task) => {
    navigate(`/hrm/tasks/my-tasks/view/${task.id}`);
  };
 
  const handleEdit = (task) => {
    navigate(`/hrm/tasks/my-tasks/edit/${task.id}`);
  };
 
  // Delete functionality
  const handleDelete = (id) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(id)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover this record!
      </SweetAlert>
    );
  };

  const confirmDelete = async (id) => {
    try {
      await TaskManagement.deleteMyTask(parseInt(id), userId);
      setTasks(prev => prev.filter(t => t.id !== id));
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Task deleted successfully.
        </SweetAlert>
      );
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to delete task.
        </SweetAlert>
      );
    }
  };
 
  const handleShowDetails = (task) => console.log('Show details:', task);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const entriesPerPage = 10;
  const totalTasks = filteredTasks.length;
  const totalPages = Math.ceil(totalTasks / entriesPerPage);
  
  // Calculate paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, entriesPerPage]);
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Update period tabs when from/to dates change
  useEffect(() => {
    if (filters.view === 'period' && filters.fromDate && filters.toDate) {
      const periodTabs = getPeriodTabs(filters.fromDate, filters.toDate);
      setFilters(prev => ({ ...prev, activeSubTab: periodTabs[0] }));
    }
  }, [filters.fromDate, filters.toDate, filters.view]);
  
  // Update weekly tabs when month or year changes
  useEffect(() => {
    if (filters.view === 'weekly' && filters.week) {
      const weeklyTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
      const firstTab = weeklyTabs[0]?.label || weeklyTabs[0];
      setFilters(prev => ({ ...prev, activeSubTab: firstTab }));
    }
    setMobileTabStart(0);
  }, [filters.month, filters.year, filters.week, filters.view]);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!collegeId) return;
      setDeptLoading(true);
      try {
        const data = await TaskManagement.getDepartmentByCollegeId(collegeId);
        const deptNames = data.map(dept => dept.department_name || dept.name || 'Unknown');
        setDepartments(deptNames);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepartments();
  }, [collegeId]);

  // Fetch priorities from API
  useEffect(() => {
    const fetchPriorities = async () => {
      setPriorityLoading(true);
      try {
        const data = await Settings.getAllPriority();
        const priorityNames = ['All', ...data.map(priority => priority.priority_name || 'Unknown')];
        setPriorities(priorityNames);
      } catch (err) {
        console.error('Error fetching priorities:', err);
        setPriorities(['All', 'High', 'Medium', 'Low']);
      } finally {
        setPriorityLoading(false);
      }
    };
    fetchPriorities();
  }, []);

  // Fetch task statuses from API
  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const data = await Settings.getAllTaskStatus();
        const statusNames = ['All', ...data.map(status => status.name || 'Unknown')];
        setStatuses(statusNames);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        setStatuses(['All', 'Pending', 'Complete', 'Incomplete']);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  // Fetch tasks from API - UPDATED TO USE getAllMyTasks
  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await TaskManagement.getAllMyTasks(userId);
        
        const tasksData = Array.isArray(response?.tasks) ? response.tasks : [];
        
        const mappedTasks = tasksData.map(task => ({
          id: task.self_task_id?.toString(),
          firstname: response.user?.other_staff_info?.firstname || "N/A",
          lastname: response.user?.other_staff_info?.lastname || "N/A",
          name: response.user?.username || "",
          email: response.user?.username || "",
          taskTitle: task.title || "No Title",
          taskType: task.task_type?.task_type_name || "General",
          assignedBy: task.assigned_by?.other_staff_info
            ? `${task.assigned_by.other_staff_info.firstname} ${task.assigned_by.other_staff_info.lastname}`
            : "System",
          assignedOn: formatDate(task.assigned_date_time),
          dueOn: formatDate(task.due_date_time),
          dueDate: task.due_date_time,
          priority: task.priority?.priority_name || "Medium",
          status: task.status?.name || "Pending",
          department: response.user?.other_staff_info?.department?.department_name || ""
        }));
        
        setTasks(mappedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setAlert(
          <SweetAlert
            danger
            title="Error!"
            onConfirm={() => setAlert(null)}
          >
            Failed to load tasks. Please try again later.
          </SweetAlert>
        );
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [userId]);

  return (
    <div className="p-0 md:p-0">
      {alert}
      {/* Search + Filter + Create Task */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
        {/* SEARCH */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for tasks"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filter + Create Task */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
          {/* Create Task - All screens */}
          <button
            onClick={() => navigate("/teacher/hrm/tasks/my-tasks/add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="sm:inline">Create Task</span>
          </button>
        </div>
      </div>
      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              options={departments}
              placeholder={deptLoading ? "Loading departments..." : "Select Department"}
              disabled={deptLoading}
            />
           
            <CustomSelect
              label="Priority"
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              options={priorities}
              placeholder={priorityLoading ? "Loading priorities..." : "Select Priority"}
              disabled={priorityLoading}
            />
           
            <CustomSelect
              label="Status"
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={statuses}
              placeholder={statusLoading ? "Loading statuses..." : "Select Status"}
              disabled={statusLoading}
            />
            <CustomSelect
              label="Select View"
              value={filters.view}
              onChange={(e) => handleViewChange(e.target.value)}
              options={['Monthly', 'Weekly', 'Period']}
              placeholder="Select View"
            />
            {filters.view === 'weekly' && (
              <>
                <CustomSelect
                  label="Month"
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, week: '' }))}
                  options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
                  placeholder="Select Month"
                />
                <CustomSelect
                  label="Year"
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, week: '' }))}
                  options={years}
                  placeholder="Select Year"
                />
                <CustomSelect
                  label="Week"
                  value={filters.week}
                  onChange={(e) => setFilters(prev => ({ ...prev, week: e.target.value }))}
                  options={getWeekOptions(parseInt(filters.year), filters.month)}
                  placeholder="Select Week"
                  disabled={!filters.month || !filters.year}
                />
              </>
            )}
            {filters.view === 'monthly' && (
              <CustomSelect
                label="Year"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                options={years}
                placeholder="Select Year"
              />
            )}
            {filters.view === 'period' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
          {/* Sub Tabs */}
          {filters.view && (
            <div className="relative max-w-[920px] mx-auto">
              {/* Desktop Navigation */}
              <button
                onClick={() => {
                  const el = document.getElementById("tabsCarousel");
                  el.scrollLeft -= 200;
                }}
                className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors p-2 z-20 bg-white rounded-full shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("tabsCarousel");
                  el.scrollLeft += 200;
                }}
                className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors p-2 z-20 bg-white rounded-full shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div
                id="tabsCarousel"
                className="hidden sm:flex space-x-2 overflow-x-auto whitespace-nowrap scroll-smooth px-12 py-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`#tabsCarousel::-webkit-scrollbar { display: none; }`}</style>
                {getSubTabs().map((tab, index) => {
                  const tabLabel = typeof tab === 'object' ? tab.label : tab;
                  return (
                    <button
                      key={index}
                      onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                      className={`whitespace-nowrap text-center px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0 ${
                        filters.activeSubTab === tabLabel
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 shadow-md"
                      }`}
                    >
                      {filters.view === 'monthly' && monthTabs.includes(tabLabel)
                        ? fullMonthNames[monthTabs.indexOf(tabLabel)]
                        : tabLabel}
                    </button>
                  );
                })}
              </div>
              {/* Mobile Tabs */}
              <div className="sm:hidden relative">
                {getSubTabs().length > 3 && (
                  <>
                    <button
                      onClick={() => setMobileTabStart(Math.max(0, mobileTabStart - 1))}
                      disabled={mobileTabStart === 0}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${
                        mobileTabStart === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMobileTabStart(Math.min(getSubTabs().length - 3, mobileTabStart + 1))}
                      disabled={mobileTabStart >= getSubTabs().length - 3}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${
                        mobileTabStart >= getSubTabs().length - 3 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="flex space-x-2 px-8 py-2">
                  {getSubTabs().slice(mobileTabStart, mobileTabStart + 3).map((tab, index) => {
                    const tabLabel = typeof tab === 'object' ? tab.label : tab;
                    return (
                      <button
                        key={mobileTabStart + index}
                        onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                        className={`flex-1 text-center px-2 py-2 text-xs rounded-lg transition-colors ${
                          filters.activeSubTab === tabLabel
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 shadow-md"
                        }`}
                      >
                        {filters.view === 'monthly' && monthTabs.includes(tabLabel)
                          ? fullMonthNames[monthTabs.indexOf(tabLabel)]
                          : tabLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <MyTaskTable
        tasks={loading ? [] : paginatedTasks}
        selectedTask={selectedTask}
        onTaskSelect={handleTaskSelect}
        onToggleActive={handleToggleActive}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onShowDetails={handleShowDetails}
        currentPage={currentPage}
        entriesPerPage={entriesPerPage}
        onPageChange={handlePageChange}
        totalTasks={totalTasks}
        totalPages={totalPages}
        statusChanging={statusChanging}
        loading={loading}
        searchQuery={searchQuery}
         filters={filters}
      />

    </div>
  );
}
