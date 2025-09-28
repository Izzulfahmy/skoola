// file: backend/internal/presensi/service.go
package presensi

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis presensi.
type Service interface {
	GetPresensi(ctx context.Context, schemaName string, kelasID string, year int, month int) ([]*PresensiSiswa, error)
	UpsertPresensi(ctx context.Context, schemaName string, input UpsertPresensiInput) error
	DeletePresensi(ctx context.Context, schemaName string, input DeletePresensiInput) error // <-- TAMBAHKAN INI
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service presensi.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

// --- FUNGSI BARU ---
func (s *service) DeletePresensi(ctx context.Context, schemaName string, input DeletePresensiInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tanggal, err := time.Parse("2006-01-02", input.Tanggal)
	if err != nil {
		return fmt.Errorf("format tanggal tidak valid: %w", err)
	}

	return s.repo.DeletePresensiBulk(ctx, schemaName, tanggal, input.AnggotaKelasIDs)
}

// --- FUNGSI LAMA (TIDAK BERUBAH) ---
func (s *service) GetPresensi(ctx context.Context, schemaName string, kelasID string, year int, month int) ([]*PresensiSiswa, error) {
	if kelasID == "" {
		return nil, errors.New("kelasID tidak boleh kosong")
	}
	if year == 0 || month < 1 || month > 12 {
		return nil, errors.New("tahun dan bulan tidak valid")
	}
	return s.repo.GetPresensiByKelasAndMonth(ctx, schemaName, kelasID, year, month)
}
func (s *service) UpsertPresensi(ctx context.Context, schemaName string, input UpsertPresensiInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tanggal, err := time.Parse("2006-01-02", input.Tanggal)
	if err != nil {
		return fmt.Errorf("format tanggal tidak valid: %w", err)
	}

	return s.repo.UpsertPresensiBulk(ctx, schemaName, tanggal, input.Data)
}
