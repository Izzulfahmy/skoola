// file: backend/internal/ekstrakurikuler/model.go
package ekstrakurikuler

import (
	"skoola/internal/student"
	"time"
)

// Ekstrakurikuler (Diperluas untuk mencakup data sesi yang relevan dari JOIN)
type Ekstrakurikuler struct {
	ID           int       `json:"id"`
	NamaKegiatan string    `json:"nama_kegiatan"`
	Deskripsi    *string   `json:"deskripsi"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// FIX: Tambahkan field untuk data sesi yang akan diisi oleh JOIN
	NamaPembina   *string `json:"nama_pembina,omitempty"`
	JumlahAnggota *int    `json:"jumlah_anggota,omitempty"` // Menggunakan *int karena bisa NULL dari LEFT JOIN
}

// EkstrakurikulerSesi
type EkstrakurikulerSesi struct {
	ID                int     `json:"id"`
	EkstrakurikulerID int     `json:"ekstrakurikuler_id"`
	TahunAjaranID     string  `json:"tahun_ajaran_id"`
	PembinaID         *string `json:"pembina_id"`
	NamaPembina       *string `json:"nama_pembina,omitempty"`
	JumlahAnggota     int     `json:"jumlah_anggota"`
}

type EkstrakurikulerAnggota struct {
	ID        int             `json:"id"`
	SesiID    int             `json:"sesi_id"`
	StudentID string          `json:"student_id"`
	Student   student.Student `json:"student_details"`
}

type UpsertEkstrakurikulerInput struct {
	NamaKegiatan string `json:"nama_kegiatan" validate:"required,min=3,max=255"`
	Deskripsi    string `json:"deskripsi" validate:"omitempty"`
}

type UpdateSesiDetailInput struct {
	PembinaID *string `json:"pembina_id" validate:"omitempty,uuid4"`
}

type AddAnggotaInput struct {
	StudentIDs []string `json:"student_ids" validate:"required,min=1,dive,uuid4"`
}
