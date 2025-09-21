// file: backend/internal/foundation/model.go
package foundation

import "time"

// Foundation merepresentasikan data dari tabel 'public.foundations'.
type Foundation struct {
	ID          string    `json:"id"`
	NamaYayasan string    `json:"nama_yayasan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Input DTO untuk membuat atau memperbarui yayasan.
type UpsertFoundationInput struct {
	NamaYayasan string `json:"nama_yayasan" validate:"required,min=3"`
}
