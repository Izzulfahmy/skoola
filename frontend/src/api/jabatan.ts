// file: frontend/src/api/jabatan.ts
import apiClient from './axiosInstance';
import type { Jabatan, UpsertJabatanInput } from '../types';

export const getAllJabatan = async (): Promise<Jabatan[]> => {
  try {
    const response = await apiClient.get('/jabatan');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJabatan = async (data: UpsertJabatanInput): Promise<Jabatan> => {
  try {
    const response = await apiClient.post('/jabatan', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJabatan = async (id: number, data: UpsertJabatanInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/jabatan/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJabatan = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/jabatan/${id}`);
  } catch (error) {
    throw error;
  }
};