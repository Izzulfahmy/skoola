package teacher

import (
	"context"
	"database/sql"
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

// UpdateTeacherInput adalah DTO untuk memperbarui data guru.
type UpdateTeacherInput struct {
	NamaLengkap  string `json:"nama_lengkap"`
	NIP          string `json:"nip"`
	Alamat       string `json:"alamat"`
	NomorTelepon string `json:"nomor_telepon"`
}

// Service mendefinisikan interface untuk logika bisnis guru.
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error
	Delete(ctx context.Context, schemaName string, id string) error // <-- TAMBAHKAN INI
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
	if input.Email == "" || input.Password == "" || input.NamaLengkap == "" {
		return fmt.Errorf("email, password, dan nama lengkap tidak boleh kosong")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return fmt.Errorf("gagal melakukan hash password: %w", err)
	}

	userID := uuid.New().String()
	teacherID := uuid.New().String()

	user := &User{
		ID:           userID,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
	}

	teacher := &Teacher{
		ID:           teacherID,
		UserID:       userID,
		NamaLengkap:  input.NamaLengkap,
		NIP:          stringToPtr(input.NIP),
		Alamat:       stringToPtr(input.Alamat),
		NomorTelepon: stringToPtr(input.NomorTelepon),
	}

	err = s.repo.Create(ctx, schemaName, user, teacher)
	if err != nil {
		return fmt.Errorf("gagal membuat guru di service: %w", err)
	}

	return nil
}

// GetAll adalah implementasi untuk mengambil semua data guru.
func (s *service) GetAll(ctx context.Context, schemaName string) ([]Teacher, error) {
	teachers, err := s.repo.GetAll(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru di service: %w", err)
	}

	return teachers, nil
}

// GetByID adalah implementasi untuk mengambil satu data guru berdasarkan ID.
func (s *service) GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error) {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data guru by id di service: %w", err)
	}

	return teacher, nil
}

// Update adalah implementasi untuk memperbarui data guru.
func (s *service) Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error {
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk diupdate: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows // Kembalikan error jika guru tidak ditemukan.
	}

	teacher.NamaLengkap = input.NamaLengkap
	teacher.NIP = stringToPtr(input.NIP)
	teacher.Alamat = stringToPtr(input.Alamat)
	teacher.NomorTelepon = stringToPtr(input.NomorTelepon)

	err = s.repo.Update(ctx, schemaName, teacher)
	if err != nil {
		return fmt.Errorf("gagal mengupdate guru di service: %w", err)
	}

	return nil
}

// Delete adalah implementasi untuk menghapus data guru.
func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	// 1. Pastikan guru ada sebelum mencoba menghapus.
	// Ini memberikan pesan error yang lebih konsisten jika ID tidak ditemukan.
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk dihapus: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows // Guru tidak ditemukan.
	}

	// 2. Panggil repository untuk menghapus data.
	err = s.repo.Delete(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal menghapus guru di service: %w", err)
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
