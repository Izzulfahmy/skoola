// file: backend/internal/penilaiansumatif/model.go
package penilaiansumatif

import "time"

// PenilaianSumatif merepresentasikan data dari tabel 'penilaian_sumatif'.
type PenilaianSumatif struct {
	ID                   string     `json:"id"`
	TujuanPembelajaranID int        `json:"tujuan_pembelajaran_id"`
	JenisUjianID         int        `json:"jenis_ujian_id"`
	NamaPenilaian        string     `json:"nama_penilaian"`
	TanggalPelaksanaan   *time.Time `json:"tanggal_pelaksanaan"`
	Keterangan           *string    `json:"keterangan"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
	NamaJenisUjian       *string    `json:"nama_jenis_ujian,omitempty"`
	KodeJenisUjian       *string    `json:"kode_jenis_ujian,omitempty"`
}

// UpsertPenilaianSumatifInput adalah DTO untuk membuat atau mengupdate data.
type UpsertPenilaianSumatifInput struct {
	TujuanPembelajaranID int    `json:"tujuan_pembelajaran_id" validate:"required"`
	JenisUjianID         int    `json:"jenis_ujian_id" validate:"required"`
	NamaPenilaian        string `json:"nama_penilaian" validate:"required,min=3,max=255"`
	TanggalPelaksanaan   string `json:"tanggal_pelaksanaan" validate:"omitempty,datetime=2006-01-02"`
	Keterangan           string `json:"keterangan" validate:"omitempty"`
}
