// file: backend/internal/prestasi/service.go
package prestasi

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var ErrValidation = errors.New("validation failed")

// Service mendefinisikan interface untuk logika bisnis prestasi.
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertPrestasiInput) (*Prestasi, error)
	GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Prestasi, error)
	Delete(ctx context.Context, schemaName string, id string) error
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService membuat instance baru dari service presensi.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertPrestasiInput) (*Prestasi, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	tanggal, err := time.Parse("2006-01-02", input.Tanggal)
	if err != nil {
		return nil, fmt.Errorf("format tanggal tidak valid: %w", err)
	}

	prestasi := &Prestasi{
		ID:             uuid.New().String(),
		TahunAjaranID:  input.TahunAjaranID,
		AnggotaKelasID: input.AnggotaKelasID,
		NamaPrestasi:   input.NamaPrestasi,
		Tingkat:        input.Tingkat,
		Peringkat:      input.Peringkat,
		Tanggal:        tanggal,
		Deskripsi:      &input.Deskripsi,
	}

	return s.repo.Create(ctx, schemaName, prestasi)
}

func (s *service) GetAllByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Prestasi, error) {
	return s.repo.GetAllByTahunAjaran(ctx, schemaName, tahunAjaranID)
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}
