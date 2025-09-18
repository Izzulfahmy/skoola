// file: backend/internal/teacher/service.go
package teacher

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrValidation = errors.New("validation failed")

type CreateTeacherInput struct {
	Email        string `json:"email" validate:"required,email"`
	Password     string `json:"password" validate:"required,min=8"`
	NamaLengkap  string `json:"nama_lengkap" validate:"required,min=3"`
	NIP          string `json:"nip" validate:"omitempty,numeric,min=10,max=18"`
	Alamat       string `json:"alamat" validate:"omitempty,min=5"`
	NomorTelepon string `json:"nomor_telepon" validate:"omitempty,numeric,min=10,max=15"`
}

type UpdateTeacherInput struct {
	Email        string `json:"email" validate:"required,email"`
	NamaLengkap  string `json:"nama_lengkap" validate:"required,min=3"`
	NIP          string `json:"nip" validate:"omitempty,numeric,min=10,max=18"`
	Alamat       string `json:"alamat" validate:"omitempty,min=5"`
	NomorTelepon string `json:"nomor_telepon" validate:"omitempty,numeric,min=10,max=15"`
}

type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
	db       *sql.DB
}

func NewService(repo Repository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:     repo,
		validate: validate,
		db:       db,
	}
}

func (s *service) Create(ctx context.Context, schemaName string, input CreateTeacherInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password: %w", err)
	}

	user := &User{
		ID:           uuid.New().String(),
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Role:         "teacher", // Role default di sini adalah teacher
	}

	teacher := &Teacher{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		NamaLengkap:  input.NamaLengkap,
		NIP:          stringToPtr(input.NIP),
		Alamat:       stringToPtr(input.Alamat),
		NomorTelepon: stringToPtr(input.NomorTelepon),
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	err = s.repo.Create(ctx, tx, schemaName, user, teacher)
	if err != nil {
		return fmt.Errorf("gagal membuat guru di service: %w", err)
	}

	return tx.Commit()
}

// ... (Salin semua fungsi lainnya dari GetAll hingga stringToPtr di sini tanpa perubahan)
func (s *service) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	teachers, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru di service: %w", err)
	}
	return teachers, nil
}
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru by id di service: %w", err)
	}
	return teacher, nil
}
func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk diupdate: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows
	}
	teacher.NamaLengkap = input.NamaLengkap
	teacher.NIP = stringToPtr(input.NIP)
	teacher.Alamat = stringToPtr(input.Alamat)
	teacher.NomorTelepon = stringToPtr(input.NomorTelepon)
	teacher.Email = input.Email
	err = s.repo.Update(ctx, schemaName, teacher)
	if err != nil {
		return fmt.Errorf("gagal mengupdate guru di service: %w", err)
	}
	return nil
}
func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk dihapus: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows
	}
	err = s.repo.Delete(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal menghapus guru di service: %w", err)
	}
	return nil
}
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
