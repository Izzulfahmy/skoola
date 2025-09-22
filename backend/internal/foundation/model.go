// file: backend/internal/foundation/model.go
package foundation

import "time"

// Naungan merepresentasikan data dari tabel 'public.naungan'.
type Naungan struct {
	ID          string    `json:"id"`
	NamaNaungan string    `json:"nama_naungan"`
	SchoolCount int       `json:"school_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Input DTO untuk membuat atau memperbarui naungan.
type UpsertNaunganInput struct {
	NamaNaungan string `json:"nama_naungan" validate:"required,min=3"`
}
