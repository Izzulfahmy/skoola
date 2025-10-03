// file: backend/internal/pembelajaran/model.go
package pembelajaran

import (
	"skoola/internal/penilaiansumatif"
	"time"
)

// RencanaPembelajaranItem adalah tipe gabungan yang bisa berisi Materi atau Ujian.
type RencanaPembelajaranItem struct {
	Type               string                              `json:"type"` // "materi" atau "ujian"
	ID                 int                                 `json:"id"`
	PengajarKelasID    string                              `json:"pengajar_kelas_id"`
	Nama               string                              `json:"nama"`
	Urutan             int                                 `json:"urutan"`
	Deskripsi          *string                             `json:"deskripsi,omitempty"`
	TujuanPembelajaran []TujuanPembelajaran                `json:"tujuan_pembelajaran,omitempty"`
	PenilaianSumatif   []penilaiansumatif.PenilaianSumatif `json:"penilaian_sumatif,omitempty"`
}

// Ujian merepresentasikan data dari tabel 'ujian'.
type Ujian struct {
	ID               int                                 `json:"id"`
	PengajarKelasID  string                              `json:"pengajar_kelas_id"`
	UjianMasterID    string                              `json:"ujian_master_id"` // DIUBAH
	Urutan           int                                 `json:"urutan"`
	CreatedAt        time.Time                           `json:"created_at"`
	UpdatedAt        time.Time                           `json:"updated_at"`
	PenilaianSumatif []penilaiansumatif.PenilaianSumatif `json:"penilaian_sumatif"`
}

// UjianDetail adalah DTO untuk menampung data gabungan dari tabel ujian dan ujian_master
type UjianDetail struct {
	ID              int       `json:"id"`
	PengajarKelasID string    `json:"pengajar_kelas_id"`
	UjianMasterID   string    `json:"ujian_master_id"`
	NamaPaketUjian  string    `json:"nama_paket_ujian"` // Field baru dari join
	Urutan          int       `json:"urutan"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// TujuanPembelajaran merepresentasikan data dari tabel 'tujuan_pembelajaran'.
type TujuanPembelajaran struct {
	ID                   int                                 `json:"id"`
	MateriPembelajaranID int                                 `json:"materi_pembelajaran_id"`
	DeskripsiTujuan      string                              `json:"deskripsi_tujuan"`
	Urutan               int                                 `json:"urutan"`
	CreatedAt            time.Time                           `json:"created_at"`
	UpdatedAt            time.Time                           `json:"updated_at"`
	PenilaianSumatif     []penilaiansumatif.PenilaianSumatif `json:"penilaian_sumatif"`
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

// --- DTO BARU UNTUK MONITORING UJIAN (Ditambahkan) ---
type UjianMonitoring struct {
	ID            string `json:"id"`         // ID Ujian (yang paling kecil) dalam grup
	NamaUjian     string `json:"nama_ujian"` // Nama Ujian (Contoh: Ujian Tengah Semester)
	TahunAjaranID string `json:"tahun_ajaran_id"`
	JumlahKelas   int    `json:"jumlah_kelas"` // Jumlah Kelas/Rombel yang diaplikasikan
	JumlahMapel   int    `json:"jumlah_mapel"` // Jumlah Mata Pelajaran yang terlibat
}

// ------------------------------------

// --- DTO (Data Transfer Objects) untuk Input ---

// UpsertMateriInput adalah DTO untuk membuat atau mengupdate data materi.
type UpsertMateriInput struct {
	PengajarKelasID string `json:"pengajar_kelas_id" validate:"required,uuid"`
	NamaMateri      string `json:"nama_materi" validate:"required,min=3,max=255"`
	Deskripsi       string `json:"deskripsi" validate:"omitempty"`
	Urutan          int    `json:"urutan" validate:"omitempty,numeric"`
}

// UpsertUjianInput adalah DTO untuk membuat atau mengupdate data ujian.
type UpsertUjianInput struct {
	PengajarKelasID string `json:"pengajar_kelas_id" validate:"required,uuid"`
	NamaUjian       string `json:"nama_ujian" validate:"required,min=3,max=255"`
	Urutan          int    `json:"urutan" validate:"omitempty,numeric"`
}

// UpsertTujuanInput adalah DTO untuk membuat atau mengupdate data tujuan pembelajaran.
type UpsertTujuanInput struct {
	MateriPembelajaranID int    `json:"materi_pembelajaran_id" validate:"required,numeric"`
	DeskripsiTujuan      string `json:"deskripsi_tujuan" validate:"required,min=3"`
	Urutan               int    `json:"urutan" validate:"omitempty,numeric"`
}

// UpdateUrutanInput adalah DTO untuk update urutan tujuan pembelajaran
type UpdateUrutanInput struct {
	OrderedIDs []int `json:"ordered_ids" validate:"required,dive,numeric"`
}

// --- DTO BARU UNTUK UPDATE URUTAN GABUNGAN ---
type UpdateRencanaUrutanInput struct {
	OrderedItems []RencanaUrutanItem `json:"ordered_items" validate:"required,dive"`
}

type RencanaUrutanItem struct {
	ID   int    `json:"id" validate:"required"`
	Type string `json:"type" validate:"required,oneof=materi ujian"`
}

// --- DTO BARU UNTUK BULK CREATION UJIAN (REFACTOR) ---
type CreateBulkUjianInput struct {
	UjianMasterID    string   `json:"ujian_master_id" validate:"required,uuid"`
	PengajarKelasIDs []string `json:"pengajar_kelas_ids" validate:"required,min=1,dive,uuid"`
}

type BulkUjianResult struct {
	SuccessCount int `json:"success_count"`
	TotalCount   int `json:"total_count"`
}
