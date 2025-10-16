// file: frontend/src/api/paperSize.ts
import apiClient from './axiosInstance';
import type { PaperSize, UpsertPaperSizeInput } from '../types';

export const getAllPaperSize = async (): Promise<PaperSize[]> => {
  try {
    const response = await apiClient.get('/paper-size');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPaperSize = async (data: UpsertPaperSizeInput): Promise<PaperSize> => {
  try {
    const response = await apiClient.post('/paper-size', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePaperSize = async (id: string, data: UpsertPaperSizeInput): Promise<void> => {
  try {
    await apiClient.put(`/paper-size/${id}`, data);
  } catch (error) {
    throw error;
  }
};

export const deletePaperSize = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/paper-size/${id}`);
  } catch (error) {
    throw error;
  }
};