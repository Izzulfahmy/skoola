// file: backend/internal/penilaian/model.go
package penilaian

import "time"

// --- DTO UNTUK INPUT DARI FRONTEND ---

// UpsertNilaiInput merepresentasikan satu nilai formatif (nilai akhir TP).
type UpsertNilaiInput struct {
	AnggotaKelasID       string   `json:"anggota_kelas_id" validate:"required,uuid"`
	TujuanPembelajaranID int      `json:"tujuan_pembelajaran_id" validate:"required,numeric"`
	Nilai                *float64 `json:"nilai" validate:"omitempty,numeric,min=0,max=100"`
}

// UpsertNilaiSumatifSiswaInput merepresentasikan satu nilai sumatif (komponen nilai seperti PR, Tugas).
type UpsertNilaiSumatifSiswaInput struct {
	AnggotaKelasID     string   `json:"anggota_kelas_id" validate:"required,uuid"`
	PenilaianSumatifID string   `json:"penilaian_sumatif_id" validate:"required,uuid"`
	Nilai              *float64 `json:"nilai" validate:"omitempty,numeric,min=0,max=100"`
}

// BulkUpsertNilaiInput adalah DTO untuk menerima semua jenis nilai dari frontend dalam satu request.
type BulkUpsertNilaiInput struct {
	NilaiFormatif []UpsertNilaiInput             `json:"nilai_formatif" validate:"dive"`
	NilaiSumatif  []UpsertNilaiSumatifSiswaInput `json:"nilai_sumatif" validate:"dive"`
}

// --- STRUCT UNTUK MENGIRIM DATA KE FRONTEND ---

// NilaiSiswa merepresentasikan nilai akhir formatif untuk satu TP.
type NilaiSiswa struct {
	Nilai     *float64   `json:"nilai"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

// NilaiSumatifSiswa merepresentasikan nilai untuk satu komponen penilaian (PR, Tugas, dll).
type NilaiSumatifSiswa struct {
	Nilai     *float64   `json:"nilai"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

// PenilaianSiswaData adalah data lengkap seorang siswa, berisi semua nilainya.
type PenilaianSiswaData struct {
	AnggotaKelasID string                       `json:"anggota_kelas_id"`
	NamaSiswa      string                       `json:"nama_siswa"`
	NIS            *string                      `json:"nis"`
	NilaiFormatif  map[int]NilaiSiswa           `json:"nilai_formatif"` // map[tp_id]NilaiSiswa
	NilaiSumatif   map[string]NilaiSumatifSiswa `json:"nilai_sumatif"`  // map[penilaian_sumatif_id]NilaiSumatifSiswa
}

// FullPenilaianData adalah struktur data lengkap yang dikirim ke frontend.
type FullPenilaianData struct {
	Siswa       []PenilaianSiswaData `json:"siswa"`
	LastUpdated *time.Time           `json:"last_updated,omitempty"`
}
