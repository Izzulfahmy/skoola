// file: frontend/src/api/prestasi.ts
import apiClient from './axiosInstance';
import type { Prestasi, UpsertPrestasiInput } from '../types';

export const getPrestasiByTahunAjaran = async (tahunAjaranId: string): Promise<Prestasi[]> => {
  try {
    const response = await apiClient.get('/prestasi', {
      params: { tahun_ajaran_id: tahunAjaranId },
    });
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

export const createPrestasi = async (data: UpsertPrestasiInput): Promise<Prestasi> => {
  try {
    const response = await apiClient.post('/prestasi', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePrestasi = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/prestasi/${id}`);
  } catch (error) {
    throw error;
  }
};