// file: frontend/src/api/presensi.ts
import apiClient from './axiosInstance';
import type { PresensiSiswa, UpsertPresensiInput } from '../types';

// Tipe baru untuk payload delete
interface DeletePresensiInput {
  tanggal: string; // YYYY-MM-DD
  anggota_kelas_ids: string[];
}

/**
 * Mengambil data rekap presensi untuk satu kelas dalam satu bulan.
 * @param kelasId ID dari kelas/rombel.
 * @param year Tahun yang diminta.
 * @param month Bulan yang diminta (1-12).
 */
export const getPresensiBulanan = async (kelasId: string, year: number, month: number): Promise<PresensiSiswa[]> => {
  try {
    const response = await apiClient.get(`/presensi/kelas/${kelasId}`, {
      params: { year, month },
    });
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Menyimpan data presensi untuk satu kelas pada satu tanggal tertentu.
 * @param data Data presensi yang akan disimpan.
 */
export const upsertPresensi = async (data: UpsertPresensiInput): Promise<void> => {
  try {
    await apiClient.post('/presensi', data);
  } catch (error) {
    throw error;
  }
};

/**
 * Menghapus data presensi untuk satu atau lebih siswa pada tanggal tertentu.
 * @param data Payload berisi tanggal dan daftar ID anggota kelas.
 */
export const deletePresensi = async (data: DeletePresensiInput): Promise<void> => {
  try {
    // Menggunakan opsi `data` untuk mengirim body dengan method DELETE
    await apiClient.delete('/presensi', { data });
  } catch (error) {
    throw error;
  }
};