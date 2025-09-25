// file: frontend/src/api/jenisUjian.ts
import apiClient from './axiosInstance';
import type { JenisUjian, UpsertJenisUjianInput } from '../types';

export const getAllJenisUjian = async (): Promise<JenisUjian[]> => {
  try {
    const response = await apiClient.get('/jenis-ujian');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJenisUjian = async (data: UpsertJenisUjianInput): Promise<JenisUjian> => {
  try {
    const response = await apiClient.post('/jenis-ujian', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJenisUjian = async (id: number, data: UpsertJenisUjianInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/jenis-ujian/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJenisUjian = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/jenis-ujian/${id}`);
  } catch (error) {
    throw error;
  }
};