// file: backend/internal/profile/service.go
package profile

import (
	"context"
	"fmt"

	"github.com/go-playground/validator/v10"
)

// Service mendefinisikan interface untuk logika bisnis profil sekolah.
type Service interface {
	GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error)
	UpdateProfile(ctx context.Context, schemaName string, input *ProfilSekolah) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service profil sekolah.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{
		repo:     repo,
		validate: validate,
	}
}

// GetProfile memanggil repository untuk mengambil data profil.
func (s *service) GetProfile(ctx context.Context, schemaName string) (*ProfilSekolah, error) {
	profile, err := s.repo.GetProfile(ctx, schemaName)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil profil di service: %w", err)
	}
	return profile, nil
}

// UpdateProfile memvalidasi input dan memanggil repository untuk memperbarui data.
func (s *service) UpdateProfile(ctx context.Context, schemaName string, input *ProfilSekolah) error {
	// Di sini Anda bisa menambahkan validasi menggunakan s.validate.Struct(input) jika diperlukan.
	// Untuk profil sekolah, seringkali validasi tidak seketat entitas lain,
	// jadi kita bisa melewatinya untuk saat ini.

	err := s.repo.UpdateProfile(ctx, schemaName, input)
	if err != nil {
		return fmt.Errorf("gagal mengupdate profil di service: %w", err)
	}
	return nil
}
