package ujianmaster

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

// UjianMaster merepresentasikan entitas di tabel 'ujian_master'.
type UjianMaster struct {
	ID             uuid.UUID `json:"id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	TahunAjaranID  uuid.UUID `json:"tahun_ajaran_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PenugasanUjian merepresentasikan data penugasan ujian dari query.
type PenugasanUjian struct {
	PengajarKelasID string `json:"pengajar_kelas_id"`
	NamaKelas       string `json:"nama_kelas"`
	NamaMapel       string `json:"nama_mapel"`
	NamaGuru        string `json:"nama_guru"`
}

// AvailableKelas adalah struktur untuk data kelas yang tersedia untuk penugasan.
type AvailableKelas struct {
	Value    string           `json:"value"`
	Label    string           `json:"label"`
	Children []AvailableMapel `json:"children"`
}

// AvailableMapel adalah sub-struktur untuk mata pelajaran dalam AvailableKelas.
type AvailableMapel struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// UjianMasterDetail adalah response gabungan untuk detail ujian master.
type UjianMasterDetail struct {
	Detail         UjianMaster      `json:"detail"`
	Penugasan      []PenugasanUjian `json:"penugasan"`
	AvailableKelas []AvailableKelas `json:"availableKelas"`
}

// PesertaUjian merepresentasikan entitas di tabel 'peserta_ujian'.
type PesertaUjian struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UjianMasterID  uuid.UUID      `gorm:"type:uuid;not null"`
	AnggotaKelasID uuid.UUID      `gorm:"type:uuid;not null"`
	Urutan         int            `gorm:"not null"`
	NomorUjian     sql.NullString `gorm:"type:varchar(50)"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// PesertaUjianDetail adalah struct untuk response API yang berisi detail siswa.
type PesertaUjianDetail struct {
	ID         uuid.UUID `json:"id"`
	NamaSiswa  string    `json:"nama_siswa"`
	NISN       string    `json:"nisn"`
	Urutan     int       `json:"urutan"`
	NomorUjian *string   `json:"nomor_ujian"`
	NamaKelas  string    `json:"nama_kelas"`
}

// GroupedPesertaUjian adalah struktur untuk mengelompokkan peserta berdasarkan nama kelas.
type GroupedPesertaUjian map[string][]PesertaUjianDetail
