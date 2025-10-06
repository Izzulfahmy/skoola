// frontend/src/api/ujianMaster.ts
import apiClient from './axiosInstance';
import type {
  UjianMaster,
  UpsertUjianMasterInput,
  UjianDetail,
  GroupedPesertaUjian,

  // --- TIPE BARU DARI index.ts ---
  RuanganUjian,
  UpsertRuanganInput,
  AlokasiRuanganUjian,
  AssignRuanganPayload,
  UpdatePesertaSeatingPayload,
  PesertaUjianDetail,
  // --- END TIPE BARU ---
} from '../types';

interface AssignKelasPayload {
  pengajar_kelas_ids: string[];
}

// --- FUNGSI PESERTA ---
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
  } catch (error: any) {
    console.error('❌ deletePesertaFromKelas ERROR:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    throw error;
  }
};

// --- FUNGSI GENERATE NOMOR UJIAN ---
interface GenerateNomorUjianPayload {
  prefix: string;
}

export const generateNomorUjian = async (
  ujianMasterId: string,
  data: GenerateNomorUjianPayload
): Promise<any> => {
  const url = `/ujian-master/${ujianMasterId}/generate-nomor-ujian`;
  console.log('⚡ API CALL: generateNomorUjian');
  console.log('   URL:', url);
  console.log('   Method: POST');
  console.log('   ujianMasterId:', ujianMasterId);
  console.log('   data:', data);
  
  try {
    const response = await apiClient.post(url, data);
    console.log('✅ generateNomorUjian SUCCESS response:', response);
    console.log('✅ generateNomorUjian SUCCESS data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ generateNomorUjian ERROR:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    throw error;
  }
};

// --- FUNGSI BARU: EXCEL/CSV EXPORT & IMPORT ---

/**
 * Exports participant data to an Excel (.xlsx) or CSV (.csv) file.
 * @param ujianMasterId The ID of the UjianMaster.
 * @param format The desired file format ('xlsx' or 'csv'). Defaults to 'xlsx'.
 * @returns A Blob object containing the file data.
 */
export const exportPesertaToExcel = async (ujianMasterId: string, format: 'xlsx' | 'csv' = 'xlsx') => {
  const response = await apiClient.get(`/ujian-master/${ujianMasterId}/export-excel?format=${format}`, {
    responseType: 'blob', // Important for downloading files
  });
  return response.data;
};

/**
 * Imports exam numbers from an Excel file and updates participant data.
 * @param ujianMasterId The ID of the UjianMaster.
 * @param file The file (Blob) to upload.
 * @returns The API response, usually containing update summary and errors.
 */
export const importPesertaFromExcel = (ujianMasterId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post(`/ujian-master/${ujianMasterId}/import-excel`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Must be set for correct file upload
    },
  });
};

// ==============================================================================
// RUANGAN MASTER CRUD API (New)
// ==============================================================================

// GET /ujian-master/ruangan
export const getAllRuanganMaster = async (): Promise<RuanganUjian[]> => {
  const response = await apiClient.get('/ujian-master/ruangan');
  return response.data;
};

// POST /ujian-master/ruangan
export const createRuanganMaster = async (data: UpsertRuanganInput): Promise<RuanganUjian> => {
  const response = await apiClient.post('/ujian-master/ruangan', data);
  return response.data;
};

// PUT /ujian-master/ruangan/{ruanganID}
export const updateRuanganMaster = async (
  ruanganID: string,
  data: UpsertRuanganInput
): Promise<RuanganUjian> => {
  const response = await apiClient.put(`/ujian-master/ruangan/${ruanganID}`, data);
  return response.data;
};

// DELETE /ujian-master/ruangan/{ruanganID}
export const deleteRuanganMaster = async (ruanganID: string): Promise<void> => {
  await apiClient.delete(`/ujian-master/ruangan/${ruanganID}`);
};

// ==============================================================================
// RUANGAN ALLOCATION & SEATING API (New)
// ==============================================================================

// POST /ujian-master/{id}/alokasi-ruangan
export const assignRuanganToUjian = async (
  ujianMasterId: string,
  data: AssignRuanganPayload
): Promise<AlokasiRuanganUjian[]> => {
  const response = await apiClient.post(`/ujian-master/${ujianMasterId}/alokasi-ruangan`, data);
  return response.data;
};

// GET /ujian-master/{id}/alokasi-ruangan
export const getAlokasiRuanganByMasterId = async (
  ujianMasterId: string
): Promise<AlokasiRuanganUjian[]> => {
  const response = await apiClient.get(`/ujian-master/${ujianMasterId}/alokasi-ruangan`);
  return response.data;
};

// DELETE /ujian-master/{id}/alokasi-ruangan/{alokasiRuanganID}
export const removeAlokasiRuangan = async (alokasiRuanganID: string): Promise<void> => {
  // Catatan: endpoint DELETE ini hanya butuh alokasiRuanganID, ID ujianMaster diabaikan di handler Go, 
  // kita menggunakan dummy-id di URL agar sesuai dengan pola routing di main.go.
  await apiClient.delete(`/ujian-master/dummy-id/alokasi-ruangan/${alokasiRuanganID}`);
};

// GET /ujian-master/{id}/alokasi-kursi
interface GetAlokasiKursiResponse {
  peserta: PesertaUjianDetail[];
  ruangan: AlokasiRuanganUjian[];
}
export const getAlokasiKursi = async (
  ujianMasterId: string
): Promise<GetAlokasiKursiResponse> => {
  const response = await apiClient.get(`/ujian-master/${ujianMasterId}/alokasi-kursi`);
  return response.data;
};

// POST /ujian-master/{id}/alokasi-kursi/manual
export const updatePesertaSeating = async (
  ujianMasterId: string,
  data: UpdatePesertaSeatingPayload
): Promise<any> => {
  // ID ujianMaster digunakan untuk routing, tapi logicnya hanya butuh data.
  const response = await apiClient.post(`/ujian-master/${ujianMasterId}/alokasi-kursi/manual`, data);
  return response.data;
};

// POST /ujian-master/{id}/alokasi-kursi/smart
export const distributeSmart = async (ujianMasterId: string): Promise<any> => {
  const response = await apiClient.post(`/ujian-master/${ujianMasterId}/alokasi-kursi/smart`);
  return response.data;
};

// --- FUNGSI UTAMA LAINNYA ---

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