// backend/internal/ujianmaster/model.go
package ujianmaster

import "time"

// UjianMaster diperbarui untuk mencocokkan query di repository
type UjianMaster struct {
	ID             string    `json:"id"`
	TahunAjaranID  string    `json:"tahun_ajaran_id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	JenisUjianID   int       `json:"jenis_ujian_id"`
	NamaJenisUjian string    `json:"nama_jenis_ujian"`
	Durasi         int       `json:"durasi"`
	JumlahSoal     int       `json:"jumlah_soal"`
	Keterangan     *string   `json:"keterangan"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// UpsertUjianMasterInput tidak berubah
type UpsertUjianMasterInput struct {
	TahunAjaranID  string  `json:"tahun_ajaran_id" validate:"required,uuid"`
	NamaPaketUjian string  `json:"nama_paket_ujian" validate:"required,min=3"`
	JenisUjianID   int     `json:"jenis_ujian_id" validate:"required"`
	Durasi         int     `json:"durasi" validate:"required,numeric,min=1"`
	JumlahSoal     int     `json:"jumlah_soal" validate:"required,numeric,min=1"`
	Keterangan     *string `json:"keterangan" validate:"omitempty"`
}

// --- STRUCT BARU UNTUK HALAMAN DETAIL ---

// PenugasanDetail merepresentasikan satu baris data penugasan di halaman detail
type PenugasanDetail struct {
	PengajarKelasID string `json:"pengajar_kelas_id"`
	NamaKelas       string `json:"nama_kelas"`
	NamaMapel       string `json:"nama_mapel"`
	NamaGuru        string `json:"nama_guru"`
}

// UjianDetail adalah DTO untuk data utama di halaman detail
type UjianDetail struct {
	NamaPaketUjian string            `json:"nama_paket_ujian"`
	Penugasan      []PenugasanDetail `json:"penugasan"`
}

// AvailableKelas adalah struktur untuk Cascader di frontend
type AvailableKelas struct {
	Value    string           `json:"value"` // isinya jenjang_id-tingkatan_id
	Label    string           `json:"label"` // isinya "Jenjang - Tingkatan"
	Children []AvailableMapel `json:"children"`
}

type AvailableMapel struct {
	Value    string              `json:"value"` // isinya mapel_id
	Label    string              `json:"label"` // isinya nama_mapel
	Children []AvailablePengajar `json:"children"`
}

type AvailablePengajar struct {
	Value string `json:"value"` // isinya pengajar_kelas_id
	Label string `json:"label"` // isinya nama_guru
}

// UjianDetailResponse adalah struktur JSON final yang dikirim ke frontend
type UjianDetailResponse struct {
	Detail         UjianDetail      `json:"detail"`
	AvailableKelas []AvailableKelas `json:"availableKelas"`
}
