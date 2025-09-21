// file: backend/internal/student/service.go
package student

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

// --- PERBAIKAN 1: Hapus StatusSiswa dari DTO ---
type CreateStudentInput struct {
	NIS               string `json:"nis" validate:"omitempty,numeric"`
	NISN              string `json:"nisn" validate:"omitempty,numeric"`
	NomorUjianSekolah string `json:"nomor_ujian_sekolah" validate:"omitempty"`
	NamaLengkap       string `json:"nama_lengkap" validate:"required,min=1"`
	NamaPanggilan     string `json:"nama_panggilan" validate:"omitempty"`
	JenisKelamin      string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir       string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir      string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama             string `json:"agama" validate:"omitempty,oneof=Islam 'Kristen Protestan' 'Kristen Katolik' Hindu Buddha Khonghucu Lainnya"`
	Kewarganegaraan   string `json:"kewarganegaraan" validate:"omitempty"`
	AlamatLengkap     string `json:"alamat_lengkap" validate:"omitempty"`
	DesaKelurahan     string `json:"desa_kelurahan" validate:"omitempty"`
	Kecamatan         string `json:"kecamatan" validate:"omitempty"`
	KotaKabupaten     string `json:"kota_kabupaten" validate:"omitempty"`
	Provinsi          string `json:"provinsi" validate:"omitempty"`
	KodePos           string `json:"kode_pos" validate:"omitempty,numeric"`
	NamaAyah          string `json:"nama_ayah" validate:"omitempty"`
	NamaIbu           string `json:"nama_ibu" validate:"omitempty"`
	NamaWali          string `json:"nama_wali" validate:"omitempty"`
	NomorKontakWali   string `json:"nomor_kontak_wali" validate:"omitempty,numeric"`
}

type UpdateStudentInput struct {
	NIS               string `json:"nis" validate:"omitempty,numeric"`
	NISN              string `json:"nisn" validate:"omitempty,numeric"`
	NomorUjianSekolah string `json:"nomor_ujian_sekolah" validate:"omitempty"`
	NamaLengkap       string `json:"nama_lengkap" validate:"required,min=1"`
	NamaPanggilan     string `json:"nama_panggilan" validate:"omitempty"`
	JenisKelamin      string `json:"jenis_kelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	TempatLahir       string `json:"tempat_lahir" validate:"omitempty"`
	TanggalLahir      string `json:"tanggal_lahir" validate:"omitempty,datetime=2006-01-02"`
	Agama             string `json:"agama" validate:"omitempty,oneof=Islam 'Kristen Protestan' 'Kristen Katolik' Hindu Buddha Khonghucu Lainnya"`
	Kewarganegaraan   string `json:"kewarganegaraan" validate:"omitempty"`
	AlamatLengkap     string `json:"alamat_lengkap" validate:"omitempty"`
	DesaKelurahan     string `json:"desa_kelurahan" validate:"omitempty"`
	Kecamatan         string `json:"kecamatan" validate:"omitempty"`
	KotaKabupaten     string `json:"kota_kabupaten" validate:"omitempty"`
	Provinsi          string `json:"provinsi" validate:"omitempty"`
	KodePos           string `json:"kode_pos" validate:"omitempty,numeric"`
	NamaAyah          string `json:"nama_ayah" validate:"omitempty"`
	NamaIbu           string `json:"nama_ibu" validate:"omitempty"`
	NamaWali          string `json:"nama_wali" validate:"omitempty"`
	NomorKontakWali   string `json:"nomor_kontak_wali" validate:"omitempty,numeric"`
}

type Service interface {
	Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error)
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo        Repository
	historyRepo HistoryRepository
	validate    *validator.Validate
	db          *sql.DB
}

func NewService(repo Repository, historyRepo HistoryRepository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:        repo,
		historyRepo: historyRepo,
		validate:    validate,
		db:          db,
	}
}

func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func dateToPtr(dateStr string) *time.Time {
	if dateStr == "" {
		return nil
	}
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil
	}
	return &parsedDate
}

// --- PERBAIKAN 2: Perbarui Logika Create ---
func (s *service) Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	student := &Student{
		ID:                uuid.New().String(),
		NIS:               stringToPtr(input.NIS),
		NISN:              stringToPtr(input.NISN),
		NomorUjianSekolah: stringToPtr(input.NomorUjianSekolah),
		NamaLengkap:       input.NamaLengkap,
		NamaPanggilan:     stringToPtr(input.NamaPanggilan),
		JenisKelamin:      stringToPtr(input.JenisKelamin),
		TempatLahir:       stringToPtr(input.TempatLahir),
		TanggalLahir:      dateToPtr(input.TanggalLahir),
		Agama:             stringToPtr(input.Agama),
		Kewarganegaraan:   stringToPtr(input.Kewarganegaraan),
		AlamatLengkap:     stringToPtr(input.AlamatLengkap),
		DesaKelurahan:     stringToPtr(input.DesaKelurahan),
		Kecamatan:         stringToPtr(input.Kecamatan),
		KotaKabupaten:     stringToPtr(input.KotaKabupaten),
		Provinsi:          stringToPtr(input.Provinsi),
		KodePos:           stringToPtr(input.KodePos),
		NamaAyah:          stringToPtr(input.NamaAyah),
		NamaIbu:           stringToPtr(input.NamaIbu),
		NamaWali:          stringToPtr(input.NamaWali),
		NomorKontakWali:   stringToPtr(input.NomorKontakWali),
	}

	if err := s.repo.Create(ctx, tx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat data siswa: %w", err)
	}

	initialHistory := &RiwayatAkademik{
		ID:              uuid.New().String(),
		StudentID:       student.ID,
		Status:          "Aktif",
		TanggalKejadian: time.Now(),
		Keterangan:      stringToPtr("Siswa baru"),
	}

	setSchemaQuery := fmt.Sprintf("SET search_path TO %q", schemaName)
	if _, err := tx.ExecContext(ctx, setSchemaQuery); err != nil {
		return nil, fmt.Errorf("gagal mengatur skema untuk riwayat: %w", err)
	}
	historyQuery := `
		INSERT INTO riwayat_akademik (id, student_id, status, tanggal_kejadian, keterangan)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err = tx.ExecContext(ctx, historyQuery, initialHistory.ID, initialHistory.StudentID, initialHistory.Status, initialHistory.TanggalKejadian, initialHistory.Keterangan)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat riwayat akademik awal: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("gagal commit transaksi: %w", err)
	}

	createdStudent, err := s.repo.GetByID(ctx, schemaName, student.ID)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa setelah dibuat: %w", err)
	}

	return createdStudent, nil
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari siswa untuk diupdate: %w", err)
	}
	if student == nil {
		return sql.ErrNoRows
	}

	student.NIS = stringToPtr(input.NIS)
	student.NISN = stringToPtr(input.NISN)
	student.NomorUjianSekolah = stringToPtr(input.NomorUjianSekolah)
	student.NamaLengkap = input.NamaLengkap
	student.NamaPanggilan = stringToPtr(input.NamaPanggilan)
	student.JenisKelamin = stringToPtr(input.JenisKelamin)
	student.TempatLahir = stringToPtr(input.TempatLahir)
	student.TanggalLahir = dateToPtr(input.TanggalLahir)
	student.Agama = stringToPtr(input.Agama)
	student.Kewarganegaraan = stringToPtr(input.Kewarganegaraan)
	student.AlamatLengkap = stringToPtr(input.AlamatLengkap)
	student.DesaKelurahan = stringToPtr(input.DesaKelurahan)
	student.Kecamatan = stringToPtr(input.Kecamatan)
	student.KotaKabupaten = stringToPtr(input.KotaKabupaten)
	student.Provinsi = stringToPtr(input.Provinsi)
	student.KodePos = stringToPtr(input.KodePos)
	student.NamaAyah = stringToPtr(input.NamaAyah)
	student.NamaIbu = stringToPtr(input.NamaIbu)
	student.NamaWali = stringToPtr(input.NamaWali)
	student.NomorKontakWali = stringToPtr(input.NomorKontakWali)

	if err := s.repo.Update(ctx, schemaName, student); err != nil {
		return fmt.Errorf("gagal mengupdate siswa di service: %w", err)
	}

	return nil
}

func (s *service) GetAll(ctx context.Context, schemaName string) ([]Student, error) {
	students, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa di service: %w", err)
	}
	return students, nil
}

func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Student, error) {
	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa by id di service: %w", err)
	}
	return student, nil
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari siswa untuk dihapus: %w", err)
	}
	if student == nil {
		return sql.ErrNoRows
	}

	return s.repo.Delete(ctx, schemaName, id)
}
