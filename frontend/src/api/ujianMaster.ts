// frontend/src/api/ujianMaster.ts
import apiClient from './axiosInstance';
import type {
  UjianMaster,
  UpsertUjianMasterInput,
  UjianDetail,
  GroupedPesertaUjian,
} from '../types';

interface AssignKelasPayload {
  pengajar_kelas_ids: string[];
}

// --- FUNGSI BARU ---
interface AddPesertaFromKelasPayload {
  kelas_id: string;
}

export const addPesertaFromKelas = async (
  ujianMasterId: string,
  data: AddPesertaFromKelasPayload
): Promise<any> => {
  console.log('🟢 API CALL: addPesertaFromKelas', { ujianMasterId, data });
  const response = await apiClient.post(`/ujian-master/${ujianMasterId}/peserta`, data);
  console.log('✅ addPesertaFromKelas response:', response.data);
  return response.data;
};

/**
 * Menghapus semua peserta ujian yang terkait dengan Ujian Master ID dan Kelas ID tertentu.
 * DELETE /ujian-master/:ujianMasterId/peserta/kelas/:kelasId
 */
export const deletePesertaFromKelas = async (
  ujianMasterId: string,
  kelasId: string
): Promise<any> => {
  const url = `/ujian-master/${ujianMasterId}/peserta/kelas/${kelasId}`;
  console.log('🔴 API CALL: deletePesertaFromKelas');
  console.log('   URL:', url);
  console.log('   Method: DELETE');
  console.log('   ujianMasterId:', ujianMasterId);
  console.log('   kelasId:', kelasId);
  
  try {
    const response = await apiClient.delete(url);
    console.log('✅ deletePesertaFromKelas SUCCESS response:', response);
    console.log('✅ deletePesertaFromKelas SUCCESS data:', response.data);
    return response.data;
  } catch (error: any) { // Fix TypeScript error
    console.error('❌ deletePesertaFromKelas ERROR:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    throw error;
  }
};
// --------------------

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

// GET /ujian-master/:id/peserta
export const getPesertaUjian = async (
  ujianMasterId: string
): Promise<GroupedPesertaUjian> => {
  const response = await apiClient.get(`/ujian-master/${ujianMasterId}/peserta`);
  return response.data;
};