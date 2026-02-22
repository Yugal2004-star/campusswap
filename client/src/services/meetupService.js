import api from './api';

export const meetupService = {
  getAll: (params) => api.get('/api/meetups', { params }).then((r) => r.data),
  create: (data) => api.post('/api/meetups', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/meetups/${id}`, data).then((r) => r.data),
};
