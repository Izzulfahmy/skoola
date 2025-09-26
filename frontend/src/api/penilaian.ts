// file: frontend/src/api/penilaian.ts
import apiClient from './axiosInstance';
import type { FullPenilaianData, MateriPembelajaran, BulkUpsertNilaiInput } from '../types';

interface PenilaianLengkapResponse {
  penilaian: FullPenilaianData;
  materi: MateriPembelajaran[];
}

export const getPenilaianLengkap = async (kelasId: string, pengajarKelasId: string): Promise<PenilaianLengkapResponse> => {
  try {
    const response = await apiClient.get(`/penilaian/kelas/${kelasId}/pengajar/${pengajarKelasId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const upsertNilaiBulk = async (data: BulkUpsertNilaiInput): Promise<void> => {
  try {
    await apiClient.post('/penilaian/batch-upsert', data);
  } catch (error) {
    throw error;
  }
};