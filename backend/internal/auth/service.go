// file: backend/internal/auth/service.go
package auth

import (
	"context"
	"errors"
	"fmt"
	"log" // <-- Impor paket log
	"skoola/internal/teacher"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound       = errors.New("user tidak ditemukan")
	ErrInvalidCredentials = errors.New("email atau password salah")
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
	jwtSecret   []byte
}

func NewService(teacherRepo teacher.Repository, jwtSecret string) Service {
	return &service{
		teacherRepo: teacherRepo,
		jwtSecret:   []byte(jwtSecret),
	}
}

func (s *service) Login(ctx context.Context, schemaName string, input LoginInput) (string, error) {
	var user *teacher.User
	var err error

	log.Printf("--- PROSES LOGIN DIMULAI UNTUK EMAIL: %s ---", input.Email)

	if schemaName == "" {
		log.Printf("Mencari user di public.users (Login Superadmin)...")
		user, err = s.teacherRepo.GetPublicUserByEmail(ctx, input.Email)
		if err != nil {
			log.Printf("ERROR saat mencari public user: %v", err)
			return "", fmt.Errorf("error saat mencari public user: %w", err)
		}
	} else {
		log.Printf("Mencari user di schema '%s'...", schemaName)
		user, err = s.teacherRepo.GetByEmail(ctx, schemaName, input.Email)
		if err != nil {
			log.Printf("ERROR saat mencari user tenant: %v", err)
			return "", fmt.Errorf("error saat mencari user tenant: %w", err)
		}
	}

	if user == nil {
		log.Printf("HASIL: User dengan email '%s' TIDAK DITEMUKAN.", input.Email)
		return "", ErrUserNotFound
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
