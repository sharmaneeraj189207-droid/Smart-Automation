import api from './client.js';

export const workflowApi = {
  getAll: (params) => api.get('/workflows', { params }),
  getById: (id) => api.get(`/workflows/${id}`),
  process: (id) => api.post(`/workflows/${id}/process`),
  approve: (id, data) => api.post(`/workflows/${id}/approve`, data),
  reject: (id, data) => api.post(`/workflows/${id}/reject`, data),
  escalate: (id, data) => api.post(`/workflows/${id}/escalate`, data),
  runSlaCheck: () => api.post('/workflows/sla-check')
};
