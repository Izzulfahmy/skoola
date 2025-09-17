// file: src/api/students.ts
import apiClient from './axiosInstance';
import type { Student, CreateStudentInput, UpdateStudentInput } from '../types';

// Ingat: tenantId dan token otentikasi sudah di-handle secara otomatis
// oleh AuthMiddleware di backend dan axios interceptor di frontend.

export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await apiClient.get('/students');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStudent = async (studentData: CreateStudentInput): Promise<Student> => {
  try {
    const response = await apiClient.post('/students', studentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: UpdateStudentInput): Promise<Student> => {
  try {
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/students/${id}`);
  } catch (error) {
    throw error;
  }
};