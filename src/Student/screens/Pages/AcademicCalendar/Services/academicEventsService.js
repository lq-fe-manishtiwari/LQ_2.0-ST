import { authHeader, handleResponse, authHeaderToPost, AcademicAPI } from '@/_services/api';

export const academicEventsService = {
  createEvent,
  getEventsByMonth,
  getEventsByDay,
  updateEvent,
  deleteEvent
};

function createEvent(eventData) {
  const requestOptions = {
    method: 'POST',
    headers: authHeaderToPost(),
    body: JSON.stringify({
      event_name: eventData.event_name,
      description: eventData.description,
      event_date: eventData.event_date
    })
  };
  return fetch(`${AcademicAPI}/admin/academic//academic-events`, requestOptions)
    .then(handleResponse);
}

function getEventsByMonth(year, month) {
  const requestOptions = {
    method: 'GET',
    headers: authHeader()
  };
  return fetch(`${AcademicAPI}/admin/academic/academic-events/month?year=${year}&month=${month}`, requestOptions)
    .then(handleResponse);
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