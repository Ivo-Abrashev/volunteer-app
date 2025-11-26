// src/services/eventService.js
import api from './api';

const eventService = {
  // Вземи всички събития
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/events?${params}`);
    return response.data;
  },

  // Вземи едно събитие
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Създай събитие
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Обнови събитие
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Изтрий събитие
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Моите събития (създадени от мен)
  getMyEvents: async () => {
    const response = await api.get('/events/my/events');
    return response.data;
  },

  // Запиши се за събитие
  registerForEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  // Отпиши се
  unregisterFromEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/unregister`);
    return response.data;
  },

  // Моите регистрации
  getMyRegistrations: async () => {
    const response = await api.get('/my-registrations');
    return response.data;
  },

  // Участници (за organizer)
  getEventParticipants: async (eventId) => {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  },

  // Маркирай присъствие
  markAttendance: async (registrationId, attended) => {
    const response = await api.put(`/registrations/${registrationId}/attendance`, {
      attended,
    });
    return response.data;
  },
};

export default eventService;