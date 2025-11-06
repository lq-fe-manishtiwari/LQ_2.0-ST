import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthlyView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(6);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [studentStatuses, setStudentStatuses] = useState({
    1: "present",
    2: "present", 
    3: "absent",
    4: "present",
    5: "present"
  });

  // Dummy student attendance data
  const attendanceData = {
    totalStudents: 45,
    present: 38,
    absent: 7,
    students: [
      { id: 1, name: "John Smith", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
      { id: 2, name: "Emma Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" },
      { id: 3, name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
      { id: 4, name: "Sarah Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
      { id: 5, name: "David Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" }
    ]
  };

  const toggleStudentStatus = (studentId) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

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
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} / {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="p-2 lg:p-3 text-center font-medium text-xs sm:text-sm" style={{ color: 'rgb(33, 98, 193)' }}>
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((dateObj, index) => (
              <div
                key={index}
                onClick={() => dateObj.isCurrentMonth && setSelectedDate(dateObj.day)}
                className={`
                  h-10 sm:h-12 lg:h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-sm lg:text-base
                  ${dateObj.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'}
                  ${selectedDate === dateObj.day && dateObj.isCurrentMonth 
                    ? 'text-white shadow-lg' 
                    : dateObj.isCurrentMonth 
                      ? 'text-gray-800' 
                      : 'text-gray-400'
                  }
                `}
                style={selectedDate === dateObj.day && dateObj.isCurrentMonth 
                  ? { backgroundColor: 'rgb(33, 98, 193)' } 
                  : {}
                }
              >
                {dateObj.day}
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="w-full lg:w-80 bg-white rounded-lg shadow-lg p-4 lg:p-6">
          <div className="mb-4">
            <div className="text-base lg:text-lg font-medium" style={{ color: 'rgb(33, 98, 193)' }}>
              {getSelectedDayName()}, {String(selectedDate).padStart(2, '0')} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3">Attendance Summary</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <button 
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-white shadow-md hover:shadow-lg text-sm lg:text-base"
                style={{ backgroundColor: 'rgb(33, 98, 193)' }}
              >
                Present ({attendanceData.present})
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md text-sm lg:text-base">
                Absent ({attendanceData.absent})
              </button>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{attendanceData.totalStudents}</div>
              <div className="text-xs lg:text-sm text-blue-700">Total Students</div>
            </div>
          </div>

          {/* Student List */}
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3">Recent Students</h3>
            <div className="space-y-2 lg:space-y-3">
              {attendanceData.students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                    />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">{student.name}</span>
                  </div>
                  <button
                    onClick={() => toggleStudentStatus(student.id)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
                      ${studentStatuses[student.id] === 'present' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                      }
                    `}
                    style={studentStatuses[student.id] === 'present' 
                      ? { backgroundColor: 'rgb(33, 98, 193)' } 
                      : {}
                    }
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        ${studentStatuses[student.id] === 'present' 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                        }
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;