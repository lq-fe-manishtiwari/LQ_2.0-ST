import React, { useState, useEffect, useRef, useMemo } from "react";
import { Download, Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Loader from '../Components/Loader';

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

export default function TimeSheetDashboard() {
  const [loading, setLoading] = useState(true);
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
    activeSubTab: ''
  });
  const [mobileTabStart, setMobileTabStart] = useState(0);
  const [name, setName] = useState("Manish Tiwari");
  const [date, setDate] = useState("2025-02-25");
  const [month, setMonth] = useState("2025-08");
  const [startDate, setStartDate] = useState("2025-02-20");
  const [endDate, setEndDate] = useState("2025-02-25");
  const [filteredData, setFilteredData] = useState({ days: [], summary: {} });
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef(null);

  const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
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
      subTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
    } else {
      subTabs = getPeriodTabs(filters.fromDate, filters.toDate);
    }
    const firstTab = Array.isArray(subTabs[0]) ? subTabs[0] : subTabs[0]?.label || subTabs[0];
    setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: firstTab }));
  };

  // Mock data for different scenarios
  const mockData = {
    "Manish Tiwari": {
      daily: {
        "2025-02-25": {
          summary: { working: 1, present: 1, absent: 0, leave: 0 },
          tasks: [
            {
              title: "Creative of Diwali",
              description: "I have to make a creative for Diwali",
              priority: "High",
              status: "In-Progress",
              assignedBy: "Riane Nikure",
              taskType: "Scheduled",
              dueDate: "20-09-2025, 12:10 PM",
              time: "30 Min",
            },
            {
              title: "Website Redesign",
              description: "Redesign company website homepage",
              priority: "Medium",
              status: "Completed",
              assignedBy: "Riane Nikure",
              taskType: "Scheduled",
              dueDate: "25-02-2025, 05:00 PM",
              time: "2 Hours",
            }
          ]
        }
      },
      monthly: {
        "2025-08": {
          summary: { working: 22, present: 20, absent: 1, leave: 1 },
          days: [
            {
              date: "2025-08-01",
              dayName: "Friday",
              tasks: [
                {
                  title: "August Campaign Design",
                  description: "Design marketing campaign for August",
                  priority: "High",
                  status: "Completed",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "01-08-2025, 06:00 PM",
                  time: "4 Hours",
                }
              ]
            },
            {
              date: "2025-08-02",
              dayName: "Saturday",
              tasks: []
            },
            {
              date: "2025-08-05",
              dayName: "Tuesday",
              tasks: [
                {
                  title: "Client Presentation",
                  description: "Prepare slides for client meeting",
                  priority: "High",
                  status: "In-Progress",
                  assignedBy: "Tejas Chaudhari",
                  taskType: "Ad-hoc",
                  dueDate: "05-08-2025, 03:00 PM",
                  time: "1.5 Hours",
                }
              ]
            }
          ]
        },
        "2025-11": {
          summary: { working: 21, present: 19, absent: 1, leave: 1 },
          days: [
            {
              date: "2025-11-03",
              dayName: "Monday",
              tasks: [
                {
                  title: "November Planning Session",
                  description: "Monthly planning and goal setting",
                  priority: "High",
                  status: "Completed",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "03-11-2025, 10:00 AM",
                  time: "2 Hours",
                }
              ]
            },
            {
              date: "2025-11-05",
              dayName: "Wednesday",
              tasks: [
                {
                  title: "Holiday Campaign Design",
                  description: "Design marketing materials for holiday season",
                  priority: "High",
                  status: "In-Progress",
                  assignedBy: "Tejas Chaudhari",
                  taskType: "Scheduled",
                  dueDate: "15-11-2025, 05:00 PM",
                  time: "3 Hours",
                }
              ]
            },
            {
              date: "2025-11-10",
              dayName: "Monday",
              tasks: [
                {
                  title: "Team Review Meeting",
                  description: "Weekly team performance review",
                  priority: "Medium",
                  status: "Completed",
                  assignedBy: "Riane Nikure",
                  taskType: "Recurring",
                  dueDate: "10-11-2025, 02:00 PM",
                  time: "1 Hour",
                }
              ]
            },
            {
              date: "2025-11-20",
              dayName: "Thursday",
              tasks: [
                {
                  title: "Product Launch Preparation",
                  description: "Prepare materials for upcoming product launch",
                  priority: "High",
                  status: "In-Progress",
                  assignedBy: "Tejas Chaudhari",
                  taskType: "Scheduled",
                  dueDate: "25-11-2025, 06:00 PM",
                  time: "4 Hours",
                }
              ]
            }
          ]
        }
      },
      period: {
        "2025-02-20_to_2025-02-25": {
          summary: { working: 4, present: 4, absent: 0, leave: 0 },
          days: [
            {
              date: "2025-02-20",
              dayName: "Thursday",
              tasks: [
                {
                  title: "Project Planning",
                  description: "Weekly project planning session",
                  priority: "Medium",
                  status: "Completed",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "20-02-2025, 11:00 AM",
                  time: "1 Hour",
                }
              ]
            },
            {
              date: "2025-02-21",
              dayName: "Friday",
              tasks: [
                {
                  title: "Team Meeting",
                  description: "Weekly team sync meeting",
                  priority: "Medium",
                  status: "Completed",
                  assignedBy: "Tejas Chaudhari",
                  taskType: "Recurring",
                  dueDate: "21-02-2025, 10:00 AM",
                  time: "45 Min",
                }
              ]
            },
            {
              date: "2025-02-25",
              dayName: "Tuesday",
              tasks: [
                {
                  title: "Creative of Diwali",
                  description: "I have to make a creative for Diwali",
                  priority: "High",
                  status: "In-Progress",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "20-09-2025, 12:10 PM",
                  time: "30 Min",
                }
              ]
            }
          ]
        }
      }
    },
    "Tejas Chaudhari": {
      daily: {
        "2025-02-25": {
          summary: { working: 1, present: 1, absent: 0, leave: 0 },
          tasks: [
            {
              title: "Code Review",
              description: "Review pull requests for main branch",
              priority: "High",
              status: "Completed",
              assignedBy: "Manish Tiwari",
              taskType: "Scheduled",
              dueDate: "25-02-2025, 04:00 PM",
              time: "2 Hours",
            }
          ]
        }
      },
      monthly: {
        "2025-08": {
          summary: { working: 22, present: 21, absent: 0, leave: 1 },
          days: [
            {
              date: "2025-08-01",
              dayName: "Friday",
              tasks: [
                {
                  title: "API Development",
                  description: "Develop new REST API endpoints",
                  priority: "High",
                  status: "Completed",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "01-08-2025, 06:00 PM",
                  time: "6 Hours",
                }
              ]
            }
          ]
        },
        "2025-11": {
          summary: { working: 21, present: 20, absent: 0, leave: 1 },
          days: [
            {
              date: "2025-11-04",
              dayName: "Tuesday",
              tasks: [
                {
                  title: "Database Optimization",
                  description: "Optimize database queries for better performance",
                  priority: "High",
                  status: "Completed",
                  assignedBy: "Manish Tiwari",
                  taskType: "Scheduled",
                  dueDate: "04-11-2025, 05:00 PM",
                  time: "5 Hours",
                }
              ]
            },
            {
              date: "2025-11-12",
              dayName: "Wednesday",
              tasks: [
                {
                  title: "Security Audit",
                  description: "Conduct security audit of application",
                  priority: "High",
                  status: "In-Progress",
                  assignedBy: "Riane Nikure",
                  taskType: "Scheduled",
                  dueDate: "20-11-2025, 04:00 PM",
                  time: "3 Hours",
                }
              ]
            },
            {
              date: "2025-11-18",
              dayName: "Tuesday",
              tasks: [
                {
                  title: "Code Refactoring",
                  description: "Refactor legacy code modules",
                  priority: "Medium",
                  status: "Completed",
                  assignedBy: "Manish Tiwari",
                  taskType: "Scheduled",
                  dueDate: "18-11-2025, 06:00 PM",
                  time: "4 Hours",
                }
              ]
            }
          ]
        }
      },
      period: {
        "2025-02-20_to_2025-02-25": {
          summary: { working: 4, present: 4, absent: 0, leave: 0 },
          days: [
            {
              date: "2025-02-25",
              dayName: "Tuesday",
              tasks: [
                {
                  title: "Code Review",
                  description: "Review pull requests for main branch",
                  priority: "High",
                  status: "Completed",
                  assignedBy: "Manish Tiwari",
                  taskType: "Scheduled",
                  dueDate: "25-02-2025, 04:00 PM",
                  time: "2 Hours",
                }
              ]
            }
          ]
        }
      }
    }
  };

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter data based on current selections
  useEffect(() => {
    const userData = mockData[name] || mockData["Manish Tiwari"];
    
    // Show all available data when no view is selected
    if (!filters.view) {
      const allDays = [];
      
      // Get data from all sources
      Object.keys(userData.daily || {}).forEach(dateKey => {
        const dailyData = userData.daily[dateKey];
        allDays.push({
          date: dateKey,
          dayName: getDayName(dateKey),
          tasks: dailyData.tasks || []
        });
      });
      
      Object.keys(userData.monthly || {}).forEach(monthKey => {
        const monthlyData = userData.monthly[monthKey];
        if (monthlyData.days) {
          monthlyData.days.forEach(day => {
            allDays.push(day);
          });
        }
      });
      
      Object.keys(userData.period || {}).forEach(periodKey => {
        const periodData = userData.period[periodKey];
        if (periodData.days) {
          periodData.days.forEach(day => {
            allDays.push(day);
          });
        }
      });
      
      // Remove duplicates and sort by date
      const uniqueDays = allDays.filter((day, index, self) => 
        index === self.findIndex(d => d.date === day.date)
      ).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate summary based on unique days
      const workingDays = uniqueDays.filter(day => day.tasks && day.tasks.length > 0).length;
      const totalSummary = {
        working: workingDays,
        present: workingDays,
        absent: 0,
        leave: 0
      };
      
      setFilteredData({
        days: uniqueDays,
        summary: totalSummary
      });
      return;
    }
    
    if (filters.view === "monthly") {
      // Require year selection for monthly view
      if (!filters.year) {
        setFilteredData({ days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } });
        return;
      }
      
      // Use activeSubTab (month) to get data
      let monthKey;
      if (filters.activeSubTab && monthTabs.includes(filters.activeSubTab)) {
        const monthIndex = monthTabs.indexOf(filters.activeSubTab) + 1;
        monthKey = `${filters.year}-${String(monthIndex).padStart(2, '0')}`;
      } else {
        monthKey = month; // fallback to default
      }
      
      const monthlyData = userData.monthly[monthKey] || {
        summary: { working: 0, present: 0, absent: 0, leave: 0 },
        days: []
      };
      setFilteredData(monthlyData);
    } 
    else if (filters.view === "weekly") {
      // Require year, month, and week for weekly view
      if (!filters.year || !filters.month || !filters.week) {
        setFilteredData({ days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } });
        return;
      }
      
      // Use period data as fallback for weekly
      const periodKey = `${startDate}_to_${endDate}`;
      const periodData = userData.period[periodKey] || {
        summary: { working: 0, present: 0, absent: 0, leave: 0 },
        days: []
      };
      setFilteredData(periodData);
    }
    else if (filters.view === "period") {
      // Require both dates for period view
      if (!filters.fromDate || !filters.toDate) {
        setFilteredData({ days: [], summary: { working: 0, present: 0, absent: 0, leave: 0 } });
        return;
      }
      
      const periodKey = `${filters.fromDate}_to_${filters.toDate}`;
      const periodData = userData.period[periodKey] || {
        summary: { working: 0, present: 0, absent: 0, leave: 0 },
        days: []
      };
      setFilteredData(periodData);
    }
  }, [filters.view, filters.year, filters.activeSubTab, filters.month, filters.week, filters.fromDate, filters.toDate, name, month, startDate, endDate]);

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

  // Initialize activeSubTab when view changes (like in TaskAssignment)
  useEffect(() => {
    if (filters.view === 'monthly' && !filters.activeSubTab) {
      setFilters(prev => ({ ...prev, activeSubTab: monthTabs[0] }));
    }
  }, [filters.view]);

  // Helper function to get day name from date
  const getDayName = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // PDF Generation Function using html2canvas
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

      pdf.save(`Timesheet-${name}-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  // Excel CSV Download Function
  const downloadExcel = () => {
    const csvData = [];
    
    // Header row
    csvData.push(['Employee Name', 'Employee ID', 'Date', 'Day', 'Task Title', 'Description', 'Priority', 'Status', 'Task Type', 'Assigned By', 'Due Date', 'Time Spent']);
    
    // Summary row
    csvData.push(['Summary', '', '', '', `Working Days: ${filteredData.summary.working || 0}`, `Present: ${filteredData.summary.present || 0}`, `Absent: ${filteredData.summary.absent || 0}`, `Leave: ${filteredData.summary.leave || 0}`, '', '', '', '']);
    csvData.push(['', '', '', '', '', '', '', '', '', '', '', '']); // Empty row
    
    // Data rows
    if (filteredData.days && filteredData.days.length > 0) {
      filteredData.days.forEach((day) => {
        if (day.tasks && day.tasks.length > 0) {
          day.tasks.forEach((task) => {
            csvData.push([
              name,
              'LQ-036',
              day.date,
              day.dayName,
              task.title,
              task.description,
              task.priority,
              task.status,
              task.taskType,
              task.assignedBy,
              task.dueDate,
              task.time
            ]);
          });
        } else {
          csvData.push([
            name,
            'LQ-036',
            day.date,
            day.dayName,
            'No tasks',
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
    
    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Timesheet-${name}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      
      {/* Search + Filter + Download */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search timesheet data"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter + Download */}
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

          {/* Download Dropdown */}
          <div ref={downloadRef} className="relative">
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
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

      {/* Filter Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CustomSelect
              label="Department"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              options={departments}
              placeholder="Select Department"
            />
            
            <CustomSelect
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              options={['Manish Tiwari', 'Tejas Chaudhari']}
              placeholder="Select Name"
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

      {/* WRAPPER TO EXPORT PDF */}
      <div id="timesheet-section" className="bg-white p-4 rounded-xl shadow">

        {/* User Details */}
        <div className="flex justify-between items-center px-1 mb-5">
          <h2 className="text-lg font-semibold">Name : {name}</h2>
          <p className="text-gray-700 font-medium">Employee ID : LQ-036</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-blue-100 text-blue-700 p-4 text-center rounded-xl font-semibold shadow">
            Total Working Days : {filteredData.summary.working || 0}
          </div>
          <div className="bg-green-100 text-green-700 p-4 text-center rounded-xl font-semibold shadow">
            Total Present Days : {filteredData.summary.present || 0}
          </div>
          <div className="bg-red-100 text-red-700 p-4 text-center rounded-xl font-semibold shadow">
            Total Absent Days : {filteredData.summary.absent || 0}
          </div>
          <div className="bg-yellow-100 text-yellow-700 p-4 text-center rounded-xl font-semibold shadow">
            Leave Taken : {filteredData.summary.leave || 0}
          </div>
        </div>

        {/* Tasks Display */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
              <div className="flex flex-col items-center justify-center">
                <Loader size="lg" className="mb-4" />
                <p className="text-gray-500">Loading timesheet data...</p>
              </div>
            </div>
          ) : filteredData.days && filteredData.days.length > 0 ? (
            filteredData.days.map((day, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow border">
                <div className="flex justify-between border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-blue-600">
                    {day.date} , {day.dayName}
                  </h3>
                  <span className="text-sm font-medium text-gray-700">
                    Tasks : {day.tasks ? day.tasks.length : 0}
                  </span>
                </div>

                {/* Task Items */}
                {day.tasks && day.tasks.length > 0 ? (
                  day.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 mb-3 bg-gray-50 shadow-sm"
                    >
                      <h4 className="text-md font-semibold">{task.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md">
                          Priority : {task.priority}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md">
                          Status : {task.status}
                        </span>
                        <span className="text-gray-700">
                          ● Task Type : {task.taskType}
                        </span>
                        <span className="text-gray-700">
                          ● Assigned By : {task.assignedBy}
                        </span>
                        <span className="text-red-600 font-medium">
                          ● Due Date : {task.dueDate}
                        </span>
                        <span className="ml-auto text-gray-700">{task.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No tasks for this day
                  </div>
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