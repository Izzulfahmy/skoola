// file: backend/internal/kelompokmapel/model.go
package kelompokmapel

import (
	"skoola/internal/matapelajaran"
	"time"
)

// KelompokMataPelajaran merepresentasikan data dari tabel 'kelompok_mata_pelajaran'.
type KelompokMataPelajaran struct {
	ID           int       `json:"id"`
	NamaKelompok string    `json:"nama_kelompok"`
	Urutan       int       `json:"urutan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	// Digunakan untuk menampung mata pelajaran yang berelasi
	MataPelajaran []*matapelajaran.MataPelajaran `json:"mata_pelajaran,omitempty"`
}

// UpsertKelompokInput adalah DTO untuk membuat atau memperbarui data kelompok.
type UpsertKelompokInput struct {
	NamaKelompok string `json:"nama_kelompok" validate:"required,min=3,max=100"`
	Urutan       *int   `json:"urutan" validate:"omitempty,numeric"`
}
