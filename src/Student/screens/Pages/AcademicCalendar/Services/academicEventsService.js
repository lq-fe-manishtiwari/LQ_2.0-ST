import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const academicEventsService = {
  createEvent,
  getEventsByCollegeAndMonth,
  getEventsByDay,
  updateEvent,
  deleteEvent
};

function createEvent(eventData, collegeId) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify({
      event_name: eventData.event_name,
      description: eventData.description,
      event_date: eventData.event_date,
      college_id: collegeId,
      academic_year_id: 1
    })
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/college/${collegeId}`, requestOptions)
    .then(handleResponse);
}

function getEventsByCollegeAndMonth(collegeId, year, month) {
  console.log('Fetching events for college:', collegeId, 'year:', year, 'month:', month);
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/college/${collegeId}/month?year=${year}&month=${month}`, requestOptions)
    .then(handleResponse)
    .catch(error => {
      console.error('API Error:', error);
      throw error;
    });
}

function getEventsByDay(year, month, day) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/day?year=${year}&month=${month}&day=${day}`, requestOptions)
    .then(handleResponse);
}

function updateEvent(id, eventData) {
  const requestOptions = {
    method: 'PUT',
    headers: authHeaderToPost(),
    body: JSON.stringify({
      event_name: eventData.event_name,
      description: eventData.description,
      event_date: eventData.event_date
    })
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/${id}`, requestOptions)
    .then(handleResponse);
}

function deleteEvent(id) {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader()
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/${id}`, requestOptions)
    .then(handleResponse);
}