// file: backend/internal/penilaian/model.go
package penilaian

import "time"

// NilaiSiswa merepresentasikan data nilai yang sudah ada di database.
type NilaiSiswa struct {
	AnggotaKelasID       string  `json:"anggota_kelas_id"`
	TujuanPembelajaranID int     `json:"tujuan_pembelajaran_id"`
	Nilai                float64 `json:"nilai"`
}

// PenilaianInput adalah DTO untuk menerima data nilai dari frontend.
type PenilaianInput struct {
	AnggotaKelasID       string   `json:"anggota_kelas_id" validate:"required,uuid"`
	TujuanPembelajaranID int      `json:"tujuan_pembelajaran_id" validate:"required,numeric"`
	Nilai                *float64 `json:"nilai" validate:"omitempty,numeric,min=0,max=100"` // Pointer agar bisa menerima null (untuk menghapus nilai)
}

// BulkPenilaianInput adalah DTO untuk menerima sekumpulan data nilai.
type BulkPenilaianInput struct {
	Penilaian []PenilaianInput `json:"penilaian" validate:"required,dive"`
}

// PenilaianData merepresentasikan data lengkap untuk ditampilkan di frontend,
// menggabungkan data siswa dengan nilai mereka.
type PenilaianData struct {
	AnggotaKelasID string           `json:"anggota_kelas_id"`
	NamaSiswa      string           `json:"nama_siswa"`
	NIS            *string          `json:"nis"`
	Nilai          map[int]*float64 `json:"nilai"` // map[tujuan_pembelajaran_id]nilai
}

// FullPenilaianData adalah struktur data lengkap yang dikirim ke frontend.
type FullPenilaianData struct {
	Siswa       []PenilaianData `json:"siswa"`
	LastUpdated *time.Time      `json:"last_updated,omitempty"`
}
