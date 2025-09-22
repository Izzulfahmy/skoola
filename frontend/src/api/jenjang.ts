// file: frontend/src/api/jenjang.ts
import apiClient from './axiosInstance';
import type { JenjangPendidikan, UpsertJenjangInput } from '../types';

export const getAllJenjang = async (): Promise<JenjangPendidikan[]> => {
  try {
    const response = await apiClient.get('/jenjang');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJenjang = async (data: UpsertJenjangInput): Promise<JenjangPendidikan> => {
  try {
    const response = await apiClient.post('/jenjang', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJenjang = async (id: number, data: UpsertJenjangInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/jenjang/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJenjang = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/jenjang/${id}`);
  } catch (error) {
    throw error;
  }
};