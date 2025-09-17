// file: src/types/index.ts
export interface LoginInput {
  email: string;
  password: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  email: string;
  nama_lengkap: string;
  nip?: string;
  alamat?: string;
  nomor_telepon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTeacherInput {
  email: string;
  password?: string;
  nama_lengkap: string;
  nip?: string;
  alamat?: string;
  nomor_telepon?: string;
}

// Hapus 'email' dari Omit
export type UpdateTeacherInput = Omit<CreateTeacherInput, 'password'>;