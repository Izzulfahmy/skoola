// file: frontend/src/api/ekstrakurikuler.ts
import apiClient from './axiosInstance';
import type { Ekstrakurikuler, UpsertEkstrakurikulerInput } from '../types';

export const getAllEkstrakurikuler = async (): Promise<Ekstrakurikuler[]> => {
  try {
    const response = await apiClient.get('/ekstrakurikuler');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEkstrakurikuler = async (data: UpsertEkstrakurikulerInput): Promise<Ekstrakurikuler> => {
  try {
    const response = await apiClient.post('/ekstrakurikuler', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEkstrakurikuler = async (id: number, data: UpsertEkstrakurikulerInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/ekstrakurikuler/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEkstrakurikuler = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/ekstrakurikuler/${id}`);
  } catch (error) {
    throw error;
  }
};