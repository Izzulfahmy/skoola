// file: src/types/index.ts

export interface Tenant {
  id: string;
  nama_sekolah: string;
  schema_name: string;
  created_at: string;
  updated_at: string;
}

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

export interface LoginInput {
  email: string;
  password: string;
}

// --- INTERFACE TEACHER DIPERBARUI ---
export interface Teacher {
  id: string;
  user_id: string;
  email: string;
  nama_lengkap: string;
  created_at: string;
  updated_at: string;

  // Kolom yang namanya diubah
  nip_nuptk?: string;
  no_hp?: string;
  alamat_lengkap?: string;

  // Kolom baru
  nama_panggilan?: string;
  gelar_akademik?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string; // Kita simpan sebagai string (YYYY-MM-DD) di frontend
  agama?: string;
  kewarganegaraan?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
  kode_pos?: string;
  status_guru?: 'Aktif' | 'NonAktif' | 'Pindah';
}

// --- INTERFACE CreateTeacherInput DIPERBARUI ---
export interface CreateTeacherInput {
  email: string;
  password?: string;
  nama_lengkap: string;
  nip_nuptk?: string;
  no_hp?: string;
  alamat_lengkap?: string;
  nama_panggilan?: string;
  gelar_akademik?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string; // Format YYYY-MM-DD
  agama?: string;
  kewarganegaraan?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
  kode_pos?: string;
  status_guru?: 'Aktif' | 'NonAktif' | 'Pindah';
}

// --- INTERFACE UpdateTeacherInput DIPERBARUI ---
// Kita hapus 'password' dari tipe CreateTeacherInput
export type UpdateTeacherInput = Omit<CreateTeacherInput, 'password'>;


// --- Tipe data Student (tidak berubah) ---
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