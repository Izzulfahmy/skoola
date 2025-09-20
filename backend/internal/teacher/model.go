package teacher

import "time"

// User struct tetap sama, tidak ada perubahan.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Jangan kirim password hash ke client
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Teacher merepresentasikan tabel 'teachers' yang sudah diperbarui.
type Teacher struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Email       string    `json:"email"` // Diambil dari join dengan tabel users
	NamaLengkap string    `json:"nama_lengkap"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// --- KOLOM LAMA DENGAN NAMA BARU ---
	NipNuptk      *string `json:"nip_nuptk"`
	NoHP          *string `json:"no_hp"`
	AlamatLengkap *string `json:"alamat_lengkap"`

	// --- KOLOM BARU ---
	NamaPanggilan   *string    `json:"nama_panggilan"`
	GelarAkademik   *string    `json:"gelar_akademik"`
	JenisKelamin    *string    `json:"jenis_kelamin"` // Menggunakan string untuk ENUM
	TempatLahir     *string    `json:"tempat_lahir"`
	TanggalLahir    *time.Time `json:"tanggal_lahir"`
	Agama           *string    `json:"agama"`
	Kewarganegaraan *string    `json:"kewarganegaraan"`
	Provinsi        *string    `json:"provinsi"`
	KotaKabupaten   *string    `json:"kota_kabupaten"`
	Kecamatan       *string    `json:"kecamatan"`
	DesaKelurahan   *string    `json:"desa_kelurahan"`
	KodePos         *string    `json:"kode_pos"`
	StatusGuru      *string    `json:"status_guru"` // Menggunakan string untuk ENUM
}
