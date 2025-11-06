import React, { useState, useEffect, useRef } from "react";
import { Filter, ChevronDown, X, ChevronLeft, ChevronRight, Users, Calendar, CheckCircle, XCircle, Save } from "lucide-react";

// ───────────────────── Custom Select Component ─────────────────────
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${
            disabled
              ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
              : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
          } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </div>
            {options.map((option) => (
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

// ───────────────────── Multi Select Program ─────────────────────
const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = programOptions.filter((p) => !selectedPrograms.includes(p));

  const handleSelect = (program) => {
    onProgramChange({ target: { value: program } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            selectedPrograms.map((prog) => (
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
          <ChevronDown
            className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map((prog) => (
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

// ───────────────────── Main Attendance Component ─────────────────────
export default function Attendance() {
  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: "all",
    filterOpen: false,
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  
  const programOptions = ["MCA-BTech-Graduation", "BCA", "BBA", "M.Tech"];
  const classOptions = ["Class 7A", "Class 8B", "Class 9B", "Class 10A"];
  const divisionOptions = ["A", "B", "C"];
  
  const [students] = useState([
    { id: 1, name: "Aarav Sharma", rollNo: "2024001", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
    { id: 2, name: "Priya Patel", rollNo: "2024002", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" },
    { id: 3, name: "Arjun Singh", rollNo: "2024003", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
    { id: 4, name: "Ananya Gupta", rollNo: "2024004", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
    { id: 5, name: "Vikram Kumar", rollNo: "2024005", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" },
    { id: 6, name: "Kavya Reddy", rollNo: "2024006", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" },
    { id: 7, name: "Rohit Joshi", rollNo: "2024007", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" },
    { id: 8, name: "Sneha Iyer", rollNo: "2024008", class: "Class 8A", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" }
  ]);

  const [attendance, setAttendance] = useState(() => {
    const today = new Date().toDateString();
    return students.reduce((acc, student) => {
      acc[`${student.id}-${today}`] = null;
      return acc;
    }, {});
  });

  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters((prev) => ({ ...prev, program: [...prev.program, value] }));
    }
  };

  const removeProgram = (prog) => {
    setFilters((prev) => ({
      ...prev,
      program: prev.program.filter((p) => p !== prog),
    }));
  };

  const markAttendance = (studentId, status) => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toDateString();
    setAttendance(prev => ({
      ...prev,
      [`${studentId}-${dateKey}`]: status
    }));
  };

  const getAttendanceStatus = (studentId) => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toDateString();
    return attendance[`${studentId}-${dateKey}`];
  };

  const getAttendanceStats = () => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toDateString();
    let present = 0, absent = 0, notMarked = 0;
    
    students.forEach(student => {
      const status = attendance[`${student.id}-${dateKey}`];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else notMarked++;
    });
    
    return { present, absent, notMarked, total: students.length };
  };

  const saveAttendance = () => {
    alert('Attendance saved successfully!');
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getSelectedDayName = () => {
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    return fullDayNames[selectedDateObj.getDay()];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    const prevMonth = new Date(year, month - 1, 0);

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonth.getDate() - i, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ day, isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const stats = getAttendanceStats();

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Attendance</h1>
        <p className="text-gray-600">Mark attendance for Class 8A - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Filter Students</span>
          <ChevronDown
            className={`w-4 h-4 text-blue-600 transition-transform ${
              filters.filterOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelectProgram
                label="Program"
                selectedPrograms={filters.program}
                programOptions={programOptions}
                onProgramChange={handleProgramChange}
                onProgramRemove={removeProgram}
              />

              <CustomSelect
                label="Class"
                value={filters.classDataId[0] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    classDataId: e.target.value ? [e.target.value] : [],
                    gradeDivisionId: [],
                  }))
                }
                options={classOptions}
                placeholder="Select Class"
                disabled={filters.program.length === 0}
              />

              <CustomSelect
                label="Division"
                value={filters.gradeDivisionId[0] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    gradeDivisionId: e.target.value ? [e.target.value] : [],
                  }))
                }
                options={divisionOptions}
                placeholder="Select Division"
                disabled={!filters.classDataId.length}
              />

              <CustomSelect
                label="Status"
                value={
                  filters.activeInactiveStatus.charAt(0).toUpperCase() +
                    filters.activeInactiveStatus.slice(1) || "All"
                }
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    activeInactiveStatus: e.target.value.toLowerCase(),
                  }))
                }
                options={["All", "Active", "Inactive"]}
                placeholder="Select Status"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
            {dayNames.map((day) => (
              <div key={day} className="p-2 lg:p-3 text-center font-medium text-xs sm:text-sm" style={{ color: "rgb(33, 98, 193)" }}>
                {day}
              </div>
            ))}

            {days.map((dateObj, index) => (
              <div
                key={index}
                onClick={() => dateObj.isCurrentMonth && setSelectedDate(dateObj.day)}
                className={`
                  h-10 sm:h-12 lg:h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-sm lg:text-base
                  ${dateObj.isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-100"}
                  ${
                    selectedDate === dateObj.day && dateObj.isCurrentMonth
                      ? "text-white shadow-lg"
                      : dateObj.isCurrentMonth
                      ? "text-gray-800"
                      : "text-gray-400"
                  }
                `}
                style={
                  selectedDate === dateObj.day && dateObj.isCurrentMonth
                    ? { backgroundColor: "rgb(33, 98, 193)" }
                    : {}
                }
              >
                {dateObj.day}
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Panel */}
        <div className="w-full lg:w-96 space-y-6">
          {/* Date & Stats Card */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="mb-4">
              <div className="text-base lg:text-lg font-medium" style={{ color: "rgb(33, 98, 193)" }}>
                {getSelectedDayName()}, {String(selectedDate).padStart(2, "0")} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">{stats.present}</div>
                <div className="text-xs text-green-700">Present</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-600">{stats.absent}</div>
                <div className="text-xs text-red-700">Absent</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-600">{stats.notMarked}</div>
                <div className="text-xs text-gray-700">Not Marked</div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-700">Total Students</div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base lg:text-lg font-semibold text-gray-800">Mark Attendance</h3>
              </div>
              <button
                onClick={saveAttendance}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => {
                const status = getAttendanceStatus(student.id);
                return (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">Roll: {student.rollNo}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAttendance(student.id, 'present')}
                        className={`p-2 rounded-lg transition-colors ${
                          status === 'present'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, 'absent')}
                        className={`p-2 rounded-lg transition-colors ${
                          status === 'absent'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}