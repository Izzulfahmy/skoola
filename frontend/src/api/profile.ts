// file: frontend/src/api/profile.ts
import apiClient from './axiosInstance';
import type { SchoolProfile } from '../types';

/**
 * Mengambil data profil sekolah untuk admin yang sedang login.
 * Token otentikasi akan otomatis dikirim oleh interceptor axios.
 */
export const getSchoolProfile = async (): Promise<SchoolProfile> => {
  try {
    const response = await apiClient.get('/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Memperbarui data profil sekolah.
 * @param profileData Data profil sekolah yang baru.
 */
export const updateSchoolProfile = async (profileData: SchoolProfile): Promise<any> => {
  try {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};