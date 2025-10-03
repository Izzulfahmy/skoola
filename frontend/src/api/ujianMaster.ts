// file: frontend/src/api/ujianMaster.ts

// --- PERBAIKAN FINAL: Ganti cara import axiosInstance ---
import axiosInstance from './axiosInstance';
import type { UjianMaster, UpsertUjianMasterInput, CreateBulkUjianInput, UjianDetail } from '../types';

// =================================================================================
// UJIAN MASTER (PAKET UJIAN)
// =================================================================================

// GET /ujian-master/by-ta/:tahun_ajaran_id
export const getAllUjianMaster = async (tahunAjaranId: string): Promise<UjianMaster[]> => {
  const response = await axiosInstance.get(`/ujian-master/by-ta/${tahunAjaranId}`);
  return response.data;
};

// GET /ujian-master/:id
export const getUjianMasterById = async (id: string): Promise<UjianDetail> => {
    const response = await axiosInstance.get(`/ujian-master/${id}`);
    return response.data;
};

// POST /ujian-master
export const createUjianMaster = async (data: UpsertUjianMasterInput): Promise<UjianMaster> => {
  const response = await axiosInstance.post('/ujian-master', data);
  return response.data;
};

// DELETE /ujian-master/:id
export const deleteUjianMaster = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/ujian-master/${id}`);
};

// =================================================================================
// UJIAN DETAIL (PENUGASAN KE KELAS)
// =================================================================================

// POST /ujian-master/assign-bulk
export const assignUjianToKelas = async (data: CreateBulkUjianInput): Promise<any> => {
    const response = await axiosInstance.post('/ujian-master/assign-bulk', data);
    return response.data;
};