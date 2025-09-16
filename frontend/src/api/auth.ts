// file: src/api/auth.ts
import apiClient from './axiosInstance';
import type{ LoginInput } from '../types'; // Kita akan buat tipe ini sebentar lagi

// Fungsi untuk melakukan login
export const loginUser = async (credentials: LoginInput, tenantId: string) => {
  try {
    const response = await apiClient.post('/login', credentials, {
      headers: {
        'X-Tenant-ID': tenantId, // Kirim tenant ID di header
      },
    });
    return response.data; // Responsnya akan berisi { "token": "..." }
  } catch (error) {
    // Jika terjadi error, lempar kembali agar bisa ditangkap oleh komponen
    throw error;
  }
};