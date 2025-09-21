// file: backend/internal/student/history_model.go
package student

import "time"

// RiwayatAkademik merepresentasikan satu baris dari tabel 'riwayat_akademik'
type RiwayatAkademik struct {
	ID              string    `json:"id"`
	StudentID       string    `json:"student_id"`
	Status          string    `json:"status"`
	TanggalKejadian time.Time `json:"tanggal_kejadian"`
	KelasTingkat    *string   `json:"kelas_tingkat"`
	Keterangan      *string   `json:"keterangan"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Input DTO untuk membuat atau memperbarui riwayat
type UpsertHistoryInput struct {
	Status          string `json:"status" validate:"required,oneof=Aktif Lulus Pindah Keluar"`
	TanggalKejadian string `json:"tanggal_kejadian" validate:"required,datetime=2006-01-02"`
	KelasTingkat    string `json:"kelas_tingkat"`
	Keterangan      string `json:"keterangan"`
}
