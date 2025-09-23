// file: frontend/src/api/mataPelajaran.ts
import apiClient from './axiosInstance';
import type { MataPelajaran, UpsertMataPelajaranInput } from '../types';

export const getAllMataPelajaran = async (): Promise<MataPelajaran[]> => {
  try {
    const response = await apiClient.get('/mata-pelajaran');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMataPelajaran = async (data: UpsertMataPelajaranInput): Promise<MataPelajaran> => {
  try {
    const response = await apiClient.post('/mata-pelajaran', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMataPelajaran = async (id: string, data: UpsertMataPelajaranInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/mata-pelajaran/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMataPelajaran = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/mata-pelajaran/${id}`);
  } catch (error) {
    throw error;
  }
};