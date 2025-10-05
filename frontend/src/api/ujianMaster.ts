// frontend/src/api/ujianMaster.ts
import apiClient from './axiosInstance';
import type {
  UjianMaster,
  UpsertUjianMasterInput,
  UjianDetail,
  GroupedPesertaUjian, // <-- Tambahkan tipe baru
} from '../types';

// Tipe untuk payload pendaftaran kelas
interface AssignKelasPayload {
  pengajar_kelas_ids: string[];
}

// GET /ujian-master/tahun-ajaran/:tahun_ajaran_id
export const getAllUjianMaster = async (tahunAjaranId: string): Promise<UjianMaster[]> => {
  const response = await apiClient.get(`/ujian-master/tahun-ajaran/${tahunAjaranId}`);
  return response.data;
};

// GET /ujian-master/:id
export const getUjianMasterById = async (id: string): Promise<UjianDetail> => {
  const response = await apiClient.get(`/ujian-master/${id}`);
  return response.data;
};

// POST /ujian-master
export const createUjianMaster = async (data: UpsertUjianMasterInput): Promise<UjianMaster> => {
  const response = await apiClient.post('/ujian-master', data);
  return response.data;
};

// PUT /ujian-master/:id
export const updateUjianMaster = async (
  id: string,
  data: UpsertUjianMasterInput
): Promise<UjianMaster> => {
  const response = await apiClient.put(`/ujian-master/${id}`, data);
  return response.data;
};

// DELETE /ujian-master/:id
export const deleteUjianMaster = async (id: string): Promise<void> => {
  await apiClient.delete(`/ujian-master/${id}`);
};

// POST /ujian-master/:id/assign-kelas
export const assignUjianToKelas = async (
  ujianMasterId: string,
  data: AssignKelasPayload
): Promise<any> => {
  const response = await apiClient.post(`/ujian-master/${ujianMasterId}/assign-kelas`, data);
  return response.data;
};

// GET /ujian-master/:id/peserta  <-- FUNGSI BARU
export const getPesertaUjian = async (
  ujianMasterId: string
): Promise<GroupedPesertaUjian> => {
  const response = await apiClient.get(`/ujian-master/${ujianMasterId}/peserta`);
  return response.data;
};