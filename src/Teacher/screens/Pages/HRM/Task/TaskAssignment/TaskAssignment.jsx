'use client';
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

import { useNavigate } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';
import { TaskManagement } from '../../Services/TaskManagement.service';
// import { DepartmentService } from '../../../Academics/Services/Department.service';
import { Settings } from '../../Settings/Settings.service';
// import Loader from '../Components/Loader';

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

const TaskAssignmentTable = ({
  tasks = [],
  selectedTask,
  onTaskSelect,
  onToggleActive,
  onView,
  onEdit,
  onDelete,
  onShowDetails,
  loading = false,
  statusChanging = {},
}) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalEntries = tasks.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = tasks.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const isTaskOverdue = (task) => {
    if (!task.dueOn || task.status === 'Complete') return false;

    const due = new Date(task.dueOn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  // Get display date
  const getDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDate(dateString);
  };

  return (
    <>
      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center" style={{width: '12%'}}>Name</th>
                <th className="table-th text-center" style={{width: '12%'}}>Task Title</th>
                <th className="table-th text-center" style={{width: '8%'}}>Task Type</th>
                <th className="table-th text-center" style={{width: '8%'}}>Assigned By</th>
                <th className="table-th text-center" style={{width: '8%'}}>Assigned on</th>
                <th className="table-th text-center" style={{width: '17%'}}>Due on</th>
                <th className="table-th text-center" style={{width: '10%'}}>Priority</th>
                <th className="table-th text-center" style={{width: '13%'}}>Status</th>
                <th className="table-th text-center" style={{width: '12%'}}>Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="table-td text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      {/* <Loader  size="lg" className="mb-4" /> */}
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
                currentEntries.map((task) => {
                  const displayDueDate = getDisplayDate(task.dueOn);
                  const displayAssignedDate = getDisplayDate(task.assignedOn);
                  const isOverdue = isTaskOverdue(task);
                  
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 text-center">
                        <p className="font-semibold text-gray-900 text-sm truncate">{task.name}</p>
                      </td>

                      <td className="px-3 py-4 text-sm text-gray-900 truncate text-center">{task.taskTitle}</td>
                      <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.taskType}</td>
                      <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.assignedBy}</td>
                      <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{displayAssignedDate}</td>
                      <td className={`px-3 py-4 text-sm font-semibold truncate text-center ${
                        isOverdue ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {displayDueDate}
                      </td>

                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority || 'Medium'}
                        </span>
                      </td>

                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => onToggleActive(task.id)}
                          disabled={true}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all cursor-not-allowed ${
                            statusChanging[task.id]
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : task.status === 'Complete'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : task.status === 'Pending'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : task.status === 'InProgress'
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              : task.status === 'Incomplete'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
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
                              {task.status || 'Pending'}
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-2 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onView(task)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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

      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              {/* <Loader  size="lg" className="mb-4" /> */}
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-sm">
                No tasks found. Try adjusting the filters or contact support if the issue
                persists.
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((task) => {
            const displayDueDate = getDisplayDate(task.dueOn);
            const displayAssignedDate = getDisplayDate(task.assignedOn);
            const isOverdue = isTaskOverdue(task);
            
            return (
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
                      <p className="font-semibold text-gray-900">{task.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleActive(task.id)}
                    disabled={true}
                    className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-not-allowed ${statusChanging[task.id]
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : task.status === 'Complete'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'Pending'
                        ? 'bg-blue-100 text-blue-800'
                        : task.status === 'InProgress'
                        ? 'bg-orange-100 text-orange-800'
                        : task.status === 'Incomplete'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {statusChanging[task.id] ? (
                      <>
                        {/* <Loader size="sm" className="mr-1" /> */}
                        Updating...
                      </>
                    ) : (
                      <>
                        {task.status === 'Complete' ? <ToggleRight className="w-3.5 h-3.5 mr-1" /> : <ToggleLeft className="w-3.5 h-3.5 mr-1" />}
                        {task.status || 'Pending'}
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Task:</span> {task.taskTitle || 'N/A'}</div>
                    <div><span className="font-medium">Type:</span> {task.taskType || 'N/A'}</div>
                    <div><span className="font-medium">Assigned By:</span> {task.assignedBy || 'N/A'}</div>
                    <div><span className="font-medium">Assigned:</span> {displayAssignedDate}</div>
                    <div className="col-span-2">
                      <span className={`font-medium ${
                        isOverdue ? 'text-red-600' : 'text-gray-700'
                      }`}>Due:</span> 
                      <span className={`font-semibold ml-1 ${
                        isOverdue ? 'text-red-600' : 'text-gray-700'
                      }`}>{displayDueDate}</span>
                    </div>
                    <div><span className="font-medium">Priority:</span> 
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
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
            );
          })
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {start + 1}–{Math.min(end, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages 
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

export default function TaskAssignment() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  
  // Get current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = currentUser?.user?.user_id || null;

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    filterOpen: false,
    department: '',
    view: '',
    year: '',
    month: '',
    week: '',
    fromDate: '',
    toDate: '',
    activeSubTab: '',
    priority: '',
    status: ''
  });
  const [mobileTabStart, setMobileTabStart] = useState(0);

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
    if (!fromDate || !toDate) return [];
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const dates = [];
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const formatDate = (date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
      };
      
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
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
      subTabs = getWeekTabs(parseInt(filters.year), filters.month);
    } else {
      subTabs = getPeriodTabs(filters.fromDate, filters.toDate);
    }
    const firstTab = Array.isArray(subTabs[0]) ? subTabs[0] : subTabs[0]?.label || subTabs[0];
    setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: firstTab }));
  };

  const filteredTasks = useMemo(() => {
    let list = tasks;
    
    console.log("Filtering tasks:", list.length, "filters:", filters);
    
    // Search filter
    if (searchQuery) {
      list = list.filter(
        (task) =>
          (task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.email && task.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.taskTitle && task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()))
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
    
    // Date-based filtering for view types
    if (filters.view === 'monthly' && filters.activeSubTab && filters.year) {
      const monthIndex = monthTabs.indexOf(filters.activeSubTab);
      if (monthIndex !== -1) {
        list = list.filter(task => {
          try {
            if (!task.assignedOn) return false;
            const date = new Date(task.assignedOn);
            if (isNaN(date.getTime())) return false;
            return date.getMonth() === monthIndex && date.getFullYear() === parseInt(filters.year);
          } catch (error) {
            console.error('Error filtering by month:', error);
            return false;
          }
        });
      }
    }
    
    if (filters.view === 'weekly' && filters.activeSubTab && filters.month && filters.year) {
      list = list.filter(task => {
        try {
          if (!task.assignedOn) return false;
          const date = new Date(task.assignedOn);
          if (isNaN(date.getTime())) return false;
          return date.getMonth() === ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(filters.month);
        } catch (error) {
          console.error('Error filtering by week:', error);
          return false;
        }
      });
    }
    
    if (filters.view === 'period' && filters.fromDate && filters.toDate) {
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      list = list.filter(task => {
        try {
          if (!task.assignedOn) return false;
          const taskDate = new Date(task.assignedOn);
          if (isNaN(taskDate.getTime())) return false;
          return taskDate >= fromDate && taskDate <= toDate;
        } catch (error) {
          console.error('Error filtering by period:', error);
          return false;
        }
      });
    }
    
    console.log("Filtered tasks count:", list.length);
    return list;
  }, [tasks, searchQuery, filters.priority, filters.status, filters.department, filters.view, filters.activeSubTab, filters.year, filters.month, filters.fromDate, filters.toDate]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [statusChanging, setStatusChanging] = useState({});

  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  
  // Success/Error Alert States
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
  const [showStatusErrorAlert, setShowStatusErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch tasks from API - IMPROVED
  useEffect(() => {
    async function fetchTasks() {
      if (!userId) {
        console.error("User ID not found");
        setTasks([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching tasks from API for user ID:", userId);
  
        const response = await TaskManagement.getAllPMSTasks();
        console.log("API Response:", response);
  
        // Check if response is an array
        let taskList = [];
        if (Array.isArray(response)) {
          taskList = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          taskList = response.data;
        } else if (response && Array.isArray(response.tasks)) {
          taskList = response.tasks;
        } else {
          console.error("Unexpected API response format:", response);
          taskList = [];
        }
  
        console.log("Task list:", taskList);
  
        // Map tasks with better error handling
        const formatted = taskList.map((item, index) => {
          try {
            // Extract employee name from user object
            const firstName = item.user?.teacher_info?.firstname || item.user?.other_staff_info?.firstname || "";
            const lastName = item.user?.teacher_info?.lastname || item.user?.other_staff_info?.lastname || "";
            const employeeName = `${firstName} ${lastName}`.trim() || item.user?.username || "Unknown";
            
            return {
              id: item.task_assignment_id || item.id || `task-${index}`,
            
              name: employeeName,
            
              taskTitle: item.task?.task_name || item.taskName || item.title || "No Title",
            
              taskType: item.task?.task_type?.task_type_name || "N/A",
            
              assignedBy: item.assignedByName || item.assigned_by || item.assignedBy || "-",
            
              assignedOn: item.task?.assigned_date_time || item.assigned_date_time,
            
              dueOn: item.task?.due_date_time || item.due_date_time,
            
              priority: item.task?.priority?.priority_name 
       || item.priority?.priority_name 
       || "Medium",

            
              status: item.task?.task_status_name || item.assignment_status || "ASSIGNED",
            
              email: item.user?.email || "",
            
              phone: item.user?.phone || "",
            
              department: item.departmentName || item.department || "",
            
              _raw: item
            };
            
          } catch (error) {
            console.error("Error formatting task:", error, item);
            return {
              id: `error-${index}`,
              name: "Error",
              taskTitle: "Error formatting task",
              taskType: "N/A",
              assignedBy: "-",
              assignedOn: "",
              dueOn: "",
              priority: "Medium",
              status: "Error",
              email: "",
              phone: "",
              department: ""
            };
          }
        });
  
        // Filter tasks to show only those assigned to current user
        const userTasks = formatted.filter(task => {
          // Check if task is assigned to current user
          const taskUserId = task._raw?.user?.user_id || task._raw?.user_id;
          return taskUserId === userId;
        });
        
        console.log("Formatted tasks:", formatted);
        console.log("User specific tasks:", userTasks);
        setTasks(userTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Set empty array instead of throwing
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
  
    fetchTasks();
  }, [userId]);
  
  // DELETE HANDLERS
  const handleDelete = (id) => {
    console.log("Delete requested for task ID:", id);
    setTaskToDelete(id);
    setShowAlert(true);
  };
  
  const handleConfirmDelete = async () => {
    console.log("Confirming delete for task ID:", taskToDelete);
    setShowAlert(false);

    try {
        setLoading(true);

        // Check if delete method exists in service
        if (!TaskManagement.deletePMSTaskAssignment) {
          throw new Error("Delete method not found in service");
        }

        const response = await TaskManagement.deletePMSTaskAssignment(taskToDelete);
        console.log("Delete response:", response);

        setLoading(false);
        setAlertMessage("Task deleted successfully!");
        setShowDeleteSuccessAlert(true);

        // Remove from UI
        setTasks(prev => prev.filter(t => t.id !== taskToDelete));

        setTaskToDelete(null);
    } catch (error) {
        setLoading(false);
        console.error("Delete Error:", error);

        let message = "Failed to delete task. Please try again.";
        if (error?.message) message = error.message;
        if (error?.response?.data?.message) message = error.response.data.message;

        setErrorMessage(message);
        setShowDeleteErrorAlert(true);
    }
  };
  
  const handleCancelDelete = () => {
    setShowAlert(false);
    setTaskToDelete(null);
  };

  const handlePasswordConfirm = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const adminUserId = Number(currentUser?.jti);

      if (!password) {
        SweetAlert({
          title: "Error!",
          text: "Please enter your admin password.",
          type: "error",
          confirmButtonText: "OK"
        });
        return;
      }

      const payload = {
        task_id: Number(taskToDelete),
        admin_user_id: adminUserId,
        admin_password: password,
      };

      // Call the API
      const response = await TaskManagement.deleteTaskAssignment(payload);

      // If API returns 400 inside try
      if (response?.status === 400) {
        const message = response?.message || response?.error || "Invalid admin password. Please try again.";
        setErrorMessage(message);
        setShowDeleteErrorAlert(true);
        return;
      }

      // If successful
      setPasswordAlert(false);
      setPassword("");
      setTaskToDelete(null);
      setAlertMessage('Task deleted successfully!');
      setShowDeleteSuccessAlert(true);
      
      // Remove task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));

    } catch (error) {
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      console.log("Error data:", error.response?.data);

      // Extract proper message
      let apiErrorMessage = "Something went wrong. Try again.";
      const status = error?.response?.status;

      if (status === 400) {
        apiErrorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid admin password. Please try again.";
      } else if (error?.message) {
        apiErrorMessage = error.message;
      }

      setErrorMessage(apiErrorMessage);
      setShowDeleteErrorAlert(true);
    }
  };
  
  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword("");
    setTaskToDelete(null);
  };

  const handleTaskSelect = (id) => {
    setSelectedTask(selectedTask === id ? null : id);
  };

  const handleToggleActive = (id) => {
    setStatusChanging(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setStatusChanging(prev => ({ ...prev, [id]: false }));
    }, 1000);
  };

  const handleView = (task) => {
    navigate(`/hrm/tasks/task-assignment/task-view/${task.id}`);
  };

  const handleEdit = (task) => {
    navigate(`/hrm/tasks/task-assignment/edit-task/${task.id}`);
  };

  const handleShowDetails = (task) => console.log('Show details:', task);

  useEffect(() => {
    if (filters.view === 'period' && filters.fromDate && filters.toDate) {
      const periodTabs = getPeriodTabs(filters.fromDate, filters.toDate);
      setFilters(prev => ({ ...prev, activeSubTab: periodTabs[0] }));
    }
  }, [filters.fromDate, filters.toDate, filters.view]);

  useEffect(() => {
    if (filters.view === 'weekly' && filters.week) {
      const weeklyTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
      const firstTab = weeklyTabs[0]?.label || weeklyTabs[0];
      setFilters(prev => ({ ...prev, activeSubTab: firstTab }));
    }
    setMobileTabStart(0);
  }, [filters.month, filters.year, filters.week, filters.view]);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const collegeId = activeCollege?.id || null;

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!collegeId) return;
      setDeptLoading(true);
      try {
        const data = await DepartmentService.getDepartmentByCollegeId(collegeId);
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

  // Debug
  console.log("Total tasks:", tasks.length);
  console.log("Filtered tasks:", filteredTasks.length);
  console.log("Loading:", loading);

  return (
    <div className="p-6">
      {/* Search + Filter + Create Task */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
        {/* Search */}
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
            onClick={() => navigate("/hrm/tasks/task-assignment/create-task")}
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

                <div className="grid grid-cols-3 gap-2 px-8 py-2">
                  {getSubTabs().slice(mobileTabStart, mobileTabStart + 3).map((tab, index) => {
                    const tabLabel = typeof tab === 'object' ? tab.label : tab;
                    return (
                      <button
                        key={mobileTabStart + index}
                        onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                        className={`text-center px-2 py-2 text-xs rounded-lg transition-colors ${
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

      <TaskAssignmentTable
        tasks={filteredTasks}
        selectedTask={selectedTask}
        onTaskSelect={handleTaskSelect}
        onToggleActive={handleToggleActive}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onShowDetails={handleShowDetails}
        statusChanging={statusChanging}
        loading={loading}
      />
      
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
          Do you want to delete this Task?
        </SweetAlert>
      )}
      
      {/* Password Protected Delete Confirmation */}
      {passwordAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 sm:px-0">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
              Admin Verification Required
            </h3>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              Enter your admin password to confirm deletion.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordConfirm();
              }}
              className="flex flex-col"
            >
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 text-center text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success/Error Alerts */}
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
      
      {showDeleteErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => {
            setShowDeleteErrorAlert(false);
            setErrorMessage('');
          }}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {errorMessage}
        </SweetAlert>
      )}
      
      {showStatusSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowStatusSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {showStatusErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowStatusErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}