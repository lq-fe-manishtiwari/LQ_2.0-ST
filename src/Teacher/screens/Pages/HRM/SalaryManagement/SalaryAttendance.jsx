import React, { useState, useEffect } from 'react';

export default function SalaryAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 17));
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    type: 'sick',
    reason: '',
    startDate: '2025-12-17',
    endDate: '2025-12-17'
  });

  const [attendanceData, setAttendanceData] = useState({
    present: 15,
    absent: 2,
    late: 3,
    halfDay: 1,
    leave: 4,
    weekend: 5,
    totalWorkingDays: 31,
    leaveBreakdown: {
      sick: 2,
      casual: 1,
      annual: 1
    }
  });

  const leaveTypes = [
    { id: 'sick', name: 'Sick Leave', color: '#FF6B6B', shortCode: 'SL' },
    { id: 'casual', name: 'Casual Leave', color: '#4ECDC4', shortCode: 'CL' },
    { id: 'annual', name: 'Annual Leave', color: '#45B7D1', shortCode: 'AL' }
  ];

  const userData = {
    name: "John Doe",
    employeeId: "EMP-00123",
    designation: "Senior Developer",
    department: "Engineering",
    joiningDate: "2022-03-15",
    contact: "+1 234-567-8900",
    email: "john.doe@company.com",
    profileImage: "https://via.placeholder.com/100",
    leaveBreakdown: {
      sick: { total: 5, taken: 3, remaining: 2 },
      casual: { total: 4, taken: 2, remaining: 2 },
      annual: { total: 3, taken: 1, remaining: 2 }
    },
    totalLeaves: 12,
    leavesTaken: 6,
    leavesRemaining: 6
  };

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'hr', name: 'HR' },
    { id: 'finance', name: 'Finance' }
  ];
  
  const employees = [
    { id: 'all', name: 'All Employees' },
    { id: 'EMP-00123', name: 'John Doe' },
    { id: 'EMP-00124', name: 'Jane Smith' },
    { id: 'EMP-00125', name: 'Robert Brown' }
  ];

  const attendanceRecords = {
    '2025-12-01': { status: 'present', checkIn: '09:00', checkOut: '18:00' },
    '2025-12-02': { status: 'present', checkIn: '09:05', checkOut: '18:10' },
    '2025-12-03': { status: 'late', checkIn: '10:30', checkOut: '19:00' },
    '2025-12-04': { status: 'present', checkIn: '08:45', checkOut: '17:45' },
    '2025-12-05': { status: 'present', checkIn: '09:15', checkOut: '18:30' },
    '2025-12-06': { status: 'weekend' },
    '2025-12-07': { status: 'weekend' },
    '2025-12-08': { status: 'present', checkIn: '09:00', checkOut: '18:00' },
    '2025-12-09': { status: 'half-day', checkIn: '09:00', checkOut: '14:00' },
    '2025-12-10': { status: 'present', checkIn: '08:55', checkOut: '17:50' },
    '2025-12-11': { status: 'leave', type: 'sick', reason: 'Fever and cold' },
    '2025-12-12': { status: 'present', checkIn: '09:10', checkOut: '18:20' },
    '2025-12-13': { status: 'weekend' },
    '2025-12-14': { status: 'weekend' },
    '2025-12-15': { status: 'present', checkIn: '08:45', checkOut: '17:55' },
    '2025-12-16': { status: 'leave', type: 'casual', reason: 'Family function' },
    '2025-12-17': { status: 'present', checkIn: '09:00', checkOut: '18:00' },
    '2025-12-18': { status: 'late', checkIn: '11:00', checkOut: '19:30' },
    '2025-12-19': { status: 'present', checkIn: '09:05', checkOut: '18:05' },
    '2025-12-20': { status: 'weekend' },
    '2025-12-21': { status: 'weekend' },
    '2025-12-22': { status: 'present', checkIn: '08:50', checkOut: '17:45' },
    '2025-12-23': { status: 'absent' },
    '2025-12-24': { status: 'present', checkIn: '09:20', checkOut: '18:10' },
    '2025-12-25': { status: 'leave', type: 'annual', reason: 'Christmas holiday' },
    '2025-12-26': { status: 'present', checkIn: '08:40', checkOut: '17:50' },
    '2025-12-27': { status: 'weekend' },
    '2025-12-28': { status: 'weekend' },
    '2025-12-29': { status: 'present', checkIn: '09:00', checkOut: '18:00' },
    '2025-12-30': { status: 'leave', type: 'sick', reason: 'Doctor appointment' },
    '2025-12-31': { status: 'half-day', checkIn: '09:00', checkOut: '13:00' }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    if (day) {
      const clickedDate = new Date(year, month, day);
      setSelectedDate(clickedDate);
    }
  };

  const getAttendanceStatus = (day) => {
    if (!day) return null;
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    if (attendanceRecords[dateString]) {
      return attendanceRecords[dateString];
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { status: 'weekend' };
    }
    
    return { status: 'present', checkIn: '09:00', checkOut: '18:00' };
  };

  const calculateAttendanceSummary = () => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let leave = 0;
    let weekend = 0;
    const leaveBreakdown = {
      sick: 0,
      casual: 0,
      annual: 0
    };

    Object.values(attendanceRecords).forEach(record => {
      switch(record.status) {
        case 'present': present++; break;
        case 'absent': absent++; break;
        case 'late': late++; break;
        case 'half-day': halfDay++; break;
        case 'leave': 
          leave++;
          if (record.type && leaveBreakdown[record.type] !== undefined) {
            leaveBreakdown[record.type]++;
          }
          break;
        case 'weekend': weekend++; break;
        default: break;
      }
    });

    return { present, absent, late, halfDay, leave, weekend, totalWorkingDays: daysInMonth, leaveBreakdown };
  };

  useEffect(() => {
    const summary = calculateAttendanceSummary();
    setAttendanceData(summary);
  }, [currentDate]);

  const getStatusColor = (status, type) => {
    if (status === 'leave' && type) {
      const leaveType = leaveTypes.find(lt => lt.id === type);
      return leaveType ? leaveType.color : '#2196F3';
    }
    
    switch(status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'late': return '#FF9800';
      case 'half-day': return '#FFC107';
      case 'leave': return '#2196F3';
      case 'weekend': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getStatusName = (status, type) => {
    if (status === 'leave' && type) {
      const leaveType = leaveTypes.find(lt => lt.id === type);
      return leaveType ? leaveType.name : 'Leave';
    }
    
    switch(status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      case 'leave': return 'Leave';
      case 'weekend': return 'Weekend';
      default: return 'Unknown';
    }
  };

  const getLeaveTypeShortCode = (typeId) => {
    const leaveType = leaveTypes.find(lt => lt.id === typeId);
    return leaveType ? leaveType.shortCode : 'LV';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleLeaveRequest = () => {
    alert(`Leave requested:\nType: ${leaveData.type}\nFrom: ${leaveData.startDate}\nTo: ${leaveData.endDate}\nReason: ${leaveData.reason}`);
    setLeaveModal(false);
    setLeaveData({
      type: 'sick',
      reason: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedDayDetails = getAttendanceStatus(selectedDate.getDate());

  return (
    <div style={styles.container}>
      {/* Top Filters */}
      <div style={styles.topFilters}>
        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={styles.filterSelect}
          >
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            style={styles.filterSelect}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.calendarHeader}>
            <button onClick={prevMonth} style={styles.navButton}>&lt;</button>
            <h2 style={styles.monthYear}>{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} style={styles.navButton}>&gt;</button>
          </div>

          {/* Enhanced Attendance Summary */}
          <div style={styles.attendanceSummary}>
            <div style={styles.summaryRow}>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#4CAF50'}}></div>
                <span>Present: {attendanceData.present}</span>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#F44336'}}></div>
                <span>Absent: {attendanceData.absent}</span>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#FF9800'}}></div>
                <span>Late: {attendanceData.late}</span>
              </div>
            </div>
            <div style={styles.summaryRow}>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#FFC107'}}></div>
                <span>Half-day: {attendanceData.halfDay}</span>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#2196F3'}}></div>
                <span>Leave: {attendanceData.leave}</span>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.statusIndicator, backgroundColor: '#9E9E9E'}}></div>
                <span>Weekend: {attendanceData.weekend}</span>
              </div>
            </div>
          </div>
       
          {/* Calendar */}
          <div style={styles.calendar}>
            <div style={styles.weekDays}>
              {weekDays.map(day => (
                <div key={day} style={styles.weekDay}>{day}</div>
              ))}
            </div>
            
            <div style={styles.daysGrid}>
              {days.map((day, index) => {
                const attendance = getAttendanceStatus(day);
                const isSelected = day === selectedDate.getDate();
                
                const dayColor = attendance ? getStatusColor(attendance.status, attendance.type) : '';
                const statusName = attendance ? getStatusName(attendance.status, attendance.type) : '';
                
                let dayStyle = { ...styles.day };
                
                if (!day) {
                  dayStyle = { ...dayStyle, ...styles.emptyDay };
                }
                
                if (attendance && attendance.status) {
                  const statusStyle = styles[`${attendance.status}Day`];
                  if (statusStyle) {
                    dayStyle = { ...dayStyle, ...statusStyle };
                  }
                  
                  if (attendance.status === 'leave' && attendance.type) {
                    dayStyle.backgroundColor = `${getStatusColor(attendance.status, attendance.type)}20`;
                  }
                }
                
                if (isSelected) {
                  dayStyle = { ...dayStyle, ...styles.selectedDay };
                }
                
                if (attendance?.status === 'leave' && attendance.type && !isSelected) {
                  dayStyle.borderLeft = `4px solid ${getStatusColor(attendance.status, attendance.type)}`;
                }
                
                return (
                  <div
                    key={index}
                    style={dayStyle}
                    onClick={() => handleDayClick(day)}
                    title={day ? `${statusName}${attendance?.reason ? ` - ${attendance.reason}` : ''}` : ''}
                  >
                    {day}
                    {attendance && attendance.status && day && (
                      <div style={{
                        ...styles.dayIndicator,
                        backgroundColor: dayColor,
                      }}></div>
                    )}
                    {attendance?.status === 'leave' && attendance.type && (
                      <div style={{
                        ...styles.leaveTypeBadge,
                        backgroundColor: getStatusColor(attendance.status, attendance.type)
                      }}>
                        {getLeaveTypeShortCode(attendance.type)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Balance Details */}
          <div style={styles.leaveBalanceDetails}>
            <h3 style={styles.sectionTitle}>Leave Balance Details</h3>                
            <div style={styles.leaveTotalSummary}>
              <div style={styles.totalHeader}>
                <div style={styles.totalLabel}>Total Leave Summary</div>
              </div>
              <div style={styles.totalStats}>
                {/* Row 1: Total Statistics */}
                <div style={styles.totalStat}>
                  <div style={styles.totalStatLabel}>Total Leaves</div>
                  <div style={styles.totalStatValue}>12</div>
                </div>
                <div style={styles.totalStat}>
                  <div style={styles.totalStatLabel}>Leaves Taken</div>
                  <div style={{...styles.totalStatValue, color: '#F44336'}}>6</div>
                </div>
                <div style={styles.totalStat}>
                  <div style={styles.totalStatLabel}>Leaves Remaining</div>
                  <div style={{...styles.totalStatValue, color: '#4CAF50', fontWeight: 'bold'}}>6</div>
                </div>
                
                {/* Row 2: Leave Type Breakdown */}
                <div style={styles.leaveTypeStat}>
                  <div style={styles.leaveTypeStatLabel}>Annual Leave</div>
                  <div style={{...styles.leaveTypeStatValue, color: '#F44336'}}>1</div>
                </div>
                <div style={styles.leaveTypeStat}>
                  <div style={styles.leaveTypeStatLabel}>Casual Leave</div>
                  <div style={{...styles.leaveTypeStatValue, color: '#F44336'}}>2</div>
                </div>
                <div style={styles.leaveTypeStat}>
                  <div style={styles.leaveTypeStatLabel}>Sick Leave</div>
                  <div style={{...styles.leaveTypeStatValue, color: '#F44336'}}>3</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.userProfile}>
            <img 
              src={userData.profileImage} 
              alt="Profile" 
              style={styles.profileImage}
            />
            <h2 style={styles.userName}>{userData.name}</h2>
            <p style={styles.userId}>{userData.employeeId}</p>
            
            {/* User Details Section */}
            <div style={styles.userDetails}>
              <h3 style={styles.sectionTitle}>Employee Details</h3>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Designation:</div>
                  <div style={styles.detailValue}>{userData.designation}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Department:</div>
                  <div style={styles.detailValue}>{userData.department}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Joining Date:</div>
                  <div style={styles.detailValue}>{userData.joiningDate}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Contact:</div>
                  <div style={styles.detailValue}>{userData.contact}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Email:</div>
                  <div style={styles.detailValue}>{userData.email}</div>
                </div>
              </div>
            </div>
            
            {/* Selected Day Details */}
            <div style={styles.selectedDayDetails}>
              <h3 style={styles.sectionTitle}>Attendance Details</h3>
              <div style={styles.selectedDate}>{formatDate(selectedDate)}</div>
              
              {selectedDayDetails && (
                <div style={styles.attendanceDetails}>
                  <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(selectedDayDetails.status, selectedDayDetails.type)
                      }}>
                        {selectedDayDetails.status === 'leave' && selectedDayDetails.type ? (
                          <span>
                            {getStatusName(selectedDayDetails.status, selectedDayDetails.type)}
                          </span>
                        ) : getStatusName(selectedDayDetails.status, selectedDayDetails.type)}
                      </div>
                    </div>
                    
                    {selectedDayDetails.checkIn && selectedDayDetails.checkOut && (
                      <div style={styles.timeDetails}>
                        <div style={styles.timeRow}>
                          <div style={styles.timeColumn}>
                            <div style={styles.timeLabel}>Check In:</div>
                            <div style={styles.timeValue}>{selectedDayDetails.checkIn}</div>
                          </div>
                          <div style={styles.timeColumn}>
                            <div style={styles.timeLabel}>Check Out:</div>
                            <div style={styles.timeValue}>{selectedDayDetails.checkOut}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedDayDetails.reason && (
                      <div style={styles.reasonSection}>
                        <div style={styles.reasonLabel}>Reason:</div>
                        <p style={styles.reasonText}>{selectedDayDetails.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button 
                style={styles.primaryButton}
                onClick={() => setLeaveModal(true)}
              >
                Request Leave
              </button>
             </div>
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {leaveModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Request Leave</h3>
              <button 
                style={styles.modalClose}
                onClick={() => setLeaveModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>Leave Type:</div>
                <div style={styles.leaveTypeOptions}>
                  {leaveTypes.map(leaveType => (
                    <label 
                      key={leaveType.id} 
                      style={{
                        ...styles.leaveTypeOption,
                        ...(leaveData.type === leaveType.id ? styles.selectedLeaveType : {})
                      }}
                    >
                      <input
                        type="radio"
                        name="leaveType"
                        value={leaveType.id}
                        checked={leaveData.type === leaveType.id}
                        onChange={(e) => setLeaveData({...leaveData, type: e.target.value})}
                        style={styles.radioInput}
                      />
                      <div style={styles.leaveTypeOptionContent}>
                        <div style={{
                          ...styles.leaveTypeColorBox,
                          backgroundColor: leaveType.color
                        }}></div>
                        <div style={styles.leaveTypeText}>{leaveType.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>Start Date:</div>
                <input 
                  type="date"
                  style={styles.formInput}
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>End Date:</div>
                <input 
                  type="date"
                  style={styles.formInput}
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>Reason:</div>
                <textarea 
                  style={styles.formTextarea}
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                  placeholder="Enter reason for leave..."
                  rows="4"
                />
              </div>
              
              {/* Leave Balance Info */}
              <div style={styles.leaveBalanceInfo}>
                <h4 style={styles.balanceInfoTitle}>Available Leaves:</h4>
                <div style={styles.balanceInfoGrid}>
                  {leaveTypes.map(leaveType => {
                    const data = userData.leaveBreakdown[leaveType.id];
                    if (!data) return null;
                    
                    return (
                      <div key={leaveType.id} style={styles.balanceInfoItem}>
                        <div style={{
                          ...styles.balanceInfoDot,
                          backgroundColor: leaveType.color
                        }}></div>
                        <div style={styles.balanceInfoText}>
                          {leaveType.name}: {data.remaining}/{data.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button 
                style={styles.cancelButton}
                onClick={() => setLeaveModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.submitButton}
                onClick={handleLeaveRequest}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '10px',
    fontFamily: 'Arial, sans-serif'
  },
  topFilters: {
    display: 'flex',
    gap: '20px',
    marginBottom: '7px',
    padding: '9px',
    backgroundColor: 'white',
    // borderRadius: '15px',
    // boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  mainContent: {
    display: 'flex',
    gap: '10px',
  },
  leftPanel: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  rightPanel: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '2px solid #f0f0f0'
  },
  navButton: {
    padding: '10px 20px',
    border: '1px solid #e0e0e0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#555',
    transition: 'all 0.3s'
  },
  monthYear: {
    margin: 0,
    color: '#333',
    fontSize: '24px',
    fontWeight: '600'
  },
  attendanceSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '10px',
    // marginBottom: '10px',
    border: '1px solid #e9ecef'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px'
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    color: '#555',
    flex: 1,
    justifyContent: 'center'
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block'
  },
 
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  leaveTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  leaveTypeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0'
  },
  leaveTypeIndicator: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  leaveTypeCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  leaveTypeInfo: {
    flex: 1
  },
  leaveTypeName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  leaveTypeCount: {
    fontSize: '13px',
    color: '#666'
  },
  calendar: {
    marginBottom: '20px'
  },
  weekDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#555',
    fontSize: '15px'
  },
  weekDay: {
    padding: '10px 5px'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px'
  },
  day: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s',
    backgroundColor: 'white',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333'
  },
  emptyDay: {
    border: 'none',
    cursor: 'default',
    backgroundColor: 'transparent'
  },
  selectedDay: {
    border: '3px solid #2196F3',
    boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.1)',
    backgroundColor: '#e3f2fd'
  },
  presentDay: {
    backgroundColor: '#e8f5e9'
  },
  absentDay: {
    backgroundColor: '#ffebee'
  },
  lateDay: {
    backgroundColor: '#fff3e0'
  },
  halfDayDay: {
    backgroundColor: '#fff8e1'
  },
  leaveDay: {
    backgroundColor: '#e3f2fd'
  },
  weekendDay: {
    backgroundColor: '#f5f5f5',
    color: '#999'
  },
  dayIndicator: {
    position: 'absolute',
    bottom: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  leaveTypeBadge: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leaveBalanceDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid #e9ecef',
    marginTop: '20px'
  },
  leaveTotalSummary: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    border: '2px solid #bbdefb',
    boxShadow: '0 2px 12px rgba(187, 222, 251, 0.3)'
  },
  totalHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1976D2'
  },
  totalStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: '15px'
  },
  totalStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    backgroundColor: '#f0f7ff',
    borderRadius: '8px'
  },
  leaveTypeStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  totalStatLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '500'
  },
  totalStatValue: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333'
  },
  leaveTypeStatLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '500'
  },
  leaveTypeStatValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  filterItem: {
    flex: 1
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555'
  },
  filterSelect: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  userProfile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    // marginBottom: '10px',
    border: '4px solid #f0f0f0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  userName: {
    margin: '5px 0 5px 0',
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
    fontWeight: '600'
  },
  userId: {
    color: '#666',
    marginBottom: '8px',
    fontSize: '16px',
    backgroundColor: '#f8f9fa',
    padding: '8px 16px',
    borderRadius: '20px'
  },
  userDetails: {
    width: '100%',
    marginBottom: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid #e9ecef'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '600',
    textAlign: 'right'
  },
  selectedDayDetails: {
    width: '100%',
    marginBottom: '15px'
  },
  selectedDate: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  attendanceDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '10px',
    border: '1px solid #e9ecef'
  },
  detailCard: {
    textAlign: 'center'
  },
  detailHeader: {
    marginBottom: '20px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '25px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    marginBottom: '15px'
  },
  timeDetails: {
    marginBottom: '20px'
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px'
  },
  timeColumn: {
    flex: 1,
    textAlign: 'center'
  },
  timeLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600'
  },
  timeValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  reasonSection: {
    textAlign: 'left'
  },
  reasonLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600'
  },
  reasonText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    marginTop: '20px'
  },
  primaryButton: {
    padding: '14px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
   modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  },
  modalContent: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '12px',
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  },
  leaveTypeOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  leaveTypeOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  selectedLeaveType: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff'
  },
  radioInput: {
    marginRight: '10px'
  },
  leaveTypeOptionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  leaveTypeColorBox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px'
  },
  leaveTypeText: {
    fontSize: '14px',
    color: '#333'
  },
  formInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    backgroundColor: 'white',
    outline: 'none'
  },
  formTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    backgroundColor: 'white',
    outline: 'none',
    resize: 'vertical'
  },
  leaveBalanceInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px'
  },
  balanceInfoTitle: {
    marginTop: 0,
    marginBottom: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#555'
  },
  balanceInfoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  balanceInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  balanceInfoDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  balanceInfoText: {
    color: '#666'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  }
};