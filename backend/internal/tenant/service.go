// file: backend/internal/tenant/service.go
package tenant

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"skoola/internal/teacher"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Register(ctx context.Context, input RegisterTenantInput) error
	GetAll(ctx context.Context) ([]Tenant, error) // <-- TAMBAHKAN INI
}

type service struct {
	repo        Repository
	teacherRepo teacher.Repository
	validate    *validator.Validate
	db          *sql.DB
}

func NewService(repo Repository, teacherRepo teacher.Repository, validate *validator.Validate, db *sql.DB) Service {
	return &service{
		repo:        repo,
		teacherRepo: teacherRepo,
		validate:    validate,
		db:          db,
	}
}

// --- FUNGSI BARU DITAMBAHKAN DI SINI ---
func (s *service) GetAll(ctx context.Context) ([]Tenant, error) {
	tenants, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data tenants di service: %w", err)
	}
	return tenants, nil
}

// Fungsi Register tetap sama
func (s *service) Register(ctx context.Context, input RegisterTenantInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %w", err)
	}
	defer tx.Rollback()

	if err := s.repo.CreateTenantSchema(ctx, tx, input); err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.AdminPass), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password admin: %w", err)
	}

	adminUser := &teacher.User{
		ID:           uuid.New().String(),
		Email:        input.AdminEmail,
		PasswordHash: string(hashedPassword),
		Role:         "admin",
	}

	adminTeacherData := &teacher.Teacher{
		ID:          uuid.New().String(),
		UserID:      adminUser.ID,
		NamaLengkap: input.AdminName,
	}

	err = s.teacherRepo.Create(ctx, tx, input.SchemaName, adminUser, adminTeacherData)
	if err != nil {
		return fmt.Errorf("gagal membuat admin pertama: %w", err)
	}

	return tx.Commit()
}
