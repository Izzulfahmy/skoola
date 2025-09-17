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

export type UpdateTeacherInput = Omit<CreateTeacherInput, 'password' | 'email'>;

// --- TIPE-TIPE BARU UNTUK SISWA DITAMBAHKAN DI BAWAH INI ---

export interface Student {
  id: string;
  nama_lengkap: string;
  nis?: string;
  nisn?: string;
  alamat?: string;
  nama_wali?: string;
  nomor_telepon_wali?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentInput {
  nama_lengkap: string;
  nis?: string;
  nisn?: string;
  alamat?: string;
  nama_wali?: string;
  nomor_telepon_wali?: string;
}

export type UpdateStudentInput = CreateStudentInput;