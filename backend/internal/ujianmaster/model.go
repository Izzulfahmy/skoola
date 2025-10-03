package ujianmaster

import (
	"time"

	"github.com/google/uuid"
)

// UjianMaster represents the main exam package entity.
// NOTE: Corrected data types for ID fields from string/int to uuid.UUID.
type UjianMaster struct {
	ID             uuid.UUID `json:"id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	TahunAjaranID  uuid.UUID `json:"tahun_ajaran_id"`
	JenisUjianID   uuid.UUID `json:"jenis_ujian_id"`
	NamaJenisUjian string    `json:"nama_jenis_ujian,omitempty"` // omitempty because it's from a JOIN
	Durasi         int       `json:"durasi"`
	JumlahSoal     int       `json:"jumlah_soal"`
	Keterangan     string    `json:"keterangan"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// UjianMasterDetail is a new struct for providing detailed exam information.
// It was missing, causing a compilation error.
type UjianMasterDetail struct {
	UjianMaster
	// Penugasan      []SomeType `json:"penugasan"`      // Placeholder for future implementation
	// AvailableKelas []SomeType `json:"available_kelas"`  // Placeholder for future implementation
}
