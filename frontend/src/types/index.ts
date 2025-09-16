// file: src/types/index.ts
export interface LoginInput {
  email: string;
  password: string;
}
// TAMBAHKAN INTERFACE DI BAWAH INI
export interface Teacher {
  id: string;
  user_id: string;
  nama_lengkap: string;
  nip?: string; // Tanda tanya (?) menandakan properti ini opsional
  alamat?: string;
  nomor_telepon?: string;
  created_at: string;
  updated_at: string;
}
export interface CreateTeacherInput {
  email: string;
  password?: string; // Password opsional di form, tapi wajib di backend
  nama_lengkap: string;
  nip?: string;
  alamat?: string;
  nomor_telepon?: string;
}