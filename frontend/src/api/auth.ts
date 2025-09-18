// file: frontend/src/api/auth.ts
import apiClient from './axiosInstance';
import type{ LoginInput } from '../types';
import type { AxiosRequestConfig } from 'axios';

// Fungsi untuk melakukan login
export const loginUser = async (credentials: LoginInput, tenantId: string) => {
  try {
    // --- PERUBAHAN DI SINI ---
    const config: AxiosRequestConfig = {
      headers: {},
    };

    // Hanya tambahkan header X-Tenant-ID jika tenantId tidak kosong
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    // -------------------------

    const response = await apiClient.post('/login', credentials, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};