import api from './api';

export const chatService = {
  getAll: () => api.get('/api/chats').then((r) => r.data),
  create: (data) => api.post('/api/chats', data).then((r) => r.data),
  getMessages: (chatId) => api.get(`/api/chats/${chatId}/messages`).then((r) => r.data),
  sendMessage: (chatId, data) => api.post(`/api/chats/${chatId}/messages`, data).then((r) => r.data),
};
