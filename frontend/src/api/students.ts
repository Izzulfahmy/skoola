// file: src/api/students.ts
import apiClient from './axiosInstance';
import type { Student, CreateStudentInput, UpdateStudentInput, RiwayatAkademik, UpsertAcademicHistoryInput } from '../types';

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

// --- FUNGSI BARU UNTUK RIWAYAT AKADEMIK ---

export const getStudentHistory = async (studentId: string): Promise<RiwayatAkademik[]> => {
  try {
    const response = await apiClient.get(`/students/history/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStudentHistory = async (studentId: string, historyData: UpsertAcademicHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.post(`/students/history/${studentId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentHistory = async (historyId: string, historyData: UpsertAcademicHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/students/history/${historyId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudentHistory = async (historyId: string): Promise<void> => {
  try {
    await apiClient.delete(`/students/history/${historyId}`);
  } catch (error) {
    throw error;
  }
};