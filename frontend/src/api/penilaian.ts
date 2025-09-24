// file: frontend/src/api/penilaian.ts
import apiClient from './axiosInstance';
import type { FullPenilaianData, PenilaianInput } from '../types';

export const getPenilaian = async (kelasId: string, tpIds: number[]): Promise<FullPenilaianData> => {
  try {
    const response = await apiClient.get('/penilaian', {
      params: {
        kelas_id: kelasId,
        tp_ids: tpIds.join(','),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const upsertNilai = async (penilaian: PenilaianInput[]): Promise<void> => {
  try {
    await apiClient.post('/penilaian', { penilaian });
  } catch (error) {
    throw error;
  }
};