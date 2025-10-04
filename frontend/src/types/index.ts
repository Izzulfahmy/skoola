// file: src/types/index.ts

// --- TIPE BARU UNTUK AUTH CONTEXT (Dipindahkan ke atas untuk akses global) ---
// Fix: 2339 - Menambahkan AuthUser agar property 'user' ada.
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'superadmin';
  username: string;
}
// ------------------------------------

// --- TIPE BARU UNTUK PRESTASI ---
export interface Prestasi {
  id: string;
  tahun_ajaran_id: string;
  anggota_kelas_id: string;
  nama_prestasi: string;
  tingkat: 'Sekolah' | 'Desa/Kelurahan' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  peringkat: 'Juara 1' | 'Juara 2' | 'Juara 3' | 'Harapan 1' | 'Harapan 2' | 'Harapan 3';
  tanggal: string;
  deskripsi?: string;
  created_at: string;
  updated_at: string;
  nama_siswa: string;
  nama_kelas: string;
}

export interface UpsertPrestasiInput {
  tahun_ajaran_id: string;
  anggota_kelas_id: string;
  nama_prestasi: string;
  tingkat: 'Sekolah' | 'Desa/Kelurahan' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  peringkat: 'Juara 1' | 'Juara 2' | 'Juara 3' | 'Harapan 1' | 'Harapan 2' | 'Harapan 3';
  tanggal: string; // YYYY-MM-DD
  deskripsi?: string;
}
// ------------------------------------

// --- TIPE BARU UNTUK PENILAIAN SUMATIF ---
export interface PenilaianSumatif {
  id: string;
  tujuan_pembelajaran_id?: number;
  ujian_id?: number;
  jenis_ujian_id: number;
  nama_penilaian: string;
  tanggal_pelaksanaan?: string;
  keterangan?: string;
  nama_jenis_ujian?: string;
  kode_jenis_ujian?: string;
}

export interface UpsertPenilaianSumatifInput {
  tujuan_pembelajaran_id?: number;
  ujian_id?: number;
  jenis_ujian_id: number;
  nama_penilaian: string;
  tanggal_pelaksanaan?: string;
  keterangan?: string;
}
// ------------------------------------

// --- TIPE BARU UNTUK PRESENSI ---
export interface PresensiHari {
  status: 'H' | 'S' | 'I' | 'A';
  catatan?: string;
}

export interface PresensiSiswa {
  anggota_kelas_id: string;
  nama_siswa: string;
  nis?: string;
  presensi_per_hari: Record<number, PresensiHari>; // map[tanggal]PresensiHari
}

export interface PresensiData {
  anggota_kelas_id: string;
  status: 'H' | 'S' | 'I' | 'A';
  catatan?: string;
}

export interface UpsertPresensiInput {
  kelas_id: string;
  tanggal: string; // YYYY-MM-DD
  data: PresensiData[];
}
// ------------------------------------

export interface Ujian {
  id: number;
  pengajar_kelas_id: string;
  nama: string;
  urutan: number;
  penilaian_sumatif: PenilaianSumatif[];
}


// --- TIPE BARU UNTUK MONITORING UJIAN (Tambahkan di sini) ---
export interface UjianMonitoring {
  id: string; // ID Ujian pertama atau ID Grouping untuk bulk
  nama_ujian: string; // FIX: Menambahkan field nama_ujian
  tahun_ajaran_id: string;
  jumlah_kelas: number; // FIX: Menambahkan field agregasi
  jumlah_mapel: number; // FIX: Menambahkan field agregasi
}
// ------------------------------------


export interface RencanaPembelajaranItem {
    type: 'materi' | 'ujian';
    id: number;
    pengajar_kelas_id: string;
    nama: string;
    urutan: number;
    deskripsi?: string;
    tujuan_pembelajaran?: TujuanPembelajaran[];
    penilaian_sumatif?: PenilaianSumatif[];
}

// --- TIPE BARU UNTUK BULK UJIAN (DIPERBAIKI UNTUK MATCH PENGGUNAAN DI UjianPage.tsx) ---
export interface CreateBulkUjianPayload {
  nama_ujian: string;
  tahun_ajaran_id: string;
  kelas_ids: string[]; // UUIDs dari kelas/rombel yang dipilih
}

export interface BulkUjianResult {
  success_count: number;
  total_count: number;
}
// ------------------------------------


export interface KelompokMataPelajaran {
  id: number;
  nama_kelompok: string;
  urutan: number;
  mata_pelajaran: MataPelajaran[];
}

export interface UpsertKelompokMataPelajaranInput {
  nama_kelompok: string;
  urutan?: number;
}

export interface Naungan {
  id: string;
  nama_naungan: string;
  school_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  nama_sekolah: string;
  schema_name: string;
  naungan_id?: string;
  nama_naungan?: string;
  created_at: string;
  updated_at: string;
}

// Tambahkan minimal Jenjang type untuk struktur nested di Kelas
export interface Jenjang {
  id: number;
  nama_jenjang: string;
}

export interface JenjangPendidikan {
  id: number;
  nama_jenjang: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertJenjangInput {
  nama_jenjang: string;
}

export interface Jabatan {
  id: number;
  nama_jabatan: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertJabatanInput {
  nama_jabatan: string;
}

// Update Tingkatan untuk mendukung nested Jenjang (optional for forward compatibility)
export interface Tingkatan {
  id: number;
  nama_tingkatan: string;
  urutan?: number;
  created_at: string;
  updated_at: string;
  jenjang?: Jenjang; // Added optional nested jenjang
  jenjang_id?: number; // Added optional jenjang_id
}

export interface UpsertTingkatanInput {
  nama_tingkatan: string;
  urutan?: number;
}

export interface TahunAjaran {
  id: string;
  nama_tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
  status: 'Aktif' | 'Tidak Aktif';
  metode_absensi: 'HARIAN' | 'PER_JAM_PELAJARAN';
  kepala_sekolah_id?: string;
  nama_kepala_sekolah?: string;
  created_at: string;
  updated_at: string;
}

// +++ PERBAIKAN FINAL: Tambahkan tipe TahunAjaranOption yang diekspor +++
export interface TahunAjaranOption {
  id: string;
  nama: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface UpsertTahunAjaranInput {
  nama_tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
  status: 'Aktif' | 'Tidak Aktif';
  metode_absensi: 'HARIAN' | 'PER_JAM_PELAJARAN';
  kepala_sekolah_id?: string;
}

export interface MataPelajaran {
  id: string;
  kode_mapel: string;
  nama_mapel: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  urutan?: number;
  kelompok_id?: number;
  nama_kelompok?: string;
  children?: MataPelajaran[];
}

export interface UpsertMataPelajaranInput {
  kode_mapel: string;
  nama_mapel: string;
  parent_id?: string;
  kelompok_id?: number;
}

export interface UpdateUrutanMapelInput {
  ordered_ids: string[];
}

export interface Kurikulum {
  id: number;
  nama_kurikulum: string;
  deskripsi?: string;
}

export interface Fase {
  id: number;
  nama_fase: string;
  deskripsi?: string;
}

export interface FaseTingkatan extends Fase {
    tingkatan_id: number;
    nama_tingkatan: string;
}

export interface PemetaanInput {
    tahun_ajaran_id: string;
    kurikulum_id: number;
    tingkatan_id: number;
    fase_id: number;
}

export interface UpsertKurikulumInput {
    nama_kurikulum: string;
    deskripsi?: string;
}

export interface UpsertFaseInput {
    nama_fase: string;
    deskripsi?: string;
}

export interface Rombel {
  id: number;
  nama_rombel: string;
  tahun_ajaran_id: number;
  tingkatan_id: number;
  wali_kelas_id: string;
  kurikulum_id: number;
  nama_wali_kelas?: string;
  nama_kurikulum?: string;
  nama_tingkatan?: string;
}

// Update Kelas (Rombel) structure (FINAL FIX untuk sinkronisasi Backend/Frontend)
export interface Kelas {
  id: string;
  nama_kelas: string;
  tahun_ajaran_id: string;
  tingkatan_id: number;
  wali_kelas_id?: string;
  created_at: string;
  updated_at: string;
  nama_tingkatan?: string;

  // PERBAIKAN: Field flat yang dikirimkan oleh Go Backend untuk Cascader
  jenjang_id?: number;
  nama_jenjang?: string;
  // --------------------------

  nama_wali_kelas?: string;
  jumlah_siswa: number;
  jumlah_pengajar: number;
  nama_tahun_ajaran?: string;
  semester?: string;

  // HAPUS STRUKTUR NESTED: tingkatan?: { ... } karena sudah diganti field flat di atas.
}

export interface AnggotaKelas {
  id: string;
  student_id: string;
  urutan: number;
  nis?: string;
  nisn?: string;
  nama_lengkap: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
}

export interface PengajarKelas {
  id: string;
  teacher_id: string;
  mata_pelajaran_id: string;
  nama_guru: string;
  nama_mapel: string;
  kode_mapel: string;
}

export interface UpsertKelasInput {
  nama_kelas: string;
  tahun_ajaran_id: string;
  tingkatan_id: number;
  wali_kelas_id?: string;
}

export interface AddAnggotaKelasInput {
  student_ids: string[];
}

export interface UpsertPengajarKelasInput {
  teacher_id: string;
  mata_pelajaran_id: string;
}

export interface TujuanPembelajaran {
  id: number;
  materi_pembelajaran_id: number;
  deskripsi_tujuan: string;
  urutan: number;
  penilaian_sumatif: PenilaianSumatif[];
}

export interface MateriPembelajaran {
  id: number;
  type: 'materi';
  pengajar_kelas_id: string;
  nama_materi: string;
  deskripsi?: string;
  urutan: number;
  tujuan_pembelajaran: TujuanPembelajaran[];
}

export interface UpsertMateriInput {
  pengajar_kelas_id: string;
  nama_materi: string;
  deskripsi?: string;
  urutan?: number;
}

export interface UpsertUjianInput {
    pengajar_kelas_id: string;
    nama_ujian: string;
}


export interface UpsertTujuanInput {
  materi_pembelajaran_id: number;
  deskripsi_tujuan: string;
  urutan?: number;
}

export interface UpdateUrutanInput {
  ordered_ids: number[];
}

export interface RencanaUrutanItem {
  id: number;
  type: 'materi' | 'ujian';
}

export interface UpdateRencanaUrutanInput {
  ordered_items: RencanaUrutanItem[];
}

export interface NilaiSiswa {
  nilai: number | null;
  updated_at?: string;
}

export interface NilaiSumatifSiswa {
  nilai: number | null;
  updated_at?: string;
}

export interface PenilaianSiswaData {
  anggota_kelas_id: string;
  nama_siswa: string;
  nis?: string;
  nilai_formatif: Record<number, NilaiSiswa>;
  nilai_sumatif: Record<string, NilaiSumatifSiswa>;
}

export interface FullPenilaianData {
  siswa: PenilaianSiswaData[];
  last_updated?: string;
}

export interface UpsertNilaiInput {
  anggota_kelas_id: string;
  tujuan_pembelajaran_id: number;
  nilai: number | null;
}

export interface UpsertNilaiSumatifSiswaInput {
  anggota_kelas_id: string;
  penilaian_sumatif_id: string;
  nilai: number | null;
}

export interface BulkUpsertNilaiInput {
  nilai_formatif: UpsertNilaiInput[];
  nilai_sumatif: UpsertNilaiSumatifSiswaInput[];
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

export interface Student {
  id: string;
  created_at: string;
  updated_at: string;

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
  pekerjaan_ayah?: string;
  alamat_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  alamat_ibu?: string;
  nama_wali?: string;
  pekerjaan_wali?: string;
  alamat_wali?: string;
  nomor_kontak_wali?: string;

  status_saat_ini?: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
}

export interface CreateStudentInput {
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
  pekerjaan_ayah?: string;
  alamat_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  alamat_ibu?: string;
  nama_wali?: string;
  pekerjaan_wali?: string;
  alamat_wali?: string;
  nomor_kontak_wali?: string;
}

export type UpdateStudentInput = CreateStudentInput;

export interface ImportResult {
  success_count: number;
  error_count: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  message: string;
}

export interface RiwayatAkademik {
  id: string;
  student_id: string;
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
  tanggal_kejadian: string;
  kelas_tingkat?: string;
  keterangan?: string;
}

export interface UpsertAcademicHistoryInput {
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
  tanggal_kejadian: string;
  kelas_tingkat?: string;
  keterangan?: string;
}

export interface Ekstrakurikuler {
  id: number;
  nama_kegiatan: string;
  deskripsi?: string;
  created_at: string;
  updated_at: string;
  // FIX: Tambahkan properti dari backend yang diperbarui (Nama Pembina & Jumlah Anggota)
  nama_pembina?: string | null;
  jumlah_anggota?: number | null;
}

export interface UpsertEkstrakurikulerInput {
  nama_kegiatan: string;
  deskripsi?: string;
}

export interface EkstrakurikulerSesi {
  id: number;
  ekstrakurikuler_id: number;
  tahun_ajaran_id: string;
  pembina_id: string | null;
  nama_pembina?: string | null; // Perubahan di sini
  jumlah_anggota: number;
}

export interface StudentSimple {
  id: string;
  nama_lengkap: string;
  nis?: string;
  nisn?: string;
}

export interface EkstrakurikulerAnggota {
  id: number;
  sesi_id: number;
  student_id: string;
  student_details: {
    nis: string;
    nisn: string;
    nama_lengkap: string;
  }
}

export interface UpdateSesiDetailInput {
  pembina_id: string | null;
}

export interface AddAnggotaInput {
  student_ids: string[];
}


// --- PERUBAHAN DIMULAI DI SINI ---

export interface JenisUjian {
  id: number;
  kode_ujian: string;
  nama_ujian: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertJenisUjianInput {
  kode_ujian: string;
  nama_ujian: string;
}

// UjianMaster diperbarui sesuai instruksi
export interface UjianMaster {
  id: string;
  tahun_ajaran_id: string;
  nama_paket_ujian: string;
  created_at: string;
  updated_at: string;
}

// UpsertUjianMasterInput diperbarui sesuai instruksi
export interface UpsertUjianMasterInput {
  tahun_ajaran_id: string;
  nama_paket_ujian: string;
}

// Tipe baru untuk data penugasan yang sudah ada
export interface PenugasanUjian {
    pengajar_kelas_id: string;
    nama_kelas: string;
    nama_mapel: string;
    nama_guru: string;
}

// Tipe baru untuk struktur Cascader di frontend
export interface AvailableMapel {
    value: string;
    label: string;
}

// Tipe baru untuk struktur Cascader di frontend
export interface AvailableKelas {
    value: string;
    label: string;
    children: AvailableMapel[];
}

// UjianDetail diperbarui untuk menampung seluruh data detail dari backend
export interface UjianDetail {
    detail: UjianMaster;
    penugasan: PenugasanUjian[];
    availableKelas: AvailableKelas[];
}


// Tipe data ini masih relevan untuk fungsi lain, jadi tetap dipertahankan
export interface CreateBulkUjianInput {
    ujian_master_id: string;
    pengajar_kelas_ids: string[];
}

// --- AKHIR PERUBAHAN ---