// file: frontend/src/api/rombel.ts
import apiClient from './axiosInstance';
import type {
  Kelas,
  AnggotaKelas,
  PengajarKelas,
  UpsertKelasInput,
  AddAnggotaKelasInput,
  UpsertPengajarKelasInput,
} from '../types';

// --- API untuk Kelas (Rombel) ---

export const getAllKelasByTahunAjaran = async (tahunAjaranId: string): Promise<Kelas[]> => {
  try {
    const response = await apiClient.get('/rombel', {
      params: { tahun_ajaran_id: tahunAjaranId },
    });
    return response.data || []; // <-- PERBAIKAN DI SINI
  } catch (error) {
    throw error;
  }
};

export const getKelasById = async (kelasId: string): Promise<Kelas> => {
    try {
        const response = await apiClient.get(`/rombel/${kelasId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createKelas = async (data: UpsertKelasInput): Promise<Kelas> => {
  try {
    const response = await apiClient.post('/rombel', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKelas = async (kelasId: string, data: UpsertKelasInput): Promise<Kelas> => {
  try {
    const response = await apiClient.put(`/rombel/${kelasId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteKelas = async (kelasId: string): Promise<void> => {
  try {
    await apiClient.delete(`/rombel/${kelasId}`);
  } catch (error) {
    throw error;
  }
};


// --- API untuk Anggota Kelas (Siswa) ---

export const getAllAnggotaByKelas = async (kelasId: string): Promise<AnggotaKelas[]> => {
  try {
    const response = await apiClient.get(`/rombel/${kelasId}/anggota`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAnggotaKelas = async (kelasId: string, data: AddAnggotaKelasInput): Promise<void> => {
  try {
    await apiClient.post(`/rombel/${kelasId}/anggota`, data);
  } catch (error) {
    throw error;
  }
};

export const removeAnggotaKelas = async (anggotaId: string): Promise<void> => {
  try {
    await apiClient.delete(`/rombel/anggota/${anggotaId}`);
  } catch (error) {
    throw error;
  }
};

export const updateUrutanAnggota = async (orderedIds: string[]): Promise<void> => {
	try {
	  await apiClient.put('/rombel/anggota/reorder', { ordered_ids: orderedIds });
	} catch (error) {
	  throw error;
	}
};


// --- API untuk Pengajar Kelas (Guru) ---

export const getAllPengajarByKelas = async (kelasId: string): Promise<PengajarKelas[]> => {
  try {
    const response = await apiClient.get(`/rombel/${kelasId}/pengajar`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPengajarKelas = async (kelasId: string, data: UpsertPengajarKelasInput): Promise<PengajarKelas> => {
  try {
    const response = await apiClient.post(`/rombel/${kelasId}/pengajar`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removePengajarKelas = async (pengajarId: string): Promise<void> => {
  try {
    await apiClient.delete(`/rombel/pengajar/${pengajarId}`);
  } catch (error) {
    throw error;
  }
};