// file: backend/internal/ekstrakurikuler/model.go
package ekstrakurikuler

import (
	"skoola/internal/student"
	"time"
)

// ... (struct Ekstrakurikuler tidak berubah) ...
type Ekstrakurikuler struct {
	ID           int       `json:"id"`
	NamaKegiatan string    `json:"nama_kegiatan"`
	Deskripsi    *string   `json:"deskripsi"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// EkstrakurikulerSesi
type EkstrakurikulerSesi struct {
	ID                int     `json:"id"`
	EkstrakurikulerID int     `json:"ekstrakurikuler_id"`
	TahunAjaranID     string  `json:"tahun_ajaran_id"` // FIX: Diubah dari int menjadi string
	PembinaID         *string `json:"pembina_id"`
	NamaPembina       *string `json:"nama_pembina,omitempty"`
	JumlahAnggota     int     `json:"jumlah_anggota"`
}

// ... (struct dan DTO lainnya tidak berubah) ...
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
