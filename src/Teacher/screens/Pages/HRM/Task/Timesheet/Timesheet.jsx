import React, { useState, useEffect, useRef, useMemo } from "react";
import { Download, Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TaskManagement } from '../../Services/TaskManagement.service.js';
import * as XLSX from 'xlsx';
import './Timesheet.module.css';

// Custom Select Components
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, getLabel }) => {
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
            {options.map((option, idx) => (
              <div
                key={idx}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
                onClick={() => handleSelect(option)}
              >
                {getLabel ? getLabel(option) : option}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default function TimeSheetDashboard() {
  // ========================================
  // 🔧 SATURDAY HOLIDAY CONFIGURATION
  // ========================================
  const SATURDAY_POLICY = 'SECOND_FOURTH';  // 'NONE', 'ALL', 'SECOND_FOURTH', 'ALTERNATE'
  // ========================================

  // Helper function to check if a date is a Saturday holiday
  const isSaturdayHoliday = (date) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek !== 6) return false;
    if (SATURDAY_POLICY === 'NONE') return false;
    if (SATURDAY_POLICY === 'ALL') return true;

    const dayOfMonth = dateObj.getDate();
    const saturdayNumber = Math.ceil(dayOfMonth / 7);

    if (SATURDAY_POLICY === 'SECOND_FOURTH') {
      return saturdayNumber === 2 || saturdayNumber === 4;
    }

    if (SATURDAY_POLICY === 'ALTERNATE') {
      return saturdayNumber % 2 === 1;
    }

    return false;
  };

  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthTabs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthTab = monthTabs[currentMonth];

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    filterOpen: false,
    view: '',
    year: String(currentYear),
    month: '',
    week: '',
    fromDate: '',
    toDate: '',
    activeSubTab: currentMonthTab
  });
  const [mobileTabStart, setMobileTabStart] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = currentUser?.user?.user_id || null;
  const [filteredData, setFilteredData] = useState({ days: [], summary: {} });
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef(null);

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

  const getWeekDateRange = (year, month, week) => {
    if (!year || !month || !week) return null;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(month);
    const weekNumber = parseInt(week.split(' ')[1]);

    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(weekNumber * 7, new Date(year, monthIndex + 1, 0).getDate());

    const startDate = new Date(year, monthIndex, startDay);
    const endDate = new Date(year, monthIndex, endDay);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
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
    switch (filters.view) {
      case 'monthly': return monthTabs;
      case 'weekly': return getWeekTabs(parseInt(filters.year), filters.month, filters.week);
      case 'period': return getPeriodTabs(filters.fromDate, filters.toDate);
      default: return [];
    }
  };

  const handleViewChange = (view) => {
    const viewValue = view.toLowerCase();
    let subTabs;
    let firstTab;

    if (viewValue === 'monthly') {
      subTabs = monthTabs;
      firstTab = currentMonthTab;
      setFilters(prev => ({
        ...prev,
        view: viewValue,
        activeSubTab: firstTab,
        year: String(currentYear)
      }));
    } else if (viewValue === 'weekly') {
      subTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
      setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: '' }));
    } else {
      subTabs = getPeriodTabs(filters.fromDate, filters.toDate);
      firstTab = Array.isArray(subTabs[0]) ? subTabs[0] : subTabs[0]?.label || subTabs[0];
      setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: firstTab }));
    }
  };

  const transformApiResponse = (apiResponse) => {
    console.log('API Response:', apiResponse);

    if (!apiResponse) {
      return { days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } };
    }

    // Build leave map
    const leaveMap = {};
    (apiResponse.summary?.approved_leaves || []).forEach(leave => {
      (leave.leave_dates || []).forEach(date => {
        const duration = leave.no_of_days === 0.5 ? 'HALF_DAY' : 'FULL_DAY';
        leaveMap[date] = {
          leaveType: leave.leave_type_name,
          reason: leave.reason || '-',
          noOfDays: leave.no_of_days,
          duration: duration
        };
      });
    });

    if (!apiResponse.date_wise_data || !Array.isArray(apiResponse.date_wise_data)) {
      return { days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } };
    }

    const days = apiResponse.date_wise_data.map(dayData => {
      const leaveForDay = leaveMap[dayData.date] || null;

      const assignedTasks = (dayData.assigned_tasks || []).map(task => ({
        title: task.task_name || task.title || 'Untitled Task',
        description: task.description || '',
        priority: task.priority_name || task.priority?.priority_name || 'Medium',
        status: task.task_status_name || task.status?.name || 'UNKNOWN',
        taskType: task.task_type_name || task.task_type?.task_type_name || 'General',
        assignedBy: task.assigned_by_user
          ? `${task.assigned_by_user.other_staff_info?.firstname || ''} ${task.assigned_by_user.other_staff_info?.lastname || ''}`.trim() ||
          task.assigned_by_user.username ||
          '-'
          : '-',
        dueDate: task.due_date_time ? new Date(task.due_date_time).toLocaleDateString() : '-',
        time: task.estimated_time || '-',
        taskDuration: task.task_duration || '-',
        actualDuration: task.actual_duration || '-',
        delayedTime: task.delayed_time || '-'
      }));

      const selfTasks = (dayData.self_tasks || []).map(task => ({
        title: task.title || 'Untitled Self Task',
        description: task.description || '',
        priority: task.priority_name || task.priority?.priority_name || 'Medium',
        status: task.status_name || task.task_status?.name || 'UNKNOWN',
        taskType: task.task_type_name || task.task_type?.task_type_name || 'General',
        assignedBy: 'Self',
        dueDate: task.due_date_time ? new Date(task.due_date_time).toLocaleDateString() : '-',
        time: task.estimated_time || '-',
        taskDuration: task.task_duration || '-',
        actualDuration: task.actual_duration || '-',
        delayedTime: task.delayed_time || '-',
        taskCategory: task.task_category || '',
        // Academic details (only for ACADEMIC tasks)
        programName: task.academic_year?.program_name || '',
        batchName: task.academic_year?.batch_name || '',
        classYear: task.academic_year?.class_year_name || '',
        semester: task.semester?.name || '',
        division: task.division?.division_name || '',
        subject: task.subject?.name || ''
      }));

      const allTasks = [...assignedTasks, ...selfTasks];

      const dateObj = new Date(dayData.date);
      const isSunday = dateObj.getDay() === 0;
      const isSaturday = dateObj.getDay() === 6;
      const isSatHoliday = isSaturdayHoliday(dayData.date);

      return {
        date: dayData.date,
        dayName: new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'long' }),
        tasks: allTasks,
        isSunday,
        isSaturday,
        isSaturdayHoliday: isSatHoliday,
        isSundayHoliday: isSunday && allTasks.length === 0,
        isWeekendHoliday: (isSunday || isSatHoliday) && allTasks.length === 0,
        leave: leaveForDay
      };
    });

    const totalDays = days.length;
    const totalSundays = days.filter(day => day.isSunday).length;
    const totalSaturdayHolidays = days.filter(day => day.isSaturdayHoliday).length;
    const totalWeekends = totalSundays + totalSaturdayHolidays;
    const totalWorkingDays = totalDays - totalWeekends;
    const actualWorkingDays = days.filter(day => day.tasks.length > 0).length;
    const compOffDays = days.filter(day =>
      day.tasks.length > 0 && (day.isSunday || day.isSaturdayHoliday)
    ).length;
    const leaveDays = apiResponse.summary?.approved_leaves_days || 0;
    const workingDaysExcludingWeekends = actualWorkingDays - compOffDays;
    const absentDays = totalWorkingDays - workingDaysExcludingWeekends - leaveDays;

    // Helper function to convert minutes to hours
    const convertMinutesToHours = (minutes) => {
      if (!minutes || minutes === 0) return '0h';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const summary = {
      totalDays: totalDays,
      totalWorkingDays: totalWorkingDays,
      actualWorkingDays: actualWorkingDays,
      absent: absentDays >= 0 ? absentDays : 0,
      leave: leaveDays,
      compOff: compOffDays,
      totalTasks: apiResponse.summary?.total_tasks || 0,
      totalAssignedTasks: apiResponse.summary?.total_assigned_tasks || 0,
      totalSelfTasks: apiResponse.summary?.total_self_tasks || 0,
      averageDelayedTime: apiResponse.summary?.average_delayed_time || '-',
      totalDelayedHours: apiResponse.summary?.total_delayed_minutes
        ? convertMinutesToHours(apiResponse.summary.total_delayed_minutes)
        : '-',
      totalDelayedTasks: apiResponse.summary?.total_delayed_tasks || 0
    };

    console.log('Transformed Data:', { days, summary });
    return { days, summary };
  };

  const fetchTimesheetData = async () => {
    try {
      setLoading(true);
      let response;

      if (!filters.view) {
        response = await TaskManagement.getUserTimesheetCurrentMonth(userId);
      } else if (filters.view === 'monthly') {
        if (!filters.year) return;

        if (filters.activeSubTab && monthTabs.includes(filters.activeSubTab)) {
          const monthIndex = monthTabs.indexOf(filters.activeSubTab) + 1;
          response = await TaskManagement.getUserTimesheetMonthly(userId, filters.year, monthIndex);
        } else {
          response = await TaskManagement.getUserTimesheetCurrentMonth(userId);
        }
      } else if (filters.view === 'weekly') {
        if (!filters.year || !filters.month || !filters.week) return;
        const weekRange = getWeekDateRange(parseInt(filters.year), filters.month, filters.week);
        if (!weekRange) return;
        response = await TaskManagement.getUserTimesheet(userId, weekRange.startDate, weekRange.endDate);
      } else if (filters.view === 'period') {
        if (!filters.fromDate || !filters.toDate) return;
        response = await TaskManagement.getUserTimesheet(userId, filters.fromDate, filters.toDate);
      }

      if (response) {
        const transformedData = transformApiResponse(response);
        setRawData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
      setRawData({ days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const [rawData, setRawData] = useState({ days: [], summary: {} });

  useEffect(() => {
    fetchTimesheetData();
  }, [filters.view, filters.year, filters.activeSubTab, filters.month, filters.week, filters.fromDate, filters.toDate, userId]);

  // Client-side filtering based on activeSubTab
  const displayData = useMemo(() => {
    if (!rawData.days || rawData.days.length === 0) return rawData;

    let filteredDays = [...rawData.days];

    // Weekly filter - filter by specific date if activeSubTab is selected
    if (filters.view === 'weekly' && filters.activeSubTab) {
      // Extract date from activeSubTab format: "Monday, 6 Jan"
      const dateMatch = filters.activeSubTab.match(/(\d+)\s+(\w+)/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(filters.month);

        filteredDays = filteredDays.filter(dayData => {
          const date = new Date(dayData.date);
          return date.getDate() === day && date.getMonth() === monthIndex && date.getFullYear() === parseInt(filters.year);
        });
      }
    }

    // Period filter - filter by specific date if activeSubTab is selected
    if (filters.view === 'period' && filters.activeSubTab) {
      // Parse activeSubTab format: "01-01-2026"
      const dateParts = filters.activeSubTab.split('-');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
        const year = parseInt(dateParts[2]);

        filteredDays = filteredDays.filter(dayData => {
          const date = new Date(dayData.date);
          return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
        });
      }
    }

    return { ...rawData, days: filteredDays };
  }, [rawData, filters.view, filters.activeSubTab, filters.month, filters.year]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't auto-select first period date - show all period tasks by default
  // useEffect(() => {
  //   if (filters.view === 'period' && filters.fromDate && filters.toDate) {
  //     const periodTabs = getPeriodTabs(filters.fromDate, filters.toDate);
  //     setFilters(prev => ({ ...prev, activeSubTab: periodTabs[0] }));
  //   }
  // }, [filters.fromDate, filters.toDate, filters.view]);

  // Don't auto-select first date - let user manually select or show whole week
  // useEffect(() => {
  //   if (filters.view === 'weekly' && filters.week) {
  //     const weeklyTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
  //     const firstTab = weeklyTabs[0]?.label || weeklyTabs[0];
  //     setFilters(prev => ({ ...prev, activeSubTab: firstTab }));
  //   }
  //   setMobileTabStart(0);
  // }, [filters.month, filters.year, filters.week, filters.view]);

  // Reset mobile tab start when filters change
  useEffect(() => {
    setMobileTabStart(0);
  }, [filters.month, filters.year, filters.week, filters.view]);

  // Clear activeSubTab when week changes to show full week data first
  useEffect(() => {
    if (filters.view === 'weekly' && filters.week) {
      setFilters(prev => ({ ...prev, activeSubTab: '' }));
    }
  }, [filters.week]);

  // Clear activeSubTab when period dates change to show full period data first
  useEffect(() => {
    if (filters.view === 'period' && filters.fromDate && filters.toDate) {
      setFilters(prev => ({ ...prev, activeSubTab: '' }));
    }
  }, [filters.fromDate, filters.toDate]);

  const getDayName = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const downloadPDF = () => {
    const input = document.getElementById("timesheet-section");

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Timesheet-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  const downloadExcel = () => {
    const excelData = [];

    // Header row
    excelData.push(['Date', 'Day', 'Leave Info', 'Task Title', 'Description', 'Priority', 'Status', 'Task Type', 'Assigned By', 'Due Date', 'Program', 'Batch', 'Class Year', 'Semester', 'Division', 'Subject']);

    // Summary row
    excelData.push(['Summary', '', `Leave Taken: ${displayData.summary.leave || 0}`, `Total Days: ${displayData.summary.totalDays || 0}`, `Working Days: ${displayData.summary.totalWorkingDays || 0}`, `Actual Working: ${displayData.summary.actualWorkingDays || 0}`, `Absent: ${displayData.summary.absent || 0}`, `Comp Off: ${displayData.summary.compOff || 0}`, '', '', '', '', '', '', '', '']);
    excelData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Data rows
    if (displayData.days && displayData.days.length > 0) {
      displayData.days.forEach((day) => {
        const leaveInfo = day.leave
          ? `${day.leave.leaveType} (${day.leave.duration === 'FULL_DAY' ? 'Full Day' : 'Half Day'})${day.leave.reason && day.leave.reason !== '-' ? ' - ' + day.leave.reason : ''}`
          : '';

        if (day.tasks && day.tasks.length > 0) {
          day.tasks.forEach((task) => {
            excelData.push([
              day.date,
              day.dayName,
              leaveInfo,
              task.title,
              task.description,
              task.priority,
              task.status,
              task.taskType,
              task.assignedBy,
              task.dueDate,
              task.programName || '',
              task.batchName || '',
              task.classYear || '',
              task.semester || '',
              task.division || '',
              task.subject || ''
            ]);
          });
        } else if (day.leave) {
          excelData.push([
            day.date,
            day.dayName,
            leaveInfo,
            'On Leave',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ]);
        } else {
          excelData.push([
            day.date,
            day.dayName,
            '',
            'No tasks',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ]);
        }
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 },  // Date
      { wch: 12 },  // Day
      { wch: 20 },  // Leave Info
      { wch: 30 },  // Task Title
      { wch: 30 },  // Description
      { wch: 12 },  // Priority
      { wch: 15 },  // Status
      { wch: 15 },  // Task Type
      { wch: 10 },  // Assigned By
      { wch: 12 },  // Due Date
      { wch: 35 },  // Program
      { wch: 25 },  // Batch
      { wch: 12 },  // Class Year
      { wch: 12 },  // Semester
      { wch: 12 },  // Division
      { wch: 25 }   // Subject
    ];

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');

    // Generate Excel file and download
    XLSX.writeFile(workbook, `Timesheet-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="timesheet-container p-0 md:p-0 max-w-full overflow-x-hidden">

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search timesheet"
            className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-2 sm:px-4 py-2 sm:py-3 text-sm rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-blue-600 font-medium text-xs sm:text-sm">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          <div ref={downloadRef} className="relative">
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              <Download size={16} /> Download
              <ChevronDown className={`w-4 h-4 transition-transform ${downloadOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {downloadOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    downloadExcel();
                    setDownloadOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2 rounded-t-lg"
                >
                  <Download size={16} className="text-green-600" />
                  Download Excel
                </button>
                <button
                  onClick={() => {
                    downloadPDF();
                    setDownloadOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2 rounded-b-lg border-t border-gray-200"
                >
                  <Download size={16} className="text-red-600" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year || currentYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, week: '' }))}
                    placeholder="Enter Year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min="1900"
                    max="2100"
                  />
                </div>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={filters.year || currentYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="Enter Year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1900"
                  max="2100"
                />
              </div>
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

          {filters.view && (
            <div className="relative max-w-[920px] mx-auto">
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
                      className={`whitespace-nowrap text-center px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0 ${filters.activeSubTab === tabLabel
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

              <div className="sm:hidden relative">
                {getSubTabs().length > 3 && (
                  <>
                    <button
                      onClick={() => setMobileTabStart(Math.max(0, mobileTabStart - 1))}
                      disabled={mobileTabStart === 0}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${mobileTabStart === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setMobileTabStart(Math.min(getSubTabs().length - 3, mobileTabStart + 1))}
                      disabled={mobileTabStart >= getSubTabs().length - 3}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${mobileTabStart >= getSubTabs().length - 3 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="grid grid-cols-3 gap-1 sm:gap-2 px-6 sm:px-8 py-2">
                  {getSubTabs().slice(mobileTabStart, mobileTabStart + 3).map((tab, index) => {
                    const tabLabel = typeof tab === 'object' ? tab.label : tab;
                    return (
                      <button
                        key={mobileTabStart + index}
                        onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                        className={`text-center px-1 sm:px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-lg transition-colors ${filters.activeSubTab === tabLabel
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

      <div id="timesheet-section" className="bg-white p-3 sm:p-4 rounded-xl shadow max-w-full overflow-hidden">

        <div className="name-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 px-1 mb-3 sm:mb-5">
          <h2 className="text-sm sm:text-base lg:text-lg break-words">
            Name : {
              currentUser?.fullName?.trim() ||
              `${currentUser?.firstname || ''} ${currentUser?.lastname || ''}`.trim() ||
              '-'
            }
          </h2>
          <p className="employee-id text-xs sm:text-sm lg:text-base text-gray-700 font-medium break-words">
            Employee ID : {currentUser?.employeeId || currentUser?.staffCode || '-'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="summary-card bg-slate-100 text-slate-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
            <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.totalDays || 0}</div>
            <div className="summary-label text-xs sm:text-sm">Total Days</div>
          </div>

          <div className="summary-card bg-blue-100 text-blue-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
            <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.totalWorkingDays || 0}</div>
            <div className="summary-label text-xs sm:text-sm">Total Working Days</div>
          </div>

          <div className="summary-card bg-green-100 text-green-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
            <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.actualWorkingDays || 0}</div>
            <div className="summary-label text-xs sm:text-sm">Actual Working Days</div>
          </div>

          <div className="summary-card bg-red-100 text-red-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
            <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.absent || 0}</div>
            <div className="summary-label text-xs sm:text-sm">Absent Days</div>
          </div>

          <div className="summary-card bg-yellow-100 text-yellow-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
            <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.leave || 0}</div>
            <div className="summary-label text-xs sm:text-sm">Leave Taken</div>
          </div>

          {displayData.summary.compOff > 0 && (
            <div className="summary-card bg-purple-100 text-purple-700 p-3 sm:p-4 text-center rounded-xl font-semibold shadow">
              <div className="summary-number text-xl sm:text-2xl font-bold mb-1">{displayData.summary.compOff}</div>
              <div className="summary-label text-xs sm:text-sm">Comp Off</div>
            </div>
          )}
        </div>

        {displayData.summary.totalTasks > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-100 text-purple-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Total Tasks: {displayData.summary.totalTasks || 0}
            </div>
            <div className="bg-indigo-100 text-indigo-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Assigned Tasks: {displayData.summary.totalAssignedTasks || 0}
            </div>
            <div className="bg-teal-100 text-teal-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Self Tasks: {displayData.summary.totalSelfTasks || 0}
            </div>
          </div>
        )}

        {displayData.summary.totalDelayedTasks > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-rose-100 text-rose-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Total Delayed Tasks: {displayData.summary.totalDelayedTasks || 0}
            </div>
            <div className="bg-amber-100 text-amber-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Average Delayed Time: {displayData.summary.averageDelayedTime || '-'}
            </div>
            <div className="bg-orange-100 text-orange-700 p-3 text-center rounded-lg font-medium shadow-sm">
              Total Delayed Hours: {displayData.summary.totalDelayedHours || '-'}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-500">Loading timesheet data...</p>
              </div>
            </div>
          ) : displayData.days && displayData.days.length > 0 ? (
            displayData.days.map((day, index) => (
              <div key={index} className="bg-white p-3 sm:p-5 rounded-xl shadow border max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 border-b pb-2 mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600 break-words min-w-0">
                    {day.date} , {day.dayName}
                  </h3>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Tasks : {day.tasks ? day.tasks.length : 0}
                  </span>
                </div>

                {/* Biometric Attendance Data */}
                {!day.isWeekendHoliday && (
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                      {/* ST - Start Time */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-blue-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Start Time</div>
                        <div className="text-xs sm:text-sm font-bold text-blue-700">09:00 AM</div>
                      </div>

                      {/* ET - End Time */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-blue-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">End Time</div>
                        <div className="text-xs sm:text-sm font-bold text-blue-700">
                          {day.dayName === 'Thursday' ? '01:00 PM' : day.dayName === 'Friday' ? '03:00 PM' : '05:00 PM'}
                        </div>
                      </div>

                      {/* No. of Hours */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-green-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">No. of Hours</div>
                        <div className="text-xs sm:text-sm font-bold text-green-700">
                          {day.dayName === 'Thursday' ? '4h' : day.dayName === 'Friday' ? '6h' : '8h'}
                        </div>
                      </div>

                      {/* Approved Time */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-purple-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Approved Time</div>
                        <div className="text-xs sm:text-sm font-bold text-purple-700">
                          {day.dayName === 'Thursday' ? '4h' : day.dayName === 'Friday' ? '6h' : '8h'}
                        </div>
                      </div>

                      {/* As per Biometric */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-orange-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">As per Biometric</div>
                        <div className="text-xs sm:text-sm font-bold text-orange-700">
                          {day.dayName === 'Thursday' ? '4h' : day.dayName === 'Friday' ? '6h' : '8h'}
                        </div>
                      </div>

                      {/* Principal Approval */}
                      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-teal-100">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium mb-1">Principal Approval</div>
                        <div className="text-xs sm:text-sm font-bold text-teal-700">
                          {day.dayName === 'Thursday' ? '3h 45m' : day.dayName === 'Friday' ? '5h 30m' : '7h 45m'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {day.isWeekendHoliday ? (
                  <div className="text-center py-8 text-gray-500 font-medium text-lg">
                    {day.isSunday ? 'Sunday - Holiday' : 'Saturday - Holiday'}
                  </div>
                ) : (
                  <>
                    {day.leave && (
                      <div className="border rounded-lg p-4 mb-3 shadow-sm bg-orange-50 border-orange-300">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-md font-semibold text-orange-800">
                            {day.leave.duration === 'FULL_DAY' ? '🏖️ Full Day Leave' : '⏰ Half Day Leave'}
                          </h4>
                          <span className="px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                            {day.leave.leaveType}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          <span className="font-semibold">Reason:</span> {day.leave.reason || 'No reason provided'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Duration: {day.leave.duration === 'FULL_DAY' ? 'Full Day' : 'Half Day'}</span>
                        </div>
                      </div>
                    )}

                    {day.tasks && day.tasks.length > 0 ? (
                      day.tasks.map((task, i) => (
                        <div
                          key={i}
                          className={`border rounded-lg p-3 sm:p-4 mb-3 shadow-sm ${task.assignedBy === 'Self'
                            ? 'bg-teal-50 border-teal-200'
                            : 'bg-blue-50 border-blue-200'
                            }`}
                          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                        >
                          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-2 mb-2 sm:mb-3">
                            <div className="flex items-start gap-1 sm:gap-2 flex-1" style={{ minWidth: 0 }}>
                              <h4 className="task-title text-xs sm:text-sm lg:text-base font-semibold flex-1" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{task.title}</h4>
                            </div>

                            <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2 text-[10px] sm:text-[11px] lg:text-xs xl:justify-end min-w-0">
                              <span className="task-badge px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                                Priority: {task.priority}
                              </span>

                              <span className={`task-badge px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium whitespace-nowrap flex-shrink-0 ${task.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                                task.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                Status: {task.status}
                              </span>

                              <span className="task-badge px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                                Type: {task.taskType}
                              </span>

                              <span className="task-badge px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                                By: {task.assignedBy}
                              </span>

                              <span className="task-badge px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                                Due: {task.dueDate}
                              </span>
                            </div>
                          </div>

                          {/* Academic Details - Only for Self Tasks with ACADEMIC category */}
                          {task.assignedBy === 'Self' && task.taskCategory === 'ACADEMIC' && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                                {task.programName && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Program:</span>
                                    <span className="text-gray-700">{task.programName}</span>
                                  </div>
                                )}
                                {task.batchName && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Batch:</span>
                                    <span className="text-gray-700">{task.batchName}</span>
                                  </div>
                                )}
                                {task.classYear && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Class Year:</span>
                                    <span className="text-gray-700">{task.classYear}</span>
                                  </div>
                                )}
                                {task.semester && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Semester:</span>
                                    <span className="text-gray-700">{task.semester}</span>
                                  </div>
                                )}
                                {task.division && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Division:</span>
                                    <span className="text-gray-700">{task.division}</span>
                                  </div>
                                )}
                                {task.subject && (
                                  <div className="flex items-start gap-1">
                                    <span className="font-semibold text-indigo-700 whitespace-nowrap">Paper:</span>
                                    <span className="text-gray-700">{task.subject}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {task.description && task.description.trim() !== '' ? (
                            <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 bg-white/50 p-1.5 sm:p-2 rounded border-l-2 border-gray-300" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                              <span className="font-medium text-gray-600">Description: </span>
                              {task.description}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs sm:text-sm italic mb-2 sm:mb-3">No description provided</p>
                          )}

                          {/* Duration Info - Bottom Right */}
                          {(task.taskDuration !== '-' || task.actualDuration !== '-' || task.delayedTime !== '-') && (
                            <div className="flex justify-end gap-2 sm:gap-3 text-[10px] sm:text-xs mt-2">
                              {task.taskDuration !== '-' && (
                                <div className="text-gray-600">
                                  <span className="font-semibold">Expected Duration:</span> {task.taskDuration}
                                </div>
                              )}
                              {task.actualDuration !== '-' && (
                                <div className="text-blue-600">
                                  <span className="font-semibold">Actual:</span> {task.actualDuration}
                                </div>
                              )}
                              {task.delayedTime !== '-' && (
                                <div className={task.delayedTime === 'On Time' ? 'text-green-600' : 'text-red-600'}>
                                  <span className="font-semibold">
                                    {task.delayedTime === 'On Time' ? 'On Time' : 'Delayed:'}
                                  </span> {task.delayedTime === 'On Time' ? '' : task.delayedTime}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : day.leave ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center text-yellow-800">
                          <span className="text-sm font-medium">
                            {day.leave.leaveType} - {day.leave.duration === 'FULL_DAY' ? 'Full Day' : 'Half Day'}
                          </span>
                        </div>
                        {day.leave.reason && day.leave.reason !== '-' && (
                          <p className="text-sm text-gray-600 mt-2">Reason: {day.leave.reason}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No tasks for this day
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {filters.view === 'monthly' && !filters.year ? (
                <div>
                  <p className="text-lg font-medium mb-2">Year Required</p>
                  <p className="text-sm">Please select a year to view monthly timesheet data.</p>
                </div>
              ) : filters.view === 'weekly' && (!filters.year || !filters.month || !filters.week) ? (
                <div>
                  <p className="text-lg font-medium mb-2">Complete Weekly Selection</p>
                  <p className="text-sm">Please select year, month, and week to view weekly timesheet data.</p>
                </div>
              ) : filters.view === 'period' && (!filters.fromDate || !filters.toDate) ? (
                <div>
                  <p className="text-lg font-medium mb-2">Date Range Required</p>
                  <p className="text-sm">Please select both from date and to date to view period timesheet data.</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">No Data Available</p>
                  <p className="text-sm">No timesheet data found for the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
