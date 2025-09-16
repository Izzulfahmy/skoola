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
	jwtSecret   []byte             // Kunci rahasia JWT disimpan di sini
}

// NewService sekarang menerima jwtSecret sebagai argumen.
func NewService(teacherRepo teacher.Repository, jwtSecret string) Service {
	return &service{
		teacherRepo: teacherRepo,
		jwtSecret:   []byte(jwtSecret), // Simpan kuncinya di sini
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
		return "", ErrInvalidCredentials
	}

	// 3. Jika password cocok, buat token JWT
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"sch":  schemaName,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Gunakan s.jwtSecret, bukan variabel global lagi
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("gagal membuat token: %w", err)
	}

	// 4. Kembalikan string token
	return tokenString, nil
}
