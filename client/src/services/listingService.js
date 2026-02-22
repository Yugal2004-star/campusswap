import api from './api';

export const listingService = {
  getAll: (params) => api.get('/api/listings', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/api/listings/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/listings', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/listings/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/listings/${id}`).then((r) => r.data),
  getMy: (params) => api.get('/api/listings/my', { params }).then((r) => r.data),
  uploadImages: (id, formData) =>
    api.post(`/api/listings/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteImage: (id, imageId) => api.delete(`/api/listings/${id}/images/${imageId}`).then((r) => r.data),
  report: (id, data) => api.post(`/api/listings/${id}/report`, data).then((r) => r.data),
  getWishlist: () => api.get('/api/listings/wishlist').then((r) => r.data),
  toggleWishlist: (id) => api.post(`/api/listings/${id}/wishlist`).then((r) => r.data),
};
