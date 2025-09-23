// file: backend/internal/student/model.go
package student

import "time"

// Student merepresentasikan data dalam tabel 'students'.
type Student struct {
	// Kolom Identitas & Waktu
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Kolom Akademik
	NIS               *string `json:"nis"`
	NISN              *string `json:"nisn"`
	NomorUjianSekolah *string `json:"nomor_ujian_sekolah"`

	// Kolom Biodata Pribadi
	NamaLengkap     string     `json:"nama_lengkap"`
	NamaPanggilan   *string    `json:"nama_panggilan"`
	JenisKelamin    *string    `json:"jenis_kelamin"`
	TempatLahir     *string    `json:"tempat_lahir"`
	TanggalLahir    *time.Time `json:"tanggal_lahir"`
	Agama           *string    `json:"agama"`
	Kewarganegaraan *string    `json:"kewarganegaraan"`

	// Kolom Alamat Lengkap
	AlamatLengkap *string `json:"alamat_lengkap"`
	DesaKelurahan *string `json:"desa_kelurahan"`
	Kecamatan     *string `json:"kecamatan"`
	KotaKabupaten *string `json:"kota_kabupaten"`
	Provinsi      *string `json:"provinsi"`
	KodePos       *string `json:"kode_pos"`

	// Kolom Data Orang Tua / Wali
	NamaAyah        *string `json:"nama_ayah"`
	NamaIbu         *string `json:"nama_ibu"`
	NamaWali        *string `json:"nama_wali"`
	NomorKontakWali *string `json:"nomor_kontak_wali"`

	// Kolom Tambahan (Hasil Query)
	StatusSaatIni *string `json:"status_saat_ini"`
	KelasID       *string `json:"kelas_id,omitempty"`   // <-- TAMBAHKAN INI
	NamaKelas     *string `json:"nama_kelas,omitempty"` // <-- TAMBAHKAN INI
}
