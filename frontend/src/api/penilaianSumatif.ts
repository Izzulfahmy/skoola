// file: frontend/src/api/penilaianSumatif.ts
import apiClient from './axiosInstance';
import type { PenilaianSumatif, UpsertPenilaianSumatifInput } from '../types';

export const getPenilaianByTP = async (tpId: number): Promise<PenilaianSumatif[]> => {
    try {
        const response = await apiClient.get('/penilaian-sumatif', {
            params: { tp_id: tpId },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createPenilaian = async (data: UpsertPenilaianSumatifInput): Promise<PenilaianSumatif> => {
    try {
        const response = await apiClient.post('/penilaian-sumatif', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePenilaian = async (id: string, data: UpsertPenilaianSumatifInput): Promise<void> => {
    try {
        await apiClient.put(`/penilaian-sumatif/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deletePenilaian = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/penilaian-sumatif/${id}`);
    } catch (error) {
        throw error;
    }
};