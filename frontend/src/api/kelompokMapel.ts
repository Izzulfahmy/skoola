// file: frontend/src/api/kelompokMapel.ts
import apiClient from './axiosInstance';
import type { KelompokMataPelajaran, UpsertKelompokMataPelajaranInput } from '../types';

export const getAllKelompokMapel = async (): Promise<KelompokMataPelajaran[]> => {
  try {
    // Arahkan ke endpoint baru yang mengembalikan kelompok beserta mapelnya
    const response = await apiClient.get('/mata-pelajaran');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createKelompokMapel = async (data: UpsertKelompokMataPelajaranInput): Promise<KelompokMataPelajaran> => {
	try {
	  const response = await apiClient.post('/kelompok-mapel', data);
	  return response.data;
	} catch (error) {
	  throw error;
	}
};
  
export const updateKelompokMapel = async (id: number, data: UpsertKelompokMataPelajaranInput): Promise<void> => {
	try {
	  await apiClient.put(`/kelompok-mapel/${id}`, data);
	} catch (error) {
	  throw error;
	}
};
  
export const deleteKelompokMapel = async (id: number): Promise<void> => {
	try {
	  await apiClient.delete(`/kelompok-mapel/${id}`);
	} catch (error) {
	  throw error;
	}
};