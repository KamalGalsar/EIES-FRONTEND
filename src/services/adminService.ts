// Frontend/src/services/adminService.ts

import apiClient from './apiClient';
import type { AdminUser } from '../types/admin';

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get('/admin/users');
  return response.data;
};