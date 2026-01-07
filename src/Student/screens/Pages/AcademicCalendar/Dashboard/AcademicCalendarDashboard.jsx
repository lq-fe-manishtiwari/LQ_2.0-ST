import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Grid, List, Plus, Star } from 'lucide-react';
import AddEventModal from '../Components/AddEventModal';
import SweetAlert from 'react-bootstrap-sweetalert';
import { academicEventsService } from '../Services/academicEventsService';

const AcademicCalendarDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());
  
  // Success alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [events, setEvents] = useState({});
  const [showTodayEventPopup, setShowTodayEventPopup] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load events for current month
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEvents({}); // Clear existing events
        const response = await academicEventsService.getEventsByMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        
        // Transform API response to match existing event structure
        const transformedEvents = {};
        if (Array.isArray(response)) {
          response.forEach(event => {
            const eventDate = new Date(event.event_date);
            const day = eventDate.getDate();
            
            if (!transformedEvents[day]) {
              transformedEvents[day] = [];
            }
            
            transformedEvents[day].push({
              id: event.event_id,
              academicEventId: event.event_id,
              text: event.event_name,
              description: event.description,
              startDate: event.event_date,
              endDate: event.event_date
            });
          });
        }
        
        setEvents(transformedEvents);
        
        // Check for today's events and show popup
        const today = new Date();
        const todayDay = today.getDate();
        const todayEvents = transformedEvents[todayDay] || [];
        if (todayEvents.length > 0) {
          setShowTodayEventPopup(true);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents({}); // Clear events on error
      }
    };
    
    loadEvents();
  }, [currentDate]);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getEventStatus = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(23, 59, 59, 999);
    
    if (today < eventStart) {
      return 'upcoming';
    } else if (today >= eventStart && today <= eventEnd) {
      return 'current';
    } else {
      return 'ended';
    }
  };
  
  const getEventStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'current':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };
  
  const hasTodayEvent = (day) => {
    if (!isToday(day)) return false;
    const dayEvents = events[day] || [];
    return dayEvents.some(event => getEventStatus(event) === 'current');
  };
  
  const toggleDayExpansion = (day) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const openAddEventModal = (day) => {
    setSelectedDate({ day, month: monthNames[currentDate.getMonth()], year: currentDate.getFullYear() });
    setEditEvent(null);
    setShowAddModal(true);
  };

  const openEditEventModal = (event, day) => {
    setSelectedDate({ day, month: monthNames[currentDate.getMonth()], year: currentDate.getFullYear() });
    setEditEvent(event);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedDate(null);
    setEditEvent(null);
  };

  const saveEvent = async (eventData) => {
    try {
      if (editEvent) {
        // Update existing event
        await academicEventsService.updateEvent(editEvent.academicEventId, {
          event_name: eventData.event_name,
          description: eventData.description,
          event_date: eventData.event_date
        });
        
        setEvents(prev => ({
          ...prev,
          [selectedDate.day]: prev[selectedDate.day].map(event => 
            event.id === editEvent.id ? { 
              ...event, 
              text: eventData.event_name,
              description: eventData.description,
              startDate: eventData.event_date,
              endDate: eventData.event_date
            } : event
          )
        }));
        setSuccessMessage('Event updated successfully!');
      } else {
        // Add new event
        const response = await academicEventsService.createEvent({
          event_name: eventData.event_name,
          description: eventData.description,
          event_date: eventData.event_date
        });
        
        const newEvent = {
          id: response.event_id,
          academicEventId: response.event_id,
          text: eventData.event_name,
          description: eventData.description,
          startDate: eventData.event_date,
          endDate: eventData.event_date
        };
        
        setEvents(prev => ({
          ...prev,
          [selectedDate.day]: [...(prev[selectedDate.day] || []), newEvent]
        }));
        setSuccessMessage('Event created successfully!');
      }
      
      closeAddModal();
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error saving event:', error);
      setSuccessMessage('Error saving event. Please try again.');
      setShowSuccessAlert(true);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const eventToDelete = events[selectedDate.day].find(event => event.id === eventId);
      if (eventToDelete?.academicEventId) {
        await academicEventsService.deleteEvent(eventToDelete.academicEventId);
      }
      
      setEvents(prev => ({
        ...prev,
        [selectedDate.day]: prev[selectedDate.day].filter(event => event.id !== eventId)
      }));
      
      closeAddModal();
      setSuccessMessage('Event deleted successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error deleting event:', error);
      setSuccessMessage('Error deleting event. Please try again.');
      setShowSuccessAlert(true);
    }
  };
  
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction));
    setExpandedDays(new Set()); // Reset expanded days when navigating
    // Scroll to top after month navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getEventsForMonth = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const eventsWithDates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events[day] || [];
      if (dayEvents.length > 0) {
        dayEvents.forEach(event => {
          eventsWithDates.push({ ...event, day });
        });
      }
    }
    
    return eventsWithDates.sort((a, b) => a.day - b.day);
  };
  
  const getAllDatesForMonth = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const allDates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events[day] || [];
      allDates.push({ day, events: dayEvents });
    }
    
    return allDates;
  };
  
  const renderMobileDateCard = (dateInfo, index) => {
    const { day, events: dayEvents } = dateInfo;
    const hasEvents = dayEvents.length > 0;
    const isTodayDate = isToday(day);
    const hasTodayEvents = hasTodayEvent(day);
    
    if (hasEvents) {
      // Render existing event card for dates with events
      const event = dayEvents[0];
      const eventStatus = getEventStatus(event);
      const statusColor = getEventStatusColor(eventStatus);
      
      return (
        <div 
          key={index}
          onClick={() => openEditEventModal(event, day)}
          className={`${statusColor} border rounded-xl p-4 mb-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
            hasTodayEvents ? 'ring-2 ring-orange-400 shadow-lg animate-pulse' : ''
          } ${
            isTodayDate && !hasTodayEvents ? 'ring-1 ring-orange-300' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                isTodayDate ? 'bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white' : 'bg-white'
              }`}>
                <span className={`text-lg font-bold ${
                  isTodayDate ? 'text-white' : 'text-gray-900'
                }`}>{day}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  eventStatus === 'upcoming' ? 'bg-blue-500' : 
                  eventStatus === 'current' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <h3 className="font-semibold text-sm leading-tight">{event.text}</h3>
              </div>
              {event.description && (
                <div className="text-xs opacity-75 mt-1">
                  {event.description}
                </div>
              )}
              {dayEvents.length > 1 && (
                <div className="text-xs text-blue-600 font-medium mt-2">
                  {dayEvents.length} Events
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Render blank date card for dates without events - not clickable for students
      return (
        <div 
          key={index}
          className={`bg-white border border-gray-200 rounded-xl p-4 mb-3 cursor-default transition-all ${
            isTodayDate ? 'ring-2 ring-orange-300 bg-orange-50' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                isTodayDate ? 'bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white' : 'bg-gray-50'
              }`}>
                <span className={`text-lg font-bold ${
                  isTodayDate ? 'text-white' : 'text-gray-700'
                }`}>{day}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex items-center">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  No events scheduled
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  const renderDesktopEvent = (event, index, day) => {
    const eventStatus = getEventStatus(event);
    const statusColor = getEventStatusColor(eventStatus);
    
    return (
      <div 
        key={index} 
        onClick={(e) => {
          e.stopPropagation();
          openEditEventModal(event, day);
        }}
        className={`${statusColor} border rounded-md p-1.5 mb-1 text-xs transition-all hover:shadow-sm cursor-pointer hover:scale-105`}
      >
        <div className="flex items-start gap-1">
          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
            eventStatus === 'upcoming' ? 'bg-blue-500' : 
            eventStatus === 'current' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{event.text}</div>
            {event.description && (
              <div className="text-xs opacity-75 truncate">
                {event.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderDesktopCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[140px]"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events[day] || [];
      const hasEvents = dayEvents.length > 0;
      const isExpanded = expandedDays.has(day);
      const eventsToShow = isExpanded ? dayEvents : dayEvents.slice(0, 3);
      const isTodayDate = isToday(day);
      const hasTodayEvents = hasTodayEvent(day);
      
      days.push(
        <div 
          key={day} 
          onClick={hasEvents ? () => openAddEventModal(day) : undefined}
          className={`${isExpanded ? 'min-h-[200px]' : 'min-h-[140px]'} border rounded-lg p-2 transition-all bg-white relative overflow-hidden ${
            hasEvents ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
          } ${
            hasTodayEvents ? 'ring-2 ring-orange-400 border-orange-300 bg-orange-50' : 
            isTodayDate ? 'ring-2 ring-orange-300 border-orange-200 bg-orange-50' :
            hasEvents ? 'ring-1 ring-sky-100 border-sky-200' : 'border-sky-100'
          }`}
        >

          <div className={`font-semibold text-sm mb-2 flex items-center justify-between ${
            isTodayDate ? 'text-orange-700' :
            hasEvents ? 'text-blue-700' : 'text-gray-700'
          }`}>
            <span className={isTodayDate ? 'w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg animate-bounce font-bold border-2 border-white flex items-center justify-center' : ''}>
              {day}
            </span>
          </div>
          <div className="space-y-1 overflow-hidden">
            {eventsToShow.length > 0 ? (
              eventsToShow.map((event, index) => renderDesktopEvent(event, index, day))
            ) : (
              <div className="text-xs text-gray-400 italic py-2">
                No events scheduled
              </div>
            )}
            {dayEvents.length > 3 && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDayExpansion(day);
                }}
                className="text-xs text-blue-600 font-medium px-1 cursor-pointer hover:text-blue-800 hover:underline"
              >
                {isExpanded ? 'Show less' : `+${dayEvents.length - 3} more`}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  // Check if today has any events
  const todayEvents = events[new Date().getDate()] || [];
  const hasTodayEvents = todayEvents.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Academic Calendar</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Manage your academic schedule
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm md:text-base font-semibold text-white bg-blue-600 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigateMonth(-1)}
                className="w-12 h-12 text-blue-600 hover:text-blue-700 flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-blue-600">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Today's Events</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Upcoming</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Past</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigateMonth(1)}
                className="w-12 h-12 text-blue-600 hover:text-blue-700 flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Card View */}
        {isMobile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <List className="w-4 h-4" />
              <span>All Dates for {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            </div>
            {getAllDatesForMonth().map((dateInfo, index) => renderMobileDateCard(dateInfo, index))}
          </div>
        ) : (
          /* Desktop Calendar View */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                <Grid className="w-4 h-4" />
                <span>Calendar View</span>
              </div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day, index) => {
                  const today = new Date();
                  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                  const isTodayDayOfWeek = today.getDay() === index;
                  const shouldHighlight = isCurrentMonth && isTodayDayOfWeek;
                  
                  return (
                    <div key={day} className={`text-center font-semibold text-sm py-3 rounded-lg transition-all ${
                      shouldHighlight 
                        ? 'bg-orange-200 text-orange-800 border border-orange-300' 
                        : 'bg-sky-50 text-sky-600'
                    }`}>
                      {day}
                    </div>
                  );
                })}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3">
                {renderDesktopCalendar()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Event Modal */}
      <AddEventModal 
        showModal={showAddModal}
        selectedDate={selectedDate}
        editEvent={editEvent}
        onClose={closeAddModal}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
      
      {/* Today's Event Popup */}
      {showTodayEventPopup && (
        <SweetAlert
          title="🎉 Today's Events"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowTodayEventPopup(false)}
          customClass="today-event-popup"
          showConfirm={true}
          type={undefined}
        >
          <div className="text-left">
            <p className="mb-3 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">You have {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} scheduled for today:</p>
            <div className="space-y-2">
              {todayEvents.map((event, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">{event.text}</h4>
                  {event.description && (
                    <p className="text-sm text-orange-600 mt-1">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SweetAlert>
      )}
      
      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>
      )}
    </div>
  );
};

export default AcademicCalendarDashboard;