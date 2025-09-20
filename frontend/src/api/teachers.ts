// file: src/api/teachers.ts
import apiClient from './axiosInstance';
import type { Teacher, CreateTeacherInput, UpdateTeacherInput } from '../types';

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await apiClient.get('/teachers'); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- FUNGSI BARU DI SINI ---
// Fungsi untuk mengambil detail data admin sekolah yang sedang login
export const getAdminDetails = async (): Promise<Teacher> => {
  try {
    const response = await apiClient.get('/teachers/admin/details');
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createTeacher = async (
  teacherData: CreateTeacherInput
): Promise<Teacher> => {
  try {
    const response = await apiClient.post('/teachers', teacherData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (
  id: string,
  teacherData: UpdateTeacherInput
): Promise<Teacher> => {
  try {
    const response = await apiClient.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/teachers/${id}`);
  } catch (error) {
    throw error;
  }
};