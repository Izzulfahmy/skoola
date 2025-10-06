package ujianmaster

import (
	"time"

	"github.com/google/uuid"
)

// UjianMaster represents the main exam package.
type UjianMaster struct {
	ID             uuid.UUID `json:"id"`
	NamaPaketUjian string    `json:"nama_paket_ujian"`
	TahunAjaranID  uuid.UUID `json:"tahun_ajaran_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PenugasanUjian represents a class and subject assigned to an exam.
type PenugasanUjian struct {
	PengajarKelasID string `json:"pengajar_kelas_id"`
	KelasID         string `json:"kelas_id"`
	NamaKelas       string `json:"nama_kelas"`
	NamaMapel       string `json:"nama_mapel"`
	NamaGuru        string `json:"nama_guru"`
}

// AvailableMapel is a helper struct for the frontend.
type AvailableMapel struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// AvailableKelas is a helper struct for the frontend.
type AvailableKelas struct {
	Value    string           `json:"value"`
	Label    string           `json:"label"`
	Children []AvailableMapel `json:"children"`
}

// UjianMasterDetail is the comprehensive view of an exam package.
type UjianMasterDetail struct {
	Detail         UjianMaster      `json:"detail"`
	Penugasan      []PenugasanUjian `json:"penugasan"`
	AvailableKelas []AvailableKelas `json:"availableKelas"`
}

// PesertaUjian represents a student registered for an exam.
type PesertaUjian struct {
	ID             uuid.UUID `db:"id"`
	UjianMasterID  uuid.UUID `db:"ujian_master_id"`
	AnggotaKelasID uuid.UUID `db:"anggota_kelas_id"`
	KelasID        uuid.UUID `db:"kelas_id"`
	Urutan         int       `db:"urutan"`
	NomorUjian     *string   `db:"nomor_ujian"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

// PesertaUjianDetail represents detailed information of a participant.
type PesertaUjianDetail struct {
	ID         string  `json:"id"`
	NamaSiswa  string  `json:"nama_siswa"`
	NISN       *string `json:"nisn"`
	Urutan     int     `json:"urutan"`
	NomorUjian *string `json:"nomor_ujian"`
	NamaKelas  string  `json:"nama_kelas"`
}

// GroupedPesertaUjian groups participants by class name.
type GroupedPesertaUjian map[string][]PesertaUjianDetail

// --- STRUCTS FOR GENERATE NOMOR UJIAN ---
type GenerateNomorUjianInput struct {
	Prefix string `json:"prefix"`
}

type GenerateNomorUjianResponse struct {
	Message        string `json:"message"`
	GeneratedCount int    `json:"generatedCount"`
	Prefix         string `json:"prefix"`
}

// --- STRUCTS FOR EXCEL EXPORT/IMPORT ---
type ExcelExportRequest struct {
	Format string `json:"format"` // "xlsx" or "csv"
}

type ExcelImportRequest struct {
	// File akan dikirim via multipart/form-data
}

type ExcelImportResponse struct {
	Message      string                `json:"message"`
	UpdatedCount int                   `json:"updatedCount"`
	ErrorRows    []ExcelImportErrorRow `json:"errorRows,omitempty"`
}

type ExcelImportErrorRow struct {
	Row         int    `json:"row"`
	Error       string `json:"error"`
	NamaLengkap string `json:"namaLengkap"`
}

type PesertaUjianExcelRow struct {
	No          int     `json:"no"`
	NamaLengkap string  `json:"namaLengkap"`
	NISN        *string `json:"nisn"`
	NamaKelas   string  `json:"namaKelas"`
	NomorUjian  *string `json:"nomorUjian"`
	Status      string  `json:"status"`
}
