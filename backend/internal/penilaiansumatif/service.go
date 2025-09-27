// file: backend/internal/penilaiansumatif/service.go
package penilaiansumatif

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

// Service defines the business logic interface.
type Service interface {
	Create(ctx context.Context, schemaName string, input UpsertPenilaianSumatifInput) (*PenilaianSumatif, error)
	Update(ctx context.Context, schemaName string, id string, input UpsertPenilaianSumatifInput) error
	Delete(ctx context.Context, schemaName string, id string) error
	GetByTujuanPembelajaranID(ctx context.Context, schemaName string, tpID int) ([]PenilaianSumatif, error)
}

type service struct {
	repo     Repository
	validate *validator.Validate
}

// NewService creates a new service instance.
func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

func (s *service) Create(ctx context.Context, schemaName string, input UpsertPenilaianSumatifInput) (*PenilaianSumatif, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	var tanggal *time.Time
	if input.TanggalPelaksanaan != "" {
		t, err := time.Parse("2006-01-02", input.TanggalPelaksanaan)
		if err == nil {
			tanggal = &t
		}
	}

	var keterangan *string
	if input.Keterangan != "" {
		keterangan = &input.Keterangan
	}

	ps := &PenilaianSumatif{
		TujuanPembelajaranID: input.TujuanPembelajaranID,
		UjianID:              input.UjianID,
		JenisUjianID:         input.JenisUjianID,
		NamaPenilaian:        input.NamaPenilaian,
		TanggalPelaksanaan:   tanggal,
		Keterangan:           keterangan,
	}

	return s.repo.Create(ctx, schemaName, ps)
}

func (s *service) Update(ctx context.Context, schemaName string, id string, input UpsertPenilaianSumatifInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}

	var tanggal *time.Time
	if input.TanggalPelaksanaan != "" {
		t, err := time.Parse("2006-01-02", input.TanggalPelaksanaan)
		if err == nil {
			tanggal = &t
		}
	}

	var keterangan *string
	if input.Keterangan != "" {
		keterangan = &input.Keterangan
	}

	ps := &PenilaianSumatif{
		ID:                   id,
		TujuanPembelajaranID: input.TujuanPembelajaranID,
		UjianID:              input.UjianID,
		JenisUjianID:         input.JenisUjianID,
		NamaPenilaian:        input.NamaPenilaian,
		TanggalPelaksanaan:   tanggal,
		Keterangan:           keterangan,
	}

	return s.repo.Update(ctx, schemaName, ps)
}

func (s *service) Delete(ctx context.Context, schemaName string, id string) error {
	return s.repo.Delete(ctx, schemaName, id)
}

func (s *service) GetByTujuanPembelajaranID(ctx context.Context, schemaName string, tpID int) ([]PenilaianSumatif, error) {
	return s.repo.GetByTujuanPembelajaranID(ctx, schemaName, tpID)
}
