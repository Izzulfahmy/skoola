// file: backend/internal/jenisujian/model.go
package jenisujian

import "time"

// JenisUjian merepresentasikan data dari tabel 'jenis_ujian'.
type JenisUjian struct {
	ID        int       `json:"id"`
	KodeUjian string    `json:"kode_ujian"`
	NamaUjian string    `json:"nama_ujian"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UpsertJenisUjianInput adalah DTO untuk membuat atau memperbarui data jenis ujian.
type UpsertJenisUjianInput struct {
	KodeUjian string `json:"kode_ujian" validate:"required,min=1,max=20"`
	NamaUjian string `json:"nama_ujian" validate:"required,min=3,max=100"`
}
