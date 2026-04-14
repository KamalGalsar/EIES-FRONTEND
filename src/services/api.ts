import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5268';
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userApi = {
  getAll: () => api.get('/admin/users'),
  getCurrent: () => api.get('/admin/me'),
  getAvailableUsers: () => api.get('/admin/available-users'),
  create: (data: { email: string; role: string; scope: string }) => api.post('/admin/users', data),
  update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

export default api;