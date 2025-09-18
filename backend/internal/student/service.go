// file: backend/internal/student/service.go
package student

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

// PERUBAHAN 1: Menyesuaikan aturan validasi
type CreateStudentInput struct {
	NamaLengkap      string  `json:"nama_lengkap" validate:"required,min=1"`                    // Diubah ke min=1
	NIS              *string `json:"nis,omitempty" validate:"omitempty,numeric"`                // Dihapus min=4
	NISN             *string `json:"nisn,omitempty" validate:"omitempty,numeric"`               // Dihapus min=10,max=10
	Alamat           *string `json:"alamat,omitempty" validate:"omitempty"`                     // Dihapus min=5
	NamaWali         *string `json:"nama_wali,omitempty" validate:"omitempty"`                  // Dihapus min=3
	NomorTeleponWali *string `json:"nomor_telepon_wali,omitempty" validate:"omitempty,numeric"` // Dihapus min=10,max=15
}

// PERUBAHAN 2: Menyamakan UpdateStudentInput
type UpdateStudentInput struct {
	NamaLengkap      string  `json:"nama_lengkap" validate:"required,min=1"`                    // Diubah ke min=1
	NIS              *string `json:"nis,omitempty" validate:"omitempty,numeric"`                // Dihapus min=4
	NISN             *string `json:"nisn,omitempty" validate:"omitempty,numeric"`               // Dihapus min=10,max=10
	Alamat           *string `json:"alamat,omitempty" validate:"omitempty"`                     // Dihapus min=5
	NamaWali         *string `json:"nama_wali,omitempty" validate:"omitempty"`                  // Dihapus min=3
	NomorTeleponWali *string `json:"nomor_telepon_wali,omitempty" validate:"omitempty,numeric"` // Dihapus min=10,max=15
}

// Service mendefinisikan interface untuk logika bisnis siswa.
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

func (s *service) Create(ctx context.Context, schemaName string, input CreateStudentInput) (*Student, error) {
	if err := s.validate.Struct(input); err != nil {
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
		NIS:              input.NIS,
		NISN:             input.NISN,
		Alamat:           input.Alamat,
		NamaWali:         input.NamaWali,
		NomorTeleponWali: input.NomorTeleponWali,
	}

	if err := s.repo.Create(ctx, schemaName, student); err != nil {
		return nil, fmt.Errorf("gagal membuat siswa di service: %w", err)
	}

	return student, nil
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

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateStudentInput) error {
	if err := s.validate.Struct(input); err != nil {
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
	student.NIS = input.NIS
	student.NISN = input.NISN
	student.Alamat = input.Alamat
	student.NamaWali = input.NamaWali
	student.NomorTeleponWali = input.NomorTeleponWali

	if err := s.repo.Update(ctx, schemaName, student); err != nil {
		return fmt.Errorf("gagal mengupdate siswa di service: %w", err)
	}

	return nil
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
