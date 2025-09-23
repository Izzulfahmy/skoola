// file: backend/internal/tahunajaran/model.go
package tahunajaran

import "time"

// TahunAjaran merepresentasikan data dari tabel 'tahun_ajaran'.
type TahunAjaran struct {
	ID                string    `json:"id"`
	NamaTahunAjaran   string    `json:"nama_tahun_ajaran"`
	Semester          string    `json:"semester"`
	Status            string    `json:"status"`
	MetodeAbsensi     string    `json:"metode_absensi"`
	KepalaSekolahID   *string   `json:"kepala_sekolah_id"`
	NamaKepalaSekolah *string   `json:"nama_kepala_sekolah,omitempty"` // Untuk join
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// UpsertTahunAjaranInput adalah DTO untuk membuat atau memperbarui data.
type UpsertTahunAjaranInput struct {
	NamaTahunAjaran string  `json:"nama_tahun_ajaran" validate:"required,min=4,max=50"`
	Semester        string  `json:"semester" validate:"required,oneof=Ganjil Genap"`
	Status          string  `json:"status" validate:"required,oneof=Aktif 'Tidak Aktif'"`
	MetodeAbsensi   string  `json:"metode_absensi" validate:"required,oneof=HARIAN PER_JAM_PELAJARAN"`
	KepalaSekolahID *string `json:"kepala_sekolah_id" validate:"omitempty,uuid"`
}
