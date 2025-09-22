// file: frontend/src/api/naungan.ts
import apiClient from './axiosInstance';
import type { Naungan } from '../types';

export interface UpsertNaunganInput {
  nama_naungan: string;
}

export const getNaunganById = async (id: string): Promise<Naungan> => {
  try {
    const response = await apiClient.get(`/naungan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllNaungan = async (): Promise<Naungan[]> => {
  try {
    const response = await apiClient.get('/naungan');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createNaungan = async (data: UpsertNaunganInput): Promise<Naungan> => {
  try {
    const response = await apiClient.post('/naungan', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNaungan = async (id: string, data: UpsertNaunganInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/naungan/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNaungan = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/naungan/${id}`);
  } catch (error) {
    throw error;
  }
};