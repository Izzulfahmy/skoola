// file: frontend/src/api/tingkatan.ts
import apiClient from './axiosInstance';
import type { Tingkatan, UpsertTingkatanInput } from '../types';

export const getAllTingkatan = async (): Promise<Tingkatan[]> => {
  try {
    const response = await apiClient.get('/tingkatan');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTingkatan = async (data: UpsertTingkatanInput): Promise<Tingkatan> => {
  try {
    const response = await apiClient.post('/tingkatan', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTingkatan = async (id: number, data: UpsertTingkatanInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/tingkatan/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTingkatan = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/tingkatan/${id}`);
  } catch (error) {
    throw error;
  }
};