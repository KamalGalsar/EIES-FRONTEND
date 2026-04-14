import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5268/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if you're using one
api.interceptors.request.use((config) => {
  // Use 'accessToken' (matching AuthContext)
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userApi = {
  getAll: () => api.get('/admin/users'),
  getCurrent: () => api.get('/admin/me'),
  getAvailableUsers: () => api.get('/admin/available-users'), // new
  create: (data: { email: string; role: string; scope: string }) => api.post('/admin/users', data), // changed
  update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

export default api;