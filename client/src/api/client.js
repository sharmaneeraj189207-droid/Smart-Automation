import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor: add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response payload or error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const errors = error.response?.data?.errors || [];
    
    // Auto logout on 401 token expiry
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('flowpilot_token');
      localStorage.removeItem('flowpilot_user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default api;
