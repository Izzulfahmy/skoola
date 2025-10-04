package ujianmaster

import (
	"time"

	"github.com/google/uuid"
)

// UjianMaster disesuaikan dengan skema DB Anda.
type UjianMaster struct {
	ID             uuid.UUID `json:"id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	TahunAjaranID  uuid.UUID `json:"tahun_ajaran_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PenugasanUjian tetap sama
type PenugasanUjian struct {
	PengajarKelasID string `json:"pengajar_kelas_id"`
	NamaKelas       string `json:"nama_kelas"`
	NamaMapel       string `json:"nama_mapel"`
	NamaGuru        string `json:"nama_guru"`
}

// AvailableKelas tetap sama
type AvailableKelas struct {
	Value    string           `json:"value"`
	Label    string           `json:"label"`
	Children []AvailableMapel `json:"children"`
}

type AvailableMapel struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// UjianMasterDetail tetap sama
type UjianMasterDetail struct {
	Detail         UjianMaster      `json:"detail"`
	Penugasan      []PenugasanUjian `json:"penugasan"`
	AvailableKelas []AvailableKelas `json:"availableKelas"`
}
