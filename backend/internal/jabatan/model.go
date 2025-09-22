// file: backend/internal/jabatan/model.go
package jabatan

import "time"

// Jabatan merepresentasikan data dari tabel 'jabatan'.
type Jabatan struct {
	ID          int       `json:"id"`
	NamaJabatan string    `json:"nama_jabatan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// UpsertJabatanInput adalah DTO untuk membuat atau memperbarui data jabatan.
type UpsertJabatanInput struct {
	NamaJabatan string `json:"nama_jabatan" validate:"required,min=3,max=100"`
}
