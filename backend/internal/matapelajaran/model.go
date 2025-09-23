// file: backend/internal/matapelajaran/model.go
package matapelajaran

import "time"

// MataPelajaran merepresentasikan data dari tabel 'mata_pelajaran'.
type MataPelajaran struct {
	ID        string    `json:"id"`
	KodeMapel string    `json:"kode_mapel"`
	NamaMapel string    `json:"nama_mapel"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UpsertMataPelajaranInput adalah DTO untuk membuat atau memperbarui data.
type UpsertMataPelajaranInput struct {
	KodeMapel string `json:"kode_mapel" validate:"required,min=1,max=20"`
	NamaMapel string `json:"nama_mapel" validate:"required,min=3,max=100"`
}
