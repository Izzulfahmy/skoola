// file: backend/internal/pembelajaran/model.go
package pembelajaran

import "time"

// TujuanPembelajaran merepresentasikan data dari tabel 'tujuan_pembelajaran'.
type TujuanPembelajaran struct {
	ID                   int       `json:"id"`
	MateriPembelajaranID int       `json:"materi_pembelajaran_id"`
	DeskripsiTujuan      string    `json:"deskripsi_tujuan"`
	Urutan               int       `json:"urutan"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// MateriPembelajaran merepresentasikan data dari tabel 'materi_pembelajaran'
// dan menyertakan slice dari TujuanPembelajaran sebagai relasi nested.
type MateriPembelajaran struct {
	ID                 int                  `json:"id"`
	PengajarKelasID    string               `json:"pengajar_kelas_id"`
	NamaMateri         string               `json:"nama_materi"`
	Deskripsi          *string              `json:"deskripsi"`
	Urutan             int                  `json:"urutan"`
	CreatedAt          time.Time            `json:"created_at"`
	UpdatedAt          time.Time            `json:"updated_at"`
	TujuanPembelajaran []TujuanPembelajaran `json:"tujuan_pembelajaran"` // Untuk menampung data join
}

// --- DTO (Data Transfer Objects) untuk Input ---

// UpsertMateriInput adalah DTO untuk membuat atau mengupdate data materi.
type UpsertMateriInput struct {
	PengajarKelasID string `json:"pengajar_kelas_id" validate:"required,uuid"`
	NamaMateri      string `json:"nama_materi" validate:"required,min=3,max=255"`
	Deskripsi       string `json:"deskripsi" validate:"omitempty"`
	Urutan          int    `json:"urutan" validate:"omitempty,numeric"`
}

// UpsertTujuanInput adalah DTO untuk membuat atau mengupdate data tujuan pembelajaran.
type UpsertTujuanInput struct {
	MateriPembelajaranID int    `json:"materi_pembelajaran_id" validate:"required,numeric"`
	DeskripsiTujuan      string `json:"deskripsi_tujuan" validate:"required,min=3"`
	Urutan               int    `json:"urutan" validate:"omitempty,numeric"`
}

// --- DTO BARU UNTUK UPDATE URUTAN ---
type UpdateUrutanInput struct {
	OrderedIDs []int `json:"ordered_ids" validate:"required,dive,numeric"`
}
