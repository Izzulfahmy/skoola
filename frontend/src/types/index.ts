// file: src/types/index.ts

export interface Tenant {
  id: string;
  nama_sekolah: string;
  schema_name: string;
  created_at: string;
  updated_at: string;
}

// --- TIPE BARU DITAMBAHKAN DI SINI ---
export interface SchoolProfile {
  id: number;
  npsn?: string;
  nama_sekolah: string;
  naungan?: string;
  alamat?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota_kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
  telepon?: string;
  email?: string;
  website?: string;
  kepala_sekolah?: string;
  jenjang_id?: number;
}


// --- SISA TIPE DATA DI BAWAH INI TETAP SAMA ---

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