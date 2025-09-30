// file: backend/internal/ekstrakurikuler/model.go
package ekstrakurikuler

import "time"

// Ekstrakurikuler merepresentasikan data dari tabel 'ekstrakurikuler'.
type Ekstrakurikuler struct {
	ID           int       `json:"id"`
	NamaKegiatan string    `json:"nama_kegiatan"`
	Deskripsi    *string   `json:"deskripsi"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// UpsertEkstrakurikulerInput adalah DTO untuk membuat atau memperbarui data.
type UpsertEkstrakurikulerInput struct {
	NamaKegiatan string `json:"nama_kegiatan" validate:"required,min=3,max=255"`
	Deskripsi    string `json:"deskripsi" validate:"omitempty"`
}
