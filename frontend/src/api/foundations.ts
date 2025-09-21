// file: frontend/src/api/foundations.ts
import apiClient from './axiosInstance';
import type { Foundation } from '../types';

export interface UpsertFoundationInput {
  nama_yayasan: string;
}

// --- FUNGSI BARU DI SINI ---
export const getFoundationById = async (id: string): Promise<Foundation> => {
  try {
    const response = await apiClient.get(`/foundations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFoundations = async (): Promise<Foundation[]> => {
  try {
    const response = await apiClient.get('/foundations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createFoundation = async (data: UpsertFoundationInput): Promise<Foundation> => {
  try {
    const response = await apiClient.post('/foundations', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFoundation = async (id: string, data: UpsertFoundationInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/foundations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFoundation = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/foundations/${id}`);
  } catch (error) {
    throw error;
  }
};