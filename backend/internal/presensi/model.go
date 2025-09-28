// file: backend/internal/presensi/model.go
package presensi

import "time"

// Presensi merepresentasikan data dari tabel 'presensi'.
type Presensi struct {
	ID             string    `json:"id"`
	AnggotaKelasID string    `json:"anggota_kelas_id"`
	Tanggal        string    `json:"tanggal"` // Menggunakan string format YYYY-MM-DD
	Status         string    `json:"status"`
	Catatan        *string   `json:"catatan"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PresensiSiswa adalah DTO untuk menampilkan data presensi per siswa dalam satu bulan.
type PresensiSiswa struct {
	AnggotaKelasID  string               `json:"anggota_kelas_id"`
	NamaSiswa       string               `json:"nama_siswa"`
	NIS             *string              `json:"nis"`
	PresensiPerHari map[int]PresensiHari `json:"presensi_per_hari"` // map[tanggal]PresensiHari
}

// PresensiHari berisi detail presensi untuk satu hari.
type PresensiHari struct {
	Status  string  `json:"status"`
	Catatan *string `json:"catatan,omitempty"`
}

// UpsertPresensiInput adalah DTO untuk membuat atau memperbarui data presensi secara bulk.
type UpsertPresensiInput struct {
	KelasID string         `json:"kelas_id" validate:"required,uuid"`
	Tanggal string         `json:"tanggal" validate:"required,datetime=2006-01-02"`
	Data    []PresensiData `json:"data" validate:"required,dive"`
}

// PresensiData adalah item individu dalam bulk upsert.
type PresensiData struct {
	AnggotaKelasID string  `json:"anggota_kelas_id" validate:"required,uuid"`
	Status         string  `json:"status" validate:"required,oneof=H S I A"`
	Catatan        *string `json:"catatan"`
}

// --- DTO BARU UNTUK HAPUS ---
type DeletePresensiInput struct {
	Tanggal         string   `json:"tanggal" validate:"required,datetime=2006-01-02"`
	AnggotaKelasIDs []string `json:"anggota_kelas_ids" validate:"required,dive,uuid"`
}
