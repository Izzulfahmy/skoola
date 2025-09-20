// file: backend/internal/auth/service.go
package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"skoola/internal/teacher"
	"skoola/internal/tenant" // <-- 1. IMPOR PAKET TENANT
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound       = errors.New("user tidak ditemukan")
	ErrInvalidCredentials = errors.New("email atau password salah")
	// --- 2. TAMBAHKAN ERROR BARU ---
	ErrInvalidTenantID = errors.New("ID Sekolah tidak valid atau tidak ditemukan")
)

type Service interface {
	Login(ctx context.Context, schemaName string, input LoginInput) (string, error)
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type service struct {
	teacherRepo teacher.Repository
	tenantRepo  tenant.Repository // <-- 3. TAMBAHKAN TENANT REPO
	jwtSecret   []byte
}

// --- 4. PERBARUI FUNGSI NewService ---
func NewService(teacherRepo teacher.Repository, tenantRepo tenant.Repository, jwtSecret string) Service {
	return &service{
		teacherRepo: teacherRepo,
		tenantRepo:  tenantRepo, // Tambahkan ini
		jwtSecret:   []byte(jwtSecret),
	}
}

// --- 5. PERBARUI LOGIKA FUNGSI LOGIN ---
func (s *service) Login(ctx context.Context, schemaName string, input LoginInput) (string, error) {
	var user *teacher.User
	var err error

	log.Printf("--- PROSES LOGIN DIMULAI UNTUK EMAIL: %s ---", input.Email)

	if schemaName == "" {
		// Logika untuk Superadmin (tidak berubah)
		log.Printf("Mencari user di public.users (Login Superadmin)...")
		user, err = s.teacherRepo.GetPublicUserByEmail(ctx, input.Email)
		if err != nil {
			log.Printf("ERROR saat mencari public user: %v", err)
			return "", fmt.Errorf("error saat mencari public user: %w", err)
		}
	} else {
		// Logika untuk Admin Sekolah (DENGAN PERUBAHAN)
		log.Printf("Memvalidasi ID Sekolah (schema): '%s'...", schemaName)
		exists, err := s.tenantRepo.CheckSchemaExists(ctx, schemaName)
		if err != nil {
			log.Printf("ERROR saat validasi schema: %v", err)
			return "", fmt.Errorf("error saat validasi schema: %w", err)
		}
		if !exists {
			log.Printf("HASIL: ID Sekolah '%s' TIDAK DITEMUKAN.", schemaName)
			return "", ErrInvalidTenantID
		}
		log.Printf("HASIL: ID Sekolah valid. Melanjutkan pencarian user...")

		log.Printf("Mencari user di schema '%s'...", schemaName)
		user, err = s.teacherRepo.GetByEmail(ctx, schemaName, input.Email)
		if err != nil {
			log.Printf("ERROR saat mencari user tenant: %v", err)
			return "", fmt.Errorf("error saat mencari user tenant: %w", err)
		}
	}

	if user == nil {
		log.Printf("HASIL: User dengan email '%s' TIDAK DITEMUKAN.", input.Email)
		return "", ErrInvalidCredentials // Diubah agar lebih konsisten
	}
	log.Printf("HASIL: User ditemukan. ID: %s, Role: %s", user.ID, user.Role)

	log.Printf("Membandingkan password...")
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		log.Printf("HASIL: Perbandingan password GAGAL.")
		return "", ErrInvalidCredentials
	}
	log.Printf("HASIL: Perbandingan password BERHASIL.")

	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
		"iat":  time.Now().Unix(),
	}

	if user.Role != "superadmin" {
		claims["sch"] = schemaName
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		log.Printf("ERROR saat membuat token JWT: %v", err)
		return "", fmt.Errorf("gagal membuat token: %w", err)
	}

	log.Printf("--- PROSES LOGIN BERHASIL ---")
	return tokenString, nil
}
