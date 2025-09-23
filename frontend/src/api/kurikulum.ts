// file: frontend/src/api/kurikulum.ts
import apiClient from './axiosInstance';
import type { Kurikulum, UpsertKurikulumInput, Fase, UpsertFaseInput, FaseTingkatan, Tingkatan, PemetaanInput } from '../types';

// --- Kurikulum ---
export const getKurikulumByTahunAjaran = async (tahunAjaranId: string): Promise<Kurikulum[]> => {
  try {
    const response = await apiClient.get('/kurikulum', {
      params: { tahun_ajaran_id: tahunAjaranId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createKurikulum = async (data: UpsertKurikulumInput): Promise<Kurikulum> => {
    try {
      const response = await apiClient.post('/kurikulum', data);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const updateKurikulum = async (id: number, data: UpsertKurikulumInput): Promise<any> => {
    try {
        const response = await apiClient.put(`/kurikulum/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteKurikulum = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/kurikulum/${id}`);
    } catch (error) {
        throw error;
    }
};

// --- Fase ---
export const getAllFase = async (): Promise<Fase[]> => {
    try {
        const response = await apiClient.get('/kurikulum/fase');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createFase = async (data: UpsertFaseInput): Promise<Fase> => {
    try {
        const response = await apiClient.post('/kurikulum/fase', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Pemetaan & Tingkatan ---
export const getFaseTingkatan = async (tahunAjaranId: string, kurikulumId: number): Promise<FaseTingkatan[]> => {
    try {
        const response = await apiClient.get('/kurikulum/pemetaan', {
            params: { tahun_ajaran_id: tahunAjaranId, kurikulum_id: kurikulumId }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllTingkatan = async (): Promise<Tingkatan[]> => {
    try {
        const response = await apiClient.get('/kurikulum/tingkatan');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createPemetaan = async (data: PemetaanInput): Promise<any> => {
    try {
        const response = await apiClient.post('/kurikulum/pemetaan', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePemetaan = async (tahunAjaranId: string, kurikulumId: number, tingkatanId: number): Promise<void> => {
    try {
        await apiClient.delete(`/kurikulum/pemetaan/ta/${tahunAjaranId}/k/${kurikulumId}/t/${tingkatanId}`);
    } catch (error) {
        throw error;
    }
};