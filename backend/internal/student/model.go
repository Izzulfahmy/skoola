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
	NIS  *string `json:"nis"`
	NISN *string `json:"nisn"`

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
	PekerjaanAyah   *string `json:"pekerjaan_ayah"`
	AlamatAyah      *string `json:"alamat_ayah"`
	NamaIbu         *string `json:"nama_ibu"`
	PekerjaanIbu    *string `json:"pekerjaan_ibu"`
	AlamatIbu       *string `json:"alamat_ibu"`
	NamaWali        *string `json:"nama_wali"`
	PekerjaanWali   *string `json:"pekerjaan_wali"`
	AlamatWali      *string `json:"alamat_wali"`
	NomorKontakWali *string `json:"nomor_kontak_wali"`

	// Kolom Tambahan (Hasil Query)
	StatusSaatIni *string `json:"status_saat_ini"`
	KelasID       *string `json:"kelas_id,omitempty"`
	NamaKelas     *string `json:"nama_kelas,omitempty"`
}

// ImportResult merepresentasikan hasil dari proses impor Excel.
type ImportResult struct {
	SuccessCount int           `json:"success_count"`
	ErrorCount   int           `json:"error_count"`
	Errors       []ImportError `json:"errors"`
}

// ImportError merepresentasikan detail error pada baris tertentu di file Excel.
type ImportError struct {
	Row     int    `json:"row"`
	Message string `json:"message"`
}
