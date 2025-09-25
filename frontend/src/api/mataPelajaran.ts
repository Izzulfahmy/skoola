// file: frontend/src/api/mataPelajaran.ts
import apiClient from './axiosInstance';
import type { MataPelajaran, UpsertMataPelajaranInput, UpdateUrutanMapelInput } from '../types';

export const updateUrutanMataPelajaran = async (data: UpdateUrutanMapelInput): Promise<void> => {
	try {
	  await apiClient.put('/mata-pelajaran/reorder', data);
	} catch (error) {
	  throw error;
	}
};

export const getAllMataPelajaran = async (): Promise<MataPelajaran[]> => {
  try {
    const response = await apiClient.get('/mata-pelajaran');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTaughtMataPelajaran = async (): Promise<MataPelajaran[]> => {
	try {
	  const response = await apiClient.get('/mata-pelajaran/taught');
	  return response.data;
	} catch (error) {
	  throw error;
	}
  };

export const createMataPelajaran = async (data: UpsertMataPelajaranInput): Promise<MataPelajaran> => {
  try {
    const response = await apiClient.post('/mata-pelajaran', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMataPelajaran = async (id: string, data: UpsertMataPelajaranInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/mata-pelajaran/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMataPelajaran = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/mata-pelajaran/${id}`);
  } catch (error) {
    throw error;
  }
};