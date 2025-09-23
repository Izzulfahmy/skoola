// file: backend/internal/kurikulum/service.go
package kurikulum

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

var ErrValidation = errors.New("validation failed")

type Service interface {
	// Kurikulum
	GetAllKurikulum(ctx context.Context, schemaName string) ([]Kurikulum, error) // <-- TAMBAHKAN INI
	GetKurikulumByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kurikulum, error)
	CreateKurikulum(ctx context.Context, schemaName string, input UpsertKurikulumInput) (*Kurikulum, error)
	UpdateKurikulum(ctx context.Context, schemaName string, id int, input UpsertKurikulumInput) error
	DeleteKurikulum(ctx context.Context, schemaName string, id int) error

	// Fase
	GetAllFase(ctx context.Context, schemaName string) ([]Fase, error)
	CreateFase(ctx context.Context, schemaName string, input UpsertFaseInput) (*Fase, error)

	// Pemetaan & Tingkatan
	GetFaseTingkatan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int) ([]FaseTingkatan, error)
	CreatePemetaan(ctx context.Context, schemaName string, input PemetaanInput) error
	DeletePemetaan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int, tingkatanID int) error
	GetAllTingkatan(ctx context.Context, schemaName string) ([]Tingkatan, error)
}

// ... (sisa kode NewService tidak berubah)
type service struct {
	repo     Repository
	validate *validator.Validate
}

func NewService(repo Repository, validate *validator.Validate) Service {
	return &service{repo: repo, validate: validate}
}

// Kurikulum methods
func (s *service) GetAllKurikulum(ctx context.Context, schemaName string) ([]Kurikulum, error) {
	return s.repo.GetAllKurikulum(ctx, schemaName)
}

// ... (sisa kode tidak berubah)
func (s *service) GetKurikulumByTahunAjaran(ctx context.Context, schemaName string, tahunAjaranID string) ([]Kurikulum, error) {
	if tahunAjaranID == "" {
		return nil, errors.New("tahun ajaran ID tidak boleh kosong")
	}
	return s.repo.GetAllKurikulumByTahunAjaran(ctx, schemaName, tahunAjaranID)
}

func (s *service) CreateKurikulum(ctx context.Context, schemaName string, input UpsertKurikulumInput) (*Kurikulum, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateKurikulum(ctx, schemaName, input)
}

func (s *service) UpdateKurikulum(ctx context.Context, schemaName string, id int, input UpsertKurikulumInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.UpdateKurikulum(ctx, schemaName, id, input)
}

func (s *service) DeleteKurikulum(ctx context.Context, schemaName string, id int) error {
	return s.repo.DeleteKurikulum(ctx, schemaName, id)
}

// Fase methods
func (s *service) GetAllFase(ctx context.Context, schemaName string) ([]Fase, error) {
	return s.repo.GetAllFase(ctx, schemaName)
}

func (s *service) CreateFase(ctx context.Context, schemaName string, input UpsertFaseInput) (*Fase, error) {
	if err := s.validate.Struct(input); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreateFase(ctx, schemaName, input)
}

// Pemetaan & Tingkatan methods
func (s *service) GetFaseTingkatan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int) ([]FaseTingkatan, error) {
	return s.repo.GetFaseTingkatanByKurikulum(ctx, schemaName, tahunAjaranID, kurikulumID)
}

func (s *service) CreatePemetaan(ctx context.Context, schemaName string, input PemetaanInput) error {
	if err := s.validate.Struct(input); err != nil {
		return fmt.Errorf("%w: %s", ErrValidation, err.Error())
	}
	return s.repo.CreatePemetaan(ctx, schemaName, input)
}

func (s *service) DeletePemetaan(ctx context.Context, schemaName string, tahunAjaranID string, kurikulumID int, tingkatanID int) error {
	return s.repo.DeletePemetaan(ctx, schemaName, tahunAjaranID, kurikulumID, tingkatanID)
}

func (s *service) GetAllTingkatan(ctx context.Context, schemaName string) ([]Tingkatan, error) {
	return s.repo.GetAllTingkatan(ctx, schemaName)
}
