// file: internal/student/service.go
package student

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// ErrValidation adalah error khusus untuk kegagalan validasi.
var ErrValidation = errors.New("validation failed")

// CreateStudentInput adalah DTO untuk menerima data siswa baru dari API.
type CreateStudentInput struct {
	NamaLengkap      string `json:"nama_lengkap" validate:"required,min=3"`
	NIS              string `json:"nis" validate:"omitempty,numeric,min=4"`
	NISN             string `json:"nisn" validate:"omitempty,numeric,min=10,max=10"`
	Alamat           string `json:"alamat" validate:"omitempty,min=5"`
	NamaWali         string `json:"nama_wali" validate:"omitempty,min=3"`
	NomorTeleponWali string `json:"nomor_telepon_wali" validate:"omitempty,numeric,min=10,max=15"`
}

// Service mendefinisikan interface untuk logika bisnis siswa.
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error)
	GetAll(ctx context.Context, schemaName string) ([]Student, error)
}

// service adalah implementasi dari interface Service.
type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service siswa.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{
		repo:     repo,
		validate: validate,
	}
}

// Create adalah implementasi untuk membuat siswa baru.
func (s *service) Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error) {
	// 1. Jalankan validasi pada input.
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	// 2. Buat objek Student dari input DTO.
	student := &Student{
		ID:               uuid.New().String(),
		NamaLengkap:      input.NamaLengkap,
		NIS:              stringToPtr(input.NIS),
		NISN:             stringToPtr(input.NISN),
		Alamat:           stringToPtr(input.Alamat),
		NamaWali:         stringToPtr(input.NamaWali),
		NomorTeleponWali: stringToPtr(input.NomorTeleponWali),
	}

	// 3. Panggil repository untuk menyimpan data.
	if err := s.repo.Create(ctx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat siswa di service: %w", err)
	}

	// 4. Kembalikan objek siswa yang baru dibuat.
	return student, nil
}

// GetAll adalah implementasi untuk mengambil semua data siswa.
func (s *service) GetAll(ctx context.Context, schemaName string) ([]Student, error) {
	students, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa di service: %w", err)
	}
	return students, nil
}

// stringToPtr adalah fungsi helper untuk mengubah string menjadi pointer string.
func stringToPtr(str string) *string {
	if str == "" {
		return nil
	}
	return &str
}
