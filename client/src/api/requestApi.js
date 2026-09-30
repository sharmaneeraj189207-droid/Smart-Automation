import api from './client.js';

export const requestApi = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.patch(`/requests/${id}`, data),
  cancel: (id) => api.delete(`/requests/${id}`)
};
