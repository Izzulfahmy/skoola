// file: backend/internal/tenant/service.go
package tenant

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"skoola/internal/teacher"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	Register(ctx context.Context, input RegisterTenantInput) error
	GetAll(ctx context.Context) ([]Tenant, error)
	GetTenantsWithoutNaungan(ctx context.Context) ([]Tenant, error) // <-- TAMBAHKAN INI
	UpdateAdminEmail(ctx context.Context, schemaName string, input UpdateAdminEmailInput) error
	ResetAdminPassword(ctx context.Context, schemaName string, input ResetAdminPasswordInput) error
	DeleteTenant(ctx context.Context, schemaName string) error
	RunMigrationsForAllTenants(ctx context.Context) (int, error)
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

// --- FUNGSI BARU UNTUK MENGAMBIL TENANT TANPA NAUNGAN ---
func (s *service) GetTenantsWithoutNaungan(ctx context.Context) ([]Tenant, error) {
	tenants, err := s.repo.GetTenantsWithoutNaungan(ctx)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data tenants tanpa naungan di service: %w", err)
	}
	return tenants, nil
}

// --- FUNGSI BARU UNTUK MENJALANKAN MIGRASI KE SEMUA TENANT ---
func (s *service) RunMigrationsForAllTenants(ctx context.Context) (int, error) {
	// 1. Baca file migrasi baru
	migrationPath, err := filepath.Abs("./db/migrations/002_add_school_profile.sql")
	if err != nil {
		return 0, fmt.Errorf("gagal mendapatkan path file migrasi: %w", err)
	}
	migrationSQL, err := os.ReadFile(migrationPath)
	if err != nil {
		return 0, fmt.Errorf("gagal membaca file migrasi 002: %w", err)
	}

	// 2. Dapatkan semua tenant yang terdaftar
	tenants, err := s.repo.GetAll(ctx)
	if err != nil {
		return 0, fmt.Errorf("gagal mendapatkan daftar tenant: %w", err)
	}

	// 3. Looping dan jalankan migrasi untuk setiap tenant
	migratedCount := 0
	for _, tenant := range tenants {
		err := s.repo.ApplyMigrationToSchema(ctx, tenant.SchemaName, migrationSQL)
		if err != nil {
			// Jika gagal di satu tenant, kita bisa memilih untuk berhenti atau lanjut.
			// Untuk sekarang, kita kembalikan error dan berhenti.
			return migratedCount, fmt.Errorf("gagal migrasi untuk sekolah %s: %w", tenant.NamaSekolah, err)
		}
		migratedCount++
	}

	return migratedCount, nil
}

// --- FUNGSI-FUNGSI LAMA DI BAWAH INI TETAP SAMA ---

func (s *service) DeleteTenant(ctx context.Context, schemaName string) error {
	return s.repo.DeleteTenantBySchema(ctx, schemaName)
}

func (s *service) UpdateAdminEmail(ctx context.Context, schemaName string, input UpdateAdminEmailInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	admin, err := s.teacherRepo.GetAdminBySchema(ctx, schemaName)
	if err != nil {
		return fmt.Errorf("gagal menemukan admin untuk skema %s: %w", schemaName, err)
	}
	return s.teacherRepo.UpdateUserEmail(ctx, schemaName, admin.ID, input.Email)
}

func (s *service) ResetAdminPassword(ctx context.Context, schemaName string, input ResetAdminPasswordInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	admin, err := s.teacherRepo.GetAdminBySchema(ctx, schemaName)
	if err != nil {
		return fmt.Errorf("gagal menemukan admin untuk skema %s: %w", schemaName, err)
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password baru: %w", err)
	}
	return s.teacherRepo.UpdateUserPassword(ctx, schemaName, admin.ID, string(hashedPassword))
}

func (s *service) GetAll(ctx context.Context) ([]Tenant, error) {
	tenants, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data tenants di service: %w", err)
	}
	return tenants, nil
}

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
