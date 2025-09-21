// file: src/types/index.ts

export interface Foundation {
  id: string;
  nama_yayasan: string;
  school_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  nama_sekolah: string;
  schema_name: string;
  foundation_id?: string;
  nama_yayasan?: string;
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

export interface RiwayatKepegawaian {
  id: string;
  teacher_id: string;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  keterangan?: string;
}

export interface CreateHistoryInput {
  status: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  keterangan?: string;
}

export type UpdateHistoryInput = CreateHistoryInput;


export interface Teacher {
  id: string;
  user_id: string;
  email: string;
  nama_lengkap: string;
  created_at: string;
  updated_at: string;
  nip_nuptk?: string;
  no_hp?: string;
  alamat_lengkap?: string;
  nama_panggilan?: string;
  gelar_akademik?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: string;
  kewarganegaraan?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
  kode_pos?: string;
  status_saat_ini?: string;
  lama_mengajar?: string;
}

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
  tanggal_lahir?: string;
  agama?: string;
  kewarganegaraan?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  desa_kelurahan?: string;
  kode_pos?: string;
}

export type UpdateTeacherInput = Omit<CreateTeacherInput, 'password'>;


// --- PERUBAHAN UTAMA DI SINI ---
// Interface untuk Student diperbarui
export interface Student {
  id: string;
  created_at: string;
  updated_at: string;
  
  nis?: string;
  nisn?: string;
  nomor_ujian_sekolah?: string;
  status_siswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';

  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: 'Islam' | 'Kristen Protestan' | 'Kristen Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya';
  kewarganegaraan?: string;
  
  alamat_lengkap?: string;
  desa_kelurahan?: string;
  kecamatan?: string;
  kota_kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
  
  nama_ayah?: string;
  nama_ibu?: string;
  nama_wali?: string;
  nomor_kontak_wali?: string;
}

// Input DTO untuk Create/Update Student juga diperbarui
export interface CreateStudentInput {
  status_siswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
  nis?: string;
  nisn?: string;
  nomor_ujian_sekolah?: string;

  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: 'Islam' | 'Kristen Protestan' | 'Kristen Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya';
  kewarganegaraan?: string;
  
  alamat_lengkap?: string;
  desa_kelurahan?: string;
  kecamatan?: string;
  kota_kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
  
  nama_ayah?: string;
  nama_ibu?: string;
  nama_wali?: string;
  nomor_kontak_wali?: string;
}

export type UpdateStudentInput = CreateStudentInput;