// file: backend/internal/matapelajaran/model.go
package matapelajaran

import "time"

// MataPelajaran merepresentasikan data dari tabel 'mata_pelajaran'.
type MataPelajaran struct {
	ID           string           `json:"id"`
	KodeMapel    string           `json:"kode_mapel"`
	NamaMapel    string           `json:"nama_mapel"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	ParentID     *string          `json:"parent_id,omitempty"`
	Urutan       int              `json:"urutan"`
	KelompokID   *int             `json:"kelompok_id,omitempty"`
	NamaKelompok *string          `json:"nama_kelompok,omitempty"`
	Children     []*MataPelajaran `json:"children,omitempty"`
}

// UpsertMataPelajaranInput adalah DTO untuk membuat atau memperbarui data.
type UpsertMataPelajaranInput struct {
	KodeMapel  string  `json:"kode_mapel" validate:"required,min=1,max=20"`
	NamaMapel  string  `json:"nama_mapel" validate:"required,min=3,max=100"`
	ParentID   *string `json:"parent_id,omitempty"`
	KelompokID *int    `json:"kelompok_id,omitempty"`
	Urutan     *int    `json:"urutan,omitempty"`
}

// UpdateUrutanInput DTO untuk menerima daftar ID yang sudah diurutkan
type UpdateUrutanInput struct {
	OrderedIDs []string `json:"ordered_ids" validate:"required,dive,uuid"`
}
