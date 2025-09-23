// file: frontend/src/api/tahunAjaran.ts
import apiClient from './axiosInstance';
import type { TahunAjaran, UpsertTahunAjaranInput } from '../types';

export const getAllTahunAjaran = async (): Promise<TahunAjaran[]> => {
  try {
    const response = await apiClient.get('/tahun-ajaran');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTahunAjaran = async (data: UpsertTahunAjaranInput): Promise<TahunAjaran> => {
  try {
    const response = await apiClient.post('/tahun-ajaran', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTahunAjaran = async (id: string, data: UpsertTahunAjaranInput): Promise<TahunAjaran> => {
  try {
    const response = await apiClient.put(`/tahun-ajaran/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTahunAjaran = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/tahun-ajaran/${id}`);
  } catch (error) {
    throw error;
  }
};