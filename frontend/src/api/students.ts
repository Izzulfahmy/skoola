// file: src/api/students.ts
import apiClient from './axiosInstance';
import type { Student, CreateStudentInput, UpdateStudentInput, RiwayatAkademik, UpsertAcademicHistoryInput, ImportResult, StudentSimple } from '../types';

export const downloadStudentTemplate = async (): Promise<void> => {
  try {
    const response = await apiClient.get('/students/import/template', {
    responseType: 'blob', // Penting untuk menangani file
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_siswa.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};
  
export const uploadStudentsFile = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAvailableStudents = async (tahunAjaranId: string): Promise<Student[]> => {
  try {
    const response = await apiClient.get('/students/available', {
      params: { tahun_ajaran_id: tahunAjaranId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await apiClient.get('/students');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStudent = async (studentData: CreateStudentInput): Promise<Student> => {
  try {
    const response = await apiClient.post('/students', studentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: UpdateStudentInput): Promise<Student> => {
  try {
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/students/${id}`);
  } catch (error) {
    throw error;
  }
};

// --- FUNGSI RIWAYAT AKADEMIK (TETAP SAMA) ---

export const getStudentHistory = async (studentId: string): Promise<RiwayatAkademik[]> => {
  try {
    const response = await apiClient.get(`/students/history/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStudentHistory = async (studentId: string, historyData: UpsertAcademicHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.post(`/students/history/${studentId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentHistory = async (historyId: string, historyData: UpsertAcademicHistoryInput): Promise<any> => {
  try {
    const response = await apiClient.put(`/students/history/${historyId}`, historyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudentHistory = async (historyId: string): Promise<void> => {
  try {
    await apiClient.delete(`/students/history/${historyId}`);
  } catch (error) {
    throw error;
  }
};

// --- PERUBAHAN: GANTI FUNGSI LAMA DENGAN VERSI BARU INI ---
export const getStudentsByRombel = async (rombelId: string): Promise<StudentSimple[]> => {
  try {
    // Memanggil endpoint anggota rombel
    const response = await apiClient.get(`/rombel/${rombelId}/anggota`);
    // Memetakan data agar sesuai dengan tipe StudentSimple
    return response.data.map((anggota: any) => ({
      id: anggota.student_id,
      nama_lengkap: anggota.nama_lengkap,
      nis: anggota.nis,
      nisn: anggota.nisn
    }));
  } catch (error) {
    throw error;
  }
};