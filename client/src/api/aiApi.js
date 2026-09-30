import api from './client.js';

export const aiApi = {
  classify: (data) => api.post('/ai/classify', data),
  extract: (data) => api.post('/ai/extract', data),
  priority: (data) => api.post('/ai/priority', data),
  recommend: (data) => api.post('/ai/recommend', data),
  summarize: (data) => api.post('/ai/summarize', data),
  duplicateCheck: (data) => api.post('/ai/duplicate-check', data)
};
