import api from './client.js';

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  complete: (id, data) => api.post(`/tasks/${id}/complete`, data)
};
