// file: frontend/src/api/ekstrakurikuler.ts
import apiClient from './axiosInstance';
import type {
  Ekstrakurikuler,
  UpsertEkstrakurikulerInput,
  EkstrakurikulerSesi,
  UpdateSesiDetailInput,
  EkstrakurikulerAnggota,
  AddAnggotaInput
} from '../types';

// --- Master Ekstrakurikuler (dari Pengaturan) ---
// FIX: Tambahkan parameter tahunAjaranId dan kirimkan ke backend
export const getAllEkstrakurikuler = async (tahunAjaranId: string): Promise<Ekstrakurikuler[]> => {
  const response = await apiClient.get('/ekstrakurikuler', {
    params: { tahunAjaranId } 
  });
  return response.data;
};

export const createEkstrakurikuler = async (data: UpsertEkstrakurikulerInput): Promise<Ekstrakurikuler> => {
  const response = await apiClient.post('/ekstrakurikuler', data);
  return response.data;
};

export const updateEkstrakurikuler = async (id: number, data: UpsertEkstrakurikulerInput): Promise<any> => {
  const response = await apiClient.put(`/ekstrakurikuler/${id}`, data);
  return response.data;
};

export const deleteEkstrakurikuler = async (id: number): Promise<void> => {
  await apiClient.delete(`/ekstrakurikuler/${id}`);
};


// --- API BARU UNTUK MANAJEMEN SESI & ANGGOTA (Tetap sama) ---

export const getOrCreateSesi = async (ekskulId: number, tahunAjaranId: string): Promise<EkstrakurikulerSesi> => {
  const response = await apiClient.get('/ekstrakurikuler/sesi', {
    params: { ekskulId, tahunAjaranId },
  });
  return response.data;
};

export const updateSesiDetail = async (sesiId: number, data: UpdateSesiDetailInput): Promise<void> => {
  await apiClient.put(`/ekstrakurikuler/sesi/${sesiId}`, data);
};

export const getAnggotaBySesiId = async (sesiId: number): Promise<EkstrakurikulerAnggota[]> => {
  const response = await apiClient.get(`/ekstrakurikuler/sesi/${sesiId}/anggota`);
  return response.data || [];
};

export const addAnggotaToSesi = async (sesiId: number, data: AddAnggotaInput): Promise<void> => {
  await apiClient.post(`/ekstrakurikuler/sesi/${sesiId}/anggota`, data);
};

export const removeAnggota = async (anggotaId: number): Promise<void> => {
  await apiClient.delete(`/ekstrakurikuler/anggota/${anggotaId}`);
};