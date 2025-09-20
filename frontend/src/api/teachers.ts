// file: src/api/teachers.ts
import apiClient from './axiosInstance';
// --- PERBAIKAN DI SINI ---
import type { Teacher, CreateTeacherInput, UpdateTeacherInput, RiwayatKepegawaian, CreateHistoryInput, UpdateHistoryInput } from '../types';

// Tipe 'UpdateHistoryInput' dihapus dari sini

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await apiClient.get('/teachers'); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminDetails = async (): Promise<Teacher> => {
  try {
    const response = await apiClient.get('/teachers/admin/details');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherHistory = async (teacherId: string): Promise<RiwayatKepegawaian[]> => {
  try {
    const response = await apiClient.get(`/teachers/history/${teacherId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTeacherHistory = async (teacherId: string, historyData: CreateHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.post(`/teachers/history/${teacherId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacherHistory = async (historyId: string, historyData: UpdateHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/teachers/history/${historyId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacherHistory = async (historyId: string): Promise<void> => {
  try {
    await apiClient.delete(`/teachers/history/${historyId}`);
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