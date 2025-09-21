// file: frontend/src/api/foundations.ts
import apiClient from './axiosInstance';
// --- PERBAIKAN DI SINI: Menambahkan 'export' pada tipe Foundation ---
import type { Foundation } from '../types';

// Tipe ini juga perlu diekspor jika akan digunakan di tempat lain
export interface UpsertFoundationInput {
  nama_yayasan: string;
}

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