package teacher

import "time"

// User struct tetap sama, tidak ada perubahan.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// --- STRUCT BARU UNTUK RIWAYAT KEPEGAWAIAN ---
// Merepresentasikan satu baris dari tabel 'riwayat_kepegawaian'
type RiwayatKepegawaian struct {
	ID             string     `json:"id"`
	TeacherID      string     `json:"teacher_id"`
	Status         string     `json:"status"`
	TanggalMulai   time.Time  `json:"tanggal_mulai"`
	TanggalSelesai *time.Time `json:"tanggal_selesai"` // Pointer karena bisa NULL
	Keterangan     *string    `json:"keterangan"`      // Pointer karena bisa NULL
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// --- STRUCT TEACHER DIPERBARUI ---
// Kolom 'status_guru' dihapus dan diganti dengan data agregat
type Teacher struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Email       string    `json:"email"`
	NamaLengkap string    `json:"nama_lengkap"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Kolom detail lainnya (tidak berubah)
	NipNuptk        *string    `json:"nip_nuptk"`
	NoHP            *string    `json:"no_hp"`
	AlamatLengkap   *string    `json:"alamat_lengkap"`
	NamaPanggilan   *string    `json:"nama_panggilan"`
	GelarAkademik   *string    `json:"gelar_akademik"`
	JenisKelamin    *string    `json:"jenis_kelamin"`
	TempatLahir     *string    `json:"tempat_lahir"`
	TanggalLahir    *time.Time `json:"tanggal_lahir"`
	Agama           *string    `json:"agama"`
	Kewarganegaraan *string    `json:"kewarganegaraan"`
	Provinsi        *string    `json:"provinsi"`
	KotaKabupaten   *string    `json:"kota_kabupaten"`
	Kecamatan       *string    `json:"kecamatan"`
	DesaKelurahan   *string    `json:"desa_kelurahan"`
	KodePos         *string    `json:"kode_pos"`

	// --- KOLOM BARU HASIL KALKULASI (TIDAK ADA DI DATABASE) ---
	// Akan diisi oleh query di repository
	StatusSaatIni *string `json:"status_saat_ini"`
	LamaMengajar  *string `json:"lama_mengajar"` // Disimpan sebagai string, misal: "5 tahun 2 bulan"
}
