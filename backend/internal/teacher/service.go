package teacher

import (
	"context"
	"fmt"

	"github.com/google/uuid"     // Untuk generate ID unik
	"golang.org/x/crypto/bcrypt" // Untuk hashing password
)

// CreateTeacherInput adalah DTO (Data Transfer Object) untuk membawa data dari handler ke service.
type CreateTeacherInput struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	NamaLengkap  string `json:"nama_lengkap"`
	NIP          string `json:"nip"`
	Alamat       string `json:"alamat"`
	NomorTelepon string `json:"nomor_telepon"`
}

// Service mendefinisikan interface untuk logika bisnis guru.
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
}

type service struct {
	repo Repository // Dependensi ke repository
}

// NewService membuat instance baru dari service.
func NewService(repo Repository) Service {
	return &service{
		repo: repo,
	}
}

// Create adalah implementasi method untuk membuat guru baru.
func (s *service) Create(ctx context.Context, schemaName string, input CreateTeacherInput) error {
	// 1. Lakukan validasi dasar (bisa dikembangkan lebih lanjut)
	if input.Email == "" || input.Password == "" || input.NamaLengkap == "" {
		return fmt.Errorf("email, password, dan nama lengkap tidak boleh kosong")
	}

	// 2. Hash password sebelum disimpan
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password: %w", err)
	}

	// 3. Generate ID unik untuk user dan teacher
	userID := uuid.New().String()
	teacherID := uuid.New().String()

	// 4. Siapkan struct User dan Teacher untuk dikirim ke repository
	user := &User{
		ID:           userID,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
	}

	// FIX: Menggunakan helper untuk mengubah string menjadi *string jika tidak kosong
	teacher := &Teacher{
		ID:           teacherID,
		UserID:       userID,
		NamaLengkap:  input.NamaLengkap,
		NIP:          stringToPtr(input.NIP),
		Alamat:       stringToPtr(input.Alamat),
		NomorTelepon: stringToPtr(input.NomorTelepon),
	}

	// 5. Panggil repository untuk menyimpan data ke database
	err = s.repo.Create(ctx, schemaName, user, teacher)
	if err != nil {
		return fmt.Errorf("gagal membuat guru di service: %w", err)
	}

	return nil
}

// stringToPtr adalah fungsi helper kecil untuk mengubah string menjadi pointer string.
// Jika string input kosong, akan mengembalikan nil.
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
