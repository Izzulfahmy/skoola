// file: src/api/teachers.ts
import apiClient from './axiosInstance';
import type { Teacher, CreateTeacherInput } from '../types';

// Hapus parameter tenantId dan header X-Tenant-ID
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    // Backend akan mendapatkan tenant ID dari token JWT yang sudah dikirim otomatis
    const response = await apiClient.get('/teachers'); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTeacher = async (
  teacherData: CreateTeacherInput,
  tenantId: string
): Promise<Teacher> => {
  try {
    // Ingat, token otentikasi sudah otomatis ditambahkan oleh interceptor
    const response = await apiClient.post('/teachers', teacherData, {
      headers: {
        'X-Tenant-ID': tenantId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};