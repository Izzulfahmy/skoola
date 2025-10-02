// file: frontend/src/api/pembelajaran.ts
import apiClient from './axiosInstance';
import type {
  MateriPembelajaran,
  TujuanPembelajaran,
  UpsertMateriInput,
  UpsertTujuanInput,
  UpdateUrutanInput,
  RencanaPembelajaranItem,
  Ujian,
  UpsertUjianInput,
  UpdateRencanaUrutanInput,
  // --- Import Tipe Baru ---
  CreateBulkUjianPayload, 
  BulkUjianResult, 
  // -------------------------
} from '../types';

// --- API UNTUK RENCANA GABUNGAN ---
export const getAllRencanaPembelajaran = async (pengajarKelasID: string): Promise<RencanaPembelajaranItem[]> => {
  try {
    const response = await apiClient.get(`/pembelajaran/rencana/by-pengajar/${pengajarKelasID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRencanaUrutan = async (data: UpdateRencanaUrutanInput): Promise<void> => {
    try {
      await apiClient.put('/pembelajaran/rencana/reorder', data);
    } catch (error) {
      throw error;
    }
};

// --- API UNTUK MATERI PEMBELAJARAN (TIDAK BERUBAH) ---
export const createMateri = async (data: UpsertMateriInput): Promise<MateriPembelajaran> => {
  try {
    const response = await apiClient.post('/pembelajaran/materi', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMateri = async (materiID: number, data: UpsertMateriInput): Promise<void> => {
  try {
    await apiClient.put(`/pembelajaran/materi/${materiID}`, data);
  } catch (error) {
    throw error;
  }
};

export const deleteMateri = async (materiID: number): Promise<void> => {
  try {
    await apiClient.delete(`/pembelajaran/materi/${materiID}`);
  } catch (error) {
    throw error;
  }
};

// --- API UNTUK UJIAN ---
export const createUjian = async (data: UpsertUjianInput): Promise<Ujian> => {
  try {
    const response = await apiClient.post('/pembelajaran/ujian', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUjian = async (ujianID: number, data: UpsertUjianInput): Promise<void> => {
  try {
    await apiClient.put(`/pembelajaran/ujian/${ujianID}`, data);
  } catch (error) {
    throw error;
  }
};

export const deleteUjian = async (ujianID: number): Promise<void> => {
  try {
    await apiClient.delete(`/pembelajaran/ujian/${ujianID}`);
  } catch (error) {
    throw error;
  }
};

// --- API UNTUK BULK UJIAN ---
export const createBulkUjian = async (payload: CreateBulkUjianPayload): Promise<BulkUjianResult> => {
  try {
    const response = await apiClient.post('/pembelajaran/ujian/bulk', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// ----------------------------


// --- API UNTUK TUJUAN PEMBELAJARAN ---
export const createTujuan = async (data: UpsertTujuanInput): Promise<TujuanPembelajaran> => {
    try {
      const response = await apiClient.post('/pembelajaran/tujuan', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const updateTujuan = async (tujuanID: number, data: UpsertTujuanInput): Promise<void> => {
    try {
      await apiClient.put(`/pembelajaran/tujuan/${tujuanID}`, data);
    } catch (error) {
      throw error;
    }
  };
  
  export const deleteTujuan = async (tujuanID: number): Promise<void> => {
    try {
      await apiClient.delete(`/pembelajaran/tujuan/${tujuanID}`);
    } catch (error) {
      throw error;
    }
  };

export const updateUrutanTujuan = async (data: UpdateUrutanInput): Promise<void> => {
    try {
        await apiClient.put('/pembelajaran/tujuan/reorder', data);
    } catch (error) {
        throw error;
    }
};