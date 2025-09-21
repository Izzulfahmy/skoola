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

// --- 1. Definisikan Input DTO (Data Transfer Object) ---
// DTO untuk membuat siswa baru
type CreateStudentInput struct {
	StatusSiswa       string `json:"status_siswa" validate:"required,oneof=Aktif Lulus Pindah Keluar"`
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

// DTO untuk memperbarui data siswa (sama seperti Create)
type UpdateStudentInput = CreateStudentInput

// --- 2. Interface Service tetap sama ---
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error)
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{
		repo:     repo,
		validate: validate,
	}
}

// --- 3. Helper untuk mengubah string dan waktu ---
// Mengubah string kosong menjadi nil pointer
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Mengubah string tanggal (YYYY-MM-DD) menjadi pointer time.Time
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

// --- 4. Perbarui Logika Create dan Update ---
func (s *service) Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	student := &Student{
		ID:                uuid.New().String(),
		StatusSiswa:       input.StatusSiswa,
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

	if err := s.repo.Create(ctx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat siswa di service: %w", err)
	}

	return student, nil
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

	// Map input ke model yang ada
	student.StatusSiswa = input.StatusSiswa
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

// --- Fungsi lain tidak perlu diubah ---
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
