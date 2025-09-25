// file: backend/internal/rombel/model.go
package rombel

import "time"

// Kelas merepresentasikan data dari tabel 'kelas' (Rombel).
type Kelas struct {
	ID              string    `json:"id"`
	NamaKelas       string    `json:"nama_kelas"`
	TahunAjaranID   string    `json:"tahun_ajaran_id"`
	TingkatanID     int       `json:"tingkatan_id"`
	WaliKelasID     *string   `json:"wali_kelas_id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	NamaTingkatan   *string   `json:"nama_tingkatan,omitempty"`    // Untuk join
	NamaWaliKelas   *string   `json:"nama_wali_kelas,omitempty"`   // Untuk join
	JumlahSiswa     int       `json:"jumlah_siswa,omitempty"`      // Untuk join
	JumlahPengajar  int       `json:"jumlah_pengajar,omitempty"`   // Untuk join
	NamaTahunAjaran *string   `json:"nama_tahun_ajaran,omitempty"` // Untuk join
	Semester        *string   `json:"semester,omitempty"`          // Untuk join
}

// AnggotaKelas merepresentasikan siswa dalam sebuah rombel.
type AnggotaKelas struct {
	ID           string    `json:"id"`
	KelasID      string    `json:"kelas_id"`
	StudentID    string    `json:"student_id"`
	Urutan       int       `json:"urutan"`
	CreatedAt    time.Time `json:"created_at"`
	NIS          *string   `json:"nis,omitempty"`           // Untuk join
	NISN         *string   `json:"nisn,omitempty"`          // Untuk join
	NamaLengkap  string    `json:"nama_lengkap,omitempty"`  // Untuk join
	JenisKelamin *string   `json:"jenis_kelamin,omitempty"` // Untuk join
}

// PengajarKelas merepresentasikan guru yang mengajar mapel di rombel.
type PengajarKelas struct {
	ID              string    `json:"id"`
	KelasID         string    `json:"kelas_id"`
	TeacherID       string    `json:"teacher_id"`
	MataPelajaranID string    `json:"mata_pelajaran_id"`
	CreatedAt       time.Time `json:"created_at"`
	NamaGuru        string    `json:"nama_guru,omitempty"`  // Untuk join
	NamaMapel       string    `json:"nama_mapel,omitempty"` // Untuk join
	KodeMapel       string    `json:"kode_mapel,omitempty"` // <-- TAMBAHKAN INI
}

// --- DTO (Data Transfer Objects) untuk Input ---

// UpsertKelasInput adalah DTO untuk membuat atau mengupdate data kelas.
type UpsertKelasInput struct {
	NamaKelas     string  `json:"nama_kelas" validate:"required,min=1,max=100"`
	TahunAjaranID string  `json:"tahun_ajaran_id" validate:"required,uuid"`
	TingkatanID   int     `json:"tingkatan_id" validate:"required,numeric"`
	WaliKelasID   *string `json:"wali_kelas_id" validate:"omitempty,uuid"`
}

// AddAnggotaKelasInput adalah DTO untuk menambahkan siswa ke kelas.
// Menggunakan slice of string untuk bisa menambahkan banyak siswa sekaligus.
type AddAnggotaKelasInput struct {
	StudentIDs []string `json:"student_ids" validate:"required,min=1,dive,uuid"`
}

// UpsertPengajarKelasInput adalah DTO untuk menugaskan guru ke kelas.
type UpsertPengajarKelasInput struct {
	TeacherID       string `json:"teacher_id" validate:"required,uuid"`
	MataPelajaranID string `json:"mata_pelajaran_id" validate:"required,uuid"`
}

// UpdateAnggotaUrutanInput adalah DTO untuk mengubah urutan siswa.
type UpdateAnggotaUrutanInput struct {
	OrderedIDs []string `json:"ordered_ids" validate:"required,dive,uuid"`
}
