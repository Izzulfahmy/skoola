// file: backend/internal/jenjang/model.go
package jenjang

import "time"

// JenjangPendidikan merepresentasikan data dari tabel 'jenjang_pendidikan'.
type JenjangPendidikan struct {
	ID          int       `json:"id"`
	NamaJenjang string    `json:"nama_jenjang"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// UpsertJenjangInput adalah DTO untuk membuat atau memperbarui data jenjang.
type UpsertJenjangInput struct {
	NamaJenjang string `json:"nama_jenjang" validate:"required,min=2,max=100"`
}
