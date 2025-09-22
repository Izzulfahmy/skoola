// file: backend/internal/tingkatan/model.go
package tingkatan

import "time"

// Tingkatan merepresentasikan data dari tabel 'tingkatan'.
type Tingkatan struct {
	ID            int       `json:"id"`
	NamaTingkatan string    `json:"nama_tingkatan"`
	Urutan        *int      `json:"urutan"` // Pointer karena bisa NULL
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// UpsertTingkatanInput adalah DTO untuk membuat atau memperbarui data tingkatan.
type UpsertTingkatanInput struct {
	NamaTingkatan string `json:"nama_tingkatan" validate:"required,min=1,max=100"`
	Urutan        *int   `json:"urutan" validate:"omitempty,numeric"`
}
