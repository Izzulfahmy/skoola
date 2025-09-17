// file: src/api/teachers.ts
import apiClient from './axiosInstance';
// 1. Perbarui impor tipe untuk menyertakan UpdateTeacherInput
import type { Teacher, CreateTeacherInput, UpdateTeacherInput } from '../types';

// Fungsi getTeachers tetap sama
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await apiClient.get('/teachers'); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi createTeacher tetap sama
export const createTeacher = async (
  teacherData: CreateTeacherInput,
  tenantId: string
): Promise<Teacher> => {
  try {
    const response = await apiClient.post('/teachers', teacherData, {
      headers: {
        'X-Tenant-ID': tenantId, // Endpoint create mungkin masih memerlukannya sebelum user login
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. TAMBAHKAN FUNGSI UNTUK MEMPERBARUI DATA GURU
export const updateTeacher = async (
  id: string,
  teacherData: UpdateTeacherInput
): Promise<Teacher> => {
  try {
    // tenantId tidak perlu dikirim karena sudah ada di token JWT
    const response = await apiClient.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. TAMBAHKAN FUNGSI UNTUK MENGHAPUS DATA GURU
export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    // tenantId juga tidak perlu dikirim di sini
    await apiClient.delete(`/teachers/${id}`);
  } catch (error) {
    throw error;
  }
};