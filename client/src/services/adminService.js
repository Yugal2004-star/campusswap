import api from './api';

export const adminService = {
  getAnalytics: () => api.get('/api/admin/analytics').then((r) => r.data),
  getUsers: (params) => api.get('/api/admin/users', { params }).then((r) => r.data),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}`, data).then((r) => r.data),
  getListings: (params) => api.get('/api/admin/listings', { params }).then((r) => r.data),
  updateListingStatus: (id, status) => api.patch(`/api/admin/listings/${id}/status`, { status }).then((r) => r.data),
  getReports: (params) => api.get('/api/admin/reports', { params }).then((r) => r.data),
  updateReport: (id, status) => api.patch(`/api/admin/reports/${id}`, { status }).then((r) => r.data),
};
