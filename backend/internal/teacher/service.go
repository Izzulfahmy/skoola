package teacher

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// CreateTeacherInput adalah DTO (Data Transfer Object) untuk membawa data dari handler ke service.
type CreateTeacherInput struct {
	Email        string `json:"email" validate:"required,email"`
	Password     string `json:"password" validate:"required,min=8"`
	NamaLengkap  string `json:"nama_lengkap" validate:"required,min=3"`
	NIP          string `json:"nip" validate:"omitempty,numeric,min=10,max=18"`
	Alamat       string `json:"alamat" validate:"omitempty,min=5"`
	NomorTelepon string `json:"nomor_telepon" validate:"omitempty,numeric,min=10,max=15"`
}

// UpdateTeacherInput adalah DTO untuk memperbarui data guru.
type UpdateTeacherInput struct {
	NamaLengkap  string `json:"nama_lengkap" validate:"required,min=3"`
	NIP          string `json:"nip" validate:"omitempty,numeric,min=10,max=18"`
	Alamat       string `json:"alamat" validate:"omitempty,min=5"`
	NomorTelepon string `json:"nomor_telepon" validate:"omitempty,numeric,min=10,max=15"`
}

// Service mendefinisikan interface untuk logika bisnis guru.
type Service interface {
	Create(ctx context.Context, schemaName string, input CreateTeacherInput) error
	GetAll(ctx context.Context, schemaName string) ([]Teacher, error)
	GetByID(ctx context.Context, schemaName string, id string) (*Teacher, error)
	Update(ctx context.Context, schemaName string, id string, input UpdateTeacherInput) error
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository          // Dependensi ke repository
	validate *validator.Validate // <-- TAMBAHKAN INI
}

// NewService membuat instance baru dari service.
func NewService(repo Repository, validate *validator.Validate) Service { // <-- TAMBAHKAN PARAMETER
	return &service{
		repo:     repo,
		validate: validate, // <-- TAMBAHKAN INI
	}
}

// Create adalah implementasi method untuk membuat guru baru.
func (s *service) Create(ctx context.Context, schemaName string, input CreateTeacherInput) error {
	// 1. Ganti validasi lama dengan validator yang lebih canggih.
	if err := s.validate.Struct(input); err != nil {
		// Jika ada error validasi, kembalikan error yang lebih spesifik.
		// Ini adalah error dari klien (400 Bad Request), bukan error server (500).
		return fmt.Errorf("validasi gagal: %w", err)
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
	// Tambahkan validasi di sini juga
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("validasi gagal: %w", err)
	}

	// 1. Pertama, dapatkan data guru yang ada saat ini.
	teacher, err := s.repo.GetByID(ctx, schemaName, id)
	if err != nil {
		return fmt.Errorf("gagal mencari guru untuk diupdate: %w", err)
	}
	if teacher == nil {
		return sql.ErrNoRows
	}

	// 2. Terapkan perubahan dari input ke data yang sudah ada.
	teacher.NamaLengkap = input.NamaLengkap
	teacher.NIP = stringToPtr(input.NIP)
	teacher.Alamat = stringToPtr(input.Alamat)
	teacher.NomorTelepon = stringToPtr(input.NomorTelepon)

	// 3. Panggil repository untuk menyimpan perubahan ke database.
	err = s.repo.Update(ctx, schemaName, teacher)
	if err != nil {
		return fmt.Errorf("gagal mengupdate guru di service: %w", err)
	}

	return nil
}

// Delete adalah implementasi untuk menghapus data guru.
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

// stringToPtr adalah fungsi helper kecil untuk mengubah string menjadi pointer string.
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
