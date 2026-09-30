import api from './client.js';

export const adminApi = {
  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Departments
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.patch(`/departments/${id}`, data),

  // Rules
  getRules: () => api.get('/rules'),
  createRule: (data) => api.post('/rules', data),
  updateRule: (id, data) => api.patch(`/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/rules/${id}`),

  // Audit Logs
  getAuditLogs: (params) => api.get('/audit-logs', { params })
};
