// backend/internal/ujianmaster/model.go
package ujianmaster

import "time"

type UjianMaster struct {
	ID             string    `json:"id"`
	TahunAjaranID  string    `json:"tahun_ajaran_id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type UpsertUjianMasterInput struct {
	TahunAjaranID  string `json:"tahun_ajaran_id" validate:"required,uuid"`
	NamaPaketUjian string `json:"nama_paket_ujian" validate:"required,min=3"`
}
