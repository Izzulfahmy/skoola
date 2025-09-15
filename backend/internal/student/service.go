package student

import (
	"context"
	"database/sql" // <-- Tambah import ini
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

// UpdateStudentInput adalah DTO untuk memperbarui data siswa.
type UpdateStudentInput struct {
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
	GetByID(ctx context.Context, schemaName string, id string) (*Student, error)              // <-- Tambah
	Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error // <-- Tambah
	Delete(ctx context.Context, schemaName string, id string) error                           // <-- Tambah
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
	if err := s.validate.Struct(input); err != nil {
		// Buat pesan error yang lebih deskriptif
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			for _, fieldErr := range validationErrors {
				return nil, fmt.Errorf("%w: field '%s' failed on the '%s' tag", ErrValidation, fieldErr.Field(), fieldErr.Tag())
			}
		}
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	student := &Student{
		ID:               uuid.New().String(),
		NamaLengkap:      input.NamaLengkap,
		NIS:              stringToPtr(input.NIS),
		NISN:             stringToPtr(input.NISN),
		Alamat:           stringToPtr(input.Alamat),
		NamaWali:         stringToPtr(input.NamaWali),
		NomorTeleponWali: stringToPtr(input.NomorTeleponWali),
	}

	if err := s.repo.Create(ctx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat siswa di service: %w", err)
	}

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

// GetByID mengambil satu data siswa berdasarkan ID.
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Student, error) {
	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data siswa by id di service: %w", err)
	}
	return student, nil
}

// Update memperbarui data siswa.
func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error {
	if err := s.validate.Struct(input); err != nil {
		// Buat pesan error yang lebih deskriptif
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			for _, fieldErr := range validationErrors {
				return fmt.Errorf("%w: field '%s' failed on the '%s' tag", ErrValidation, fieldErr.Field(), fieldErr.Tag())
			}
		}
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	student, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari siswa untuk diupdate: %w", err)
	}
	if student == nil {
		return sql.ErrNoRows
	}

	student.NamaLengkap = input.NamaLengkap
	student.NIS = stringToPtr(input.NIS)
	student.NISN = stringToPtr(input.NISN)
	student.Alamat = stringToPtr(input.Alamat)
	student.NamaWali = stringToPtr(input.NamaWali)
	student.NomorTeleponWali = stringToPtr(input.NomorTeleponWali)

	if err := s.repo.Update(ctx, schemaName, student); err != nil {
		return fmt.Errorf("gagal mengupdate siswa di service: %w", err)
	}

	return nil
}

// Delete menghapus data siswa.
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

// stringToPtr adalah fungsi helper untuk mengubah string menjadi pointer string.
func stringToPtr(str string) *string {
	if str == "" {
		return nil
	}
	return &str
}
