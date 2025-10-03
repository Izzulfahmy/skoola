// frontend/src/api/ujianMaster.ts

import axiosInstance from './axiosInstance';
// PERUBAHAN DI SINI: Tambahkan 'type'
import type { UjianMaster, UpsertUjianMasterInput, CreateBulkUjianInput, UjianDetail } from '../types';

// =================================================================================
// UJIAN MASTER (PAKET UJIAN)
// =================================================================================

// GET /api/ujian-master
export const getAllUjianMaster = async (): Promise<UjianMaster[]> => {
  const response = await axiosInstance.get('/api/ujian-master');
  return response.data;
};

// POST /api/ujian-master
export const createUjianMaster = async (data: UpsertUjianMasterInput): Promise<UjianMaster> => {
  const response = await axiosInstance.post('/api/ujian-master', data);
  return response.data;
};

// PUT /api/ujian-master/:id
export const updateUjianMaster = async (id: string, data: UpsertUjianMasterInput): Promise<void> => {
  await axiosInstance.put(`/api/ujian-master/${id}`, data);
};

// DELETE /api/ujian-master/:id
export const deleteUjianMaster = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/ujian-master/${id}`);
};


// =================================================================================
// UJIAN DETAIL (PENUGASAN KE KELAS)
// =================================================================================

// GET /api/ujian/:ujian_master_id (Endpoint ini perlu Anda buat di backend)
// Untuk sekarang, kita asumsikan responsenya seperti ini
interface UjianDetailResponse {
  detail: {
    nama_paket_ujian: string;
    penugasan: any[]; // Ganti 'any' dengan tipe data yang lebih spesifik nanti
  };
  availableKelas: any[]; // Tipe data untuk Cascader
}

export const getUjianDetails = async (ujianMasterId: string): Promise<UjianDetailResponse> => {
    // Anda harus mengimplementasikan endpoint ini di backend
    // Endpoint ini harus me-return detail ujian master DAN daftar kelas yang tersedia untuk ditugaskan
    const response = await axiosInstance.get(`/api/ujian/${ujianMasterId}`);
    return response.data;
};

// POST /api/pembelajaran/ujian/bulk (Endpoint refactor dari sebelumnya)
export const assignUjianToKelas = async (data: CreateBulkUjianInput): Promise<any> => {
    // Pastikan endpoint ini sesuai dengan yang ada di backend
    const response = await axiosInstance.post('/api/pembelajaran/ujian/bulk', data);
    return response.data;
};