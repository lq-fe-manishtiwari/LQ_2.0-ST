import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, BarChart3 } from 'lucide-react';

const MonthlyView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Monthly report data
  const monthlyData = {
    totalStudents: 45,
    avgAttendance: 84.2,
    topPerformers: 12,
    needsAttention: 5,
    students: [
      { id: 1, name: "John Smith", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face", attendance: 95, grade: "A+" },
      { id: 2, name: "Emma Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face", attendance: 88, grade: "A" },
      { id: 3, name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", attendance: 76, grade: "B+" },
      { id: 4, name: "Sarah Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face", attendance: 92, grade: "A" },
      { id: 5, name: "David Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face", attendance: 68, grade: "C+" }
    ]
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Monthly Report</h1>
        <p className="text-gray-600">Class 8A Performance Summary - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
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

        {/* Monthly Report Panel */}
        <div className="w-full lg:w-96 space-y-6">
          {/* Date & Stats Card */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="mb-4">
              <div className="text-base lg:text-lg font-medium" style={{ color: 'rgb(33, 98, 193)' }}>
                {getSelectedDayName()}, {String(selectedDate).padStart(2, '0')} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">{monthlyData.avgAttendance}%</div>
                <div className="text-xs text-green-700">Avg Attendance</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-600">{monthlyData.topPerformers}</div>
                <div className="text-xs text-yellow-700">Top Performers</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-600">{monthlyData.needsAttention}</div>
                <div className="text-xs text-red-700">Needs Attention</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">{monthlyData.totalStudents}</div>
                <div className="text-xs text-blue-700">Total Students</div>
              </div>
            </div>
          </div>

          {/* Student Performance List */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base lg:text-lg font-semibold text-gray-800">Student Performance</h3>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {monthlyData.students.map((student) => {
                const getAttendanceColor = (attendance) => {
                  if (attendance >= 90) return 'text-green-600 bg-green-50';
                  if (attendance >= 75) return 'text-yellow-600 bg-yellow-50';
                  return 'text-red-600 bg-red-50';
                };
                
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
                        <div className="text-sm text-gray-500">Grade: {student.grade}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </div>
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
};

export default MonthlyView;