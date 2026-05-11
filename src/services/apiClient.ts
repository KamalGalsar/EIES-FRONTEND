// Frontend/src/services/apiClient.ts

import axios from 'axios';
 
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:5268/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
export default apiClient;