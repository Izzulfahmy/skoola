package auth

import (
	"context"
	"errors"
	"fmt"
	"skoola/internal/teacher" // Kita butuh akses ke repository guru/user
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Definisikan error-error spesifik untuk otentikasi
var (
	ErrUserNotFound       = errors.New("user tidak ditemukan")
	ErrInvalidCredentials = errors.New("email atau password salah")
)

// JWTSecretKey adalah kunci rahasia untuk menandatangani token.
// DI APLIKASI PRODUKSI, INI HARUS DIAMBIL DARI ENVIRONMENT VARIABLE!
var JWTSecretKey = []byte("kunci-rahasia-yang-sangat-aman-dan-panjang")

// Service mendefinisikan interface untuk layanan otentikasi.
type Service interface {
	Login(ctx context.Context, schemaName string, input LoginInput) (string, error)
}

// LoginInput adalah DTO untuk request login.
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type service struct {
	teacherRepo teacher.Repository // Dependensi ke repository untuk mencari user
}

// NewService membuat instance baru dari service otentikasi.
func NewService(teacherRepo teacher.Repository) Service {
	return &service{
		teacherRepo: teacherRepo,
	}
}

// Login adalah implementasi logika untuk login user.
func (s *service) Login(ctx context.Context, schemaName string, input LoginInput) (string, error) {
	// 1. Cari user berdasarkan email
	user, err := s.teacherRepo.GetByEmail(ctx, schemaName, input.Email)
	if err != nil {
		return "", fmt.Errorf("error saat mencari user: %w", err)
	}
	if user == nil {
		return "", ErrUserNotFound
	}

	// 2. Bandingkan password yang diberikan dengan hash di database
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		// Jika error, kemungkinan besar karena password tidak cocok.
		return "", ErrInvalidCredentials
	}

	// 3. Jika password cocok, buat token JWT
	// Tentukan 'claims' atau data yang ingin kita simpan di dalam token
	claims := jwt.MapClaims{
		"sub":  user.ID,                               // Subject (ID user)
		"role": user.Role,                             // Peran user
		"sch":  schemaName,                            // Skema/Tenant
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // Waktu kedaluwarsa (24 jam)
		"iat":  time.Now().Unix(),                     // Waktu token dibuat
	}

	// Buat token baru dengan claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Tandatangani token dengan kunci rahasia untuk menghasilkan string token
	tokenString, err := token.SignedString(JWTSecretKey)
	if err != nil {
		return "", fmt.Errorf("gagal membuat token: %w", err)
	}

	// 4. Kembalikan string token
	return tokenString, nil
}
