import api from './client.js';

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAutomation: () => api.get('/analytics/automation')
};
